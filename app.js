const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const downloadImage = async (url, filename) => {
  const response = await axios.get(url, { responseType: "stream" });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filename);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const getUniqueFilename = (baseDir, baseName, ext) => {
  let filename = `${baseName}.${ext}`;
  let counter = 1;

  while (fs.existsSync(path.join(baseDir, filename))) {
    filename = `${baseName}_${counter}.${ext}`;
    counter++;
  }

  return path.join(baseDir, filename);
};

const sankritScraper = async (page) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://digitalcollections.ifpindia.org/s/manuscripts/search_manuscripts?item_set%5Bid%5D%5B0%5D=307452&page=${page}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const links = await page.evaluate(() => {
    const items = document.querySelectorAll(".resource.items .resource-link");
    return Array.from(items).map((item) => item.href);
  });

  console.log(links);
  console.log(`Found ${links.length} item pages`);

  const downloadDir = path.join(__dirname, "images");
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  for (const link of links) {
    const itemPage = await browser.newPage();
    await itemPage.goto(link, { waitUntil: "domcontentloaded" });

    // get real image src inside the item page
    const { imageUrl, script, language } = await itemPage.evaluate(() => {
      const imgElement = document.querySelector(".media img");
      const script =
        document.querySelector(".ifp-script a")?.innerText || "no-script";
      const language =
        document.querySelector(".dcterms-language a")?.innerText ||
        "no-language";
      return {
        imageUrl: imgElement ? imgElement.src : null,
        script,
        language,
      };
    });

    if (imageUrl) {
      console.log("This is the real img URL", imageUrl);
      const extension =
        path.extname(new URL(imageUrl).pathname).replace(".", "") || "jpg";
      const safeName = `${script}_${language}`.replace(/[^\w\s-]/g, "_"); // make filename safe
      const filepath = getUniqueFilename(downloadDir, safeName, extension);

      console.log(`Downloading: ${filepath}`);
      await downloadImage(imageUrl, filepath);
    } else {
      console.log(`No image found on ${link}`);
    }

    await itemPage.close();
  }

  await browser.close();
};

for (let i = 2; i <= 501; i++) {
  await sankritScraper(i);
}

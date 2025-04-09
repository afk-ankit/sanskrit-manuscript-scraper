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

const sankritScraper = async (pageNum) => {
  console.log(`Processing page ${pageNum}...`);
  const url = `https://digitalcollections.ifpindia.org/s/manuscripts/search_manuscripts?item_set%5Bid%5D%5B0%5D=307452&page=${pageNum}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const links = await page.evaluate(() => {
      const items = document.querySelectorAll(".resource.items .resource-link");
      return Array.from(items).map((item) => item.href);
    });

    console.log(`Found ${links.length} item pages on page ${pageNum}`);

    const downloadDir = path.join(__dirname, "images");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    for (const link of links) {
      const itemPage = await browser.newPage();
      try {
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
          console.log(`Page ${pageNum} - Found image: ${imageUrl}`);
          const extension =
            path.extname(new URL(imageUrl).pathname).replace(".", "") || "jpg";
          const safeName = `${script}_${language}_page${pageNum}`.replace(
            /[^\w\s-]/g,
            "_",
          ); // make filename safe
          const filepath = getUniqueFilename(downloadDir, safeName, extension);
          console.log(`Downloading: ${filepath}`);
          await downloadImage(imageUrl, filepath);
        } else {
          console.log(`No image found on ${link}`);
        }
      } catch (error) {
        console.error(`Error processing item ${link}: ${error.message}`);
      } finally {
        await itemPage.close();
      }
    }
  } catch (error) {
    console.error(`Error scraping page ${pageNum}: ${error.message}`);
  } finally {
    await browser.close();
  }
};

// Main execution with concurrency control
const main = async () => {
  const startPage = 1;
  const endPage = 501;
  const concurrency = 5; // Process this many pages simultaneously

  // Create a queue of pages to process
  const pageQueue = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => i + startPage,
  );

  // Process the queue with limited concurrency
  async function processQueue() {
    while (pageQueue.length > 0) {
      const currentBatch = pageQueue.splice(0, concurrency);
      console.log(`Processing batch of ${currentBatch.length} pages`);

      // Process current batch concurrently
      await Promise.all(currentBatch.map((pageNum) => sankritScraper(pageNum)));

      console.log(`Completed batch. ${pageQueue.length} pages remaining.`);
    }
  }

  await processQueue();
  console.log("All pages processed!");
};

main().catch(console.error);

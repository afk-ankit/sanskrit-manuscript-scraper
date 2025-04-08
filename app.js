const puppeteer = require("puppeteer");

const sankritScraper = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://digitalcollections.ifpindia.org/s/manuscripts/item-set/307452`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  const data = await page.evaluate(async () => {
    const script_dom = document.querySelectorAll(".resource.items");
    const img_data = Array.from(script_dom).map((item) => {
      return {
        url: item.querySelector("a").href || null,
        heading: item.querySelector("h4").innerText || null,
        script: item.querySelector(".ifp-script a").innerText || null,
        language: item.querySelector(".dcterms-language a").innerText || null,
      };
    });
    return img_data;
  });
  console.log(data);
  await browser.close();
};

sankritScraper();

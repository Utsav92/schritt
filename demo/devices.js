// Renders the front page, learn view and a lesson at phone, tablet, laptop, TV and 4K sizes; reports horizontal overflow.
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html", OUT = path.join(__dirname, "stills", "devices"); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEV = [["phone", 390, 844, 2, true], ["phone-land", 844, 390, 2, true], ["tablet", 820, 1180, 1, true], ["laptop", 1366, 768, 1, false], ["tv1080", 1920, 1080, 1, false], ["tv4k", 3840, 2160, 1, false]];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  for (const [tag, w, h, dpr, mob] of DEV) {
    const p = await (await b.createBrowserContext()).newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: mob, hasTouch: mob });
    await p.goto(base + "?dev=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(1500);
    const shot = (n) => p.screenshot({ path: path.join(OUT, tag + "-" + n + ".png") }); const ov = () => p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    await shot("front"); const o1 = await ov();
    await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(1100); await shot("learn"); const o2 = await ov();
    await p.evaluate(() => document.querySelector(".node.current").click()); await sleep(1500); await shot("lesson"); const o3 = await ov();
    console.log(tag, w + "x" + h, "overflow(front,learn,lesson):", JSON.stringify([o1, o2, o3]), errs.length ? errs : "");
    await p.close();
  }
  await b.close();
})();

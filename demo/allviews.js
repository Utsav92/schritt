// Screenshots every main view of the app on a phone (and the dark variant) to check the design is consistent everywhere.
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html", OUT = path.join(__dirname, "stills", "views"); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), scheme = process.argv[3] || "light";
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  const p = await (await b.createBrowserContext()).newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
  await p.goto(base + "?views=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(1200);
  await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(900);
  const shot = async (n) => { await sleep(700); await p.screenshot({ path: path.join(OUT, scheme + "-" + n + ".png") }); };
  for (const t of ["practice", "words", "shop"]) { await p.evaluate((t) => document.querySelector('[data-tab="' + t + '"]').click(), t); await shot(t); }
  await p.evaluate(() => [...document.querySelectorAll(".pill")].find((x) => /Plus/.test(x.textContent)).click()); await shot("plus");
  await p.evaluate(() => document.querySelector('[data-tab="me"]').click()); await shot("me");
  await p.evaluate(() => document.querySelector('[data-tab="me"]').click()); await sleep(500);
  await p.evaluate(() => window.scrollTo(0, 99999)); await shot("me-bottom");
  await p.evaluate(() => document.querySelector('[data-tab="learn"]').click()); await sleep(400);
  await p.evaluate(() => document.getElementById("langBtn").click()); await shot("lang-sheet");
  console.log("errors:", errs.length ? errs : "none"); await b.close();
})();

// Captures store screenshots from the real app: iPhone 6.7" (1290x2796) and Android phone (1080x1920) -> store/ios/*.png, store/android/*.png
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html", ROOT = path.join(__dirname, "..", "store");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = [["ios", 430, 932, 3], ["android", 360, 640, 3]];   // css px x dpr = 1290x2796 and 1080x1920
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  for (const [dir, w, h, dpr] of SIZES) {
    const out = path.join(ROOT, dir); fs.mkdirSync(out, { recursive: true });
    const p = await (await b.createBrowserContext()).newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
    await p.goto(base + "?store=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(1800);
    const shot = (n) => p.screenshot({ path: path.join(out, n + ".png") });
    await shot("1-welcome");
    await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(1200); await shot("2-learn");
    const lesson = async (sec, name, answers) => {
      await p.evaluate((s) => { const h = window.__schritt; h.state.subject = s; h.render(); }, sec); await sleep(700);
      await p.evaluate(() => document.querySelector(".node.current").click()); await sleep(1300);
      for (let i = 0; i < answers; i++) { await p.evaluate(() => { const L = window.__schritt.lesson, ch = L.queue[L.i]; if (ch.type === "info") { document.getElementById("lCheck").click(); return; } const o = [...document.querySelectorAll(".opt")].find((x) => x.dataset.v === ch.answer); if (o) o.click(); else if (ch.type === "type") { const t = document.getElementById("typed"); t.value = ch.answer; t.dispatchEvent(new Event("input", { bubbles: true })); } document.getElementById("lCheck").click(); }); await sleep(900); if (i < answers - 1) { await p.evaluate(() => { const n = document.getElementById("lNext"); if (n) n.click(); }); await sleep(900); } }
      await shot(name); await p.evaluate(() => document.getElementById("lClose").click()); await sleep(500); await p.evaluate(() => document.getElementById("shQuit").click()); await sleep(700);
    };
    await lesson("lang", "3-language-lesson", 2); await lesson("math", "4-math-lesson", 3); await lesson("music", "5-music-lesson", 2);
    await p.evaluate(() => { const h = window.__schritt; h.state.subject = "math"; h.render(); }); await sleep(800); await shot("6-math-path");
    console.log(dir, fs.readdirSync(out).length, "screenshots"); await p.close();
  }
  await b.close();
})();

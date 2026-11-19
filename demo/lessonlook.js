const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html", OUT = path.join(__dirname, "stills", "views"); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  for (const [tag, w, h, mobile] of [["m", 390, 844, true], ["d", 1280, 800, false]]) {
    const p = await (await b.createBrowserContext()).newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    await p.goto(base + "?ll=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(900);
    await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(900);
    await p.evaluate(() => document.querySelector(".node.current").click()); await sleep(1500);
    const shot = (n) => p.screenshot({ path: path.join(OUT, "lesson-" + tag + "-" + n + ".png") });
    await shot("1ask");
    const ans = (wrong) => p.evaluate((wrong) => { const L = window.__schritt.lesson, ch = L.queue[L.i]; const os = [...document.querySelectorAll(".opt")]; const o = wrong ? os.find((x) => x.dataset.v !== ch.answer) : os.find((x) => x.dataset.v === ch.answer); if (o) o.click(); document.getElementById("lCheck").click(); return ch.type; }, wrong);
    console.log(tag, "type", await ans(false)); await sleep(500); await shot("2good");
    await p.evaluate(() => document.getElementById("lNext").click()); await sleep(1300);
    console.log(tag, "type", await ans(true)); await sleep(700); await shot("3bad");
    console.log(tag, "errors:", errs.length ? errs : "none"); await p.close();
  }
  await b.close();
})();

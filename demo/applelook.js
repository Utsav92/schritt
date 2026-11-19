// One batched visual pass of the redesigned app: phone + desktop, light + dark. Output: demo/stills/look/*.png
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html", OUT = path.join(__dirname, "stills", "look"); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  const shots = [];
  async function run(tag, w, h, dpr, scheme) {
    const ctx = await b.createBrowserContext(), p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr, isMobile: w < 600, hasTouch: w < 600 }); await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
    await p.goto(base + "?look=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(1800);
    const shot = async (n) => { const f = path.join(OUT, tag + "-" + n + ".png"); await p.screenshot({ path: f }); shots.push(f); };
    await shot("front-top");
    await p.evaluate(() => { const f = document.getElementById("welcome"); f.scrollTo({ top: f.scrollHeight * 0.34, behavior: "instant" }); }); await sleep(1500); await shot("front-features");
    await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(1200); await shot("learn");
    await p.evaluate(() => document.querySelector('[data-sec="math"]').click()); await sleep(1100); await shot("math");
    await p.evaluate(() => { const h = window.__schritt; h.state.subject = "lang"; h.render(); }); await sleep(600);
    await p.evaluate(() => document.querySelector(".node.current").click()); await sleep(1200); await shot("lesson");
    await p.evaluate(() => { const L = window.__schritt.lesson, ch = L.queue[L.i]; const o = [...document.querySelectorAll(".opt")].find((x) => x.dataset.v === ch.answer); if (o) o.click(); document.getElementById("lCheck").click(); }); await sleep(900); await shot("lesson-correct");
    if (tag === "phone-light") { await p.evaluate(() => document.getElementById("lClose").click()); await sleep(700); await shot("sheet"); }
    console.log(tag, "errors:", errs.length ? errs : "none"); await ctx.close();
  }
  await run("phone-light", 390, 844, 2, "light"); await run("phone-dark", 390, 844, 2, "dark"); await run("desk-light", 1280, 800, 1, "light");
  // company pages
  const ctx = await b.createBrowserContext(), p = await ctx.newPage(); await p.setViewport({ width: 1280, height: 800 });
  await p.goto(base + "?look=" + Date.now(), { waitUntil: "networkidle0" });
  for (const k of ["about", "mission", "products"]) { await p.evaluate((k) => Pages.open(k), k); await sleep(1500); await p.evaluate(() => document.querySelectorAll(".pgx-rv").forEach((n) => n.classList.add("in"))); await sleep(300); const f = path.join(OUT, "pg-" + k + ".png"); await p.screenshot({ path: f }); }
  await b.close();
})();

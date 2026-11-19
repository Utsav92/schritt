// Screenshots every company page (desktop + phone) from a local or live URL and reports console errors and frame rate.
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const base = process.argv[2] || "http://localhost:8880/index.html";
const keys = ["about", "mission", "products", "careers", "help", "legal", "privacy", "terms", "security"];
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  fs.mkdirSync(path.join(__dirname, "stills", "pages"), { recursive: true });
  for (const [tag, w, h, dpr] of [["d", 1280, 800, 1], ["m", 390, 844, 2]]) {
    const ctx = await b.createBrowserContext(), p = await ctx.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
    const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto(base + "?pgcheck=" + Date.now(), { waitUntil: "networkidle0" });
    for (const k of keys) {
      await p.evaluate((k) => { window.Pages.open(k); }, k); await new Promise((r) => setTimeout(r, 900));
      const info = await p.evaluate(() => { const m = document.getElementById("pgMain"); return { h: m.scrollHeight, over: m.scrollWidth > m.clientWidth + 2, secs: m.querySelectorAll(".pgx-sec").length }; });
      await p.screenshot({ path: path.join(__dirname, "stills", "pages", tag + "-" + k + ".png") });
      // reveal everything and capture the full page for a second look
      await p.evaluate(() => { const m = document.getElementById("pgMain"); m.querySelectorAll(".pgx-rv").forEach((n) => n.classList.add("in")); m.scrollTop = 0; });
      console.log(tag, k, JSON.stringify(info));
    }
    const fps = await p.evaluate(() => new Promise((r) => { window.Pages.open("about"); let n = 0, t0 = performance.now(); (function f(t) { n++; if (t - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n / ((t - t0) / 1000))); })(t0); }));
    console.log(tag, "fps (about, software-rendered headless):", fps, "errors:", errs.length ? errs : "none");
    await ctx.close();
  }
  await b.close();
})();

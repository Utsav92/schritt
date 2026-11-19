// Opens the live site in a brand-new browser profile (like a first-time visitor) and screenshots it.
const puppeteer = require("puppeteer-core"), path = require("path");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  for (const [name, w, h, dpr] of [["live-desktop", 1280, 760, 1], ["live-phone", 390, 844, 2]]) {
    const ctx = await b.createBrowserContext(), p = await ctx.newPage(); await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
    const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    await p.goto(process.argv[2] || "https://schritt-rosy.vercel.app/", { waitUntil: "networkidle0" }); await new Promise((r) => setTimeout(r, 1500));
    const info = await p.evaluate(() => ({ front: !!document.getElementById("welcome"), title: (document.querySelector("#wlTitle") || {}).innerText, flags: document.querySelectorAll(".fr-card .flag").length, buttons: [...document.querySelectorAll(".fr-cta button")].map((x) => x.innerText) }));
    await p.screenshot({ path: path.join(__dirname, "stills", name + ".png") }); console.log(name, JSON.stringify(info), "errors:", errs.length ? errs : "none"); await ctx.close();
  }
  await b.close();
})();

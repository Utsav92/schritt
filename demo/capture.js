/* Captures real screenshots of the running app (http://localhost:8880) for the launch video. */
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.env.APP_URL || "http://localhost:8880/index.html";
const OUT = path.join(__dirname, "shots"); fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, w, h, dpr, fresh) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto(URL + "?demo=" + Date.now(), { waitUntil: "networkidle0" });
  await page.evaluate((fresh) => {
    const h = window.__schritt, s = h.state, prog = {};
    window.UNITS.filter((u) => u.lvl === "A1").forEach((u, i) => { prog[u.id] = fresh ? [] : i < 2 ? [0, 1, 2, 3, 4] : i === 2 ? [0, 1] : []; });
    s.lang = "de"; s.progress = { de: prog }; s.xp = 1240; s.streak = 12; s.lastDay = (function () { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); })();
    s.dayXp = {}; s.dayXp[s.lastDay] = 14; s.gems = 340; s.avatar = "fox"; s.hearts = 5; s.freezes = 1; s.plus = null;
    s.quests = { day: s.lastDay, p: { xp: 14, lessons: 1, perfect: 0 }, claimed: [] }; s.adCount = 0;
    h.render();
  }, !!fresh);
  await wait(500); return page;
}
async function shot(page, name, opts) { await page.screenshot(Object.assign({ path: path.join(OUT, name + ".png") }, opts || {})); console.log("shot", name); }
const click = async (page, sel) => { await page.evaluate((s) => document.querySelector(s).click(), sel); await wait(350); };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-gpu-vsync", "--hide-scrollbars"] });
  let p = await open(browser, 1280, 800, 1);
  await shot(p, "desktop-learn"); await p.close();

  p = await open(browser, 390, 844, 2);
  await shot(p, "phone-learn");
  await click(p, "[data-tab=practice]"); await shot(p, "phone-practice");
  await click(p, "[data-tab=shop]"); await shot(p, "phone-shop");
  await click(p, "[data-tab=me]"); await shot(p, "phone-profile");
  await click(p, "#plusBtn"); await shot(p, "phone-plus");
  await p.evaluate(() => document.querySelector(".cmp").scrollIntoView({ block: "start" })); await wait(300); await shot(p, "phone-plus-table");
  await p.close();
  p = await open(browser, 390, 844, 2, true);
  await click(p, ".node.current"); await wait(500); await shot(p, "phone-lesson");
  await p.evaluate(() => { const ch = window.__schritt.lesson.queue[0], root = document.getElementById("lesson"); [...root.querySelectorAll(".opt")].find((b) => b.dataset.v === ch.answer).click(); root.querySelector("#lCheck").click(); });
  await wait(700); await shot(p, "phone-feedback");
  await p.close();

  // a wrong answer, for the sad reaction
  p = await open(browser, 390, 844, 2, true); await click(p, ".node.current"); await wait(400);
  await p.evaluate(() => { const ch = window.__schritt.lesson.queue[0], root = document.getElementById("lesson"); [...root.querySelectorAll(".opt")].find((b) => b.dataset.v !== ch.answer).click(); root.querySelector("#lCheck").click(); });
  await wait(700); await shot(p, "phone-wrong"); await p.close();

  // the ad
  p = await open(browser, 390, 844, 2, true);
  await p.evaluate(() => { window.__schritt.state.adCount = 2; });
  await click(p, ".node.current"); await wait(400);
  await p.evaluate(async () => {
    const h = window.__schritt, wait = (ms) => new Promise((r) => setTimeout(r, ms)), root = document.getElementById("lesson");
    let g = 0; while (!root.hidden && g++ < 90) { const L = h.lesson; if (!L) break; const ch = L.queue[L.i];
      if (root.querySelector("#lDone")) break; if (root.querySelector("#lNext")) { root.querySelector("#lNext").click(); await wait(25); continue; }
      if (ch.type === "select" || ch.type === "listen") [...root.querySelectorAll(".opt")].find((b) => b.dataset.v === ch.answer).click();
      else if (ch.type === "type") { const t = root.querySelector("#typed"); t.value = ch.answer; t.dispatchEvent(new Event("input")); }
      else if (ch.type === "build" || ch.type === "listenbuild") { for (const tk of ch.tokens) [...root.querySelectorAll("#bank .tok")].find((x) => !x.classList.contains("used") && x.textContent === tk).click(); }
      else if (ch.type === "match") { const l = [...root.querySelectorAll("[data-side=tl]")], r = [...root.querySelectorAll("[data-side=en]")]; for (const a of l) { a.click(); r.find((x) => x.dataset.key === a.dataset.key).click(); } await wait(30); continue; }
      await wait(15); const c = root.querySelector("#lCheck"); if (c && !c.disabled) c.click(); await wait(20); }
    document.getElementById("lDone").click();
  });
  await wait(900); await shot(p, "phone-ad"); await p.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

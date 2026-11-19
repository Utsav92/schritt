// Records the Schritt launch film: the real app, driven by a scripted finger, inside an iPhone on a 1920x1080 stage.
// Usage: node record.js            (needs narr2/ from gen_narr.py). Output: frames2/*.jpg + frames2/timeline.json
const puppeteer = require("puppeteer-core"), http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), PUB = path.join(ROOT, "public"), OUTD = path.join(__dirname, "frames_mac"), PORT = 8893;
const dur = JSON.parse(fs.readFileSync(path.join(__dirname, "narr2", "durations.json"), "utf8"));
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".json": "application/json", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]); let file;
  if (u.startsWith("/app/")) file = path.join(PUB, u.slice(5) || "index.html"); else file = path.join(__dirname, u === "/" ? "stage_mac.html" : u);
  if (file.endsWith(path.sep) || (fs.existsSync(file) && fs.statSync(file).isDirectory())) file = path.join(file, "index.html");
  fs.readFile(file, (e, b) => { if (e) { res.writeHead(404); res.end("nf"); return; } res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(b); });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  fs.rmSync(OUTD, { recursive: true, force: true }); fs.mkdirSync(OUTD, { recursive: true });
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"], protocolTimeout: 240000 });
  const ctx = await b.createBrowserContext(), page = await ctx.newPage(); await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("http://localhost:" + PORT + "/stage_mac.html", { waitUntil: "load" });
  const E = (code) => page.evaluate("(async()=>{" + code + "})()");
  if (!(await E("return await demo.ready()"))) throw new Error("app did not load");
  await E("demo.pose('hidden'); demo.fade(1);"); await sleep(600);

  // ---- screencast ----
  const cdp = await page.createCDPSession(), frames = []; let n = 0, first = null, writes = [];
  cdp.on("Page.screencastFrame", (f) => {
    const t = f.metadata.timestamp; if (first === null) first = t; const file = path.join(OUTD, String(++n).padStart(6, "0") + ".jpg");
    frames.push({ t: t - first, file: path.basename(file) }); writes.push(fs.promises.writeFile(file, Buffer.from(f.data, "base64")));
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  while (first === null) await sleep(50);
  const wall0 = Date.now(), starts = {};
  const wallNow = () => (Date.now() - wall0) / 1000;
  const scene = async (id, fn) => { starts[id] = wallNow(); const t0 = Date.now(); console.log("scene", id, "at", starts[id].toFixed(1)); await fn(); const need = (dur[id] + 0.9) * 1000 - (Date.now() - t0); if (need > 0) await sleep(need); };
  const cap = (o) => "await demo.caption(" + JSON.stringify(o) + ");";
  const P1 = "Part 1 · The home page", P2 = "Part 2 · Inside the app";
  const answerLoop = (k, wrongAt) => "for (let i=0;i<" + k + ";i++){ await demo.answer(i===" + (wrongAt == null ? -1 : wrongAt) + "); }";
  const quit = "await demo.tap('#lClose',{after:700}); await demo.tap('#shQuit',{after:900});";

  await scene("s01", () => E("demo.fade(0); demo.pose('hero');" + cap({ eyebrow: "Introducing", title: "Schritt.", sub: "Languages. Music. Math. One calm app.", ac: "#5ac8fa", part: P1 }) + "await demo.wait(3200);"));
  await scene("s02", () => E(cap({ eyebrow: "The home page", title: "Seventeen languages, one tap away.", sub: "Flags, levels and short lessons that fit your day.", ac: "#5ac8fa" }) + "demo.pose('left'); await demo.wait(900); await demo.scrollBy('#welcome', 650, 3000); await demo.wait(300); await demo.scrollBy('#welcome', 700, 3000);"));
  await scene("s03", () => E(cap({ eyebrow: "Our mission", title: "Free, playful and private.", sub: "A great start in any subject.", ac: "#ff6f61" }) + "demo.pose('tilt'); await demo.scrollBy('#welcome', 5000, 2600); await demo.tap('[data-page=\"mission\"]',{after:1800}); await demo.scrollBy('#pgMain', 380, 3200); await demo.wait(1200); await demo.scrollBy('#pgMain', 420, 3000);"));
  await scene("s04", () => E(cap({ eyebrow: "Our values", title: "Six promises we keep.", sub: "Free for everyone. Private by default. Honest about limits.", ac: "#ffb340" }) + "demo.pose('left'); await demo.scrollBy('#pgMain', 750, 3600); await demo.wait(300); await demo.scrollBy('#pgMain', 750, 3600);"));
  await scene("s05", () => E(cap({ eyebrow: "Products", title: "Everything in one app.", sub: "Languages, Math, Music and Studio.", ac: "#a58bff" }) + "demo.pose('tilt'); demo.el('[data-pgn=\"products\"]').scrollIntoView({inline:'center',block:'nearest'}); await demo.wait(300); await demo.tap('[data-pgn=\"products\"]',{after:1800}); await demo.scrollBy('#pgMain', 520, 3200); await demo.wait(600); await demo.scrollBy('#pgMain', 700, 3400);"));
  await scene("s06", () => E(cap({ eyebrow: "Now, inside the app", title: "Let&rsquo;s step in.", sub: "", ac: "#5ac8fa", part: P2 }) + "demo.pose('flat'); await demo.tap('#pgClose',{after:700}); await demo.scrollTo('#welcome', 0, 1400); await demo.tap('#wlGuest',{after:1500});"));
  await scene("s07", () => E(cap({ eyebrow: "Languages", title: "Pick any of seventeen.", sub: "German to Japanese. A1 to C2.", ac: "#58cc02" }) + "demo.pose('hero'); await demo.wait(1200); await demo.tap('#langBtn',{after:1000}); const sc = demo.scroller(demo.el('[data-lang]')); await demo.scrollBy(sc, 520, 3000); await demo.wait(400); await demo.scrollBy(sc, -520, 1500); await demo.tap('[data-lang=\"es\"]',{after:1200});"));
  await scene("s08", () => E(cap({ eyebrow: "Example exercise", title: "Learn by doing.", sub: "Listen, match, build, type.", ac: "#58cc02" }) + "demo.pose('left'); await demo.tap('.node.current',{after:1300});" + answerLoop(2, 1) + quit));
  await scene("s09", () => E(cap({ eyebrow: "Math", title: "Grade 1 to grade 12.", sub: "360 lessons with pictures. All free.", ac: "#a58bff" }) + "demo.pose('hero'); await demo.tap('[data-sec=\"math\"]',{after:1400}); const sc = demo.scroller(demo.el('.lvl-head')); await demo.scrollBy(sc, 1500, 4200);"));
  await scene("s10", () => E(cap({ eyebrow: "Example exercise", title: "Pictures make it click.", sub: "Number lines, shapes, graphs.", ac: "#a58bff" }) +
    "demo.pose('tilt'); const h=W().__schritt, S=h.state, c=W().Subjects.course('math'); let ui=c.units.findIndex((u)=>/fraction/i.test(u.title)&&['G3','G4','G5'].includes(u.lvl)); if(ui<0) ui=14; S.progress.math=S.progress.math||{}; c.units.slice(0,ui).forEach((u)=>{S.progress.math[u.id]=[0,1,2,3,4];}); h.render(); await demo.wait(900); await demo.tap('.node.current',{after:1400});" + answerLoop(3, null) + quit));
  await scene("s11", () => E(cap({ eyebrow: "Music", title: "From first notes to chords.", sub: "Staff, rhythm, keys and scales.", ac: "#ff6f61" }) + "demo.pose('left'); await demo.tap('[data-sec=\"music\"]',{after:1400}); const sc = demo.scroller(demo.el('.lvl-head')); await demo.scrollBy(sc, 900, 3200);"));
  await scene("s12", () => E(cap({ eyebrow: "Example exercise", title: "Hear it. Name it.", sub: "Questions that play a sound.", ac: "#ff6f61" }) +
    "demo.pose('tilt'); await demo.tap('.node.current',{after:1300}); for (let i=0;i<2;i++){ const L=W().__schritt.lesson, ch=L.queue[L.i]; if (ch.type!=='info' && D().querySelector('[data-tone]')) await demo.tap('[data-tone]',{after:900}); await demo.answer(false); }" + quit));
  await scene("s13", () => E(cap({ eyebrow: "Music Studio", title: "Describe it. Hear it.", sub: "In any language.", ac: "#64d2ff" }) +
    "demo.pose('hero'); await demo.tap((d)=>[...d.querySelectorAll('#tabs .tab')].find((b)=>/Studio/.test(b.textContent)),{after:1300}); await demo.tap('#stPrompt',{focus:true,after:300}); await demo.type('#stPrompt','calm piano for a rainy night',75); await demo.wait(400); const sel=D().getElementById('stLang'); sel.value='ja'; await demo.wait(700); await demo.scrollBy(demo.scroller(sel), 360, 2200);"));
  await scene("s14", () => E(cap({ eyebrow: "Schritt", title: "Learn a little every day.", sub: "Free for everyone.", ac: "#5ac8fa" }) + "await demo.tap((d)=>[...d.querySelectorAll('#tabs .tab')].find((b)=>/Learn/.test(b.textContent)),{after:700}); demo.pose('flat'); await demo.wait(2500); demo.fade(1); await demo.wait(900);"));
  const endT = wallNow(); await sleep(400);
  await cdp.send("Page.stopScreencast"); await Promise.all(writes);
  fs.writeFileSync(path.join(OUTD, "timeline.json"), JSON.stringify({ frames, starts, end: endT, errors: errs }, null, 0));
  console.log("frames", frames.length, "seconds", endT.toFixed(1), "fps", (frames.length / endT).toFixed(1), "errors", errs.length ? errs : "none");
  await b.close(); server.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });

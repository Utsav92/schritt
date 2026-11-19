/* Builds the Schritt launch video: narration (edge-tts) -> timeline -> crayon frames (headless Chrome) -> music bed -> mp4.
   Usage:  node build.js            full build
           node build.js still 12   write stills/still-12.00.png (a single frame at t=12s) to check the look
   Needs: python with edge-tts, ffmpeg/ffprobe on PATH, Chrome (CHROME env var to override), the app's screenshots in shots/ (node capture.js). */
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 30, W = 1280, H = 720, WORKERS = Number(process.env.WORKERS || 3), VOICE = "en-US-AndrewNeural";
const dir = (...p) => path.join(__dirname, ...p), mk = (p) => fs.mkdirSync(p, { recursive: true });
const SCENES = [
  { id: "s1", min: 5.2, say: "Meet Schritt. Learn any language, your way." },
  { id: "s2", min: 7.0, say: "Seventeen languages. From German and Spanish, to Japanese, Arabic and Hindi." },
  { id: "s3", min: 8.6, say: "Six levels. From A one, all the way to C two. A hundred and eighty lessons in every language." },
  { id: "s4", min: 6.6, say: "Bite-sized lessons on a path that always shows what comes next." },
  { id: "s5", min: 7.6, say: "Listen. Match. Build sentences. Type what you hear. Every lesson mixes it up." },
  { id: "s6", min: 7.4, say: "Friendly faces cheer you on, whether you get it right, or not quite." },
  { id: "s7", min: 7.4, say: "Keep your streak alive. Earn gems. Finish your daily quests." },
  { id: "s8", min: 9.6, say: "Start free with levels A one to B one. Go Plus to unlock B two to C two, with unlimited hearts, mistakes review, double gems, and no ads." },
  { id: "s9", min: 9.4, say: "And it's private by design. Your progress stays on your device, with no analytics and no tracking. Install it on iPhone or Android, and it works offline." },
  { id: "s10", min: 6.6, say: "Schritt. Now live." }
];
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

function narration() {
  mk(dir("narr"));
  for (const s of SCENES) {
    const f = dir("narr", s.id + ".mp3");
    if (!fs.existsSync(f)) { console.log("tts", s.id); execFileSync("python", ["-m", "edge_tts", "--voice", VOICE, "--rate=-4%", "--text", s.say, "--write-media", f], { stdio: "inherit" }); }
    s.narr = probe(f);
  }
}
function timeline() {
  let t = 0; const scenes = SCENES.map((s) => { const dur = Math.max(s.min, 0.6 + s.narr + 1.0); const o = { id: s.id, start: t, dur, narrAt: t + 0.6 }; t += dur; return o; });
  return { scenes, total: t + 0.5 };
}
async function page(browser, tl) {
  const p = await browser.newPage(); await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await p.goto("file:///" + dir("scene.html").replace(/\\/g, "/"), { waitUntil: "load" }); await p.evaluate((t) => window.setTimeline(t), tl);
  await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
  return p;
}
async function frames(tl) {
  // one browser window per worker: background tabs in a single window do not paint, which made screenshots time out
  const total = Math.ceil(tl.total * FPS); mk(dir("frames"));
  if (process.env.FRESH) fs.readdirSync(dir("frames")).forEach((f) => fs.unlinkSync(dir("frames", f))); // otherwise a rerun resumes
  const browsers = await Promise.all(Array.from({ length: WORKERS }, () => puppeteer.launch({ executablePath: CHROME, headless: "new", protocolTimeout: 240000, args: ["--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars"] })));
  const pages = await Promise.all(browsers.map((br) => page(br, tl)));
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async (p) => {
    for (;;) {
      const i = next++; if (i >= total) return; const f = dir("frames", String(i + 1).padStart(5, "0") + ".jpg");
      if (fs.existsSync(f) && fs.statSync(f).size > 4000) { done++; continue; }
      await p.evaluate((t) => window.render(t), i / FPS);
      await p.screenshot({ path: f, type: "jpeg", quality: 93 });
      if (++done % 60 === 0) console.log("frames", done + "/" + total, Math.round((Date.now() - t0) / 1000) + "s");
    }
  }));
  await Promise.all(browsers.map((br) => br.close())); return total;
}
function music(total) {
  // soft ambient pad: four chords (Cmaj7, Am7, Fmaj7, G6) of sine tones with slow tremolo, cross-faded
  const chords = [[130.81, 261.63, 329.63, 392.0, 493.88], [110.0, 220.0, 261.63, 329.63, 392.0], [87.31, 174.61, 261.63, 349.23, 440.0], [98.0, 196.0, 293.66, 392.0, 493.88]];
  const seg = 16, n = Math.ceil(total / (seg - 2)) + 1, args = [];
  for (let i = 0; i < n; i++) chords[i % 4].forEach((f) => args.push("-f", "lavfi", "-t", String(seg), "-i", "sine=f=" + f + ":sample_rate=44100"));
  let filt = ""; const labels = [];
  for (let i = 0; i < n; i++) { const ins = chords[0].map((_, k) => "[" + (i * 5 + k) + ":a]").join(""); filt += ins + "amix=inputs=5:normalize=0,volume=0.16,tremolo=f=0.18:d=0.35,lowpass=f=1400,afade=t=in:d=2,afade=t=out:st=" + (seg - 2) + ":d=2[m" + i + "];"; labels.push("[m" + i + "]"); }
  let cur = labels[0];
  for (let i = 1; i < n; i++) { filt += cur + labels[i] + "acrossfade=d=2[x" + i + "];"; cur = "[x" + i + "]"; }
  filt += cur + "atrim=0:" + (total + 1) + ",afade=t=in:d=1.5,afade=t=out:st=" + (total - 2) + ":d=2[out]";
  execFileSync("ffmpeg", ["-y", ...args, "-filter_complex", filt, "-map", "[out]", "-c:a", "aac", "-b:a", "128k", dir("music.m4a")], { stdio: "ignore" });
}
function mix(tl) {
  const inputs = ["-i", dir("music.m4a")]; let filt = "[0:a]volume=0.75[bed];"; const lab = ["[bed]"];
  tl.scenes.forEach((s, i) => { inputs.push("-i", dir("narr", s.id + ".mp3")); filt += "[" + (i + 1) + ":a]adelay=" + Math.round(s.narrAt * 1000) + "|" + Math.round(s.narrAt * 1000) + ",volume=1.9[n" + i + "];"; lab.push("[n" + i + "]"); });
  filt += lab.join("") + "amix=inputs=" + lab.length + ":normalize=0:dropout_transition=0,alimiter=limit=0.95[aout]";
  execFileSync("ffmpeg", ["-y", ...inputs, "-filter_complex", filt, "-map", "[aout]", "-c:a", "aac", "-b:a", "192k", dir("audio.m4a")], { stdio: "ignore" });
}
(async () => {
  narration(); const tl = timeline(); fs.writeFileSync(dir("timeline.json"), JSON.stringify(tl, null, 1));
  console.log("scenes", tl.scenes.map((s) => s.id + "@" + s.start.toFixed(1) + "+" + s.dur.toFixed(1)).join(" "), "total", tl.total.toFixed(1) + "s");
  if (process.argv[2] === "still") {
    const t = Number(process.argv[3] || 6); mk(dir("stills")); const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--allow-file-access-from-files"] });
    const p = await page(browser, tl); await p.evaluate((x) => window.render(x), t); const f = dir("stills", "still-" + t.toFixed(2) + ".png"); await p.screenshot({ path: f }); await browser.close(); console.log("wrote", f); return;
  }
  const total = await frames(tl); music(tl.total); mix(tl);
  const out = dir("schritt-launch.mp4");
  execFileSync("ffmpeg", ["-y", "-framerate", String(FPS), "-i", dir("frames", "%05d.jpg"), "-i", dir("audio.m4a"), "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-shortest", out], { stdio: "inherit" });
  console.log("done", out, (fs.statSync(out).size / 1048576).toFixed(1) + " MB", total + " frames");
})().catch((e) => { console.error(e); process.exit(1); });

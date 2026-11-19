// UI/UX checklist measurements on the live site (phone viewport): touch targets, contrast, accessible names, alt text, zoom, headings.
const puppeteer = require("puppeteer-core"); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const URL_ = process.argv[2] || "https://schritt-rosy.vercel.app/";
const audit = () => {
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x)); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const bgOf = (el) => { let n = el; while (n) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.9) return c.rgb; n = n.parentElement; } return [0, 0, 0]; };
  const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && r.bottom > 0 && r.top < innerHeight + 2000; };
  const out = { small: [], lowContrast: [], noName: [], noAlt: 0, imgs: 0 };
  document.querySelectorAll("button,a[href],[role=button],input:not([type=hidden]),select,textarea,summary").forEach((el) => {
    if (!vis(el)) return; const r = el.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.small.push((el.id ? "#" + el.id : (el.className || el.tagName).toString().slice(0, 28)) + " " + Math.round(r.width) + "x" + Math.round(r.height));
    const name = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || el.getAttribute("placeholder") || "").trim(); if (!name && el.tagName !== "INPUT") out.noName.push((el.id || el.className || el.tagName).toString().slice(0, 30));
  });
  document.querySelectorAll("img").forEach((i) => { if (vis(i)) { out.imgs++; if (!i.hasAttribute("alt")) out.noAlt++; } });
  const seen = new Set();
  document.querySelectorAll("p,span,small,b,h1,h2,h3,h4,li,label,button,a,div").forEach((el) => {
    if (!vis(el) || !el.childNodes.length) return; const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" "); if (!own) return;
    const cs = getComputedStyle(el), fg = parse(cs.color); if (!fg) return; const bg = bgOf(el), a = fg.a, mix = fg.rgb.map((v, i) => v * a + bg[i] * (1 - a));
    const L1 = lum(mix), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05), size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700, need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < need) { const k = own.slice(0, 26) + "|" + ratio.toFixed(1); if (!seen.has(k)) { seen.add(k); out.lowContrast.push(own.slice(0, 34) + " " + ratio.toFixed(2) + ":1 (" + size + "px)"); } }
  });
  out.zoomOk = !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(document.querySelector("meta[name=viewport]").content);
  out.h1 = document.querySelectorAll("h1").length; out.lang = document.documentElement.lang; out.scrollW = [document.documentElement.scrollWidth, innerWidth];
  return out;
};
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  const p = await (await b.createBrowserContext()).newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(URL_ + "?ux=" + Date.now(), { waitUntil: "networkidle0" }); await sleep(1200);
  const res = {}; res.front = await p.evaluate(audit);
  await p.evaluate(() => document.getElementById("wlGuest").click()); await sleep(1000); res.learn = await p.evaluate(audit);
  await p.evaluate(() => document.querySelector(".node.current").click()); await sleep(1300); res.lesson = await p.evaluate(audit);
  for (const [k, v] of Object.entries(res)) console.log("\n== " + k, "| zoomOk", v.zoomOk, "| h1", v.h1, "| lang", v.lang, "| imgs", v.imgs, "noAlt", v.noAlt, "| scroll", v.scrollW.join("/"), "\n small targets (" + v.small.length + "):", [...new Set(v.small)].slice(0, 10).join("; "), "\n unnamed controls (" + v.noName.length + "):", [...new Set(v.noName)].slice(0, 6).join("; "), "\n low contrast (" + v.lowContrast.length + "):", v.lowContrast.slice(0, 8).join("; "));
  await b.close();
})();

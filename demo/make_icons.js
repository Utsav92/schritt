// Draws the Schritt logo and exports every icon the web app, iOS and Android need.
// Run: node make_icons.js   -> public/icon.svg + PNGs, store/*.png, mobile/resources/*.png
const puppeteer = require("puppeteer-core"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), PUB = path.join(ROOT, "public"), STORE = path.join(ROOT, "store"), RES = path.join(ROOT, "mobile", "resources");
[STORE, RES].forEach((d) => fs.mkdirSync(d, { recursive: true }));

/* One drawing, three steps: languages (blue), math (violet), music (coral). A small character climbs toward a sparkle. */
function logo({ rx = 232, scale = 1, bg = true } = {}) {
  const t = scale === 1 ? "" : ` transform="translate(512 512) scale(${scale}) translate(-512 -512)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1c32"/><stop offset="1" stop-color="#050509"/></linearGradient>
<radialGradient id="glow" cx=".74" cy=".16" r=".62"><stop offset="0" stop-color="#bf5af2" stop-opacity=".5"/><stop offset="1" stop-color="#bf5af2" stop-opacity="0"/></radialGradient>
<radialGradient id="glow2" cx=".14" cy=".92" r=".55"><stop offset="0" stop-color="#0a84ff" stop-opacity=".35"/><stop offset="1" stop-color="#0a84ff" stop-opacity="0"/></radialGradient>
<linearGradient id="g1" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0a84ff"/><stop offset="1" stop-color="#64d2ff"/></linearGradient>
<linearGradient id="g2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8e44ec"/><stop offset="1" stop-color="#ff6bd6"/></linearGradient>
<linearGradient id="g3" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff5a52"/><stop offset="1" stop-color="#ffc247"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
${bg ? `<rect width="1024" height="1024" rx="${rx}" fill="url(#bg)"/><rect width="1024" height="1024" rx="${rx}" fill="url(#glow)"/><rect width="1024" height="1024" rx="${rx}" fill="url(#glow2)"/>` : ""}
<g${t}>
<rect x="150" y="610" width="226" height="226" rx="62" fill="url(#g1)"/><rect x="150" y="610" width="226" height="120" rx="62" fill="url(#shine)"/>
<rect x="399" y="460" width="226" height="376" rx="62" fill="url(#g2)"/><rect x="399" y="460" width="226" height="150" rx="62" fill="url(#shine)"/>
<rect x="648" y="310" width="226" height="526" rx="62" fill="url(#g3)"/><rect x="648" y="310" width="226" height="180" rx="62" fill="url(#shine)"/>
<path d="M312 468C430 330 560 252 716 222" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="11" stroke-linecap="round" stroke-dasharray="1 30"/>
<g transform="translate(263 546)"><circle r="64" fill="#fff"/><circle cx="-22" cy="-8" r="10" fill="#101014"/><circle cx="22" cy="-8" r="10" fill="#101014"/><path d="M-26 20Q0 44 26 20" fill="none" stroke="#101014" stroke-width="9" stroke-linecap="round"/><circle cx="-40" cy="18" r="9" fill="#ff8fa3" fill-opacity=".7"/><circle cx="40" cy="18" r="9" fill="#ff8fa3" fill-opacity=".7"/></g>
<path d="M775 118 L797 178 L857 200 L797 222 L775 282 L753 222 L693 200 L753 178 Z" fill="#fff"/>
<circle cx="880" cy="128" r="12" fill="#fff" fill-opacity=".8"/><circle cx="650" cy="150" r="8" fill="#fff" fill-opacity=".6"/>
</g></svg>`;
}
fs.writeFileSync(path.join(PUB, "icon.svg"), logo());
fs.writeFileSync(path.join(STORE, "logo-mark.svg"), logo({ bg: false }));

(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  const p = await b.newPage();
  async function png(file, w, h, html) { await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await p.setContent("<style>*{margin:0}html,body{width:" + w + "px;height:" + h + "px;background:transparent;overflow:hidden}</style>" + html); await p.screenshot({ path: file, omitBackground: true }); }
  const sized = (svg, px) => '<div style="width:' + px + "px;height:" + px + 'px">' + svg.replace('width="1024" height="1024"', 'width="' + px + '" height="' + px + '"') + "</div>";
  const round = logo(), square = logo({ rx: 0 }), mask = logo({ rx: 0, scale: 0.82 });
  for (const [f, px, svg] of [["icon-192.png", 192, round], ["icon-512.png", 512, round], ["icon-maskable-512.png", 512, mask], ["apple-touch-icon.png", 180, square], ["favicon-32.png", 32, round], ["favicon-48.png", 48, round]]) await png(path.join(PUB, f), px, px, sized(svg, px));
  await png(path.join(STORE, "ios-app-store-1024.png"), 1024, 1024, sized(square, 1024));       // App Store: square, no transparency, no rounded corners
  await png(path.join(STORE, "play-store-icon-512.png"), 512, 512, sized(square, 512));         // Play: Google applies its own mask
  await png(path.join(RES, "icon-only.png"), 1024, 1024, sized(square, 1024));
  await png(path.join(RES, "icon-foreground.png"), 1024, 1024, sized(logo({ bg: false, scale: 0.7 }), 1024));   // Android adaptive icon foreground
  await png(path.join(RES, "icon-background.png"), 1024, 1024, '<div style="width:1024px;height:1024px;background:#0a0a10"></div>');
  await png(path.join(RES, "splash.png"), 2732, 2732, '<div style="width:2732px;height:2732px;background:#000;display:grid;place-items:center"><div style="width:760px;height:760px">' + logo().replace('width="1024" height="1024"', 'width="760" height="760"') + "</div></div>");
  // Play Store feature graphic 1024x500
  await png(path.join(STORE, "play-feature-graphic-1024x500.png"), 1024, 500, '<div style="width:1024px;height:500px;background:radial-gradient(circle at 80% 20%,#3a1f5e,#000 60%);display:flex;align-items:center;gap:44px;padding-left:80px;font-family:-apple-system,\'Segoe UI Variable Display\',\'Segoe UI\',sans-serif;color:#f5f5f7"><div style="width:300px;height:300px;flex:none">' + logo().replace('width="1024" height="1024"', 'width="300" height="300"') + '</div><div><div style="font-size:92px;font-weight:700;letter-spacing:-3px;line-height:1">Schritt</div><div style="font-size:34px;color:#a1a1a6;margin-top:14px;letter-spacing:-.5px">Languages, music and math.<br>Free for everyone.</div></div></div>');
  await b.close(); console.log("icons written");
})();

// Generates public/privacy.html and public/terms.html from public/policy.js + config.js so the in-app and public policies never differ.
const fs = require("fs"), path = require("path"), vm = require("vm");
const pub = path.join(__dirname, "public");
const ctx = { window: {} }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(pub, "policy.js"), "utf8"), ctx);
const cfg = fs.readFileSync(path.join(pub, "config.js"), "utf8");
const operator = (cfg.match(/operator:\s*"([^"]*)"/) || [])[1] || "Schritt", contact = (cfg.match(/contact:\s*"([^"]*)"/) || [])[1] || "";
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fill = (t) => esc(t).replace(/\{operator\}/g, esc(operator)).replace(/\{contact\}/g, '<a href="mailto:' + esc(contact) + '">' + esc(contact) + "</a>");
const page = (key, file) => {
  const d = ctx.POLICY[key];
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>" + esc(d.title) + " - Schritt</title><meta name=\"description\" content=\"" + esc(d.title) + " for Schritt, the free learning app for languages, math and music.\">" +
    '<meta name="theme-color" content="#000000"><link rel="icon" href="/favicon-32.png">' +
    "<style>:root{color-scheme:dark}body{margin:0;background:#000;color:#f5f5f7;font:17px/1.6 -apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif}" +
    "main{max-width:720px;margin:0 auto;padding:32px 20px 80px}a{color:#5ac8fa}h1{font-size:2.2rem;letter-spacing:-.02em;margin:.2em 0}h2{font-size:1.2rem;margin:1.8em 0 .3em}" +
    "p{margin:.4em 0;color:#d2d2d7}.note{color:#a1a1a6;font-size:.9rem}nav{display:flex;gap:16px;align-items:center;margin-bottom:24px}nav b{font-size:1.1rem}</style></head><body><main>" +
    '<nav><img src="/icon-192.png" width="36" height="36" alt="Schritt logo" style="border-radius:9px"><b>Schritt</b><a href="/">Open the app</a><a href="/privacy.html">Privacy policy</a><a href="/terms.html">Terms of use</a></nav>' +
    "<h1>" + esc(d.title) + "</h1><p class=\"note\">" + esc(d.note.replace(/\s*Plain-language template, not legal advice\./, "")) + "</p>" +
    d.sections.map((s) => "<h2>" + esc(s[0]) + "</h2><p>" + fill(s[1]) + "</p>").join("") +
    '<p class="note" style="margin-top:2.5em">Website: https://schritt-rosy.vercel.app &middot; Contact: ' + fill("{contact}") + "</p></main></body></html>";
  fs.writeFileSync(path.join(pub, file), html); console.log("wrote", file, html.length);
};
page("privacy", "privacy.html"); page("terms", "terms.html");

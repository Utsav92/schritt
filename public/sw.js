/* Offline cache for Schritt. Bump VERSION when files change. */
const VERSION = "schritt-v24";
const CORE = ["./", "index.html", "style.css", "apple.css", "data.js", "packs_more.js", "units_adv.js", "adv1.js", "adv2.js", "adv3.js", "units_more.js", "adv4.js", "adv5.js", "adv6.js", "engine.js", "config.js", "policy.js", "pages.js", "apply.js", "front.js", "subjects.js", "visuals.js", "tv.js", "math.js", "music.js", "studio.js", "app.js", "manifest.json", "icon.svg", "icon-192.png", "icon-maskable-512.png", "apple-touch-icon.png", "icon-512.png"].concat(["happy","starstruck","wink","love","determined","celebrate","oops","thinking","sleepy","shocked","sad","relieved","fox","axolotl","bear","afro","curly","violet","robot","cat","dragon"].map((n) => "art/" + n + ".webp"));

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;
  // Network first for our own files so updates show up; fall back to cache offline. Fonts: cache first.
  if (isFont) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }).catch(() => hit)));
    return;
  }
  e.respondWith(fetch(req, { cache: "no-cache" }).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html"))));
});

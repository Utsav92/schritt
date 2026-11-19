// Copies the web app into mobile/www (what Capacitor bundles inside the app, so lessons work offline).
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "public"), DST = path.join(__dirname, "www");
fs.rmSync(DST, { recursive: true, force: true });
fs.cpSync(SRC, DST, { recursive: true });
// The service worker is for browsers; the native app already ships every file, so remove it to avoid stale caches.
fs.rmSync(path.join(DST, "sw.js"), { force: true });
console.log("web app copied to", DST);

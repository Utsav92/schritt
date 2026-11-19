/* Remote-control and keyboard navigation for TVs and desktops: arrow keys move focus to the nearest control in that direction,
   Enter activates, and the Back key (Escape, Backspace, or the Tizen / webOS Back buttons) closes the top layer.
   Touch and mouse are untouched. Does nothing while typing in a field. */
(function (root) {
  "use strict";
  var SEL = 'button:not([disabled]),a[href],input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
  var doc = root.document;
  function visible(el) { var r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; var cs = root.getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none" && r.bottom > 0 && r.right > 0 && r.top < root.innerHeight && r.left < root.innerWidth; }
  function layer() {
    var sheet = doc.getElementById("sheet"), pages = doc.getElementById("pages"), lesson = doc.getElementById("lesson"), ad = doc.querySelector(".ad-screen"), wel = doc.getElementById("welcome");
    if (ad) return ad; if (sheet && !sheet.hidden) return sheet; if (pages) return pages; if (lesson && !lesson.hidden) return lesson; if (wel) return wel; return doc.body;
  }
  function pick(dir) {
    var cur = doc.activeElement, scope = layer(), list = Array.prototype.filter.call(scope.querySelectorAll(SEL), visible);
    if (!cur || cur === doc.body || !scope.contains(cur)) return list[0];
    var a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2, best = null, bs = 1e9;
    list.forEach(function (el) {
      if (el === cur) return; var b = el.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2, dx = bx - ax, dy = by - ay, ok, main, cross;
      if (dir === "ArrowRight") { ok = dx > 4; main = dx; cross = Math.abs(dy); } else if (dir === "ArrowLeft") { ok = dx < -4; main = -dx; cross = Math.abs(dy); }
      else if (dir === "ArrowDown") { ok = dy > 4; main = dy; cross = Math.abs(dx); } else { ok = dy < -4; main = -dy; cross = Math.abs(dx); }
      if (!ok) return; var score = main + cross * 2.2; if (score < bs) { bs = score; best = el; }
    });
    return best;
  }
  function back() {
    var pages = doc.getElementById("pages"), sheet = doc.getElementById("sheet"), ad = doc.querySelector(".ad-screen");
    if (ad) { var sk = ad.querySelector("button:not([disabled])"); if (sk) sk.click(); return true; }
    if (sheet && !sheet.hidden) { var c = sheet.querySelector("#shStay,#shNo,#shOk,#plClose,#pfCancel"); if (c) c.click(); return !!c; }
    if (pages && root.Pages) { root.Pages.close(); return true; }
    var lc = doc.getElementById("lClose"); if (lc && !doc.getElementById("lesson").hidden) { lc.click(); return true; }
    return false;
  }
  doc.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (t.tagName === "INPUT" && !/^(button|checkbox|radio|range|file)$/.test(t.type) || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape" || e.keyCode === 10009 || e.keyCode === 461 || (e.key === "Backspace" && !typing)) { if (back()) e.preventDefault(); return; }
    if (typing || !/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
    var next = pick(e.key); if (next) { e.preventDefault(); doc.documentElement.classList.add("kbd-nav"); next.focus({ preventScroll: true }); next.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }); }
  });
  doc.addEventListener("pointerdown", function () { doc.documentElement.classList.remove("kbd-nav"); });
  /* tell CSS what kind of screen this is, so one stylesheet can adapt (also used by the TV tiers) */
  function mode() { var w = root.innerWidth, h = root.innerHeight, c = doc.documentElement.classList; c.toggle("is-tv", w >= 1700 && !root.matchMedia("(pointer:coarse)").matches); c.toggle("is-land", h <= 500 && w > h); }
  root.addEventListener("resize", mode); mode();
})(window);

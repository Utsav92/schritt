/* Front page (landing + sign-in) for Schritt: simplified flag artwork, 3D flag carousel, tilting phones, install buttons.
   Flags are simplified flat drawings (not official flag specifications). Window.Front.html(opts) returns markup; Front.init(root) starts the pointer parallax. */
(function (root) {
  "use strict";
  var R = function (x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; };
  var star = function (cx, cy, r, c) { var p = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; p.push((cx + rr * Math.cos(a)).toFixed(2) + "," + (cy + rr * Math.sin(a)).toFixed(2)); } return '<polygon points="' + p.join(" ") + '" fill="' + c + '"/>'; };
  var FLAGS = {
    de: R(0, 0, 30, 6.67, "#000") + R(0, 6.67, 30, 6.67, "#d00") + R(0, 13.33, 30, 6.67, "#ffce00"),
    es: R(0, 0, 30, 20, "#c60b1e") + R(0, 5, 30, 10, "#ffc400"),
    esmx: R(0, 0, 10, 20, "#006847") + R(10, 0, 10, 20, "#fff") + R(20, 0, 10, 20, "#ce1126") + '<circle cx="15" cy="10" r="2.4" fill="#8c6b3f"/>',
    fr: R(0, 0, 10, 20, "#0055a4") + R(10, 0, 10, 20, "#fff") + R(20, 0, 10, 20, "#ef4135"),
    it: R(0, 0, 10, 20, "#009246") + R(10, 0, 10, 20, "#fff") + R(20, 0, 10, 20, "#ce2b37"),
    pt: R(0, 0, 30, 20, "#009c3b") + '<polygon points="15,2 27.5,10 15,18 2.5,10" fill="#ffdf00"/><circle cx="15" cy="10" r="4.4" fill="#002776"/><path d="M10.8 9.4 Q15 8.2 19.2 10.9" stroke="#fff" stroke-width="1" fill="none"/>',
    nl: R(0, 0, 30, 6.67, "#ae1c28") + R(0, 6.67, 30, 6.67, "#fff") + R(0, 13.33, 30, 6.67, "#21468b"),
    sv: R(0, 0, 30, 20, "#006aa7") + R(9, 0, 3.6, 20, "#fecc00") + R(0, 8.2, 30, 3.6, "#fecc00"),
    tr: R(0, 0, 30, 20, "#e30a17") + '<circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.4" cy="10" r="4" fill="#e30a17"/>' + star(17, 10, 2.4, "#fff"),
    vi: R(0, 0, 30, 20, "#da251d") + star(15, 10.6, 5.6, "#ff0"),
    ko: R(0, 0, 30, 20, "#fff") + '<path d="M11 10a4 4 0 0 1 8 0z" fill="#cd2e3a"/><path d="M11 10a4 4 0 0 0 8 0z" fill="#0047a0"/>' +
      [[4, 4, 0], [26, 4, 1], [4, 16, 1], [26, 16, 0]].map(function (b) { return '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(' + (b[2] ? -35 : 35) + ')"><rect x="-2.6" y="-1.8" width="5.2" height=".7" fill="#000"/><rect x="-2.6" y="-.35" width="5.2" height=".7" fill="#000"/><rect x="-2.6" y="1.1" width="5.2" height=".7" fill="#000"/></g>'; }).join(""),
    zh: R(0, 0, 30, 20, "#de2910") + star(5.5, 5.5, 3.2, "#ffde00") + star(11, 2.6, 1, "#ffde00") + star(13, 5, 1, "#ffde00") + star(13, 8, 1, "#ffde00") + star(11, 10.3, 1, "#ffde00"),
    ja: R(0, 0, 30, 20, "#fff") + '<circle cx="15" cy="10" r="6" fill="#bc002d"/>',
    th: R(0, 0, 30, 3.33, "#a51931") + R(0, 3.33, 30, 3.33, "#f4f5f8") + R(0, 6.67, 30, 6.67, "#2d2a4a") + R(0, 13.33, 30, 3.33, "#f4f5f8") + R(0, 16.67, 30, 3.33, "#a51931"),
    hi: R(0, 0, 30, 6.67, "#f93") + R(0, 6.67, 30, 6.67, "#fff") + R(0, 13.33, 30, 6.67, "#138808") + '<circle cx="15" cy="10" r="2.5" fill="none" stroke="#000080" stroke-width=".5"/><path d="M15 7.5v5M12.5 10h5M13.2 8.2l3.6 3.6M16.8 8.2l-3.6 3.6" stroke="#000080" stroke-width=".3"/>',
    ur: R(0, 0, 30, 20, "#01411c") + R(0, 0, 7.5, 20, "#fff") + '<circle cx="19" cy="10" r="5" fill="#fff"/><circle cx="20.5" cy="9.2" r="4.1" fill="#01411c"/>' + star(21.8, 8, 1.7, "#fff"),
    ar: R(0, 0, 30, 20, "#006c35") + R(7, 13.6, 16, 1, "#fff") + R(10, 5, 10, 1.3, "#fff") + R(12, 7.4, 6, 1.1, "#fff")
  };
  var NAMES = { de: "German", es: "Spanish", esmx: "Spanish (Mexico)", fr: "French", it: "Italian", pt: "Portuguese", nl: "Dutch", sv: "Swedish", tr: "Turkish", vi: "Vietnamese", ko: "Korean", zh: "Chinese", ja: "Japanese", th: "Thai", hi: "Hindi", ur: "Urdu", ar: "Arabic" };
  var ORDER = ["de", "es", "fr", "it", "pt", "esmx", "nl", "sv", "tr", "vi", "ko", "zh", "ja", "th", "hi", "ur", "ar"];
  function flag(id) { return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false">' + (FLAGS[id] || R(0, 0, 30, 20, "#ccc")) + "</svg>"; }
  function native(id) { var p = (root.PACKS || {})[id]; return p && p.native ? p.native : NAMES[id]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>';
  function html(o) {
    o = o || {};
    var ring = ORDER.map(function (id, i) { return '<div class="fr-card" style="--i:' + i + '">' + flag(id) + "<b>" + esc(native(id)) + "</b></div>"; }).join("");
    var strip = ORDER.map(function (id) { return '<span class="fr-chip">' + flag(id) + esc(NAMES[id]) + "</span>"; }).join("");
    var socials = root.Pages && root.Pages.socialLinks ? root.Pages.socialLinks() : [];
    var art = ["fox", "starstruck", "dragon", "celebrate", "axolotl", "love"].map(function (n, i) { return '<img class="fr-float f' + (i + 1) + '" src="art/' + n + '.webp" alt="" width="96" height="96" decoding="async">'; }).join("");
    return '<div class="fr-bg" aria-hidden="true"><i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i></div>' +
      '<header class="fr-top"><div class="fr-brand"><img src="icon.svg" alt="" width="34" height="34">Schritt</div><button class="fr-toplink" id="frLogin">Log in</button></header>' +
      '<main class="fr-hero"><div class="fr-copy"><h1 id="wlTitle">Languages, music and math<br>the playful way.</h1><p class="fr-lead">17 languages from A1 to C2, music from first notes to chords, and math from grade 1 to 12. Short lessons with gems, streaks and friendly faces.</p>' +
      '<div class="fr-cta"><button class="btn fr-primary" id="wlGuest">Get started, it\'s free</button>' +
      '<button class="btn secondary" id="wlNew">Create a profile</button>' +
      '<button class="btn secondary fr-google" id="wlGoogle"' + (o.googleOn ? "" : " disabled") + ">Continue with Google</button>" +
      (o.hasProfiles ? '<button class="btn ghost" id="wlLogin">I already have a profile</button>' : "") + "</div>" +
      (o.googleOn ? "" : '<p class="fr-note">Google sign-in is not switched on for this site yet. Profiles work now.</p>') +
      '<p class="fr-note">By continuing you agree to the <button class="link" id="wlTerms">Terms</button> and <button class="link" id="wlPrivacy">Privacy policy</button>.</p></div>' +
      '<div class="fr-stage" id="frStage" aria-hidden="true"><div class="fr-ringwrap"><div class="fr-ring">' + ring + "</div></div>" +
      '<div class="fr-phones"><div class="fr-phone p2"><img src="art/hero-lesson.webp" alt="" width="210" height="454"></div><div class="fr-phone p1"><img src="art/hero-learn.webp" alt="" width="210" height="454"></div></div>' + art + "</div></main>" +
      '<section class="fr-marquee" aria-label="Languages"><div class="fr-track">' + strip + strip + "</div></section>" +
      '<section class="fr-feats"><article class="fr-feat"><div class="ladder" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><h2>Three subjects, one app</h2><p>180 lessons in every language, 360 in math and 90 in music. Switch between them with one tap.</p></article>' +
      '<article class="fr-feat"><div class="types" aria-hidden="true"><span>Listen</span><span>Match</span><span>Build</span><span>Type</span><span>Pick</span></div><h2>Lessons that mix it up</h2><p>Listening, matching, building sentences and typing, with spaced review for the words you miss.</p></article>' +
      '<article class="fr-feat"><div class="plans" aria-hidden="true"><b>Free</b><b class="gold">&#9733; All of it</b></div><h2>Free for everyone</h2><p>Every language, every grade, every level, with no ads, no paywall and no hearts to run out of.</p></article></section>' +
      '<section class="fr-get" id="frGet"><h2>Take Schritt with you</h2><p>It installs like an app on your phone and works offline after your first visit. No store download needed.</p>' +
      '<div class="fr-install"><button class="btn secondary" id="frIos">' + PHONE + ' Install on iPhone or iPad</button><button class="btn secondary" id="frAndroid">' + PHONE + " Install on Android</button></div></section>" +
      '<footer class="fr-foot"><div class="fr-cols">' +
      '<div><h4>Schritt</h4><button data-page="about">About us</button><button data-page="mission">Mission and values</button><button data-page="products">Products</button><button data-page="careers">Careers</button></div>' +
      '<div><h4>Help and support</h4><button data-page="help">Help center</button><button data-page="help">Contact support</button><button data-page="security">Safety and security</button></div>' +
      '<div><h4>Legal</h4><a href="/privacy.html">Privacy policy</a><a href="/terms.html">Terms of use</a></div>' +
      (socials.length ? '<div><h4>Follow us</h4>' + socials.join("") + "</div>" : "") + '</div><p class="fr-copy-line">&copy; ' + new Date().getFullYear() + ' Schritt. Made for learners.</p></footer>';
  }
  function reveal(el) {
    var items = el.querySelectorAll(".fr-feat,.fr-get,.fr-marquee,.fr-foot"); if (!items.length || !("IntersectionObserver" in root)) return;
    items.forEach(function (n) { n.classList.add("rv"); }); el.classList.add("js-rv");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { root: el, threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (n) { io.observe(n); });
  }
  function init(el) {
    reveal(el);
    var stage = el.querySelector("#frStage"); if (!stage) return;
    if (root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var raf = 0, px = 0, py = 0;
    el.addEventListener("pointermove", function (e) { px = (e.clientX / root.innerWidth - .5) * 2; py = (e.clientY / root.innerHeight - .5) * 2; if (!raf) raf = requestAnimationFrame(function () { raf = 0; stage.style.setProperty("--px", px.toFixed(3)); stage.style.setProperty("--py", py.toFixed(3)); }); }, { passive: true });
  }
  root.Front = { html: html, init: init, flag: flag, ORDER: ORDER, NAMES: NAMES };
})(window);

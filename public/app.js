/* Schritt app: state, screens and the lesson player. Lesson content logic lives in engine.js. */
(function () {
  "use strict";
  var E = window.Engine, UNITS = window.UNITS;
  var KEY = "schritt.v1", MAX_HEARTS = 5, REGEN_MS = 25 * 60000, DAY = 86400000;

  /* ---------- state ---------- */
  function fresh() {
    return { v: 1, lang: "de", xp: 0, streak: 0, lastDay: "", dayXp: {}, goal: 20, hearts: MAX_HEARTS, heartsT: 0,
      progress: {}, items: {}, stats: { right: 0, wrong: 0 }, settings: { speech: true, sound: true, theme: "dark", rate: 0.9 }, custom: {}, avatar: "fox", subject: "lang", gems: 0, freezes: 0, freezeWeek: "", quests: null, plus: null, trialUsed: false, uid: newUid() };
  }
  var profileId = "";
  try { profileId = localStorage.getItem("schritt.profile") || ""; } catch (e) { profileId = ""; }
  function storeKey() { return profileId ? KEY + "." + profileId : KEY; }
  function safeParse(text) { return JSON.parse(text, function (k, v) { return (k === "__proto__" || k === "constructor" || k === "prototype") ? undefined : v; }); }
  function getProfiles() { try { var a = safeParse(localStorage.getItem("schritt.profiles") || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function setProfiles(a) { try { localStorage.setItem("schritt.profiles", JSON.stringify(a)); } catch (e) { /* storage blocked */ } }
  function currentProfile() { return getProfiles().filter(function (p) { return p.id === profileId; })[0] || null; }
  function newUid() { return "u" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  if (profileId && !currentProfile()) profileId = "";
  var S = load();
  function load() {
    try { var raw = localStorage.getItem(storeKey()); if (raw) { var s = safeParse(raw); return Object.assign(fresh(), s, { settings: Object.assign(fresh().settings, s.settings || {}) }); } } catch (e) { /* ignore */ }
    return fresh();
  }
  /* ---------- art: liquid-glass reactions and avatars (art/*.webp) ---------- */
  var AVATARS = [["fox", "Fox"], ["axolotl", "Axolotl"], ["bear", "Bear"], ["afro", "Curls"], ["curly", "Glasses"], ["violet", "Violet"], ["robot", "Robot"], ["cat", "Cat"], ["dragon", "Dragon"]];
  var LEVEL_EM = { A1: "happy", A2: "wink", B1: "determined", B2: "thinking", C1: "starstruck", C2: "celebrate" };
  var DECO = ["thinking", "wink", "love", "determined", "happy", "starstruck", "oops", "relieved"];
  function pick(arr, n) { return arr[Math.abs(n | 0) % arr.length]; }
  function em(name, cls, px) { return '<img class="em ' + (cls || "") + '" src="art/' + name + '.webp" alt="" width="' + px + '" height="' + px + '" decoding="async">'; }
  function avatarImg(cls, px) { var a = AVATARS.some(function (x) { return x[0] === S.avatar; }) ? S.avatar : "fox"; return '<img class="av ' + (cls || "") + "" + '" src="art/' + a + '.webp" alt="Your avatar" width="' + px + '" height="' + px + '" decoding="async">'; }
  var saveTimer = 0;
  function save() { try { localStorage.setItem(storeKey(), JSON.stringify(S)); } catch (e) { /* storage blocked */ } cloudDirty(); }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 200); }

  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function yesterday() { var d = new Date(Date.now() - DAY); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function daysAgoStr(n) { var d = new Date(Date.now() - n * DAY); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function streakNow() {
    if (S.lastDay === today() || S.lastDay === yesterday()) return S.streak;
    if ((S.freezes || 0) > 0 && S.lastDay === daysAgoStr(2)) return S.streak; // a freeze will cover the missed day
    return 0;
  }

  /* ---------- Plus, gems, quests ---------- */
  var CFG = window.SCHRITT_CONFIG || { trialDays: 7, plans: {} };
  function subj() { return S.subject === "math" || S.subject === "music" ? S.subject : "lang"; }
  function freeLevels() {
    var f = CFG.freeLevels, k = subj();
    if (Array.isArray(f)) return k === "lang" ? f : (course().freeLevels || []);
    if (f && f[k]) return f[k];
    return k === "lang" ? ["A1", "A2", "B1"] : (course().freeLevels || []);
  }
  function levelLocked(l) { return false; }  /* everything is free for everyone */
  function isPlus() { return true; }  /* every feature (unlimited hearts, mistakes review, streak freezes, no ads) is free for everyone */
  function fmtDate(ms) { return new Date(ms).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  function plusLine() {
    var p = S.plus; if (!p) return "";
    if (p.source === "trial") return "Free trial ends " + fmtDate(p.until);
    var t = (p.plan || "Plus") + " plan"; if (p.until) t += " \u00b7 paid through " + fmtDate(p.until); if (p.verified === false) t += " \u00b7 not verified by a server";
    return t;
  }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + "-W" + Math.ceil(((t - y0) / DAY + 1) / 7); }
  function freezeCap() { return isPlus() ? 2 : 1; }
  function weeklyFreeze() { if (!isPlus()) return; var wk = isoWeek(new Date()); if (S.freezeWeek !== wk) { S.freezeWeek = wk; S.freezes = Math.min(freezeCap(), (S.freezes || 0) + 1); } }
  function applyTheme() { var t = S.settings.theme, r = document.documentElement; r.setAttribute("data-theme", t === "light" ? "light" : "dark"); }  /* dark by default; "system" is treated as dark */
  var QUESTS = [{ id: "xp", label: "Earn 30 XP", goal: 30, gems: 15 }, { id: "lessons", label: "Complete 2 lessons", goal: 2, gems: 15 }, { id: "perfect", label: "Finish a lesson without a mistake", goal: 1, gems: 20 }];
  function questState() { var d = today(); if (!S.quests || S.quests.day !== d) S.quests = { day: d, p: { xp: 0, lessons: 0, perfect: 0 }, claimed: [] }; return S.quests; }
  function questTick(id, n) { var q = questState(); q.p[id] = (q.p[id] || 0) + n; }
  function claimQuest(id) {
    var q = questState(), d = QUESTS.filter(function (x) { return x.id === id; })[0];
    if (!d || q.claimed.indexOf(id) >= 0 || (q.p[id] || 0) < d.goal) return;
    var g = d.gems; q.claimed.push(id); S.gems += g; save(); render(); toast("+" + g + " gems");
  }
  var SHOP = { hearts: { cost: 350 }, freeze: { cost: 200 } };
  function buyItem(id) {
    var it = SHOP[id]; if (!it) return;
    if (S.gems < it.cost) { toast("Not enough gems yet"); return; }
    if (id === "hearts") {
      if (isPlus()) { toast("You already have unlimited hearts"); return; }
      if (S.hearts >= MAX_HEARTS) { toast("Your hearts are full"); return; }
      S.hearts = MAX_HEARTS; S.heartsT = Date.now();
    } else if (id === "freeze") {
      if ((S.freezes || 0) >= freezeCap()) { toast("You already hold the maximum"); return; }
      S.freezes = (S.freezes || 0) + 1;
    }
    S.gems -= it.cost; save(); render(); toast(id === "hearts" ? "Hearts refilled" : "Streak freeze added");
  }
  function tickHearts() {
    weeklyFreeze();
    if (isPlus()) { S.hearts = MAX_HEARTS; S.heartsT = Date.now(); return; }
    if (S.hearts >= MAX_HEARTS) { S.hearts = MAX_HEARTS; S.heartsT = Date.now(); return; }
    var gain = Math.floor((Date.now() - S.heartsT) / REGEN_MS);
    if (gain > 0) { S.hearts = Math.min(MAX_HEARTS, S.hearts + gain); S.heartsT += gain * REGEN_MS; if (S.hearts >= MAX_HEARTS) S.heartsT = Date.now(); }
  }
  function loseHeart() { if (isPlus()) return; if (S.hearts >= MAX_HEARTS) S.heartsT = Date.now(); S.hearts = Math.max(0, S.hearts - 1); }
  function nextHeartIn() { var ms = REGEN_MS - (Date.now() - S.heartsT); return Math.max(1, Math.ceil(ms / 60000)); }

  /* ---------- languages ---------- */
  function allPacks() { return Object.assign({}, window.PACKS, S.custom); }
  var courseCache = {};
  function course() {
    if (subj() !== "lang") { var sid = subj(); if (!courseCache[sid]) courseCache[sid] = { c: Subjects.course(sid) }; return courseCache[sid].c; }
    var id = S.lang;
    if (!allPacks()[id]) { id = S.lang = "de"; }
    var packs = allPacks();
    if (!courseCache[id] || courseCache[id].src !== packs[id]) courseCache[id] = { src: packs[id], c: E.buildCourse(id, UNITS, packs) };
    return courseCache[id].c;
  }
  function progressOf(lang) { return S.progress[lang] || (S.progress[lang] = {}); }
  function lessonDone(lang, unitId, idx) { return (progressOf(lang)[unitId] || []).indexOf(idx) >= 0; }
  function markDone(lang, unitId, idx) { var p = progressOf(lang); p[unitId] = p[unitId] || []; if (p[unitId].indexOf(idx) < 0) p[unitId].push(idx); }
  /* lessons unlock in order across the whole course */
  function flatLessons(c) { var out = []; c.units.forEach(function (u, ui) { u.lessons.forEach(function (l) { out.push({ ui: ui, li: l.idx }); }); }); return out; }
  function currentLesson(c) {
    var f = flatLessons(c);
    for (var i = 0; i < f.length; i++) if (!lessonDone(c.lang, c.units[f[i].ui].id, f[i].li)) return i;
    return f.length;
  }

  /* ---------- speech + sound ---------- */
  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  loadVoices();
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = loadVoices;
  function voiceFor(tts) {
    var pre = tts.slice(0, 2).toLowerCase(), best = null;
    voices.forEach(function (v) { if (v.lang.toLowerCase().indexOf(pre) === 0) { if (!best || v.lang.toLowerCase() === tts.toLowerCase()) best = v; } });
    return best;
  }
  function speechOK() { return S.settings.speech && !!window.speechSynthesis && !!voiceFor(course().tts); }
  function say(text) {
    if (!window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text), v = voiceFor(course().tts);
      u.lang = course().tts; if (v) u.voice = v; u.rate = S.settings.rate || 0.9; speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  var actx = null;
  function beep(kind) {
    if (!S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var seq = kind === "good" ? [[660, 0], [880, .09]] : kind === "bad" ? [[220, 0], [165, .1]] : [[523, 0], [659, .1], [784, .2], [1046, .32]];
      seq.forEach(function (n) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + n[1];
        o.type = "sine"; o.frequency.value = n[0]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) { /* audio blocked */ }
  }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4.1 2.3h3.8C14.6 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2s5 4.5 5 9.5A5 5 0 0 1 12 17a5 5 0 0 1-5-5.5c0-1.7.8-3 1.6-4C9 9 10 10 10.8 10 10.6 7 12 2 12 2zM12 22a7 7 0 0 1-7-7c0-1 .2-2 .6-2.8C6.600 14 9 15.800 12 15.800S17.400 14 18.400 12.200c.4.800.6 1.800.6 2.800a7 7 0 0 1-7 7z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15.500 8.500a5 5 0 0 1 0 7M18.500 5.500a9 9 0 0 1 0 13"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="17.500" cy="16" r="2.500"/></svg>',
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 5H7l6.500 7L7 19h11"/></svg>',
    gem: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.200 3h11.600L22 9.200 12 21.500 2 9.200zM8.300 5 6.200 8.800h11.600L15.700 5z"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.300 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h4v-5h4v-5h4V5h6"/></svg>',
    practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.300L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.300L4 15M4 20v-5h5"/></svg>',
    words: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16M4 10h10M4 15h16M4 20h8"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
  };
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2600); }

  /* ---------- shell ---------- */
  var tab = (location.hash || "#learn").slice(1);
  if (["learn", "practice", "words", "studio", "shop", "me"].indexOf(tab) < 0) tab = "learn";
  var SECTIONS = [["lang", "Languages", "globe"], ["music", "Music", "note"], ["math", "Math", "sigma"]];
  function renderSections() {
    var el = $("sections"); if (!el) return;
    var seg = el.querySelector(".seg");
    if (!seg) { el.innerHTML = '<div class="seg" role="group"><i class="seg-thumb" aria-hidden="true"></i>' + SECTIONS.map(function (x) { return '<button class="sec" data-sec="' + x[0] + '">' + ICON[x[2]] + "<span>" + x[1] + "</span></button>"; }).join("") + "</div>"; seg = el.querySelector(".seg"); }
    SECTIONS.forEach(function (x, i) { var b = seg.children[i + 1], on = subj() === x[0]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); if (on) seg.style.setProperty("--idx", i); });
  }
  function vt(fn) { var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; if (document.startViewTransition && !calm) { try { var t = document.startViewTransition(fn); if (t) { if (t.ready) t.ready.catch(function () {}); if (t.finished) t.finished.catch(function () {}); if (t.updateCallbackDone) t.updateCallbackDone.catch(function () {}); } return; } catch (e) { /* fall through */ } } fn(); }
  function setSubject(id) { if (subj() === id) { if (tab !== "learn") openTab("learn"); return; } S.subject = id; if (tab === "studio" && id !== "music") tab = "learn"; save(); vt(function () { render(); window.scrollTo(0, 0); }); }
  $("sections").addEventListener("click", function (e) { var b = e.target.closest("[data-sec]"); if (b) setSubject(b.dataset.sec); });
  function openTab(t) { tab = t; history.replaceState(null, "", "#" + t); vt(function () { render(); window.scrollTo(0, 0); }); }
  function renderShell() {
    tickHearts();
    var c = course();
    $("topbar").innerHTML = '<button class="avatar-btn" id="avBtn" aria-label="Open your profile">' + avatarImg("", 38) + '</button><button class="brand" id="brandBtn" aria-label="Schritt home">Schritt</button>' +
      (subj() === "lang" ? '<button class="pill lang" id="langBtn" aria-label="Change language, now ' + esc(c.name) + '">' + esc(c.name) + '</button>' : '<span class="pill lang">' + esc(c.name) + "</span>") +
      '<span class="pill ic-flame" title="Day streak">' + ICON.flame + '<span style="color:var(--fg)">' + streakNow() + '</span></span>' +
      '<span class="pill ic-gem" title="Gems">' + ICON.gem + '<span style="color:var(--fg)">' + S.gems + '</span></span>' +
      (currentProfile() ? "" : '<button class="pill login" id="loginBtn">Log in</button>');
    var sj = subj(), tabs = [["learn", "Learn", ICON.learn], ["practice", "Practice", ICON.practice], ["words", sj === "lang" ? "Words" : "Notes", ICON.words]].concat(sj === "music" ? [["studio", "Studio", ICON.note]] : []).concat([["shop", "Shop", ICON.shop], ["me", "Profile", ICON.me]]);
    $("tabs").innerHTML = tabs.map(function (t) {
      return '<button class="tab" data-tab="' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : "") + ">" + t[2] + "<span>" + t[1] + "</span></button>";
    }).join("");
    if ($("langBtn")) $("langBtn").onclick = openLangSheet;
    $("avBtn").onclick = function () { openTab("me"); };
    if ($("loginBtn")) $("loginBtn").onclick = showWelcome;
    $("brandBtn").onclick = function () { if (currentProfile()) openTab("learn"); else showWelcome(); };
  }
  $("tabs").addEventListener("click", function (e) {
    var b = e.target.closest(".tab"); if (!b) return;
    tab = b.dataset.tab; history.replaceState(null, "", "#" + tab); render(); window.scrollTo(0, 0);
  });
  function render() {
    renderShell(); renderSections();
    var v = $("view");
    if (tab === "learn") renderLearn(v); else if (tab === "practice") renderPractice(v); else if (tab === "words") renderWords(v); else if (tab === "studio") Studio.render(v, { esc: esc, toast: toast, em: em, CFG: CFG }); else if (tab === "shop") renderShop(v); else if (tab === "plus") renderPlus(v); else renderProfile(v);
    renderRight();
  }

  /* ---------- learn ---------- */
  function renderLearn(v) {
    var c = course(), cur = currentLesson(c), flat = flatLessons(c), n = 0;
    var dayXp = S.dayXp[today()] || 0, pct = Math.min(100, Math.round(dayXp / S.goal * 100));
    var html = '<div class="card goal"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><h2>Daily goal</h2><div class="muted">' + dayXp + " of " + S.goal + " XP today. " + (pct >= 100 ? "Goal reached." : "Finish a lesson to keep your streak.") + "</div></div>" + em(pct >= 100 ? "celebrate" : streakNow() ? "determined" : "happy", "goal-em", 64) + "</div>" + questsHtml();
    var prevLvl = "", lvls = c.levels || window.LEVELS || [];
    c.units.forEach(function (u, ui) {
      if (u.lvl !== prevLvl) {
        prevLvl = u.lvl;
        var lv = lvls.filter(function (x) { return x.id === u.lvl; })[0] || { id: u.lvl, name: "", blurb: "" };
        var lvLocked = false;  /* every lesson is open: jump anywhere */
        html += '<div class="lvl-head" id="lvl-' + esc(u.lvl) + '"><span class="lvl-badge">' + esc(lv.id) + "</span><div><b>" + esc(lv.name) + '</b><div class="muted">' + esc(lv.blurb) + "</div></div>" + em(LEVEL_EM[u.lvl] || c.emoji || "happy", "lvl-em", 44) +
          (levelLocked(u.lvl) ? '<button class="btn" data-act="plus">Unlock with Plus</button>' : lvLocked ? '<button class="btn secondary" data-jump="' + ui + '" data-lvl="' + esc(lv.id) + '">Jump here</button>' : "") + "</div>";
      }
      html += '<section class="unit"><div class="unit-head" style="background:' + u.color + '"><small>Unit ' + (ui + 1) + "</small><h2>" + esc(u.title) + "</h2><small>" + esc(u.blurb) + '</small></div><div class="path">';
      u.lessons.forEach(function (l) {
        var flatIdx = n++, done = lessonDone(c.lang, u.id, l.idx), isCur = flatIdx === cur && !levelLocked(u.lvl), planLocked = levelLocked(u.lvl), locked = false;
        var offset = Math.round(Math.sin(l.idx * 1.2) * 44);
        var cls = "node" + (done ? " done" : "") + (isCur ? " current" : "") + (locked ? " locked" : "") + (l.test ? " test" : "");
        var inner = planLocked ? ICON.star : locked ? ICON.lock : done ? ICON.check : (l.test ? "T" : (l.idx + 1));
        html += '<div class="node-wrap" style="transform:translateX(' + offset + 'px)">' + (isCur ? '<span class="you-tag" aria-hidden="true">' + avatarImg("", 44) + "</span>" : "") + '<button class="' + cls + '" style="background:' + u.color + ";--nodec:" + u.color + '" data-u="' + ui + '" data-l="' + l.idx + '"' + (locked && !planLocked ? " disabled" : "") + (planLocked ? ' data-plus="1"' : "") +
          ' aria-label="' + esc(u.title + ", " + l.title + (done ? ", completed" : planLocked ? ", requires Plus" : locked ? ", locked" : "")) + '">' + inner + '</button><span class="node-label">' + esc(l.title) + "</span></div>";
        if (l.idx === 1 || l.idx === 3) html += '<div class="path-deco" aria-hidden="true" style="transform:translateX(' + (l.idx === 1 ? -1 : 1) * 92 + 'px)">' + em(pick(DECO, ui * 2 + l.idx), "deco", 64) + "</div>";
      });
      if (u.lessons.every(function (l) { return lessonDone(c.lang, u.id, l.idx); })) html += '<div class="path-deco done" aria-hidden="true">' + em("celebrate", "deco", 72) + "</div>";
      html += "</div></section>";
    });
    if (cur >= flat.length) html += '<div class="card empty" style="margin-top:20px">' + em("celebrate", "", 96) + '<h2>Course complete</h2><p class="muted">You finished every unit. Replay any lesson or keep your words fresh in Practice.</p></div>';
    v.innerHTML = html;
  }
  /* ---------- ads (free accounts only) ---------- */
  var HOUSE_AD = { house: true, headline: "Learn without interruptions", body: "Schritt Plus removes ads, unlocks the advanced levels and gives you unlimited hearts.", cta: "See Plus" };
  function adsCfg() { var a = (CFG && CFG.ads) || {}; return { enabled: a.enabled !== false, every: Math.max(1, a.everyLessons || 3), wait: Math.max(0, a.skipAfterSeconds == null ? 5 : a.skipAfterSeconds), creatives: Array.isArray(a.creatives) ? a.creatives : [] }; }
  function cleanCreative(c) {
    if (!c || !c.headline || typeof c.url !== "string") return null;
    var u; try { u = new URL(c.url); } catch (e) { return null; }
    if (u.protocol !== "https:") return null;
    return { sponsor: String(c.sponsor || "Sponsor").slice(0, 40), headline: String(c.headline).slice(0, 80), body: String(c.body || "").slice(0, 160), cta: String(c.cta || "Learn more").slice(0, 24), url: u.toString(), image: /^art\/[\w\-./]+\.(webp|png|jpg|svg)$/.test(c.image || "") ? c.image : "" };
  }
  function pickAd() {
    var list = adsCfg().creatives.map(cleanCreative).filter(Boolean);
    list.push(HOUSE_AD);
    var n = Math.floor((S.adCount || 0) / adsCfg().every) - 1;
    return list[Math.max(0, n) % list.length];
  }
  function maybeShowAd() {
    var cfg = adsCfg();
    if (!cfg.enabled || isPlus() || !S.adCount || S.adCount % cfg.every !== 0) return;
    showAd(pickAd(), cfg.wait);
  }
  function showAd(ad, wait) {
    var old = document.getElementById("ad"); if (old) old.remove();
    var el = document.createElement("div"); el.id = "ad"; el.className = "ad-screen";
    el.innerHTML = '<div class="ad-card" role="dialog" aria-modal="true" aria-label="Advertisement"><div class="ad-top"><span class="ad-tag">Ad</span><span class="ad-sponsor">' + (ad.house ? "Schritt" : esc(ad.sponsor)) + "</span></div>" +
      (ad.house ? em("starstruck", "ad-art", 120) : ad.image ? '<img class="ad-art ad-img" src="' + esc(ad.image) + '" alt="" width="120" height="120">' : "") +
      "<h2>" + esc(ad.headline) + "</h2>" + (ad.body ? '<p class="muted">' + esc(ad.body) + "</p>" : "") +
      (ad.house ? '<button class="btn" id="adPlus">' + esc(ad.cta) + "</button>" : '<a class="btn" id="adGo" href="' + esc(ad.url) + '" target="_blank" rel="noopener noreferrer sponsored">' + esc(ad.cta) + "</a>") +
      '<button class="btn secondary" id="adSkip" disabled>Skip ad</button><div class="muted ad-note" id="adNote"></div></div>';
    document.body.appendChild(el); document.body.style.overflow = "hidden";
    var skip = $("adSkip"), note = $("adNote"), left = wait, timer = 0;
    function close() { clearInterval(timer); el.remove(); document.body.style.overflow = ""; }
    function tick() { if (left > 0) { skip.textContent = "Skip in " + left; note.textContent = ""; left--; } else { clearInterval(timer); skip.disabled = false; skip.textContent = "Skip ad"; note.textContent = isPlus() ? "" : "Schritt Plus removes ads."; skip.focus(); } }
    skip.onclick = close;
    if ($("adPlus")) $("adPlus").onclick = function () { close(); openTab("plus"); };
    tick(); if (left > 0 || skip.disabled) timer = setInterval(tick, 1000);
  }

  /* ---------- right column: A1 to C2 levels ---------- */
  function levelGroups(c) {
    var cur = currentLesson(c), n = 0, groups = [], idx = {};
    c.units.forEach(function (u, ui) {
      var g = idx[u.lvl];
      if (!g) { g = idx[u.lvl] = { id: u.lvl, first: n, ui: ui, total: 0, done: 0, units: 0 }; groups.push(g); }
      g.units++;
      u.lessons.forEach(function (l) { g.total++; if (lessonDone(c.lang, u.id, l.idx)) g.done++; n++; });
    });
    groups.forEach(function (g) { g.state = g.done >= g.total ? "done" : (cur >= g.first && cur < g.first + g.total) ? "current" : "open"; });
    groups.forEach(function (g) { if (levelLocked(g.id)) g.state = "plus"; });
    return groups;
  }
  function renderRight() {
    var el = $("rightcol"); if (!el) return;
    if (tab !== "learn") { el.hidden = true; el.innerHTML = ""; return; }
    var c = course(), groups = levelGroups(c), lvls = c.levels || window.LEVELS || [], totalDone = 0, total = 0;
    groups.forEach(function (g) { if (g.state === "plus") return; totalDone += g.done; total += g.total; });
    var html = '<div class="rc-me">' + avatarImg("", 52) + '<div><b>' + esc(c.name) + '</b><div class="muted">' + totalDone + " of " + total + " lessons &middot; " + S.xp + " XP</div></div></div>" +
      '<h2 class="rc-title">Levels</h2><div class="rc-list">';
    groups.forEach(function (g) {
      var lv = lvls.filter(function (x) { return x.id === g.id; })[0] || { name: "", blurb: "" };
      var pct = Math.round(g.done / g.total * 100);
      var label = g.state === "plus" ? "Plus only" : g.state === "done" ? "Completed" : g.state === "current" ? "In progress" : g.state === "locked" ? "Locked" : "Open";
      html += '<button class="lvl-card ' + g.state + '" data-lc="' + esc(g.id) + '" data-ui="' + g.ui + '" data-state="' + g.state + '" aria-label="' + esc(g.id + " " + lv.name + ", " + label + ", " + g.done + " of " + g.total + " lessons") + '">' +
        '<span class="lvl-badge sm">' + esc(g.id) + '</span><span class="lc-body"><b>' + esc(lv.name) + '</b><span class="lc-sub">' + g.units + " sections &middot; " + (g.state === "plus" ? "Plus only" : g.done + "/" + g.total + " lessons") + "</span>" +
        '<span class="lc-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span></span>' +
        (g.state === "plus" ? '<span class="lc-state gold">' + ICON.star + "</span>" : g.state === "locked" ? '<span class="lc-state">' + ICON.lock + "</span>" : g.state === "done" ? '<span class="lc-state ok">' + ICON.check + "</span>" : "") + "</button>";
    });
    el.innerHTML = html + "</div>";
    el.hidden = false;
  }
  $("rightcol").addEventListener("click", function (e) {
    var b = e.target.closest(".lvl-card"); if (!b) return;
    if (b.dataset.state === "plus") { openTab("plus"); return; }
    if (b.dataset.state === "locked") { jumpTo(+b.dataset.ui, b.dataset.lc); return; }
    var t = document.getElementById("lvl-" + b.dataset.lc);
    if (t) t.scrollIntoView({ behavior: window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
  function jumpTo(ui, lvl) {
    openSheet('<div class="stack"><h2>Jump to ' + esc(lvl) + '?</h2><p class="muted" style="margin:0">This unlocks every unit before it without practising them. Your words stay unlearned, so Practice will start with this level.</p><button class="btn block" id="shJump">Jump to ' + esc(lvl) + '</button><button class="btn secondary block" id="shNo">Cancel</button></div>');
    $("shNo").onclick = closeSheet;
    $("shJump").onclick = function () {
      var c = course(); c.units.forEach(function (u, i) { if (i < ui) u.lessons.forEach(function (l) { markDone(c.lang, u.id, l.idx); }); });
      save(); closeSheet(); render(); window.scrollTo(0, 0); toast("Unlocked up to " + lvl);
    };
  }
  $("view").addEventListener("click", function (e) {
    var j = e.target.closest("[data-jump]"); if (j) { jumpTo(+j.dataset.jump, j.dataset.lvl); return; }
    var b = e.target.closest(".node"); if (b && b.dataset.plus) { openTab("plus"); return; } if (b && !b.disabled) startLesson(+b.dataset.u, +b.dataset.l);
  });

  function questsHtml() {
    var q = questState();
    return '<div class="card quests"><div class="row between"><h2>Daily quests</h2><span class="muted" style="font-size:13px">resets at midnight</span></div>' + QUESTS.map(function (d) {
      var p = Math.min(d.goal, q.p[d.id] || 0), done = p >= d.goal, claimed = q.claimed.indexOf(d.id) >= 0;
      return '<div class="quest"><div class="q-main"><b>' + esc(d.label) + '</b><span class="lc-bar" aria-hidden="true"><i style="width:' + Math.round(p / d.goal * 100) + '%"></i></span><span class="muted" style="font-size:12.5px">' + p + " / " + d.goal + "</span></div>" +
        (claimed ? '<span class="q-done" aria-label="Claimed">' + ICON.check + "</span>" : done ? '<button class="btn" data-claim="' + d.id + '">+' + d.gems * (isPlus() ? 2 : 1) + " " + ICON.gem + "</button>" : '<span class="q-gems">' + ICON.gem + d.gems + "</span>") + "</div>";
    }).join("") + "</div>";
  }

  /* ---------- shop ---------- */
  function shopRow(id, title, desc, cost, reason) {
    return '<div class="shop-row">' + em(id === "hearts" ? "love" : "sleepy", "", 52) + '<div class="sr-body"><b>' + title + '</b><span class="muted">' + desc + (reason ? " &middot; " + reason : "") + '</span></div><button class="btn' + (!reason && S.gems >= cost ? "" : " secondary") + '" data-buy="' + id + '"' + (reason ? " disabled" : "") + ">" + ICON.gem + " " + cost + "</button></div>";
  }
  function renderShop(v) {
    var heartReason = isPlus() ? "Unlimited with Plus" : S.hearts >= MAX_HEARTS ? "Hearts are full" : "";
    var freezeReason = (S.freezes || 0) >= freezeCap() ? "You hold the maximum (" + freezeCap() + ")" : "";
    v.innerHTML = '<div class="stack"><div class="page-head"><h1>Shop</h1><span class="pill ic-gem">' + ICON.gem + "<span>" + S.gems + "</span></span></div>" +
      '<div class="card"><h2>Power-ups</h2><div class="shop-list">' + shopRow("freeze", "Streak freeze", "Covers one missed day. You have " + (S.freezes || 0), SHOP.freeze.cost, freezeReason) + "</div></div>" +
      '<div class="card"><h2>Earn gems</h2><p class="muted" style="margin:0">Finish lessons (+10, or +20 with no mistakes), finish practice (+5) and claim your daily quests.' + "" + "</p></div></div>";
  }

  /* ---------- Plus ---------- */
  var FEATURES = [
    ["Languages: levels A1 to B1", true, true],
    ["Languages: levels B2 to C2", false, true],
    ["Math: grades 1 to 7", true, true],
    ["Math: grades 8 to 12", false, true],
    ["Music: levels 1 to 3", true, true],
    ["Music: levels 4 to 6", false, true],
    ["17 languages and your own packs", true, true],
    ["Practice, word list and offline use", true, true],
    ["Daily goal, streak and daily quests", true, true],
    ["Ads between lessons", "Skippable after 5 seconds", "None"],
    ["Hearts", "5, one back every 25 min", "Unlimited"],
    ["Mistakes review", false, true],
    ["Gems from lessons and quests", "1x", "2x"],
    ["Streak freeze", "Hold 1", "Hold 2, plus 1 free each week"],
    ["Plus ring on your avatar", false, true]
  ];
  function cell(x) { return x === true ? '<span class="ck">' + ICON.check + "</span>" : x === false ? '<span class="no" aria-label="Not included">&ndash;</span>' : esc(x); }
  function priceNum(k) { var pl = (CFG.plans || {})[k] || {}; return parseFloat(String(pl.price || "").replace(/[^0-9.]/g, "")) || 0; }
  function planCard(key, label, badge) {
    var pl = (CFG.plans || {})[key] || {}, linked = !!pl.link || !!(cloud.cfg && cloud.cfg.checkout);
    return '<div class="plan' + (key === "yearly" ? " best" : "") + '">' + (badge ? '<span class="plan-badge">' + esc(badge) + "</span>" : "") + "<b>" + esc(label) + '</b><div class="plan-price">' + esc(pl.price || "n/a") + "<span> / " + esc(pl.per || key) + '</span></div><button class="btn' + (key === "yearly" ? "" : " secondary") + ' block" data-plan="' + key + '">' + (linked ? "Subscribe" : "Not connected") + "</button></div>";
  }
  function renderPlus(v) {
    var active = isPlus(), p = S.plus || {}, plans = CFG.plans || {};
    var linked = !!((plans.monthly && plans.monthly.link) || (plans.yearly && plans.yearly.link) || (cloud.cfg && cloud.cfg.checkout));
    var m = priceNum("monthly"), y = priceNum("yearly"), sp = m && y ? Math.max(0, Math.round((1 - y / (m * 12)) * 100)) : 0;
    v.innerHTML = '<div class="stack plus-page"><div class="plus-hero">' + em("starstruck", "", 96) + "<h1>Schritt Plus</h1><p>Unlock the advanced levels in languages, math and music.</p></div>" +
      (active ? '<div class="card stack"><h2>Plus is active</h2><div class="muted">' + esc(plusLine()) + '</div><div class="row">' +
        (p.source === "stripe" && (CFG.portalLink || (cloud.user && cloudProfile())) ? '<button class="btn secondary" data-act="manage">Manage subscription</button>' : "") +
        (p.source === "stripe" && CFG.verifyUrl ? '<button class="btn ghost" data-act="verify">Refresh status</button>' : "") +
        (p.source !== "stripe" ? '<button class="btn ghost" data-act="endplus">End ' + (p.source === "trial" ? "trial" : "Plus") + "</button>" : "") + "</div></div>"
      : '<div class="plans">' + planCard("yearly", "Yearly", sp ? "Save " + sp + "%" : "Best value") + planCard("monthly", "Monthly", "") + "</div>" +
        (!S.trialUsed ? '<button class="btn secondary block" data-act="trial">Start ' + (CFG.trialDays || 7) + "-day free trial (no card)</button>" : "") +
        (CFG.verifyUrl ? '<button class="btn ghost block" data-act="verify">Already subscribed? Check status</button>' : "") +
        (!linked ? '<p class="muted note">Payments are not connected yet. Add your Stripe Payment Links in config.js (the steps are written at the top of that file).</p>' : "")) +
      '<div class="card"><h2>Basic vs Plus</h2><table class="cmp"><thead><tr><th scope="col">Feature</th><th scope="col">Basic</th><th scope="col" class="pc">Plus</th></tr></thead><tbody>' +
      FEATURES.map(function (f) { return '<tr><th scope="row">' + esc(f[0]) + "</th><td>" + cell(f[1]) + '</td><td class="pc">' + cell(f[2]) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<p class="muted note">Payments are processed by Stripe on its own page. Your card details never touch this app.</p></div>';
  }
  function stripeUrl(link, hosts) {
    var u; try { u = new URL(link); } catch (e) { return null; }
    return u.protocol === "https:" && hosts.indexOf(u.hostname) >= 0 ? u : null;
  }
  function subscribe(plan) {
    checkoutViaServer(plan).then(function (handled) { if (!handled) paymentLink(plan); });
  }
  function paymentLink(plan) {
    var pl = (CFG.plans || {})[plan];
    if (!pl || !pl.link) { toast("Payments are not connected yet. Add your Stripe link in config.js"); return; }
    var u = stripeUrl(pl.link, ["buy.stripe.com", "checkout.stripe.com"]);
    if (!u) { toast("The link in config.js must be a https://buy.stripe.com/... Payment Link"); return; }
    u.searchParams.set("client_reference_id", S.uid);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
    openSheet('<div class="stack center">' + em("determined", "", 80) + "<h2>Finish in the new tab</h2><p class=\"muted\" style=\"margin:0\">Pay on Stripe's page, then come back here." + (CFG.verifyUrl ? " Plus switches on once Stripe confirms." : "") + "</p>" +
      (CFG.verifyUrl ? '<button class="btn block" id="spCheck">Check status</button>' : "") + '<button class="btn ghost block" id="spOk">Close</button></div>');
    $("spOk").onclick = closeSheet;
    if ($("spCheck")) $("spCheck").onclick = function () { verifyPlus(true).then(function (r) { if (r === true) { closeSheet(); toast("Plus is active. Thank you!"); } else if (r === false) toast("Not confirmed yet. It can take a minute."); }); };
  }
  function openPortal() {
    if (cloud.user && cloudProfile()) { portalViaServer(); return; }
    var u = stripeUrl(CFG.portalLink, ["billing.stripe.com"]);
    if (!u) { toast("Set portalLink in config.js to your Stripe customer portal link"); return; }
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }
  function startTrial() {
    if (S.trialUsed || isPlus()) return;
    S.trialUsed = true; S.plus = { plan: "trial", source: "trial", since: Date.now(), until: Date.now() + (CFG.trialDays || 7) * DAY, verified: true };
    save(); render(); toast("Plus trial started");
  }
  function verifyPlus(manual) {
    if (!CFG.verifyUrl) return Promise.resolve(null);
    var url = CFG.verifyUrl + (CFG.verifyUrl.indexOf("?") >= 0 ? "&" : "?") + "ref=" + encodeURIComponent(S.uid);
    return fetch(url, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.active) { S.plus = { plan: j.plan || "plus", source: "stripe", since: (S.plus && S.plus.since) || Date.now(), until: j.until || 0, verified: true }; save(); render(); return true; }
      if (S.plus && S.plus.source === "stripe") { S.plus = null; save(); render(); }
      return false;
    }).catch(function () { if (manual) toast("Could not reach the payment server"); return null; });
  }

  /* ---------- cloud account: Google sign-in, sync, Stripe Checkout (needs the server in api/) ---------- */
  var cloud = { cfg: null, user: null }, pushTimer = 0;
  function api(path, opts) {
    opts = opts || {}; opts.credentials = "same-origin"; opts.headers = Object.assign({ "X-Requested-With": "schritt" }, opts.headers || {});
    if (opts.body && typeof opts.body !== "string") { opts.body = JSON.stringify(opts.body); opts.headers["Content-Type"] = "application/json"; }
    return fetch("/api/" + path, opts).then(function (r) { return r.json().then(function (j) { j.__status = r.status; return j; }); });
  }
  function loadCloudConfig() { if (cloud.cfg) return Promise.resolve(cloud.cfg); return api("config").then(function (j) { cloud.cfg = j.googleClientId !== undefined ? j : { cloud: false }; return cloud.cfg; }).catch(function () { cloud.cfg = { cloud: false }; return cloud.cfg; }); }
  function cloudProfile() { var p = currentProfile(); return p && p.cloud ? p : null; }
  function syncable() { var o = Object.assign({}, S); delete o.plus; delete o.uid; return o; }
  function cloudDirty() { if (!cloud.user || !cloudProfile()) return; clearTimeout(pushTimer); pushTimer = setTimeout(pushCloud, 2500); }
  function pushCloud() { if (!cloud.user || !cloudProfile()) return Promise.resolve(); return api("sync", { method: "PUT", body: { state: syncable() } }).catch(function () { /* offline: retried on next change */ }); }
  function refreshPlus() {
    if (!cloud.user || !cloudProfile()) return Promise.resolve(null);
    return api("plus").then(function (j) {
      if (j.active) { S.plus = { plan: j.plan || "plus", source: "stripe", since: (S.plus && S.plus.since) || Date.now(), until: j.until || 0, verified: true }; save(); render(); return true; }
      if (S.plus && S.plus.source === "stripe") { S.plus = null; save(); render(); }
      return false;
    }).catch(function () { return null; });
  }
  function pullCloud() {
    return api("sync").then(function (j) {
      if (j.state && typeof j.state === "object") { var keep = { plus: S.plus, uid: S.uid }; S = Object.assign(fresh(), j.state, keep, { settings: Object.assign(fresh().settings, j.state.settings || {}) }); courseCache = {}; try { localStorage.setItem(storeKey(), JSON.stringify(S)); } catch (e) { /* blocked */ } applyTheme(); }
      else pushCloud();
      return refreshPlus().then(function () { render(); });
    }).catch(function () { /* offline */ });
  }
  function resumeCloud() {
    if (!cloudProfile()) return;
    loadCloudConfig().then(function (c) {
      if (!c.cloud) return;
      api("auth/me").then(function (j) { if (j.user) { cloud.user = j.user; pullCloud(); } else toast("Your Google session ended. Sign in again to keep syncing."); });
    });
  }
  function loadGis() {
    return new Promise(function (resolve, reject) {
      if (window.google && google.accounts && google.accounts.id) return resolve();
      var sc = document.createElement("script"); sc.src = "https://accounts.google.com/gsi/client"; sc.async = true; sc.onload = resolve; sc.onerror = reject; document.head.appendChild(sc);
    });
  }
  function openGoogleSheet() {
    loadCloudConfig().then(function (c) {
      if (!c.cloud) { toast("Cloud sign-in is not set up on this server yet"); return; }
      openSheet('<div class="stack center"><h2>Sign in with Google</h2><p class="muted" style="margin:0">Your progress follows you to any device. Schritt never sees your Google password. Google loads only when you open this.</p><div id="gbtn" style="min-height:44px"></div><button class="btn ghost" id="gClose">Cancel</button></div>');
      $("gClose").onclick = closeSheet;
      loadGis().then(function () {
        google.accounts.id.initialize({ client_id: c.googleClientId, callback: onGoogleCredential, auto_select: false });
        google.accounts.id.renderButton($("gbtn"), { theme: "outline", size: "large", text: "continue_with", shape: "pill" });
      }).catch(function () { toast("Could not load Google sign-in"); });
    });
  }
  function onGoogleCredential(resp) {
    api("auth/google", { method: "POST", body: { credential: resp.credential } }).then(function (j) {
      if (!j.user) { toast(j.error || "Sign-in failed"); return; }
      cloud.user = j.user; closeSheet();
      var id = "g" + btoa(unescape(encodeURIComponent(j.user.email))).replace(/[^A-Za-z0-9]/g, "").slice(0, 40), list = getProfiles();
      if (!list.some(function (p) { return p.id === id; })) { list.push({ id: id, name: j.user.name, email: j.user.email, created: Date.now(), cloud: true }); setProfiles(list); }
      switchProfile(id); toast("Signed in as " + j.user.name); pullCloud();
    }).catch(function () { toast("Sign-in failed. Check your connection."); });
  }
  function cloudLogout() {
    var p = cloudProfile(); if (!p) return;
    pushCloud().then(function () { return api("auth/logout", { method: "POST" }); }).catch(function () { /* ignore */ }).then(function () {
      cloud.user = null; setProfiles(getProfiles().filter(function (x) { return x.id !== p.id; }));
      try { localStorage.removeItem(KEY + "." + p.id); } catch (e) { /* blocked */ }
      switchProfile(""); showWelcome(); toast("Signed out. Your progress stays in your account and is removed from this device.");
    });
  }
  function checkoutViaServer(plan) {
    return loadCloudConfig().then(function (c) {
      if (!c.checkout) return false;
      if (!cloud.user || !cloudProfile()) { toast("Sign in with Google first, then subscribe"); openGoogleSheet(); return true; }
      api("stripe/checkout", { method: "POST", body: { plan: plan } }).then(function (j) {
        var u; try { u = new URL(j.url); } catch (e) { u = null; }
        if (u && u.protocol === "https:" && u.hostname === "checkout.stripe.com") window.location.assign(u.toString()); else toast(j.error || "Could not start checkout");
      }).catch(function () { toast("Could not reach the payment server"); });
      return true;
    }).catch(function () { return false; });
  }
  function portalViaServer() {
    api("stripe/portal", { method: "POST" }).then(function (j) {
      var u; try { u = new URL(j.url); } catch (e) { u = null; }
      if (u && u.protocol === "https:" && u.hostname === "billing.stripe.com") window.open(u.toString(), "_blank", "noopener,noreferrer"); else toast(j.error || "Could not open the billing portal");
    }).catch(function () { toast("Could not reach the payment server"); });
  }

  /* ---------- welcome / sign-in page ---------- */
  function welcomed() { try { return localStorage.getItem("schritt.front") === "1"; } catch (e) { return true; } }
  function markWelcomed() { try { localStorage.setItem("schritt.front", "1"); } catch (e) { /* blocked */ } }
  function closeWelcome() { var w = document.getElementById("welcome"); if (w) w.remove(); document.body.style.overflow = ""; markWelcomed(); }
  var deferredInstall = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredInstall = e; });
  function installSheet(kind) {
    var steps = kind === "ios"
      ? ["Open this site in Safari on your iPhone or iPad.", "Tap the Share button (the square with an arrow).", "Choose Add to Home Screen, then tap Add."]
      : ["Open this site in Chrome on your Android phone.", "Tap the three-dot menu.", "Choose Install app (or Add to Home screen), then tap Install."];
    openSheet('<div class="stack center">' + em("celebrate", "", 80) + "<h2>Install on " + (kind === "ios" ? "iPhone or iPad" : "Android") + '</h2><ol class="install-steps">' + steps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ol><p class="muted" style="margin:0;font-size:14px">Schritt then opens full screen and works offline.</p><button class="btn block" id="inClose">Got it</button></div>');
    $("inClose").onclick = closeSheet;
  }
  function installAndroid() {
    if (deferredInstall) { var d = deferredInstall; deferredInstall = null; d.prompt(); return; }
    installSheet("android");
  }
  function showWelcome() {
    closeWelcome(); closeSheet();
    var el = document.createElement("div"); el.id = "welcome"; el.className = "welcome front";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "wlTitle");
    var hasProfiles = getProfiles().length > 0;
    el.innerHTML = Front.html({ googleOn: !!(cloud.cfg && cloud.cfg.cloud), hasProfiles: hasProfiles });
    document.body.appendChild(el); document.body.style.overflow = "hidden"; Front.init(el);
    if (window.matchMedia && (matchMedia("(display-mode: standalone)").matches || navigator.standalone)) { var g = el.querySelector("#frGet"); if (g) g.remove(); }
    $("wlGoogle").onclick = openGoogleSheet;
    $("wlNew").onclick = openCreateProfile;
    if ($("wlLogin")) $("wlLogin").onclick = openLoginSheet;
    $("frLogin").onclick = openLoginSheet;
    $("wlGuest").onclick = function () { closeWelcome(); };
    $("wlTerms").onclick = function () { Pages.open("terms"); }; $("wlPrivacy").onclick = function () { Pages.open("privacy"); };
    if ($("frIos")) $("frIos").onclick = function () { installSheet("ios"); };
    if ($("frAndroid")) $("frAndroid").onclick = installAndroid;
    setTimeout(function () { var b = $("wlGuest"); if (b) b.focus(); }, 50);
    loadCloudConfig().then(function (c) { if (c.cloud && document.getElementById("welcome") && $("wlGoogle").disabled) { var top = el.scrollTop; showWelcome(); var w2 = document.getElementById("welcome"); if (w2) w2.scrollTop = top; } });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-page]"); if (b && window.Pages) Pages.open(b.dataset.page); });
  function maybeWelcome() {
    if (currentProfile()) return;
    var untouched = !S.xp && !Object.keys(S.progress || {}).some(function (k) { return Object.keys(S.progress[k] || {}).length; });
    if (!welcomed() || untouched || location.hash === "#welcome") showWelcome();
  }
  window.addEventListener("hashchange", function () { if (location.hash === "#welcome") showWelcome(); });

  /* ---------- policies and data controls ---------- */
  function openPolicy(kind) {
    var doc = (window.POLICY || {})[kind]; if (!doc) return;
    var L = CFG.legal || {}, who = L.operator ? esc(L.operator) : "[operator name: set legal.operator in config.js]", mail = L.contact ? esc(L.contact) : "[contact email: set legal.contact in config.js]";
    openSheet('<div class="stack policy"><h2>' + esc(doc.title) + '</h2><p class="muted" style="margin:0;font-size:14px">' + esc(doc.note) + "</p>" +
      doc.sections.map(function (x) { return "<h3>" + esc(x[0]) + "</h3><p>" + esc(x[1]).replace(/\{operator\}/g, who).replace(/\{contact\}/g, mail) + "</p>"; }).join("") + '<button class="btn secondary block" id="plClose">Close</button></div>');
    $("plClose").onclick = closeSheet;
  }
  function eraseEverything() {
    confirmSheet("Erase all data on this device?", "This deletes every profile, progress, gems and settings stored by Schritt in this browser, and signs you out. Cloud accounts keep their server copy. It cannot be undone.", "Erase everything", function () {
      try { var keys = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf("schritt") === 0) keys.push(k); } keys.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* blocked */ }
      var done = function () { Storage.prototype.setItem = function () {}; location.replace(location.pathname); };
      Promise.all([cloud.user ? api("auth/logout", { method: "POST" }).catch(function () {}) : null, window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }) : null,
        navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : null]).then(done, done);
    });
  }

  /* ---------- accounts (profiles on this device) ---------- */
  function switchProfile(id) {
    save(); profileId = id || "";
    try { localStorage.setItem("schritt.profile", profileId); } catch (e) { /* blocked */ }
    S = load(); courseCache = {}; applyTheme(); closeWelcome(); tab = "learn"; history.replaceState(null, "", "#learn"); render(); window.scrollTo(0, 0); verifyPlus(false);
  }
  function openLoginSheet() {
    var list = getProfiles();
    openSheet('<div class="stack"><h2>Log in</h2><p class="muted" style="margin:0">Profiles keep separate progress on this device. There is no password, so anyone using this browser can open them.</p>' +
      (list.length ? list.map(function (p) { return '<button class="btn secondary block prof' + (p.id === profileId ? " on" : "") + '" data-pid="' + esc(p.id) + '"><b>' + esc(p.name) + "</b>" + (p.email ? ' <span class="muted">' + esc(p.email) + "</span>" : "") + "</button>"; }).join("") : '<p class="muted" style="margin:0">No profiles yet.</p>') +
      '<button class="btn block" id="lgNew">Create a profile</button><button class="btn ghost block" id="lgGuest">Continue as guest</button></div>');
    document.querySelectorAll("[data-pid]").forEach(function (b) { b.onclick = function () { closeSheet(); switchProfile(b.dataset.pid); toast("Logged in"); }; });
    $("lgNew").onclick = openCreateProfile;
    $("lgGuest").onclick = function () { closeSheet(); switchProfile(""); toast("Using guest progress"); };
  }
  function openCreateProfile() {
    openSheet('<div class="stack"><h2>Create a profile</h2><label class="stack" style="gap:6px"><span>Name</span><input type="text" id="pfName" maxlength="30" autocomplete="nickname"></label>' +
      '<label class="stack" style="gap:6px"><span>Email</span><input type="email" id="pfEmail" maxlength="80" autocomplete="email"></label>' +
      '<input type="text" id="pfWebsite" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0">' +
      '<label class="toggle" style="align-items:flex-start;gap:10px"><input type="checkbox" id="pfConsent" style="margin-top:3px"><span style="font-size:14px">I understand that my name and email are sent to the Schritt team when I create this profile. Lessons and progress stay on this device. See Privacy.</span></label>' +
      '<button class="btn block" id="pfSave">Create profile</button><button class="btn ghost block" id="pfCancel">Cancel</button></div>');
    $("pfCancel").onclick = closeSheet; setTimeout(function () { var n = $("pfName"); if (n) n.focus(); }, 50);
    $("pfSave").onclick = function () {
      var name = $("pfName").value.trim(), email = $("pfEmail").value.trim();
      if (!name) { toast("Enter a name"); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Enter a valid email"); return; }
      if (!$("pfConsent").checked) { toast("Please tick the box to continue"); return; }
      api("register", { method: "POST", body: { name: name, email: email, consent: true, website: $("pfWebsite").value } }).catch(function () { /* the profile still works if the notice cannot be sent */ });
      var list = getProfiles(), id = "p" + Math.random().toString(36).slice(2, 9);
      list.push({ id: id, name: name, email: email, created: Date.now() }); setProfiles(list);
      closeSheet(); switchProfile(id); toast("Welcome, " + name);
    };
  }
  function deleteProfile() {
    var p = currentProfile(); if (!p) return;
    confirmSheet("Delete this profile?", "This removes " + p.name + "'s progress and gems from this device. It cannot be undone.", "Delete profile", function () {
      setProfiles(getProfiles().filter(function (x) { return x.id !== p.id; }));
      try { localStorage.removeItem(KEY + "." + p.id); } catch (e) { /* blocked */ }
      closeSheet(); switchProfile(""); toast("Profile deleted");
    });
  }
  function accountCardHtml() {
    var p = currentProfile();
    if (p) return '<div class="card stack"><div><h2>' + esc(p.name) + '</h2><div class="muted">' + (p.cloud ? "Google account" + (p.email ? " &middot; " + esc(p.email) : "") + " &middot; synced" : p.email ? esc(p.email) : "Profile on this device") + '</div></div><div class="row"><button class="btn secondary" data-act="login">Switch profile</button><button class="btn secondary" data-act="logout">Log out</button><button class="btn ghost" data-act="delprofile">Delete profile</button></div></div>';
    return '<div class="card stack"><h2>Guest</h2><p class="muted" style="margin:0">You are using the shared guest progress on this device. Sign in to keep your progress on every device, or create a profile that stays on this device.</p><div class="row">' + (cloud.cfg && cloud.cfg.cloud ? '<button class="btn" data-act="google">Continue with Google</button>' : "") + '<button class="btn' + (cloud.cfg && cloud.cfg.cloud ? " secondary" : "") + '" data-act="newprofile">Create a profile</button><button class="btn secondary" data-act="login">Log in</button><button class="btn ghost" data-act="welcome">Open the welcome page</button></div></div>';
  }
  function privacyCardHtml() {
    return '<div class="card stack"><h2>Privacy, safety and data</h2><p class="muted" style="margin:0">No ads tracking, no analytics, no third-party scripts. Your progress stays on this device unless you sign in.</p><div class="row"><button class="btn secondary" data-act="policy-privacy">Privacy policy</button><button class="btn secondary" data-act="policy-terms">Terms</button><button class="btn secondary" data-act="policy-security">Security and safety</button></div><div class="row"><button class="btn secondary" data-act="export">Download my data</button><button class="btn danger" data-act="erase">Erase all data on this device</button></div><div class="row"><button class="btn ghost" data-page="about">About us</button><button class="btn ghost" data-page="help">Help and support</button><button class="btn ghost" data-page="mission">Mission and values</button><button class="btn ghost" data-page="careers">Careers</button></div></div>';
  }
  function plusStatusCard() {
    return "";
    if (isPlus()) return '<div class="card plus-card stack"><div class="row between"><div><h2>Schritt Plus</h2><div class="muted">' + esc(plusLine()) + "</div></div>" + em("starstruck", "", 56) + '</div><button class="btn secondary" data-act="plus">View Plus</button></div>';
    return '<div class="card plus-card stack"><div class="row between"><div><h2>Basic plan</h2><div class="muted">Free levels in every section, 5 hearts, daily quests</div></div>' + em("thinking", "", 56) + '</div><button class="btn" data-act="plus">Compare with Plus</button></div>';
  }
  function doAct(a) {
    if (a === "plus" || a === "shopplus") openTab("plus");
    else if (a === "trial") startTrial();
    else if (a === "manage") openPortal();
    else if (a === "endplus") { S.plus = null; save(); render(); toast("Plus ended on this device"); }
    else if (a === "verify") verifyPlus(true).then(function (r) { if (r === true) toast("Plus is active"); else if (r === false) toast("No active subscription found"); });
    else if (a === "login") openLoginSheet();
    else if (a === "newprofile") openCreateProfile();
    else if (a === "logout") { if (cloudProfile()) cloudLogout(); else { switchProfile(""); showWelcome(); toast("Logged out"); } }
    else if (a === "google") openGoogleSheet();
    else if (a === "welcome") showWelcome();
    else if (a === "policy-privacy") openPolicy("privacy"); else if (a === "policy-terms") openPolicy("terms"); else if (a === "policy-security") openPolicy("security");
    else if (a === "export") exportData(); else if (a === "erase") eraseEverything();
    else if (a === "delprofile") deleteProfile();
  }
  $("view").addEventListener("click", function (e) {
    var t = e.target.closest("[data-claim],[data-buy],[data-plan],[data-act]"); if (!t) return;
    if (t.dataset.claim) claimQuest(t.dataset.claim);
    else if (t.dataset.buy) buyItem(t.dataset.buy);
    else if (t.dataset.plan) subscribe(t.dataset.plan);
    else if (t.dataset.act) doAct(t.dataset.act);
  });

  /* ---------- practice ---------- */
  function renderNotes(v) {
    var c = course(), lv = c.levels || [], html = '<div class="stack"><h1>Notes</h1><p class="muted" style="margin:0">The key idea of every unit, in one place.</p>', last = "", lockedShown = false;
    c.units.forEach(function (u) {
      if (levelLocked(u.lvl)) { if (!lockedShown) { lockedShown = true; html += '<div class="card empty">' + em("starstruck", "", 64) + '<h2>More levels with Plus</h2><p class="muted" style="margin:0">The advanced levels are part of Schritt Plus.</p><button class="btn" data-act="plus">Unlock with Plus</button></div>'; } return; }
      if (u.lvl !== last) { last = u.lvl; var l = lv.filter(function (x) { return x.id === u.lvl; })[0]; html += '<h2 class="lvl-sep"><span class="lvl-badge sm">' + esc(u.lvl) + "</span>" + esc(l ? l.name : "") + "</h2>"; }
      html += '<div class="card"><h3 style="margin:0 0 4px">' + esc(u.title) + '</h3><p class="muted" style="margin:0">' + esc(u.tip) + "</p></div>";
    });
    v.innerHTML = html + "</div>";
  }
  function renderSubjectPractice(v) {
    var c = course(), done = 0, idxs = [];
    c.units.forEach(function (u, ui) { var n = (progressOf(c.lang)[u.id] || []).length; done += n; if (n && !levelLocked(u.lvl)) idxs.push(ui); });
    v.innerHTML = '<div class="stack"><div class="page-head"><h1>Practice</h1>' + em(done ? "determined" : "thinking", "", 56) + '</div><div class="card stack"><div class="stats"><div class="stat"><b>' + done + '</b><span>lessons finished</span></div><div class="stat"><b>' + idxs.length + '</b><span>units to practise</span></div></div>' +
      (done ? "" : '<p class="muted" style="margin:0">Finish a lesson to unlock practice.</p>') + '<button class="btn block" id="startPractice"' + (idxs.length ? "" : " disabled") + '>Start mixed practice</button><p class="muted" style="margin:0">Ten questions mixed from the units you have worked on.' + (S.hearts < MAX_HEARTS && !isPlus() ? " Finishing a session earns back a heart." : "") + "</p></div></div>";
    var sp = $("startPractice"); if (sp) sp.onclick = startPractice;
  }
  function renderPractice(v) {
    if (subj() !== "lang") return renderSubjectPractice(v);
    var c = course(), now = Date.now(), seen = 0, due = 0, weak = [];
    c.units.forEach(function (u) { u.items.forEach(function (i) {
      var st = S.items[i.key]; if (!st) return; seen++; if (st.t <= now) due++; if (st.miss > 0 && st.s < 3) weak.push({ i: i, m: st.miss });
    }); });
    weak.sort(function (a, b) { return b.m - a.m; });
    var html = '<div class="stack"><div class="page-head"><h1>Practice</h1>' + em(seen ? "determined" : "thinking", "", 56) + '</div><div class="card stack"><div class="stats"><div class="stat"><b>' + seen + '</b><span>words and sentences met</span></div><div class="stat"><b>' + due + '</b><span>due for review</span></div></div>';
    if (!seen) html += '<p class="muted">Finish your first lesson to unlock practice.</p>';
    html += '<button class="btn block" id="startPractice"' + (seen ? "" : " disabled") + ">Start practice</button>";
    html += '<p class="muted" style="margin:0">' + (S.hearts < MAX_HEARTS ? "Finishing a practice session earns back a heart. " : "") + "Practice mixes the items you are least sure about with the ones due for review.</p></div>";
    html += '<div class="card stack mistakes"><div class="row between"><h2>Mistakes review</h2>' + (isPlus() ? "" : '<span class="plus-tag">Plus</span>') + '</div><p class="muted" style="margin:0">Practice only the words and sentences you got wrong.</p><button class="btn' + (isPlus() ? "" : " secondary") + ' block" id="startMistakes">' + (isPlus() ? (weak.length ? "Review " + weak.length + " mistake" + (weak.length === 1 ? "" : "s") : "No mistakes yet") : "Unlock with Plus") + "</button></div>";
    if (weak.length) {
      html += '<div class="card"><h2>Trouble spots</h2><div class="list">' + weak.slice(0, 6).map(function (w) {
        return '<div class="li"><div><div class="tl">' + esc(E.fullText(w.i, c.lang, "tl")) + '</div><div class="en">' + esc(E.fullText(w.i, c.lang, "en")) + "</div></div></div>";
      }).join("") + "</div></div>";
    }
    html += "</div>"; v.innerHTML = html;
    var sp = $("startPractice"); if (sp) sp.onclick = startPractice;
    var sm = $("startMistakes"); if (sm) sm.onclick = startMistakes;
  }

  /* ---------- words ---------- */
  var wordFilter = "";
  function renderWords(v) {
    if (subj() !== "lang") return renderNotes(v);
    var c = course();
    var shown = 0, lockedShown = false, lastLvl = "", html = '<div class="stack"><h1>Words</h1><input type="search" id="wq" placeholder="Search words" aria-label="Search words" value="' + esc(wordFilter) + '">';
    c.units.forEach(function (u) {
      if (levelLocked(u.lvl)) {
        if (!lockedShown) { lockedShown = true; html += '<div class="card empty">' + em("starstruck", "", 64) + "<h2>Levels above " + esc(freeLevels()[freeLevels().length - 1]) + '</h2><p class="muted" style="margin:0">Those words are part of Schritt Plus.</p><button class="btn" data-act="plus">Unlock with Plus</button></div>'; }
        return;
      }
      var rows = u.items.filter(function (i) {
        if (!wordFilter) return true; var f = E.fold(wordFilter); return E.fold(i.tl).indexOf(f) >= 0 || E.fold(i.en).indexOf(f) >= 0;
      });
      if (!rows.length) return; shown++;
      if (u.lvl !== lastLvl) { lastLvl = u.lvl; var lvw = (window.LEVELS || []).filter(function (x) { return x.id === u.lvl; })[0]; html += '<h2 class="lvl-sep"><span class="lvl-badge sm">' + esc(u.lvl) + "</span>" + esc(lvw ? lvw.name : "") + "</h2>"; }
      html += '<div class="card"><h2>' + esc(u.title) + '</h2><div class="list">' + rows.map(function (i) {
        var st = S.items[i.key], s = st ? st.s : 0;
        return '<div class="li' + (st ? "" : " off") + '"><button class="icon-btn" data-say="' + esc(E.fullText(i, c.lang, "tl")) + '" aria-label="Hear it">' + ICON.speaker + '</button><div><div class="tl">' + esc(E.fullText(i, c.lang, "tl")) +
          '</div><div class="en">' + esc(E.fullText(i, c.lang, "en")) + '</div></div><div class="dots" aria-label="Strength ' + s + ' of 5">' +
          [1, 2, 3, 4, 5].map(function (n) { return "<i" + (n <= s && st ? ' class="on"' : "") + "></i>"; }).join("") + "</div></div>";
      }).join("") + "</div></div>";
    });
    v.innerHTML = html + (shown ? "" : '<div class="card empty">' + em("thinking", "", 72) + '<p class="muted" style="margin:0">Nothing matches that search.</p></div>') + "</div>";
    var q = $("wq"); q.oninput = function () { wordFilter = q.value; var pos = q.selectionStart; renderWords(v); var q2 = $("wq"); q2.focus(); q2.setSelectionRange(pos, pos); };
  }
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-say]"); if (b) say(b.dataset.say); var t = e.target.closest("[data-tone]"); if (t && L && cur() && cur().play) Subjects.playSeq(cur().play); });

  /* ---------- profile ---------- */
  function renderProfile(v) {
    var c = course(), learned = 0, strong = 0;
    Object.keys(S.items).forEach(function (k) { learned++; if (S.items[k].s >= 4) strong++; });
    var total = S.stats.right + S.stats.wrong, acc = total ? Math.round(S.stats.right / total * 100) + "%" : "n/a";
    var customIds = Object.keys(S.custom);
    var flat = flatLessons(c), curI = Math.min(currentLesson(c), flat.length - 1), lvlNow = flat[curI] ? c.units[flat[curI].ui].lvl : "A1";
    v.innerHTML = '<div class="stack"><div class="profile-head"><button class="avatar-big" id="avPick" aria-label="Change avatar">' + avatarImg("", 96) + '<span class="edit">Change</span></button><div><h1>' + esc(currentProfile() ? currentProfile().name : "Profile") + '</h1><div class="muted">Learning ' + esc(c.name) + " &middot; level " + esc(lvlNow) + "</div></div></div>" + accountCardHtml() + plusStatusCard() + privacyCardHtml() +
      '<div class="stats"><div class="stat"><b>' + S.xp + '</b><span>total XP</span></div><div class="stat"><b>' + streakNow() + '</b><span>day streak</span></div><div class="stat"><b>' + learned + '</b><span>items met</span></div><div class="stat"><b>' + strong + '</b><span>well known</span></div><div class="stat"><b>' + acc + '</b><span>answer accuracy</span></div></div>' +
      '<div class="card stack"><h2>Settings</h2>' +
      '<label class="toggle"><span>Spoken audio (' + (speechOK() ? "voice found for " + esc(c.name) : window.speechSynthesis ? "no " + esc(c.name) + " voice on this device" : "not supported here") + ')</span><input type="checkbox" id="setSpeech"' + (S.settings.speech ? " checked" : "") + "></label>" +
      (Object.keys(c.rom || {}).length ? '<label class="toggle"><span>Show pronunciation guide (romanization)</span><input type="checkbox" id="setRoman"' + (S.settings.roman !== false ? " checked" : "") + "></label>" : "") +
      '<label class="toggle"><span>Sound effects</span><input type="checkbox" id="setSound"' + (S.settings.sound ? " checked" : "") + "></label>" +
      '<label class="stack" style="gap:6px"><span>Daily goal</span><select id="setGoal">' + [10, 20, 30, 50].map(function (g) { return '<option value="' + g + '"' + (S.goal === g ? " selected" : "") + ">" + g + " XP</option>"; }).join("") + "</select></label>" +
      '<label class="stack" style="gap:6px"><span>Appearance</span><select id="setTheme">' + [["dark", "Dark"], ["light", "Light"]].map(function (o) { return '<option value="' + o[0] + '"' + (S.settings.theme === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>" +
      '<label class="stack" style="gap:6px"><span>Speaking speed</span><select id="setRate">' + [[0.7, "Slow"], [0.9, "Normal"], [1.1, "Fast"]].map(function (o) { return '<option value="' + o[0] + '"' + (S.settings.rate === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="card stack"><h2>Add a language</h2><p class="muted" style="margin:0">Any language that separates words with spaces works. Copy the template, fill in the translations (one text per English line, same order), then paste it back. Spoken audio uses the voice your device has for the language code.</p>' +
      '<div class="row"><button class="btn secondary" id="copyTpl">Copy blank template</button></div><textarea id="packText" placeholder=\'{"name":"Dutch","native":"Nederlands","tts":"nl-NL","units":{...}}\' aria-label="Language pack JSON"></textarea>' +
      '<button class="btn" id="importPack">Import language pack</button>' +
      (customIds.length ? '<div class="row">' + customIds.map(function (id) { return '<button class="btn ghost" data-delpack="' + esc(id) + '">Remove ' + esc(S.custom[id].name) + "</button>"; }).join("") + "</div>" : "") + "</div>" +
      '<div class="card stack"><h2>Your data</h2><p class="muted" style="margin:0">Progress is saved on this device only. Export a backup to move it to another device.</p><div class="row"><button class="btn secondary" id="exportData">Export backup</button><label class="btn secondary" for="importData" style="display:inline-flex;align-items:center">Import backup</label><input type="file" id="importData" accept="application/json" hidden></div>' +
      '<button class="btn danger" id="resetAll">Reset all progress</button></div></div>';
    $("setSpeech").onchange = function (e) { S.settings.speech = e.target.checked; save(); render(); };
    if ($("setRoman")) $("setRoman").onchange = function (e) { S.settings.roman = e.target.checked; save(); };
    $("setSound").onchange = function (e) { S.settings.sound = e.target.checked; save(); };
    $("setGoal").onchange = function (e) { S.goal = +e.target.value; save(); toast("Daily goal set to " + S.goal + " XP"); };
    $("avPick").onclick = openAvatarSheet;
    $("setTheme").onchange = function (e) { S.settings.theme = e.target.value; save(); applyTheme(); };
    $("setRate").onchange = function (e) { S.settings.rate = +e.target.value; save(); say(course().units[0].items[0].tl); };
    $("copyTpl").onclick = copyTemplate;
    $("importPack").onclick = importPack;
    $("exportData").onclick = exportData;
    $("importData").onchange = importData;
    $("resetAll").onclick = function () {
      confirmSheet("Reset all progress?", "This deletes XP, streak, lesson progress and word strength for every language on this device. It cannot be undone.", "Reset everything", function () {
        var keep = { custom: S.custom, avatar: S.avatar, plus: S.plus, uid: S.uid, trialUsed: S.trialUsed, settings: S.settings }; S = Object.assign(fresh(), keep); save(); courseCache = {}; closeSheet(); render(); toast("Progress reset");
      });
    };
    document.querySelectorAll("[data-delpack]").forEach(function (b) { b.onclick = function () {
      var id = b.dataset.delpack; delete S.custom[id]; delete S.progress[id]; if (S.lang === id) S.lang = "de"; save(); courseCache = {}; render(); toast("Language removed");
    }; });
  }
  function openAvatarSheet() {
    openSheet('<div class="stack"><h2>Choose your avatar</h2><div class="av-grid">' + AVATARS.map(function (a) {
      return '<button data-av="' + a[0] + '" aria-pressed="' + (S.avatar === a[0]) + '"><img src="art/' + a[0] + '.webp" alt="" width="76" height="76">' + a[1] + "</button>";
    }).join("") + '</div><button class="btn secondary block" id="avClose">Close</button></div>');
    $("avClose").onclick = closeSheet;
    document.querySelectorAll("[data-av]").forEach(function (b) { b.onclick = function () { S.avatar = b.dataset.av; save(); closeSheet(); render(); toast("Avatar changed"); }; });
  }
  function copyTemplate() {
    var tpl = { name: "Your language", native: "Name in that language", tts: "xx-XX", units: {} };
    // For languages written without spaces add "nospace": true and put | between words in the 5 sentences of each unit.
    UNITS.forEach(function (u) { tpl.units[u.id] = u.en.map(function (en, i) { return "(" + en + (i >= 10 ? " " + u.p[i - 10] : "") + ")"; }); });
    var txt = JSON.stringify(tpl, null, 1);
    function fallback() { $("packText").value = txt; $("packText").select(); toast("Template placed in the box below"); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Template copied. The English meaning is in each entry."); }, fallback); else fallback();
  }
  function importPack() {
    var raw = $("packText").value.trim(), p;
    try { p = safeParse(raw); } catch (e) { toast("That is not valid JSON"); return; }
    var errs = E.validatePack(p, UNITS);
    if (errs.length) { toast(errs[0]); return; }
    if (/^\(.*\)$/.test(p.units[UNITS[0].id][0])) { toast("The template text is still in place. Replace each entry with the translation."); return; }
    var id = "x_" + E.fold(p.name).replace(/[^a-z0-9]+/g, "") || "x_custom";
    if (window.PACKS[id]) id += "2";
    S.custom[id] = { name: p.name, native: p.native || p.name, tts: p.tts, units: p.units };
    ["nospace", "noType", "punct", "roman"].forEach(function (k) { if (p[k]) S.custom[id][k] = p[k]; }); S.lang = id; save(); courseCache = {}; tab = "learn"; render(); toast(p.name + " added");
  }
  function exportData() {
    var blob = new Blob([JSON.stringify(S)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "schritt-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function importData(e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try { var s = safeParse(r.result); if (!s || s.v !== 1 || typeof s.xp !== "number") throw new Error("bad"); delete s.plus; s.hearts = Math.max(0, Math.min(MAX_HEARTS, +s.hearts || MAX_HEARTS)); s.gems = Math.max(0, Math.min(1e6, +s.gems || 0)); S = Object.assign(fresh(), s, { plus: S.plus }); save(); courseCache = {}; render(); toast("Backup restored"); }
      catch (err) { toast("That file is not a Schritt backup"); }
    };
    r.readAsText(f);
  }

  /* ---------- sheets ---------- */
  function openSheet(html) { var s = $("sheet"); s.innerHTML = '<div class="sheet-in" role="dialog" aria-modal="true">' + html + "</div>"; s.hidden = false; s.onclick = function (e) { if (e.target === s) closeSheet(); }; var f = s.querySelector("button"); if (f) f.focus(); }
  function closeSheet() { $("sheet").hidden = true; $("sheet").innerHTML = ""; }
  function confirmSheet(title, body, yes, fn) {
    openSheet('<div class="stack"><h2>' + esc(title) + '</h2><p class="muted" style="margin:0">' + esc(body) + '</p><button class="btn secondary block" id="shNo">Cancel</button><button class="btn danger block" id="shYes">' + esc(yes) + "</button></div>");
    $("shNo").onclick = closeSheet; $("shYes").onclick = fn;
  }
  function openLangSheet() {
    var packs = allPacks();
    openSheet('<div class="stack"><h2>Choose a language</h2>' + Object.keys(packs).map(function (id) {
      var lessonsDone = Object.keys(S.progress[id] || {}).reduce(function (n, u) { return n + S.progress[id][u].length; }, 0);
      return '<button class="btn ' + (id === S.lang ? "" : "secondary") + ' block" data-lang="' + esc(id) + '">' + esc(packs[id].name) + " &middot; " + esc(packs[id].native) + (lessonsDone ? " (" + lessonsDone + "/" + Object.keys(packs[id].units).length * 5 + " lessons)" : "") + "</button>";
    }).join("") + "</div>");
    $("sheet").querySelectorAll("[data-lang]").forEach(function (b) { b.onclick = function () { S.lang = b.dataset.lang; save(); closeSheet(); render(); }; });
  }

  /* ---------- lesson player ---------- */
  var L = null;
  function startLesson(ui, li) {
    if (levelLocked(course().units[ui].lvl)) { openTab("plus"); return; }
    tickHearts();
    if (S.hearts <= 0) { noHearts(); return; }
    var c = course();
    var chs = subj() !== "lang" ? Subjects.buildLesson(c.lang, ui, li, Date.now()) : E.buildLesson(c, ui, li, S, { speech: speechOK() });
    L = { mode: "lesson", ui: ui, li: li, queue: chs, total: chs.filter(function (x) { return x.type !== "info"; }).length, i: 0, firstTry: 0, missed: 0, answered: 0, xp: 0, state: "ask", resp: null, retried: {}, t0: Date.now() };
    openLesson();
  }
  function startPractice() {
    tickHearts();
    if (subj() !== "lang") {
      var sc = course(), idxs = []; sc.units.forEach(function (u, ui) { if ((progressOf(sc.lang)[u.id] || []).length && !levelLocked(u.lvl)) idxs.push(ui); });
      if (!idxs.length) { toast("Finish a lesson first"); return; }
      var sq = Subjects.buildPractice(sc.lang, idxs, Date.now(), 10);
      L = { mode: "practice", queue: sq, total: sq.length, i: 0, firstTry: 0, missed: 0, answered: 0, xp: 0, state: "ask", resp: null, retried: {}, t0: Date.now() };
      openLesson(); return;
    }
    var chs = E.buildPractice(course(), S, { speech: speechOK() });
    if (!chs.length) { toast("Finish a lesson first"); return; }
    L = { mode: "practice", queue: chs, total: chs.length, i: 0, firstTry: 0, missed: 0, answered: 0, xp: 0, state: "ask", resp: null, retried: {}, t0: Date.now() };
    openLesson();
  }
  function startMistakes() {
    if (!isPlus()) { openTab("plus"); return; }
    tickHearts();
    var chs = E.buildPractice(course(), S, { speech: speechOK(), only: function (st) { return st.miss > 0 && st.s < 4; } });
    if (!chs.length) { toast("No mistakes to review yet"); return; }
    L = { mode: "practice", queue: chs, total: chs.length, i: 0, firstTry: 0, missed: 0, answered: 0, xp: 0, state: "ask", resp: null, retried: {}, t0: Date.now() };
    openLesson();
  }
  function noHearts() {
    var canBuy = S.gems >= SHOP.hearts.cost;
    openSheet('<div class="stack center">' + em("sleepy", "", 88) + '<h2>Out of hearts</h2><p class="muted" style="margin:0">A heart comes back in about ' + nextHeartIn() + " minutes. You can also earn one by finishing a practice session.</p>" +
      '<button class="btn block" id="shPr">Practice to earn a heart</button><button class="btn secondary block" id="shGem"' + (canBuy ? "" : " disabled") + ">Refill with " + SHOP.hearts.cost + " gems (you have " + S.gems + ')</button>' +
      '<button class="btn secondary block" id="shPlus">Unlimited hearts with Plus</button><button class="btn ghost block" id="shOk">Close</button></div>');
    $("shOk").onclick = closeSheet; $("shPr").onclick = function () { closeSheet(); startPractice(); };
    $("shGem").onclick = function () { closeSheet(); buyItem("hearts"); };
    $("shPlus").onclick = function () { closeSheet(); openTab("plus"); };
  }
  function openLesson() { $("lesson").hidden = false; document.body.style.overflow = "hidden"; renderQ(); }
  function closeLesson() { $("lesson").hidden = true; document.body.style.overflow = ""; L = null; if (window.speechSynthesis) speechSynthesis.cancel(); render(); }
  function cur() { return L.queue[L.i]; }

  function topBar() {
    var pct = Math.round(L.i / L.queue.length * 100);
    return '<div class="l-top"><button class="icon-btn" id="lClose" aria-label="Leave lesson">' + ICON.close + '</button><div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
      '</div>';
  }
  function rm(text) { var r = S.settings.roman === false ? "" : E.romanOf(course(), text); return r ? '<span class="rm">' + esc(r) + "</span>" : ""; }
  function speakBtn(text) { return '<button class="icon-btn" data-say="' + esc(text) + '" aria-label="Hear it">' + ICON.speaker + "</button>"; }

  function renderQ() {
    var ch = cur(), c = course(), body = "";
    L.state = "ask"; L.resp = null;
    if (ch.type === "select") {
      body = '<div class="q-title">' + (ch.title ? esc(ch.title) : ch.dir === "tl2en" ? (ch.intro ? "New word. What does it mean?" : "What does this mean?") : "Pick the " + esc(c.name) + " for") + "</div>" +
        '<div class="q-prompt">' + (ch.play ? '<button class="icon-btn tone-btn" data-tone="1" aria-label="Play the sound">' + ICON.speaker + "</button>" : "") + (ch.promptSide === "tl" && S.settings.speech ? speakBtn(ch.audio || ch.prompt) : "") + '<span dir="auto">' + esc(ch.prompt) + (ch.promptSide === "tl" ? rm(ch.prompt) : "") + "</span></div>" + (ch.svg ? '<div class="mq">' + ch.svg + "</div>" : "") + optionsHtml(ch.options);
    } else if (ch.type === "listen") {
      body = '<div class="q-title">What do you hear?</div><div class="q-prompt">' + speakBtn(ch.audio) + '<span class="muted">Tap to listen</span></div>' + optionsHtml(ch.options) + '<button class="skip" id="skipListen">I cannot listen right now</button>';
    } else if (ch.type === "type") {
      body = '<div class="q-title">' + esc(ch.title || "Write this in " + c.name) + "</div>" + '<div class="q-prompt"><span>' + esc(ch.prompt) + "</span></div>" + (ch.svg ? '<div class="mq">' + ch.svg + "</div>" : "") + '<input type="text" id="typed" autocomplete="off" autocapitalize="off" spellcheck="false" dir="auto" lang="' + esc(c.tts) + '" aria-label="Your answer">' +
        (ch.numeric ? '<p class="muted" style="font-size:14px">Type a number, or a fraction like 3/4.</p>' : '<p class="muted" style="font-size:14px">Accents are optional. One small typo is forgiven.</p>');
    } else if (ch.type === "info") {
      body = '<div class="q-title">' + esc(ch.title) + '</div><div class="info-card"><p>' + esc(ch.body) + "</p>" + (ch.svg ? '<div class="mq">' + ch.svg + "</div>" : "") + "</div>";
    } else if (ch.type === "build" || ch.type === "listenbuild") {
      var q = ch.type === "listenbuild" ? "Type what you hear" : ch.dir === "en2tl" ? "Translate into " + c.name : "Translate into English";
      body = '<div class="q-title">' + q + "</div>" + (ch.type === "listenbuild" ? '<div class="q-prompt">' + speakBtn(ch.audio) + '<span class="muted">Tap to listen</span></div>' :
        '<div class="q-prompt">' + (ch.promptSide === "tl" && S.settings.speech ? speakBtn(ch.audio || ch.prompt) : "") + '<span dir="auto">' + esc(ch.prompt) + (ch.promptSide === "tl" ? rm(ch.prompt) : "") + "</span></div>") +
        '<div class="answer-line" id="ansLine" dir="auto" aria-label="Your answer"></div><div class="bank" id="bank" dir="auto">' + ch.bank.map(function (t, i) { return '<button class="tok" data-i="' + i + '">' + esc(t) + "</button>"; }).join("") + "</div>";
      L.built = [];
    } else if (ch.type === "match") {
      var left = E.shuffle(ch.pairs, Math.random), right = E.shuffle(ch.pairs, Math.random);
      body = '<div class="q-title">Match the pairs</div><div class="pairs" id="pairs"><div class="stack" style="gap:10px">' + left.map(function (p) { return '<button class="opt" data-side="tl" data-key="' + esc(p.key) + '" data-t="' + esc(p.tl) + '"><span dir="auto">' + esc(p.tl) + rm(p.tl) + "</span></button>"; }).join("") +
        '</div><div class="stack" style="gap:10px">' + right.map(function (p) { return '<button class="opt" data-side="en" data-key="' + esc(p.key) + '">' + esc(p.en) + "</button>"; }).join("") + "</div></div>";
      L.m = { sel: null, done: 0, wrong: 0 };
    }
    $("lesson").innerHTML = topBar() + '<div class="l-body" id="lBody">' + body + '</div><div class="l-foot" id="lFoot"><div class="l-foot-in"><button class="btn block" id="lCheck" disabled>Check</button></div></div>';
    $("lClose").onclick = quitSheet;
    wireQ(ch);
    if (window.Visuals) { try { Visuals.decorate($("lesson"), { avatar: S.avatar, seed: (L.i + 1) * 3 + (L.answered || 0), ch: ch, combo: L.combo || 0 }); } catch (e) { /* decoration is optional */ } }
    if (ch.type === "info") { setCheck(true); $("lCheck").textContent = "Continue"; }
    if (ch.play && ch.needsPlay) setTimeout(function () { if (L && cur() === ch) Subjects.playSeq(ch.play); }, 350);
    if ((ch.type === "listen" || ch.type === "listenbuild") && S.settings.speech) setTimeout(function () { say(ch.audio); }, 250);
    else if (ch.type === "select" && ch.promptSide === "tl" && ch.intro && S.settings.speech) setTimeout(function () { say(ch.audio || ch.prompt); }, 250);
    if (ch.type === "type") setTimeout(function () { var t = $("typed"); if (t) t.focus(); }, 50);
  }
  function optionsHtml(opts) { return '<div class="opts" role="group">' + opts.map(function (o, i) { return '<button class="opt" aria-pressed="false" data-v="' + esc(o) + '"><kbd>' + (i + 1) + '</kbd><span dir="auto">' + esc(o) + rm(o) + "</span></button>"; }).join("") + "</div>"; }
  function setCheck(on) { var b = $("lCheck"); if (b) b.disabled = !on; }

  function wireQ(ch) {
    var body = $("lBody");
    $("lCheck").onclick = check;
    if (ch.type === "select" || ch.type === "listen") {
      body.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () {
        if (L.state !== "ask") return;
        body.querySelectorAll(".opt").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); L.resp = b.dataset.v; setCheck(true);
      }; });
      var sk = $("skipListen"); if (sk) sk.onclick = function () {
        L.queue[L.i] = { uid: ch.uid, type: "select", key: ch.key, dir: "en2tl", prompt: ch.gloss, promptSide: "en", answer: ch.answer, options: ch.options };
        renderQ();
      };
    } else if (ch.type === "type") {
      var t = $("typed"); t.oninput = function () { L.resp = t.value; setCheck(!!t.value.trim()); };
    } else if (ch.type === "build" || ch.type === "listenbuild") {
      var line = $("ansLine"), bank = $("bank");
      bank.onclick = function (e) { var b = e.target.closest(".tok"); if (!b || b.classList.contains("used") || L.state !== "ask") return; b.classList.add("used"); L.built.push(+b.dataset.i); redraw(); };
      line.onclick = function (e) { var b = e.target.closest(".tok"); if (!b || L.state !== "ask") return; var idx = L.built.indexOf(+b.dataset.i); if (idx >= 0) { L.built.splice(idx, 1); bank.querySelector('[data-i="' + b.dataset.i + '"]').classList.remove("used"); redraw(); } };
      function redraw() { line.innerHTML = L.built.map(function (i) { return '<button class="tok" data-i="' + i + '">' + esc(ch.bank[i]) + "</button>"; }).join(""); L.resp = L.built.map(function (i) { return ch.bank[i]; }); setCheck(L.built.length > 0); }
    } else if (ch.type === "match") {
      $("pairs").onclick = function (e) {
        var b = e.target.closest(".opt"); if (!b || b.classList.contains("done")) return;
        var m = L.m, side = b.dataset.side;
        if (m.sel && m.sel.side === side) { m.sel.el.setAttribute("aria-pressed", "false"); m.sel = null; }
        if (!m.sel) { m.sel = { side: side, key: b.dataset.key, el: b }; b.setAttribute("aria-pressed", "true"); if (side === "tl" && S.settings.speech) say(b.dataset.t); return; }
        var first = m.sel; m.sel = null; first.el.setAttribute("aria-pressed", "false");
        if (first.key === b.dataset.key) { first.el.classList.add("done"); b.classList.add("done"); beep("good"); m.done++; if (m.done >= ch.pairs.length) { L.resp = m.wrong; check(); } }
        else { m.wrong++; [first.el, b].forEach(function (x) { x.classList.add("wrong", "shake"); setTimeout(function () { x.classList.remove("wrong", "shake"); }, 450); }); beep("bad"); }
      };
    }
  }

  function check() {
    if (!L || L.state !== "ask") return;
    var ch = cur();
    if (ch.type === "info") { L.state = "fb"; next(false); return; }
    var res = E.grade(ch, L.resp);
    L.state = "fb"; L.answered++;
    var retry = !!L.retried[ch.uid];
    if (ch.key && ch.key.indexOf("match") !== 0) { E.touch(S, ch.key, res.ok && !retry, Date.now()); }
    else if (ch.type === "match") { ch.pairs.forEach(function (p) { E.touch(S, p.key, res.ok && !retry, Date.now()); }); }
    if (res.ok) { if (!retry) { L.firstTry++; L.xp += 10; L.combo = (L.combo || 0) + 1; } S.stats.right++; beep("good"); }
    else {
      L.combo = 0; S.stats.wrong++; L.missed++; beep("bad");
      if (L.mode === "lesson") { loseHeart(); }
      var again = Object.assign({}, ch, { uid: ch.uid + "r" }); L.retried[again.uid] = true; L.queue.push(again);
    }
    saveSoon();
    if (ch.type === "select" || ch.type === "listen") {
      $("lBody").querySelectorAll(".opt").forEach(function (b) { if (b.dataset.v === ch.answer) b.classList.add("right"); else if (b.getAttribute("aria-pressed") === "true") b.classList.add("wrong"); });
    }
    if (ch.type === "type") { var t = $("typed"); if (t) t.disabled = true; }
    var foot = $("lFoot"), outOfHearts = L.mode === "lesson" && S.hearts <= 0 && !res.ok;
    foot.className = "l-foot " + (res.ok ? "good" : "bad");
    var title = res.ok ? (res.typo ? "Correct, mind the spelling" : "Correct") : "Not quite";
    var ans = ch.type === "match" ? (res.ok ? "" : "Some pairs did not match the first time.") : (res.ok && !res.typo ? "" : "Answer: " + '<span dir="auto">' + esc(res.correct) + "</span>" + (ch.dir === "tl2en" ? "" : rm(res.correct)));
    var emo = res.ok ? (res.typo ? "relieved" : pick(["happy", "wink", "love", "starstruck"], L.i + L.answered)) : (outOfHearts ? "shocked" : pick(["oops", "sad"], L.i));
    foot.innerHTML = '<div class="l-foot-in"><div class="fb-row">' + em(emo, "fb-em", 56) + '<div><div class="fb-title">' + title + "</div>" + (ans ? '<div class="fb-ans">' + ans + (ch.explain && !res.ok ? "<br>" + esc(ch.explain) : "") + "</div>" : "") + "</div></div>" +
      '<button class="btn block" id="lNext">' + (outOfHearts ? "Continue" : "Continue") + "</button></div>";
    $("lNext").onclick = function () { next(outOfHearts); }; $("lNext").focus();
    if (window.Visuals) { try { Visuals.react($("lesson"), res.ok, { seed: L.i + L.answered, combo: L.combo || 0 }); } catch (e) { /* decoration is optional */ } }
    $("lClose").onclick = quitSheet;
    if (ch.type === "build" || ch.type === "listenbuild") { if (S.settings.speech && ch.audio) say(ch.audio); }
  }
  function next(outOfHearts) {
    if (outOfHearts) { renderEnd(false); return; }
    L.i++;
    if (L.i >= L.queue.length) { renderEnd(true); return; }
    renderQ();
  }
  function quitSheet() {
    openSheet('<div class="stack center">' + em("oops", "", 88) + '<h2>Leave this lesson?</h2><p class="muted" style="margin:0">You will lose the progress in this session.</p><button class="btn block" id="shStay">Keep learning</button><button class="btn danger block" id="shQuit">End session</button></div>');
    $("shStay").onclick = closeSheet; $("shQuit").onclick = function () { closeSheet(); closeLesson(); };
  }

  function renderEnd(win) {
    var c = course(), secs = Math.max(1, Math.round((Date.now() - L.t0) / 1000));
    var gemsGot = 0, perfect = win && L.missed === 0, bonus = perfect ? 5 : 0, xp = win ? L.xp + bonus : 0, msg = "";
    if (win) {
      S.xp += xp; var d = today(); S.dayXp[d] = (S.dayXp[d] || 0) + xp;
      gemsGot = (L.mode === "lesson" ? (perfect ? 20 : 10) : 5); S.gems += gemsGot;
      questTick("xp", xp); if (L.mode === "lesson") { S.adCount = (S.adCount || 0) + 1; questTick("lessons", 1); if (perfect) questTick("perfect", 1); }
      if (S.lastDay !== d) {
        if (S.lastDay === yesterday()) S.streak++;
        else if ((S.freezes || 0) > 0 && S.lastDay === daysAgoStr(2)) { S.freezes--; S.streak++; msg = "A streak freeze saved your streak."; }
        else S.streak = 1;
        S.lastDay = d;
      }
      if (L.mode === "lesson") { markDone(c.lang, c.units[L.ui].id, L.li); }
      else if (S.hearts < MAX_HEARTS) { S.hearts++; if (S.hearts >= MAX_HEARTS) S.heartsT = Date.now(); msg = "You earned back a heart."; }
      beep("win");
    }
    save();
    var acc = L.answered ? Math.round(L.firstTry / L.total * 100) : 0;
    var html = '<div class="l-body"><div class="done-screen">' + em(win ? (perfect ? "starstruck" : "celebrate") : "sad", "end-em", 150) + '<h1>' + (win ? (perfect ? "Perfect session" : "Session complete") : "Out of hearts") + "</h1>" +
      (win ? '<p class="muted" style="margin:0">' + (msg || (L.mode === "lesson" ? "Lesson finished." : "Practice finished.")) + "</p>" : '<p class="muted" style="margin:0">A heart returns in about ' + nextHeartIn() + " minutes, or practice earns one back.</p>") +
      '<div class="stats"><div class="stat"><b>+' + xp + '</b><span>XP' + (bonus ? " (includes +5 perfect bonus)" : "") + '</span></div><div class="stat"><b>' + Math.min(100, acc) + '%</b><span>right first time</span></div>' + (win ? '<div class="stat"><b>+' + gemsGot + "</b><span>gems" + (isPlus() ? " (2x Plus)" : "") + "</span></div>" : "") + '<div class="stat"><b>' + secs + 's</b><span>time</span></div></div></div></div>' +
      '<div class="l-foot"><div class="l-foot-in"><button class="btn block" id="lDone">' + (win ? "Continue" : "Back to the path") + "</button></div></div>";
    $("lesson").innerHTML = html;
    var wasLesson = win && L.mode === "lesson";
    if (win && window.Visuals) Visuals.celebrate($("lesson"));
    $("lDone").onclick = function () { closeLesson(); if (wasLesson) maybeShowAd(); }; $("lDone").focus();
  }

  /* keyboard: Enter checks/continues, 1-4 pick options */
  document.addEventListener("keydown", function (e) {
    if (!L || $("lesson").hidden || !$("sheet").hidden) return;
    if (e.key === "Enter") {
      var n = $("lNext"), c = $("lCheck"), d = $("lDone");
      if (d) { d.click(); e.preventDefault(); } else if (n) { n.click(); e.preventDefault(); } else if (c && !c.disabled) { c.click(); e.preventDefault(); }
    } else if (/^[1-4]$/.test(e.key) && L.state === "ask" && document.activeElement && document.activeElement.tagName !== "INPUT") {
      var opts = $("lBody") && $("lBody").querySelectorAll(".opts .opt"); if (opts && opts[+e.key - 1]) opts[+e.key - 1].click();
    } else if (e.key === "Escape") { quitSheet(); }
  });

  /* ---------- boot ---------- */
  window.addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", function () { if (document.hidden) save(); else if (!L) render(); });
  /* direct links to the company and legal pages, for example https://schritt-rosy.vercel.app/#privacy (store listings need these) */
  function openHashPage() { var k = (location.hash || "").slice(1); if (window.Pages && ["about", "mission", "products", "careers", "help", "legal", "privacy", "terms", "security"].indexOf(k) >= 0) Pages.open(k); }
  window.addEventListener("hashchange", openHashPage); setTimeout(openHashPage, 60);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    var hadController = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (hadController && !reloaded && !L) { reloaded = true; location.reload(); } });  // a new version took over: show it (never mid-lesson)
    navigator.serviceWorker.register("sw.js").then(function (reg) { if (reg && reg.update) reg.update(); }).catch(function () { /* offline cache unavailable */ });
  }
  applyTheme();
  resumeCloud();
  loadCloudConfig().then(function () { if (tab === "me") render(); });
  (function handleReturn() {
    var qs = new URLSearchParams(location.search);
    if (qs.get("plus") !== "success") { if (S.plus && S.plus.source === "stripe") verifyPlus(false); return; }
    var plan = qs.get("plan") === "yearly" ? "yearly" : "monthly";
    history.replaceState(null, "", location.pathname + "#plus"); tab = "plus";
    if (cloudProfile()) {
      var n = 0; loadCloudConfig().then(function () { return api("auth/me"); }).then(function (j) { cloud.user = j.user; (function poll() { refreshPlus().then(function (r) { if (r === true) toast("Plus is active. Thank you!"); else if (++n < 8) setTimeout(poll, 2500); else toast("Not confirmed yet. It can take a minute."); }); })(); });
    } else if (CFG.verifyUrl) {
      var tries = 0;
      (function poll() { verifyPlus(false).then(function (r) { if (r === true) toast("Plus is active. Thank you!"); else if (++tries < 8) setTimeout(poll, 2500); else toast("Not confirmed yet. Use Check status on the Plus page in a minute."); }); })();
    } else {
      S.plus = { plan: plan, source: "stripe", since: Date.now(), until: Date.now() + (plan === "yearly" ? 366 : 32) * DAY, verified: false }; save(); toast("Plus activated");
    }
  })();
  render();
  maybeWelcome();
  window.__schritt = { get state() { return S; }, get lesson() { return L; }, render: render };
})();

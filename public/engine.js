/* Schritt lesson engine: pure logic, no DOM. Works in the browser (window.Engine) and in Node (tests). */
(function (root) {
  "use strict";

  var INTERVAL_DAYS = [0, 0.01, 1, 3, 7, 14]; // review interval by strength 0..5
  var DAY = 86400000;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Lenient comparison form: lowercase, German umlauts as digraphs, accents stripped,
     curly quotes straightened, punctuation removed, spaces collapsed. */
  function cleanup(s) {
    try { s = s.normalize("NFD").replace(/[̀-ًͯ-ٰٟ]/g, ""); } catch (e) { /* old engines */ }
    return s.replace(/ı/g, "i").replace(/['‘’ʼ]/g, "")
      .replace(/[.,!?;:"¿¡()。？！、।۔؟،]/g, " ").replace(/\s+/g, " ").trim();
  }
  function fold(s) {
    s = String(s == null ? "" : s).toLowerCase()
      .replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
    return cleanup(s);
  }
  /* Same, but umlauts lose only the dots (Swedish, Turkish and German keyboards without them). */
  function foldPlain(s) { return cleanup(String(s == null ? "" : s).toLowerCase().replace(/ß/g, "ss")); }
  function same(a, b) { return fold(a) === fold(b) || foldPlain(a) === foldPlain(b); }
  function lev(a, b) {
    var m = a.length, n = b.length, i, j;
    if (!m) return n; if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1);
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  /* Build a course for one language from the shared UNITS skeleton and a pack. */
  function buildCourse(langId, UNITS, PACKS) {
    var pack = PACKS[langId];
    if (!pack) throw new Error("Unknown language: " + langId);
    var rom = {};
    var units = UNITS.filter(function (u) { return !!pack.units[u.id] || !u.lvl || u.lvl === "A1"; }).map(function (u, ui) {
      var tr = pack.units[u.id];
      if (!tr || tr.length !== u.en.length) throw new Error(pack.name + ": unit '" + u.id + "' needs " + u.en.length + " items");
      var rmArr = pack.roman && pack.roman[u.id];
      var items = u.en.map(function (en, i) {
        var isSent = i >= 10, raw = tr[i], tk = null;
        if (isSent && raw.indexOf("|") >= 0) { tk = raw.split("|").map(function (t) { return t.trim(); }).filter(Boolean); raw = tk.join(pack.nospace ? "" : " "); }
        var p = isSent ? u.p[i - 10] : "";
        var ptl = pack.punct && pack.punct[p] !== undefined ? pack.punct[p] : p;
        var it = { key: langId + ":" + u.id + ":" + i, k: isSent ? "s" : "w", tl: raw, en: en, p: p, ptl: ptl, unit: ui };
        if (tk) it.tk = tk;
        if (rmArr && rmArr[i]) { it.rm = rmArr[i]; rom[raw] = rmArr[i]; }
        return it;
      });
      return {
        id: u.id, lvl: u.lvl || "A1", title: u.title, blurb: u.blurb, color: u.color, items: items,
        lessons: [
          { idx: 0, title: "First words", pool: items.slice(0, 5) },
          { idx: 1, title: "More words", pool: items.slice(5, 10) },
          { idx: 2, title: "Sentences", pool: items.slice(10, 15) },
          { idx: 3, title: "Put it together", pool: items },
          { idx: 4, title: "Unit test", pool: items, test: true }
        ]
      };
    });
    return { lang: langId, name: pack.name, native: pack.native, tts: pack.tts, noType: !!pack.noType, nospace: !!pack.nospace, rom: rom, units: units };
  }

  function validatePack(p, UNITS) {
    var err = [];
    if (!p || typeof p !== "object") return ["Not a JSON object"];
    if (!p.name || typeof p.name !== "string") err.push("Missing 'name'");
    if (!p.tts || typeof p.tts !== "string") err.push("Missing 'tts' (a BCP-47 code such as 'nl-NL')");
    if (!p.units || typeof p.units !== "object") { err.push("Missing 'units'"); return err; }
    UNITS.forEach(function (u) {
      var a = p.units[u.id];
      if (a === undefined && u.lvl && u.lvl !== "A1") return; // higher levels are optional in imported packs
      if (!Array.isArray(a) || a.length !== u.en.length) err.push("Unit '" + u.id + "' must be an array of " + u.en.length + " strings");
      else if (a.some(function (x) { return typeof x !== "string" || !x.trim(); })) err.push("Unit '" + u.id + "' has an empty or non-text entry");
    });
    if (p.roman) UNITS.forEach(function (u) {
      var a = p.roman[u.id];
      if (a === undefined && !p.units[u.id]) return;
      if (!Array.isArray(a) || a.length !== u.en.length) err.push("'roman' for unit '" + u.id + "' must be an array of " + u.en.length + " strings");
    });
    if (p.nospace) UNITS.forEach(function (u) {
      var a = p.units[u.id];
      if (Array.isArray(a)) for (var i = 10; i < a.length; i++) if (typeof a[i] === "string" && a[i].indexOf("|") < 0) err.push("Unit '" + u.id + "' sentence " + (i - 9) + " needs | between words (nospace)");
    });
    return err;
  }

  function getItem(state, key) {
    return (state.items && state.items[key]) || { s: 0, t: 0, seen: 0, miss: 0 };
  }
  function touch(state, key, ok, now) {
    state.items = state.items || {};
    var it = state.items[key] || (state.items[key] = { s: 0, t: 0, seen: 0, miss: 0 });
    it.seen++;
    if (ok) it.s = Math.min(5, it.s + 1); else { it.s = Math.max(0, it.s - 2); it.miss++; }
    it.t = now + INTERVAL_DAYS[it.s] * DAY;
    return it;
  }
  function isDue(state, key, now) {
    var it = state.items && state.items[key];
    return !!it && it.t <= now;
  }

  function tokensOf(text) { return text.split(/\s+/).filter(Boolean); }
  function itemTokens(it, side) { return side === "tl" && it.tk ? it.tk : tokensOf(it[side]); }
  function romanOf(course, text) {
    if (!course || !course.rom) return "";
    var t = String(text || "").replace(/[.?!。？！।۔؟\s]+$/, "").replace(/^[¿¡]/, "");
    return course.rom[t] || "";
  }
  function fullText(item, lang, side) {
    var base = side === "en" ? item.en : item.tl;
    if (item.k !== "s") return base;
    var p = item.p || "";
    if (side !== "en" && String(lang).slice(0, 2) === "es" && (p === "?" || p === "!")) return (p === "?" ? "¿" : "¡") + base + p;
    return base + (side === "en" || item.ptl === undefined ? p : item.ptl);
  }

  function uniqueOptions(correct, candidates, n, rng, field) {
    var seen = {}; seen[fold(correct)] = 1;
    var opts = [correct];
    var pool = candidates; // callers order candidates by preference (same unit first)
    for (var i = 0; i < pool.length && opts.length < n; i++) {
      var v = pool[i][field], f = fold(v);
      if (!seen[f]) { seen[f] = 1; opts.push(v); }
    }
    return shuffle(opts, rng);
  }

  var uidCounter = 0;
  function mk(type, item, extra) {
    var c = { uid: "c" + (++uidCounter), type: type, key: item ? item.key : null };
    for (var k in extra) c[k] = extra[k];
    return c;
  }

  function makeChallenge(item, level, ctx) {
    var rng = ctx.rng, lang = ctx.course.lang;
    var sameKind = ctx.allItems.filter(function (x) { return x.k === item.k && x.key !== item.key; });
    var sameUnit = sameKind.filter(function (x) { return x.unit === item.unit; });
    var cands = shuffle(sameUnit, rng).concat(shuffle(sameKind.filter(function (x) { return x.unit !== item.unit; }), rng));
    var L = Math.max(0, Math.min(5, level));

    if (item.k === "w") {
      if (L === 0) return mk("select", item, { dir: "tl2en", prompt: item.tl, promptSide: "tl", audio: item.tl, answer: item.en, options: uniqueOptions(item.en, cands, 4, rng, "en"), gloss: item.en, intro: true });
      if (L === 1) return mk("select", item, { dir: "en2tl", prompt: item.en, promptSide: "en", answer: item.tl, options: uniqueOptions(item.tl, cands, 4, rng, "tl") });
      if (L === 2) {
        if (ctx.speech) return mk("listen", item, { audio: item.tl, answer: item.tl, gloss: item.en, options: uniqueOptions(item.tl, cands, 4, rng, "tl") });
        return mk("select", item, { dir: "en2tl", prompt: item.en, promptSide: "en", answer: item.tl, options: uniqueOptions(item.tl, cands, 4, rng, "tl") });
      }
      if (ctx.course.noType) return ctx.speech && rng() < 0.5 ? mk("listen", item, { audio: item.tl, answer: item.tl, gloss: item.en, options: uniqueOptions(item.tl, cands, 4, rng, "tl") }) : mk("select", item, { dir: "en2tl", prompt: item.en, promptSide: "en", answer: item.tl, options: uniqueOptions(item.tl, cands, 4, rng, "tl") });
      return mk("type", item, { prompt: item.en, answer: item.tl });
    }
    // sentences
    var textTl = fullText(item, lang, "tl"), textEn = fullText(item, lang, "en");
    function buildCh(dir, audio) {
      var ansTok = itemTokens(item, dir === "en2tl" ? "tl" : "en");
      var src = dir === "en2tl" ? "tl" : "en";
      var distract = [];
      shuffle(sameKind, rng).forEach(function (x) {
        itemTokens(x, src).forEach(function (t) {
          var f = fold(t);
          if (distract.length < 3 && f && !ansTok.some(function (a) { return fold(a) === f; }) && !distract.some(function (d) { return fold(d) === f; })) distract.push(t);
        });
      });
      var bank = shuffle(ansTok.concat(distract), rng);
      return mk(audio ? "listenbuild" : "build", item, {
        dir: dir, prompt: dir === "en2tl" ? textEn : textTl, promptSide: dir === "en2tl" ? "en" : "tl",
        audio: audio ? textTl : (dir === "tl2en" ? textTl : null),
        tokens: ansTok, bank: bank, answerText: dir === "en2tl" ? textTl : textEn,
        punct: item.p || ""
      });
    }
    if (L <= 0) return buildCh("tl2en", false);
    if (L === 1) return buildCh("en2tl", false);
    if (L === 2) return ctx.speech ? buildCh("en2tl", true) : buildCh("en2tl", false);
    if (ctx.course.noType) return buildCh("en2tl", !!ctx.speech && rng() < 0.5);
    return mk("type", item, { prompt: textEn, answer: textTl, long: true });
  }

  function pickItems(pool, state, max, rng, now) {
    var scored = pool.map(function (it) {
      var st = getItem(state, it.key);
      var due = st.seen && st.t > now ? 1 : 0; // not due yet = lower priority
      return { it: it, w: st.s + due * 2 + rng() * 0.9 };
    });
    scored.sort(function (a, b) { return a.w - b.w; });
    return scored.slice(0, max).map(function (x) { return x.it; });
  }

  function avoidAdjacent(list, rng) {
    for (var i = 1; i < list.length; i++) {
      if (list[i].key && list[i].key === list[i - 1].key) {
        for (var j = i + 1; j < list.length; j++) {
          if (list[j].key !== list[i - 1].key) { var t = list[i]; list[i] = list[j]; list[j] = t; break; }
        }
      }
    }
    return list;
  }

  function buildLesson(course, unitIdx, lessonIdx, state, opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random, now = opts.now || Date.now();
    var unit = course.units[unitIdx], lesson = unit.lessons[lessonIdx];
    var allItems = [].concat.apply([], course.units.map(function (u) { return u.items; }));
    var ctx = { course: course, allItems: allItems, rng: rng, speech: !!opts.speech };
    var bonus = lesson.test ? 2 : 0;
    var max = lesson.pool.length <= 5 ? 5 : (lesson.test ? 12 : 9);
    var picked = pickItems(lesson.pool, state, max, rng, now);
    var pass1 = shuffle(picked, rng).map(function (it) { return makeChallenge(it, getItem(state, it.key).s + bonus, ctx); });

    var words = picked.filter(function (i) { return i.k === "w"; });
    var extra = [];
    if (words.length >= 4) {
      var pairItems = shuffle(words, rng).slice(0, 5);
      extra.push(mk("match", null, { pairs: pairItems.map(function (i) { return { key: i.key, tl: i.tl, en: i.en }; }), key: "match:" + unit.id + ":" + lessonIdx }));
    }
    var weakest = picked.slice().sort(function (a, b) { return getItem(state, a.key).s - getItem(state, b.key).s; }).slice(0, 4);
    var pass2 = weakest.map(function (it) { return makeChallenge(it, getItem(state, it.key).s + 1 + bonus, ctx); });

    var out = pass1.slice();
    if (extra.length) out.splice(Math.min(3, out.length), 0, extra[0]);
    out = out.concat(pass2);
    out = avoidAdjacent(out, rng).slice(0, lesson.test ? 16 : 12);
    return out;
  }

  /* Practice from everything the learner has already seen: due and weak items first. */
  function buildPractice(course, state, opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random, now = opts.now || Date.now();
    var allItems = [].concat.apply([], course.units.map(function (u) { return u.items; }));
    var learned = allItems.filter(function (i) { return state.items && state.items[i.key] && (!opts.only || opts.only(state.items[i.key])); });
    if (!learned.length) return [];
    var ctx = { course: course, allItems: allItems, rng: rng, speech: !!opts.speech };
    var scored = learned.map(function (it) {
      var st = state.items[it.key];
      return { it: it, w: (st.t > now ? 3 : 0) + st.s - Math.min(st.miss, 3) * 0.5 + rng() };
    }).sort(function (a, b) { return a.w - b.w; }).slice(0, 10).map(function (x) { return x.it; });
    var list = shuffle(scored, rng).map(function (it) { return makeChallenge(it, Math.max(1, state.items[it.key].s), ctx); });
    return avoidAdjacent(list, rng);
  }

  /* resp: select/listen -> chosen string; type -> typed string; build/listenbuild -> array of tokens;
     match -> number of wrong pairs. */
  /* numbers, decimals, negatives (also with the Unicode minus) and fractions such as 3/4 */
  function parseNum(s) {
    s = String(s == null ? "" : s).replace(/[\u2212\u2013]/g, "-").replace(/\s+/g, "").replace(/,(?=\d{3}(\D|$))/g, "").replace(",", ".");
    var m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) return +m[2] === 0 ? null : +m[1] / +m[2];
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? +s : null;
  }
  function grade(ch, resp) {
    var r = { ok: false, typo: false, correct: "" };
    if (ch.type === "select" || ch.type === "listen") {
      r.correct = ch.answer; r.ok = resp === ch.answer;
    } else if (ch.type === "type" && ch.numeric) {
      r.correct = ch.answer; var nx = parseNum(resp), ny = parseNum(ch.answer); r.ok = nx !== null && ny !== null && Math.abs(nx - ny) < 1e-9;
    } else if (ch.type === "type") {
      r.correct = ch.answer;
      var a = fold(ch.answer), b = fold(resp), a2 = foldPlain(ch.answer), b2 = foldPlain(resp);
      if (b && (a === b || a2 === b2)) r.ok = true;
      else if (b && a.length >= 5 && (lev(a, b) <= 1 || lev(a2, b2) <= 1)) { r.ok = true; r.typo = true; }
    } else if (ch.type === "build" || ch.type === "listenbuild") {
      r.correct = ch.answerText;
      r.ok = Array.isArray(resp) && same(resp.join(" "), ch.tokens.join(" "));
    } else if (ch.type === "match") {
      r.correct = ""; r.ok = resp === 0;
    }
    return r;
  }

  var Engine = {
    fold: fold, foldPlain: foldPlain, parseNum: parseNum, romanOf: romanOf, itemTokens: itemTokens, lev: lev, shuffle: shuffle, mulberry32: mulberry32, buildCourse: buildCourse, validatePack: validatePack,
    buildLesson: buildLesson, buildPractice: buildPractice, grade: grade, touch: touch, isDue: isDue, getItem: getItem,
    fullText: fullText, tokensOf: tokensOf, INTERVAL_DAYS: INTERVAL_DAYS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = Engine; else root.Engine = Engine;
})(typeof window !== "undefined" ? window : globalThis);

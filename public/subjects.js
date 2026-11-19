/* Subjects beyond languages: Math (grades 1 to 12) and Music. Each course has levels, units and five lessons per unit, like a language.
   Questions are generated, not stored: every unit has a maker(rng, difficulty). Diagrams are SVG built here from numbers (never from user text),
   symbols are Unicode, and music exercises play real tones with the Web Audio API. Works in the browser and in Node (for tests). */
(function (root) {
  "use strict";
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, rng) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; };
  var simp = function (n, d) { var g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n) : n + "/" + d; };
  var fmt = function (x) { return String(Math.round(x * 1e6) / 1e6); };

  /* ---------- question builders bound to a random source ---------- */
  function bind(rng) {
    var h = {
      rng: rng,
      R: function (a, b) { return a + Math.floor(rng() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(rng() * arr.length)]; },
      chance: function (p) { return rng() < p; },
      shuffle: function (arr) { return shuffle(arr, rng); },
      /* multiple choice. wrongs may be shorter than 3; numbers are padded automatically */
      C: function (prompt, answer, wrongs, extra) {
        var seen = {}, out = [String(answer)]; seen[String(answer)] = 1;
        (wrongs || []).forEach(function (w) { w = String(w); if (!seen[w]) { seen[w] = 1; out.push(w); } });
        var num = typeof answer === "number" || /^-?\d+(\.\d+)?$/.test(String(answer)), k = 0;
        while (out.length < 4 && k++ < 60) { var w = num ? fmt(Number(answer) + (rng() < .5 ? 1 : -1) * (1 + Math.floor(rng() * 4 + k / 8))) : String(answer) + "′".repeat(k); if (!seen[w]) { seen[w] = 1; out.push(w); } }
        var o = { type: "select", dir: "q", promptSide: "en", prompt: prompt, answer: String(answer), options: shuffle(out.slice(0, 4), rng), key: null };
        for (var e in (extra || {})) o[e] = extra[e]; return o;
      },
      /* typed numeric answer (decimals, negatives and fractions like 3/4 are all understood) */
      T: function (prompt, answer, extra) {
        var o = { type: "type", numeric: true, prompt: prompt, answer: String(answer), key: null };
        for (var e in (extra || {})) o[e] = extra[e]; return o;
      }
    };
    return h;
  }

  /* ---------- diagrams ---------- */
  var S = (w, h, body, label) => '<svg class="mq-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + String(label || "diagram").replace(/[<>&"]/g, "") + '" focusable="false">' + body + "</svg>";
  var COLS = ["#e4572e", "#f29e4c", "#4caf7d", "#3d7be6", "#8a5ad6", "#e86aa6"];
  var D = {
    dots: function (n) { var b = ""; for (var i = 0; i < n; i++) b += '<circle cx="' + (24 + (i % 5) * 30) + '" cy="' + (22 + Math.floor(i / 5) * 30) + '" r="11" fill="' + COLS[(i * 7) % 6] + '"/>'; return S(180, 22 + Math.ceil(n / 5) * 30, b, n + " dots"); },
    numberLine: function (min, max, mark, step) {
      step = step || (max - min > 12 ? 5 : 1); var b = '<line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="3"/>', span = max - min, cnt = Math.round(span / step);
      for (var i = 0; i <= cnt; i++) { var v = min + i * step, x = 20 + i / cnt * 280; b += '<line x1="' + x + '" y1="32" x2="' + x + '" y2="48" stroke="currentColor" stroke-width="2"/><text x="' + x + '" y="66" text-anchor="middle" font-size="14" fill="currentColor">' + fmt(v).replace("-", "\u2212") + "</text>"; }
      if (mark !== undefined && mark !== null) { var mx = 20 + (mark - min) / span * 280; b += '<circle cx="' + mx + '" cy="40" r="9" fill="#e4572e"/>'; }
      return S(320, 76, b, "number line");
    },
    fractionBar: function (n, d) { var w = 270 / d, b = ""; for (var i = 0; i < d; i++) b += '<rect x="' + (20 + i * w) + '" y="14" width="' + w + '" height="44" fill="' + (i < n ? "#3d7be6" : "#fffaf0") + '" stroke="currentColor" stroke-width="2.5"/>'; return S(310, 72, b, n + " of " + d + " parts shaded"); },
    clock: function (hh, mm) {
      var b = '<circle cx="80" cy="80" r="68" fill="#fffaf0" stroke="currentColor" stroke-width="4"/>';
      for (var i = 1; i <= 12; i++) { var a = i * Math.PI / 6; b += '<text x="' + (80 + 52 * Math.sin(a)) + '" y="' + (86 - 52 * Math.cos(a)) + '" text-anchor="middle" font-size="15" fill="currentColor">' + i + "</text>"; }
      var ha = ((hh % 12) + mm / 60) * Math.PI / 6, ma = mm * Math.PI / 30;
      b += '<line x1="80" y1="80" x2="' + (80 + 34 * Math.sin(ha)) + '" y2="' + (80 - 34 * Math.cos(ha)) + '" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><line x1="80" y1="80" x2="' + (80 + 50 * Math.sin(ma)) + '" y2="' + (80 - 50 * Math.cos(ma)) + '" stroke="#e4572e" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="currentColor"/>';
      return S(160, 160, b, "analog clock");
    },
    shape: function (name) {
      var c = { circle: '<circle cx="70" cy="60" r="46"', square: '<rect x="26" y="16" width="88" height="88"', rectangle: '<rect x="14" y="30" width="112" height="60"', triangle: '<polygon points="70,12 124,104 16,104"', pentagon: '<polygon points="70,10 120,46 101,106 39,106 20,46"', hexagon: '<polygon points="40,14 100,14 128,60 100,106 40,106 12,60"' }[name];
      return S(140, 120, c + ' fill="#f7c948" stroke="currentColor" stroke-width="4"/>', name);
    },
    gridRect: function (w, h) { var b = ""; for (var i = 0; i < w; i++) for (var j = 0; j < h; j++) b += '<rect x="' + (28 + i * 26) + '" y="' + (8 + j * 26) + '" width="26" height="26" fill="#d9e6fb" stroke="#7a8da8"/>'; b += '<text x="' + (28 + w * 13) + '" y="' + (26 + h * 26) + '" text-anchor="middle" font-size="15" fill="currentColor">' + w + '</text><text x="14" y="' + (8 + h * 13 + 5) + '" text-anchor="middle" font-size="15" fill="currentColor">' + h + "</text>"; return S(40 + w * 26, 34 + h * 26, b, w + " by " + h + " grid rectangle"); },
    angle: function (deg) {
      var r = 90, a = deg * Math.PI / 180, x = 20 + r * Math.cos(a), y = 110 - r * Math.sin(a);
      return S(160, 130, '<line x1="20" y1="110" x2="130" y2="110" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="20" y1="110" x2="' + x + '" y2="' + y + '" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 110 A30 30 0 ' + (deg > 180 ? 1 : 0) + " 0 " + (20 + 30 * Math.cos(a)) + " " + (110 - 30 * Math.sin(a)) + '" fill="none" stroke="#e4572e" stroke-width="3.5"/>', "an angle");
    },
    plane: function (pts, line) {
      var u = 22, o = 130, b = ""; for (var i = -5; i <= 5; i++) b += '<line x1="' + (o + i * u) + '" y1="20" x2="' + (o + i * u) + '" y2="240" stroke="#c8d0d8" stroke-width="1"/><line x1="20" y1="' + (o + i * u) + '" x2="240" y2="' + (o + i * u) + '" stroke="#c8d0d8" stroke-width="1"/>';
      b += '<line x1="20" y1="130" x2="240" y2="130" stroke="currentColor" stroke-width="2.5"/><line x1="130" y1="20" x2="130" y2="240" stroke="currentColor" stroke-width="2.5"/>';
      if (line) (Array.isArray(line[0]) ? line : [line]).forEach(function (l, li) { b += '<line x1="' + (o + l[0] * u) + '" y1="' + (o - l[1] * u) + '" x2="' + (o + l[2] * u) + '" y2="' + (o - l[3] * u) + '" stroke="' + (li ? "#4caf7d" : "#3d7be6") + '" stroke-width="3.5" stroke-linecap="round"/>'; });
      (pts || []).forEach(function (p) { b += '<circle cx="' + (o + p[0] * u) + '" cy="' + (o - p[1] * u) + '" r="6" fill="#e4572e"/>' + (p[2] ? '<text x="' + (o + p[0] * u + 9) + '" y="' + (o - p[1] * u - 9) + '" font-size="14" fill="currentColor">' + p[2] + "</text>" : ""); });
      return S(260, 260, b, "coordinate plane");
    },
    rightTriangle: function (a, b2, c) { return S(220, 160, '<polygon points="30,130 190,130 30,30" fill="#fdf1c4" stroke="currentColor" stroke-width="3.5"/><rect x="30" y="112" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"/><text x="110" y="150" text-anchor="middle" font-size="16" fill="currentColor">' + a + '</text><text x="14" y="84" text-anchor="middle" font-size="16" fill="currentColor">' + b2 + '</text><text x="124" y="72" font-size="16" fill="#e4572e">' + c + "</text>", "right triangle"); },
    circle: function (label) { return S(160, 130, '<circle cx="80" cy="65" r="54" fill="#d8f0e2" stroke="currentColor" stroke-width="3.5"/><line x1="80" y1="65" x2="134" y2="65" stroke="#e4572e" stroke-width="3.5"/><circle cx="80" cy="65" r="3.5" fill="currentColor"/><text x="107" y="58" text-anchor="middle" font-size="15" fill="currentColor">' + label + "</text>", "circle with a radius"); },
    bars: function (vals) { var mx = Math.max.apply(null, vals), w = 240 / vals.length, b = ""; vals.forEach(function (v, i) { var h = v / mx * 100; b += '<rect x="' + (30 + i * w) + '" y="' + (120 - h) + '" width="' + (w - 10) + '" height="' + h + '" fill="' + COLS[i % 6] + '"/><text x="' + (30 + i * w + (w - 10) / 2) + '" y="136" text-anchor="middle" font-size="13" fill="currentColor">' + v + "</text>"; }); return S(290, 146, b, "bar chart"); }
  };


  /* ---------- more diagrams ---------- */
  var T = function (x, y, t, o) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + ((o && o.a) || "middle") + '" font-size="' + ((o && o.s) || 15) + '" fill="' + ((o && o.c) || "currentColor") + '"' + (o && o.b ? ' font-weight="700"' : "") + ">" + t + "</text>"; };
  D.dotsPair = function (a, b, op) { var g = function (n, x0, col) { var r = ""; for (var i = 0; i < n; i++) r += '<circle cx="' + (x0 + (i % 5) * 22) + '" cy="' + (16 + Math.floor(i / 5) * 22) + '" r="9" fill="' + col + '"/>'; return r; }, rows = Math.max(1, Math.ceil(Math.max(a, b) / 5)), hh = 12 + rows * 22; return S(290, hh, g(a, 14, "#e4572e") + T(140, hh / 2 + 7, op || "+", { s: 24, b: 1 }) + g(b, 170, "#3d7be6"), a + " and " + b + " dots"); };
  D.dotsTake = function (a, b) { var r = ""; for (var i = 0; i < a; i++) { var cx = 18 + (i % 10) * 26, cy = 18 + Math.floor(i / 10) * 26, x = i >= a - b; r += '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="' + (x ? "#d6dde3" : "#e4572e") + '"/>' + (x ? '<path d="M' + (cx - 7) + " " + (cy - 7) + "L" + (cx + 7) + " " + (cy + 7) + "M" + (cx + 7) + " " + (cy - 7) + "L" + (cx - 7) + " " + (cy + 7) + '" stroke="#a02c3a" stroke-width="3"/>' : ""); } return S(280, 12 + Math.ceil(a / 10) * 26 + 10, r, a + " dots with " + b + " crossed out"); };
  D.baseTen = function (n) { var h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10, r = "", x = 8, i; for (i = 0; i < h; i++) { r += '<rect x="' + x + '" y="14" width="36" height="36" fill="#d9e6fb" stroke="#3d7be6" stroke-width="2"/>'; x += 40; } x += 8; for (i = 0; i < t; i++) { r += '<rect x="' + x + '" y="14" width="10" height="36" fill="#d8f0e2" stroke="#4caf7d" stroke-width="2"/>'; x += 14; } x += 8; for (i = 0; i < o; i++) { r += '<rect x="' + x + '" y="40" width="10" height="10" fill="#fde0d6" stroke="#e4572e" stroke-width="2"/>'; x += 14; } return S(Math.max(220, x + 8), 64, r, "base ten blocks: hundreds, tens and ones"); };
  D.coins = function (q, d, n, p) { var list = [], i; for (i = 0; i < q; i++) list.push([25, "#c9ced6", 19]); for (i = 0; i < d; i++) list.push([10, "#c9ced6", 15]); for (i = 0; i < n; i++) list.push([5, "#c9ced6", 17]); for (i = 0; i < p; i++) list.push([1, "#d99a61", 13]); var r = ""; list.forEach(function (c, k) { var cx = 24 + (k % 8) * 42, cy = 24 + Math.floor(k / 8) * 42; r += '<circle cx="' + cx + '" cy="' + cy + '" r="' + c[2] + '" fill="' + c[1] + '" stroke="#6b7480" stroke-width="2"/>' + T(cx, cy + 5, c[0], { s: 13, b: 1, c: "#2f2e3b" }); }); return S(350, 16 + Math.ceil(list.length / 8) * 42, r, "coins"); };
  D.array = function (rw, cl) { var cs = Math.min(26, Math.floor(280 / Math.max(rw, cl))), r = ""; for (var i = 0; i < rw; i++) for (var j = 0; j < cl; j++) r += '<circle cx="' + (14 + cs / 2 + j * cs) + '" cy="' + (14 + cs / 2 + i * cs) + '" r="' + cs * .36 + '" fill="' + COLS[i % 6] + '"/>'; return S(28 + cl * cs, 28 + rw * cs, r, rw + " rows of " + cl); };
  D.groups = function (k, n) { var r = "", bw = Math.min(n, 5) * 18 + 16, bh = Math.ceil(n / 5) * 18 + 14, per = Math.max(1, Math.floor(300 / (bw + 10))); for (var g = 0; g < k; g++) { var x = 8 + (g % per) * (bw + 10), y = 8 + Math.floor(g / per) * (bh + 10); r += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10" fill="#fffaf0" stroke="' + COLS[g % 6] + '" stroke-width="3"/>'; for (var i = 0; i < n; i++) r += '<circle cx="' + (x + 16 + (i % 5) * 18) + '" cy="' + (y + 16 + Math.floor(i / 5) * 18) + '" r="6" fill="' + COLS[g % 6] + '"/>'; } return S(320, 16 + Math.ceil(k / per) * (bh + 10), r, k + " groups of " + n); };
  D.fractionPair = function (n1, d1, n2, d2) { var bar = function (n, d, y) { var w = 270 / d, r = ""; for (var i = 0; i < d; i++) r += '<rect x="' + (20 + i * w) + '" y="' + y + '" width="' + w + '" height="30" fill="' + (i < n ? "#3d7be6" : "#fffaf0") + '" stroke="currentColor" stroke-width="2.2"/>'; return r; }; return S(310, 84, bar(n1, d1, 8) + bar(n2, d2, 46), "two fraction bars"); };
  D.areaModel = function (rw, cl, ra, ca) { var cs = Math.min(30, Math.floor(260 / Math.max(rw, cl))), r = ""; for (var i = 0; i < rw; i++) for (var j = 0; j < cl; j++) r += '<rect x="' + (14 + j * cs) + '" y="' + (14 + i * cs) + '" width="' + cs + '" height="' + cs + '" fill="' + (i < ra && j < ca ? "#8a5ad6" : i < ra ? "#d9e6fb" : j < ca ? "#fde0d6" : "#fffaf0") + '" stroke="#7a8da8"/>'; return S(28 + cl * cs, 28 + rw * cs, r, "area model"); };
  D.box = function (l, w, h) { var u = Math.min(18, Math.floor(150 / Math.max(l, h, w))), fw = l * u, fh = h * u, dx = w * u * .55, dy = w * u * .38, x0 = 20, y0 = 14 + dy; return S(x0 + fw + dx + 38, y0 + fh + 28, '<polygon points="' + x0 + "," + y0 + " " + (x0 + dx) + "," + (y0 - dy) + " " + (x0 + dx + fw) + "," + (y0 - dy) + " " + (x0 + fw) + "," + y0 + '" fill="#d9e6fb" stroke="currentColor" stroke-width="2.5"/><rect x="' + x0 + '" y="' + y0 + '" width="' + fw + '" height="' + fh + '" fill="#fdf1c4" stroke="currentColor" stroke-width="2.5"/><polygon points="' + (x0 + fw) + "," + y0 + " " + (x0 + fw + dx) + "," + (y0 - dy) + " " + (x0 + fw + dx) + "," + (y0 - dy + fh) + " " + (x0 + fw) + "," + (y0 + fh) + '" fill="#d8f0e2" stroke="currentColor" stroke-width="2.5"/>' + T(x0 + fw / 2, y0 + fh + 18, l) + T(x0 - 8, y0 + fh / 2 + 5, h, { a: "end" }) + T(x0 + fw + dx / 2 + 12, y0 - dy / 2 + 14, w, { a: "start" }), "a box " + l + " long, " + w + " wide, " + h + " high"); };
  D.ratioBoxes = function (a, b) { var r = "", i; for (i = 0; i < a; i++) r += '<rect x="' + (14 + i * 30) + '" y="14" width="26" height="26" rx="5" fill="#3d7be6"/>'; for (i = 0; i < b; i++) r += '<rect x="' + (14 + i * 30) + '" y="48" width="26" height="26" rx="5" fill="#f29e4c"/>'; return S(28 + Math.max(a, b) * 30, 88, r, "a bar model with " + a + " blue boxes and " + b + " orange boxes"); };
  D.percentGrid = function (pc) { var r = ""; for (var i = 0; i < 100; i++) r += '<rect x="' + (10 + (i % 10) * 15) + '" y="' + (10 + Math.floor(i / 10) * 15) + '" width="15" height="15" fill="' + (i < pc ? "#4caf7d" : "#fffaf0") + '" stroke="#7a8da8" stroke-width="1"/>'; return S(170, 170, r, pc + " out of 100 squares shaded"); };
  var PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
  D.diceRow = function () { var r = ""; for (var n = 1; n <= 6; n++) { var x = 8 + (n - 1) * 50; r += '<rect x="' + x + '" y="8" width="42" height="42" rx="8" fill="#fffaf0" stroke="currentColor" stroke-width="2.5"/>'; PIPS[n].forEach(function (p) { r += '<circle cx="' + (x + 9 + p[0] * 12) + '" cy="' + (17 + p[1] * 12) + '" r="3.4" fill="currentColor"/>'; }); } return S(312, 58, r, "the six faces of a die"); };
  D.marbles = function (rd, bl) { var all = [], i; for (i = 0; i < rd; i++) all.push("#e4572e"); for (i = 0; i < bl; i++) all.push("#3d7be6"); var r = '<rect x="10" y="10" width="190" height="' + (30 + Math.ceil(all.length / 6) * 28) + '" rx="22" fill="#fdf1c4" stroke="currentColor" stroke-width="3"/>'; all.forEach(function (c, k) { r += '<circle cx="' + (34 + (k * 5 % 6) * 28) + '" cy="' + (34 + Math.floor(k / 6) * 28) + '" r="11" fill="' + c + '"/>'; }); return S(210, 56 + Math.ceil(all.length / 6) * 28, r, "a bag with " + rd + " red and " + bl + " blue marbles"); };
  D.triangleAngles = function (a, b, c) { return S(230, 150, '<polygon points="30,120 200,120 100,24" fill="#fdf1c4" stroke="currentColor" stroke-width="3.5"/>' + T(52, 112, a + "\u00b0", { b: 1 }) + T(178, 112, b + "\u00b0", { b: 1 }) + T(100, 56, c + (c === "?" ? "" : "\u00b0"), { b: 1, c: "#e4572e" }), "a triangle with two angles given"); };
  D.similarTri = function (a, b, k, hide) { var u = 10, tri = function (x, w, h, lw, lh) { return '<polygon points="' + x + ",130 " + (x + w) + ",130 " + x + "," + (130 - h) + '" fill="#d8f0e2" stroke="currentColor" stroke-width="3"/>' + T(x + w / 2, 146, lw) + T(x - 8, 130 - h / 2 + 5, lh, { a: "end" }); }; var sw = a * u, sh = b * u, bw = Math.min(150, a * k * u), bh = Math.min(120, b * k * u); return S(330, 156, tri(30, sw, sh, a, b) + tri(150, bw, bh, a * k, hide ? "x" : b * k), "two similar triangles"); };
  D.seqBars = function (vals) { var mx = Math.max.apply(null, vals), w = 260 / vals.length, r = ""; vals.forEach(function (v, i) { var h = Math.max(6, v / mx * 90); r += '<rect x="' + (20 + i * w) + '" y="' + (110 - h) + '" width="' + (w - 12) + '" height="' + h + '" rx="5" fill="' + COLS[i % 6] + '"/>' + T(20 + i * w + (w - 12) / 2, 126, v, { s: 13 }); }); return S(300, 136, r + T(150, 12, "first terms", { s: 12, c: "#7a8da8" }), "bars showing the first terms of a sequence"); };
  D.hbars = function (vals, labels) { var mx = Math.max.apply(null, vals), r = ""; vals.forEach(function (v, i) { r += T(24, 30 + i * 44, labels[i], { b: 1 }) + '<rect x="44" y="' + (14 + i * 44) + '" width="' + (v / mx * 220) + '" height="26" rx="5" fill="' + COLS[i % 6] + '"/>'; }); return S(300, 20 + vals.length * 44, r, "bars to compare"); };
  /* curves: map math coordinates to the picture */
  function graph(xmax, ymax, fn, o) {
    var W = 280, Hh = 190, ox = 34, oy = 160, sx = (W - ox - 10) / xmax, sy = (oy - 14) / ymax, r = "", i, pts = [];
    r += '<line x1="' + ox + '" y1="' + oy + '" x2="' + (W - 4) + '" y2="' + oy + '" stroke="currentColor" stroke-width="2.5"/><line x1="' + ox + '" y1="' + oy + '" x2="' + ox + '" y2="10" stroke="currentColor" stroke-width="2.5"/>';
    for (i = 1; i <= xmax; i++) r += '<line x1="' + (ox + i * sx) + '" y1="' + (oy - 4) + '" x2="' + (ox + i * sx) + '" y2="' + (oy + 4) + '" stroke="currentColor"/>' + T(ox + i * sx, oy + 18, i, { s: 12 });
    if (o && o.fill) { var a = o.fill, poly = ox + "," + oy; for (i = 0; i <= 40; i++) { var x = a * i / 40; poly += " " + (ox + x * sx) + "," + (oy - Math.min(ymax * 1.05, fn(x)) * sy); } poly += " " + (ox + a * sx) + "," + oy; r += '<polygon points="' + poly + '" fill="#d9e6fb" stroke="none"/>'; }
    for (i = 0; i <= 80; i++) { var xx = xmax * i / 80, yy = fn(xx); if (yy <= ymax * 1.05) pts.push((ox + xx * sx).toFixed(1) + "," + (oy - yy * sy).toFixed(1)); }
    r += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#3d7be6" stroke-width="3.5" stroke-linecap="round"/>';
    (o && o.line ? [o.line] : []).forEach(function (L) { r += '<line x1="' + (ox + L[0] * sx) + '" y1="' + (oy - L[1] * sy) + '" x2="' + (ox + L[2] * sx) + '" y2="' + (oy - L[3] * sy) + '" stroke="#e4572e" stroke-width="3" stroke-linecap="round"/>'; });
    ((o && o.dots) || []).forEach(function (d) { r += '<circle cx="' + (ox + d[0] * sx) + '" cy="' + (oy - d[1] * sy) + '" r="6" fill="#e4572e"/>'; });
    return S(W, Hh, r, (o && o.label) || "graph");
  }
  D.parabola = function (p, q) { var mx = q + 1; return graph(mx, Math.max(p * q, 4) + 2, function (x) { return (x - p) * (x - q) + 0; }, { dots: [[p, 0], [q, 0]], label: "a parabola crossing the x-axis" }); };
  D.areaUnder = function (k, n, a) { return graph(a + 1, k * Math.pow(a, n) * 1.15, function (x) { return k * Math.pow(x, n); }, { fill: a, label: "area under a curve from 0 to " + a }); };
  D.tangent = function (k, n, a) { var y = k * Math.pow(a, n), sl = k * n * Math.pow(a, n - 1), xm = a + 1.5; return graph(a + 2, k * Math.pow(a + 2, n) * .8, function (x) { return k * Math.pow(x, n); }, { dots: [[a, y]], line: [Math.max(0, a - 1), Math.max(0, y - sl), a + 1, y + sl], label: "a curve with a tangent line at x = " + a }); };

  /* ---------- sound (Web Audio) ---------- */
  var ac = null;
  function audio() { if (!ac) { var C = root.AudioContext || root.webkitAudioContext; if (!C) return null; ac = new C(); } if (ac.state === "suspended") ac.resume(); return ac; }
  var freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  /* seq: [{m:[midi,...], t:startSeconds, d:seconds}] */
  function playSeq(seq) {
    var a = audio(); if (!a || !seq) return 0; var t0 = a.currentTime + 0.05, end = 0;
    seq.forEach(function (n) {
      (n.m || []).forEach(function (m) {
        var o = a.createOscillator(), g = a.createGain(), o2 = a.createOscillator(); o.type = "triangle"; o2.type = "sine"; o.frequency.value = freq(m); o2.frequency.value = freq(m) * 2;
        var s = t0 + n.t, e = s + n.d, vol = 0.22 / Math.max(1, (n.m || []).length * 0.7);
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, e);
        var g2 = a.createGain(); g2.gain.value = 0.25; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(a.destination); o.start(s); o2.start(s); o.stop(e + 0.05); o2.stop(e + 0.05);
        end = Math.max(end, n.t + n.d);
      });
    });
    return end;
  }

  /* ---------- courses ---------- */
  var defs = {};
  function register(def) { defs[def.id] = def; }
  var LESSON_TITLES = ["Learn", "Practice", "Practice more", "Mixed review", "Unit test"];
  function course(id) {
    var d = defs[id]; if (!d) return null;
    return { lang: d.id, kind: d.id, name: d.name, native: d.name, tts: "en", noType: false, rom: {}, levels: d.levels, freeLevels: d.freeLevels, emoji: d.emoji,
      units: d.units.map(function (u) { return { id: u.id, lvl: u.lvl, title: u.title, blurb: u.blurb, color: u.color, tip: u.tip, items: [], lessons: LESSON_TITLES.map(function (t, i) { return { idx: i, title: t, pool: [], test: i === 4 }; }) }; }) };
  }
  var uid = 0;
  function buildLesson(courseId, unitIdx, lessonIdx, seed) {
    var d = defs[courseId], u = d.units[unitIdx], rng = mulberry32((seed || Date.now()) ^ (unitIdx * 7919 + lessonIdx * 104729 + 12345));
    var h = bind(rng), out = [], seen = {}, count = lessonIdx === 0 ? 8 : lessonIdx === 4 ? 12 : 10, guard = 0;
    if (lessonIdx === 0) out.push({ uid: "m" + (++uid), type: "info", title: u.title, body: u.tip, svg: u.tipSvg ? u.tipSvg(h) : "", key: null });
    while (out.length < count + (lessonIdx === 0 ? 1 : 0) && guard++ < 200) {
      var diff = lessonIdx === 0 ? 0 : lessonIdx === 3 ? 1 + Math.floor(rng() * 3) : lessonIdx === 4 ? 3 + Math.floor(rng() * 2) : lessonIdx;
      var q = u.make(h, diff); if (!q || (seen[q.prompt + "|" + (q.svg || "")] && guard < 120)) continue; seen[q.prompt + "|" + (q.svg || "")] = 1; q.uid = "m" + (++uid); q.key = null; out.push(q);
    }
    return out;
  }
  /* mixed practice from several units */
  function buildPractice(courseId, unitIdxs, seed, n) {
    var d = defs[courseId], rng = mulberry32(seed || Date.now()), h = bind(rng), out = [], seen = {}, guard = 0;
    while (out.length < (n || 10) && guard++ < 200) { var u = d.units[unitIdxs[Math.floor(rng() * unitIdxs.length)]], q = u.make(h, 2 + Math.floor(rng() * 2)); if (!q || (seen[q.prompt + "|" + (q.svg || "")] && guard < 120)) continue; seen[q.prompt + "|" + (q.svg || "")] = 1; q.uid = "m" + (++uid); q.key = null; out.push(q); }
    return out;
  }

  root.Subjects = { register: register, course: course, buildLesson: buildLesson, buildPractice: buildPractice, playSeq: playSeq, freq: freq, defs: defs, H: { bind: bind, D: D, S: S, simp: simp, gcd: gcd, fmt: fmt, COLS: COLS, mulberry32: mulberry32 }, ids: function () { return Object.keys(defs); } };
  if (typeof module !== "undefined" && module.exports) module.exports = root.Subjects;
})(typeof window !== "undefined" ? window : globalThis);

/* Music: 6 levels, 3 units each, 5 lessons per unit. Staff, piano and rhythm pictures are drawn as SVG; ear-training questions play real tones (Web Audio). */
(function (root) {
  "use strict";
  var Subj = root.Subjects || require("./subjects.js"), H = Subj.H, S = H.S;
  var LET = ["C", "D", "E", "F", "G", "A", "B"], SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var FONT = "Segoe UI Symbol, Noto Music, Apple Symbols, serif";
  var midiOf = function (l, o, acc) { return 12 * (o + 1) + SEMI[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0); };
  var name = function (n) { return n.replace("#", "♯").replace("b", "♭"); };
  var T = function (x, y, t, s, f) { return '<text x="' + x + '" y="' + y + '" font-size="' + (s || 15) + '" fill="currentColor"' + (f ? ' font-family="' + f + '"' : "") + ">" + t + "</text>"; };

  /* ---- pictures ---- */
  function head(cx, cy, filled) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="8" ry="5.6" transform="rotate(-20 ' + cx + " " + cy + ')" fill="' + (filled ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2.2"/>'; }
  function stem(cx, cy, up, flag) { var x = up ? cx + 7.4 : cx - 7.4, y2 = up ? cy - 36 : cy + 36; return '<line x1="' + x + '" y1="' + cy + '" x2="' + x + '" y2="' + y2 + '" stroke="currentColor" stroke-width="2.2"/>' + (flag ? '<path d="M' + x + " " + y2 + " q14 8 10 22" + '" fill="none" stroke="currentColor" stroke-width="2.6"/>' : ""); }
  function staff(notes, withClef) {
    var n = notes.length, w = 76 + n * 46, r = "", i;
    for (i = 0; i < 5; i++) r += '<line x1="4" y1="' + (84 - i * 12) + '" x2="' + (w - 4) + '" y2="' + (84 - i * 12) + '" stroke="currentColor" stroke-width="1.6"/>';
    if (withClef !== false) r += '<text x="8" y="101" font-size="74" fill="currentColor" font-family="' + FONT + '">𝄞</text>';
    notes.forEach(function (nt, k) {
      var idx = nt.o * 7 + LET.indexOf(nt.l), s = idx - 30, cx = 84 + k * 46, cy = 84 - s * 6, t;
      for (t = -2; t >= s; t -= 2) r += '<line x1="' + (cx - 13) + '" y1="' + (84 - t * 6) + '" x2="' + (cx + 13) + '" y2="' + (84 - t * 6) + '" stroke="currentColor" stroke-width="1.8"/>';
      for (t = 10; t <= s; t += 2) r += '<line x1="' + (cx - 13) + '" y1="' + (84 - t * 6) + '" x2="' + (cx + 13) + '" y2="' + (84 - t * 6) + '" stroke="currentColor" stroke-width="1.8"/>';
      if (nt.acc) r += T(cx - 26, cy + 7, nt.acc === "#" ? "♯" : "♭", 24, FONT);
      var d = nt.dur || "w"; r += head(cx, cy, d === "q" || d === "e");
      if (d !== "w") r += stem(cx, cy, s < 4, d === "e" && s < 4);
    });
    return S(w, 120, r, "music staff");
  }
  function piano(hi) {
    var W = [60, 62, 64, 65, 67, 69, 71], B = [[0, 61], [1, 63], [3, 66], [4, 68], [5, 70]], r = "";
    W.forEach(function (m, i) { r += '<rect x="' + (4 + i * 34) + '" y="6" width="34" height="112" fill="' + (m === hi ? "#f7c948" : "#fffaf0") + '" stroke="currentColor" stroke-width="2"/>'; });
    B.forEach(function (b) { r += '<rect x="' + (4 + (b[0] + 1) * 34 - 11) + '" y="6" width="22" height="70" rx="3" fill="' + (b[1] === hi ? "#e4572e" : "#2f2e3b") + '" stroke="currentColor" stroke-width="1.5"/>'; });
    return S(246, 124, r, "one octave of piano keys");
  }
  function noteShape(dur) { var d = dur, r = head(40, 62, d === "q" || d === "e"); if (d !== "w") r += stem(40, 62, true, d === "e"); return S(90, 96, r, d + " note"); }
  function restShape(kind) {
    var r = '<line x1="10" y1="40" x2="80" y2="40" stroke="currentColor" stroke-width="2"/>';
    if (kind === "w") r += '<rect x="30" y="40" width="30" height="10" fill="currentColor"/>';
    else if (kind === "h") r += '<rect x="30" y="30" width="30" height="10" fill="currentColor"/>';
    else if (kind === "q") r = '<path d="M38 14 l16 16 -12 12 16 16 -8 8" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    else r = '<circle cx="36" cy="34" r="5" fill="currentColor"/><path d="M40 38 q16 -2 14 -18 l-12 44" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>';
    return S(90, 80, r, kind + " rest");
  }

  var levels = [
    { id: "M1", name: "Reading notes", blurb: "Staff, keys, the musical alphabet" }, { id: "M2", name: "Rhythm", blurb: "Note values, rests, time signatures" },
    { id: "M3", name: "Scales and keys", blurb: "Major, minor, key signatures" }, { id: "M4", name: "Intervals and chords", blurb: "Distances, triads, chord types" },
    { id: "M5", name: "Ear training", blurb: "Listen and identify" }, { id: "M6", name: "Advanced theory", blurb: "Circle of fifths, progressions, modes" }
  ];
  var COLORS = ["#0b6e8a", "#b4541a", "#5b4bb0", "#1f7a3d", "#a02c3a", "#8a5a00"], units = [], ui = 0;
  function U(lvl, id, title, blurb, tip, make, tipSvg) { units.push({ id: "mu" + lvl + id, lvl: "M" + lvl, title: title, blurb: blurb, color: COLORS[(ui++) % 6], tip: tip, make: make, tipSvg: tipSvg }); }
  var seqOf = function (ms, step, dur) { return ms.map(function (m, i) { return { m: [m], t: i * step, d: dur || step * .9 }; }); };
  var natural = function (h, lo, hi) { var idx = h.R(lo, hi); return { l: LET[idx % 7], o: Math.floor(idx / 7) }; }; // idx = octave*7+letter

  /* ===== Level 1: reading notes ===== */
  U(1, "a", "Notes on the staff", "Treble clef names", "The treble clef staff has five lines. From the bottom the lines are E G B D F and the spaces spell F A C E.", function (h, d) {
    var nt = natural(h, d < 2 ? 4 * 7 + 2 : 4 * 7, d < 2 ? 5 * 7 + 3 : 5 * 7 + 5); if (nt.o === 4 && LET.indexOf(nt.l) < 0) nt.l = "C";
    return h.C("What is the name of this note?", nt.l, LET.filter(function (x) { return x !== nt.l; }).sort(function () { return h.rng() - .5; }).slice(0, 3), { title: "Name the note", svg: staff([{ l: nt.l, o: nt.o, dur: "q" }]), play: seqOf([midiOf(nt.l, nt.o)], .8, .7) });
  }, function () { return staff([{ l: "E", o: 4, dur: "q" }, { l: "G", o: 4, dur: "q" }, { l: "B", o: 4, dur: "q" }, { l: "D", o: 5, dur: "q" }, { l: "F", o: 5, dur: "q" }]); });
  U(1, "b", "Piano keys", "White and black keys", "White keys are A to G. A black key is a sharp (♯) of the key to its left, or a flat (♭) of the key to its right.", function (h, d) {
    var whites = [60, 62, 64, 65, 67, 69, 71], wn = ["C", "D", "E", "F", "G", "A", "B"], blacks = [61, 63, 66, 68, 70], bn = ["C♯ / D♭", "D♯ / E♭", "F♯ / G♭", "G♯ / A♭", "A♯ / B♭"];
    if (h.chance(d < 2 ? .8 : .5)) { var i = h.R(0, 6); return h.C("Which white key is highlighted?", wn[i], wn.filter(function (x) { return x !== wn[i]; }).slice(0, 3), { title: "Name the key", svg: piano(whites[i]), play: seqOf([whites[i]], .8, .7) }); }
    var j = h.R(0, 4); return h.C("Which black key is highlighted?", bn[j], bn.filter(function (x) { return x !== bn[j]; }).slice(0, 3), { title: "Name the black key", svg: piano(blacks[j]), play: seqOf([blacks[j]], .8, .7) });
  }, function () { return piano(64); });
  U(1, "c", "The musical alphabet", "A to G and round again", "Music uses seven letters: A B C D E F G, then it starts over. Moving up the alphabet moves up in pitch.", function (h) {
    var i = h.R(0, 6), a = ["A", "B", "C", "D", "E", "F", "G"], t = h.R(0, 2);
    if (t === 0) return h.C("Which note comes after " + a[i] + "?", a[(i + 1) % 7], a.filter(function (x) { return x !== a[(i + 1) % 7]; }).slice(0, 3), { title: "Next letter" });
    if (t === 1) return h.C("Which note comes before " + a[i] + "?", a[(i + 6) % 7], a.filter(function (x) { return x !== a[(i + 6) % 7]; }).slice(0, 3), { title: "Previous letter" });
    return h.T("How many different letter names does music use?", 7, { title: "The alphabet" });
  });

  /* ===== Level 2: rhythm ===== */
  var VAL = { w: ["whole", 4], h: ["half", 2], q: ["quarter", 1], e: ["eighth", .5] };
  U(2, "a", "Note values", "Whole, half, quarter, eighth", "A whole note lasts 4 beats, a half note 2, a quarter note 1 and an eighth note half a beat (in 4/4).", function (h) {
    var k = h.pick(["w", "h", "q", "e"]), t = h.R(0, 1), names = ["whole", "half", "quarter", "eighth"];
    return t === 0 ? h.C("What is this note called?", VAL[k][0], names.filter(function (x) { return x !== VAL[k][0]; }), { title: "Name the note", svg: noteShape(k) }) : h.C("How many beats does this note get in 4/4?", String(VAL[k][1]), ["4", "2", "1", "0.5"].filter(function (x) { return x !== String(VAL[k][1]); }), { title: "Count the beats", svg: noteShape(k) });
  }, function () { return noteShape("q"); });
  U(2, "b", "Rests", "Silent beats", "A rest is a silence with a length. Whole rest hangs from the line (4 beats), half rest sits on it (2 beats).", function (h) {
    var k = h.pick(["w", "h", "q", "e"]), names = ["whole rest", "half rest", "quarter rest", "eighth rest"], nm = VAL[k][0] + " rest";
    return h.chance(.5) ? h.C("What is this rest called?", nm, names.filter(function (x) { return x !== nm; }), { title: "Name the rest", svg: restShape(k) }) : h.C("How many beats of silence is this rest in 4/4?", String(VAL[k][1]), ["4", "2", "1", "0.5"].filter(function (x) { return x !== String(VAL[k][1]); }), { title: "Count the silence", svg: restShape(k) });
  }, function () { return restShape("h"); });
  U(2, "c", "Time signatures", "Beats in a measure", "In 3/4 the top number says 3 beats per measure and the bottom 4 says a quarter note gets one beat.", function (h) {
    var t = h.R(0, 3), top = h.pick([2, 3, 4, 6]);
    if (t === 0) return h.T("In " + top + "/4 time, how many beats are in each measure?", top, { title: "Time signature" });
    if (t === 1) return h.C("In 4/4 time, which note gets one beat?", "quarter note", ["half note", "whole note", "eighth note"], { title: "The bottom number" });
    if (t === 2) { var a = h.pick([1, 2]); return h.T("A 4/4 measure holds a half note and " + (a === 1 ? "two quarter notes" : "one quarter note and two eighth notes") + ". How many beats is that in total?", a === 1 ? 4 : 3.0, { title: "Add the beats", explain: a === 1 ? "2 + 1 + 1 = 4" : "2 + 1 + 0.5 + 0.5 = 4" }); }
    return h.T("How many eighth notes equal one quarter note?", 2, { title: "Note values" });
  });

  /* ===== Level 3: scales and keys ===== */
  var SC = { C: ["C", "D", "E", "F", "G", "A", "B"], G: ["G", "A", "B", "C", "D", "E", "F#"], D: ["D", "E", "F#", "G", "A", "B", "C#"], F: ["F", "G", "A", "Bb", "C", "D", "E"], A: ["A", "B", "C#", "D", "E", "F#", "G#"], Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"] };
  var ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"];
  U(3, "a", "Major scales", "W W H W W W H", "A major scale follows whole and half steps: W W H W W W H. C major uses only white keys.", function (h, d) {
    var k = h.pick(d < 2 ? ["C", "G", "F"] : ["C", "G", "D", "F", "A", "Bb"]), deg = h.R(1, 6), ans = name(SC[k][deg]), all = [].concat.apply([], Object.keys(SC).map(function (x) { return SC[x]; })).map(name).filter(function (x, i, a) { return a.indexOf(x) === i && x !== ans; });
    if (h.chance(.25)) return h.T("How many half steps are in a major scale? (the pattern W W H W W W H)", 2, { title: "Scale pattern" });
    var notes = SC[k].map(function (n, i) { return { l: n[0], o: 4 + (i >= LET.indexOf(n[0]) && k !== "C" && LET.indexOf(n[0]) < LET.indexOf(SC[k][0][0]) ? 1 : 0), acc: n[1] || "", dur: "q" }; });
    return h.C("What is the " + ORD[deg] + " note of the " + name(k) + " major scale?", ans, h.shuffle(all).slice(0, 3), { title: "Build the scale", play: seqOf(SC[k].map(function (n, i) { var m = midiOf(n[0], 4, n[1] || ""); if (LET.indexOf(n[0]) < LET.indexOf(SC[k][0][0])) m += 12; return m; }), .45, .4) });
  }, function () { return staff([{ l: "C", o: 4, dur: "q" }, { l: "D", o: 4, dur: "q" }, { l: "E", o: 4, dur: "q" }, { l: "F", o: 4, dur: "q" }, { l: "G", o: 4, dur: "q" }, { l: "A", o: 4, dur: "q" }, { l: "B", o: 4, dur: "q" }, { l: "C", o: 5, dur: "q" }]); });
  var KS = { C: 0, G: 1, D: 2, A: 3, E: 4, F: -1, Bb: -2, Eb: -3 };
  U(3, "b", "Key signatures", "Sharps and flats", "Key signatures list the sharps or flats a key uses. G major has 1 sharp (F♯), D major has 2, F major has 1 flat (B♭).", function (h) {
    var keys = Object.keys(KS), k = h.pick(keys), n = KS[k];
    if (h.chance(.55)) return h.T("How many " + (n >= 0 ? "sharps" : "flats") + " does " + name(k) + " major have?", Math.abs(n), { title: "Count the accidentals" });
    var cnt = h.pick([1, 2, 3]), key = cnt === 1 ? "G" : cnt === 2 ? "D" : "A";
    return h.C("Which major key has " + cnt + " sharp" + (cnt > 1 ? "s" : "") + "?", key + " major", ["C major", "F major", "E major", "B♭ major"].filter(function (x) { return x !== key + " major"; }), { title: "Find the key" });
  });
  var REL = { C: "A", G: "E", D: "B", F: "D", A: "F♯", Eb: "C" };
  U(3, "c", "Minor keys", "Relative minor", "Every major key has a relative minor that shares its notes. It starts on the 6th note of the major scale. C major and A minor share no sharps or flats.", function (h) {
    var k = h.pick(Object.keys(REL)), ans = REL[k] + " minor", pool = ["A", "E", "B", "D", "F♯", "C", "G"].map(function (x) { return x + " minor"; }).filter(function (x) { return x !== ans; });
    return h.chance(.8) ? h.C("What is the relative minor of " + name(k) + " major?", ans, h.shuffle(pool).slice(0, 3), { title: "Relative minor" }) : h.C("What is the natural minor step pattern?", "W H W W H W W", ["W W H W W W H", "H W W H W W W", "W H W W W H W"], { title: "Minor scale pattern" });
  });

  /* ===== Level 4: intervals and chords (Plus) ===== */
  var IV = [["minor 2nd", 1], ["major 2nd", 2], ["minor 3rd", 3], ["major 3rd", 4], ["perfect 4th", 5], ["perfect 5th", 7], ["perfect octave", 12]];
  U(4, "a", "Intervals", "The distance between notes", "An interval is the distance between two notes, counted in semitones: major 3rd = 4, perfect 5th = 7, octave = 12.", function (h) {
    var iv = h.pick(IV); if (h.chance(.5)) return h.T("How many semitones are in a " + iv[0] + "?", iv[1], { title: "Count the semitones" });
    var base = h.pick([60, 62, 65, 67]); return h.C("What interval is this?", iv[0], IV.map(function (x) { return x[0]; }).filter(function (x) { return x !== iv[0]; }).slice(0, 3), { title: "Name the interval", svg: staff([{ l: "C", o: 4, dur: "q" }, { l: ["C", "D", "E", "F", "G", "A", "B"][([0, 1, 2, 3, 4, 5, 6])[({ 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 7: 4, 12: 0 })[iv[1]]]], o: iv[1] === 12 ? 5 : 4, acc: iv[1] === 1 ? "#" : iv[1] === 3 ? "b" : "", dur: "q" }]), play: [{ m: [60], t: 0, d: .8 }, { m: [60 + iv[1]], t: .9, d: .8 }] });
  });
  var TR = { C: ["C", "E", "G"], G: ["G", "B", "D"], F: ["F", "A", "C"], D: ["D", "F♯", "A"], A: ["A", "C♯", "E"] };
  U(4, "b", "Triads", "Three-note chords", "A triad stacks three notes: root, third and fifth. C major is C E G.", function (h) {
    var k = h.pick(Object.keys(TR)), ans = TR[k].join(" "), pool = Object.keys(TR).filter(function (x) { return x !== k; }).map(function (x) { return TR[x].join(" "); });
    return h.chance(.75) ? h.C("Which notes make the " + name(k) + " major triad?", ans, pool.slice(0, 3), { title: "Build the triad", play: [{ m: TR[k].map(function (n, i) { return midiOf(n[0], 4, n[1] === "♯" ? "#" : "") + (LET.indexOf(n[0]) < LET.indexOf(TR[k][0][0]) ? 12 : 0); }), t: 0, d: 1.4 }] }) : h.T("How many notes are in a triad?", 3, { title: "Triads" });
  });
  U(4, "c", "Chord quality", "Major, minor, diminished", "Major has a major third on the bottom (C E G). Lower the third by a semitone for minor (C E♭ G). Lower the fifth too for diminished.", function (h) {
    var q = [["C E G", "major", "major"], ["C E♭ G", "minor", "minor"], ["C E♭ G♭", "diminished", "diminished"], ["C E G♯", "augmented", "augmented"]], x = h.pick(q);
    return h.C("What kind of triad is " + x[0] + "?", x[1], q.map(function (y) { return y[1]; }).filter(function (y) { return y !== x[1]; }), { title: "Name the chord quality" });
  });

  /* ===== Level 5: ear training (Plus) ===== */
  U(5, "a", "Higher or lower", "Compare two pitches", "Higher notes have faster vibrations. Listen to the two notes, then decide whether the second is higher or lower.", function (h, d) {
    var a = h.R(55, 72), diff = h.pick(d < 2 ? [5, 7, 9, 12] : [1, 2, 3, 4]) * (h.chance(.5) ? 1 : -1), b = a + diff;
    return h.C("Listen to both notes. Is the second note higher or lower than the first?", diff > 0 ? "Higher" : "Lower", ["Lower", "Higher"].filter(function (x) { return x !== (diff > 0 ? "Higher" : "Lower"); }), { title: "Higher or lower?", play: [{ m: [a], t: 0, d: .8 }, { m: [b], t: 1, d: .8 }], needsPlay: true });
  });
  U(5, "b", "Hear the interval", "Name the distance", "Songs help: a perfect 5th opens Twinkle Twinkle, a major 3rd opens When the Saints, and an octave is the same note higher.", function (h, d) {
    var pool = d < 2 ? [IV[3], IV[5], IV[6], IV[1]] : IV, iv = h.pick(pool), a = h.R(55, 66);
    return h.C("Listen. What interval do the two notes make?", iv[0], IV.map(function (x) { return x[0]; }).filter(function (x) { return x !== iv[0]; }).slice(0, 3), { title: "Name the interval by ear", play: [{ m: [a], t: 0, d: .8 }, { m: [a + iv[1]], t: 1, d: .8 }], needsPlay: true });
  });
  U(5, "c", "Major or minor?", "Happy or sad chord", "Major chords sound bright, minor chords sound darker. The only difference is the middle note.", function (h) {
    var r = h.R(55, 66), maj = h.chance(.5);
    return h.C("Listen to the chord. Is it major or minor?", maj ? "Major" : "Minor", [maj ? "Minor" : "Major"], { title: "Major or minor by ear", play: [{ m: [r, r + (maj ? 4 : 3), r + 7], t: 0, d: 1.5 }], needsPlay: true });
  });

  /* ===== Level 6: advanced theory (Plus) ===== */
  U(6, "a", "Circle of fifths", "Keys in order", "Move up a perfect fifth to add a sharp: C, G, D, A, E. Move down a fifth to add a flat: C, F, B♭, E♭.", function (h) {
    var up = ["C", "G", "D", "A", "E", "B"], i = h.R(0, 4), t = h.R(0, 2);
    if (t === 0) return h.C("What key is a perfect fifth above " + up[i] + "?", up[i + 1], ["C", "D", "E", "F", "G", "A", "B"].filter(function (x) { return x !== up[i + 1]; }).slice(0, 3), { title: "Up a fifth" });
    if (t === 1) return h.C("Which key comes next going down a fifth from C?", "F", ["D", "G", "A"], { title: "Down a fifth" });
    return h.C("Going from C major up a fifth to G major adds which sharp?", "F♯", ["C♯", "G♯", "B♭"], { title: "New sharp" });
  });
  var DEG = ["I", "ii", "iii", "IV", "V", "vi", "vii°"], CH = { C: ["C", "Dm", "Em", "F", "G", "Am", "B°"], G: ["G", "Am", "Bm", "C", "D", "Em", "F♯°"], F: ["F", "Gm", "Am", "B♭", "C", "Dm", "E°"], D: ["D", "Em", "F♯m", "G", "A", "Bm", "C♯°"] };
  U(6, "b", "Chord progressions", "Roman numerals", "Roman numerals name chords by scale degree: I, IV and V are major; ii, iii and vi are minor. In C major: C, Dm, Em, F, G, Am.", function (h) {
    var k = h.pick(Object.keys(CH)), n = h.pick([0, 3, 4, 5, 1]), ans = CH[k][n];
    return h.C("In the key of " + name(k) + " major, which chord is " + DEG[n] + "?", ans, h.shuffle(CH[k].filter(function (x) { return x !== ans; })).slice(0, 3), { title: "Find the chord" });
  });
  U(6, "c", "Seventh chords and modes", "Extra colour", "A seventh chord adds a 7th above the root: Cmaj7 = C E G B, C7 = C E G B♭. Modes start on other notes of the scale: Dorian on the 2nd, Mixolydian on the 5th.", function (h) {
    var q = [["What are the notes of Cmaj7?", "C E G B", ["C E G B♭", "C E♭ G B", "C F G B"]], ["What are the notes of C7 (dominant seventh)?", "C E G B♭", ["C E G B", "C E♭ G B♭", "C F G B♭"]], ["Which degree of the major scale does Dorian start on?", "2nd", ["1st", "5th", "6th"]], ["Which mode is the same as the natural minor scale?", "Aeolian", ["Dorian", "Lydian", "Mixolydian"]], ["Mixolydian is a major scale with which note lowered?", "7th", ["3rd", "4th", "2nd"]]], x = h.pick(q);
    return h.C(x[0], x[1], x[2], { title: "Advanced theory" });
  });

  Subj.register({ id: "music", name: "Music", levels: levels, freeLevels: ["M1", "M2", "M3"], emoji: "love", units: units });
})(typeof window !== "undefined" ? window : globalThis);

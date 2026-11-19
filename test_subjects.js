// Run: node test_subjects.js  (Math grades 1-12 and Music: every unit, every lesson, many random seeds)
const assert = require("assert");
const E = require("./public/engine.js"), Subj = require("./public/subjects.js"); require("./public/math.js"); require("./public/music.js");
let pass = 0; const ok = (n) => { pass++; console.log("ok  " + n); };
const math = Subj.defs.math, music = Subj.defs.music;

assert.strictEqual(math.levels.length, 12); assert.strictEqual(math.units.length, 72);
for (let g = 1; g <= 12; g++) assert.strictEqual(math.units.filter((u) => u.lvl === "G" + g).length, 6, "grade " + g);
ok("math: 12 grades x 6 units x 5 lessons = 30 lessons per grade, 360 in all");
assert.strictEqual(music.levels.length, 6); assert.strictEqual(music.units.length, 18);
for (let l = 1; l <= 6; l++) assert.strictEqual(music.units.filter((u) => u.lvl === "M" + l).length, 3);
ok("music: 6 levels x 3 units x 5 lessons = 90 lessons");
assert.deepStrictEqual(math.freeLevels, ["G1", "G2", "G3", "G4", "G5", "G6", "G7"]); assert.deepStrictEqual(music.freeLevels, ["M1", "M2", "M3"]);
ok("free levels: math grades 1-7, music levels 1-3 (the rest are Plus)");

const c = Subj.course("math"); assert.strictEqual(c.units.length, 72); assert(c.units.every((u) => u.lessons.length === 5 && u.lessons[4].test));
assert(c.units.every((u) => u.tip && u.title && u.color));
ok("course shape matches what the lesson player expects");

const safe = /^[0-9+\-*/(). ]+$/;
function check(courseId, seeds) {
  let total = 0, typed = 0, withSvg = 0, withPlay = 0, evald = 0;
  const def = Subj.defs[courseId];
  def.units.forEach((u, ui) => {
    for (let li = 0; li < 5; li++) for (const seed of seeds) {
      const qs = Subj.buildLesson(courseId, ui, li, seed);
      assert(qs.length >= 8 && qs.length <= 13, u.id + " lesson " + li + " size " + qs.length);
      if (li === 0) { assert.strictEqual(qs[0].type, "info"); assert(qs[0].body); }
      const seen = new Set();
      qs.forEach((q) => {
        total++; assert(q.uid && q.key === null, u.id);
        if (q.type === "info") return;
        seen.add(q.prompt + "|" + (q.svg || ""));
        assert(typeof q.prompt === "string" && q.prompt.length > 3 && !/undefined|NaN|\[object/.test(q.prompt + q.answer + (q.options || []).join(",")), u.id + ": " + q.prompt + " -> " + q.answer);
        if (q.svg) { withSvg++; assert(/^<svg [^>]*viewBox/.test(q.svg) && !/NaN|undefined/.test(q.svg), u.id + " bad svg"); }
        if (q.play) { withPlay++; assert(Array.isArray(q.play) && q.play.every((n) => n.m.every((m) => m > 20 && m < 110) && n.d > 0), u.id + " bad play"); }
        if (q.type === "select") {
          assert.strictEqual(q.options.length, 4, u.id + " needs 4 options: " + q.options.join("|")); assert.strictEqual(new Set(q.options).size, 4, u.id + " duplicate options: " + q.options.join("|"));
          assert(q.options.includes(q.answer), u.id + " answer missing from options");
          assert(E.grade(q, q.answer).ok && !E.grade(q, q.options.find((o) => o !== q.answer)).ok);
        } else if (q.type === "type") {
          typed++; assert(q.numeric && E.parseNum(q.answer) !== null, u.id + " answer not numeric: " + q.answer);
          assert(E.grade(q, q.answer).ok, u.id + " own answer rejected");
          assert(!E.grade(q, String(E.parseNum(q.answer) + 1)).ok);
        } else assert.fail("unknown type " + q.type);
        if (q.expr) { evald++; assert(safe.test(q.expr), "unsafe expr " + q.expr); const v = Function('"use strict";return (' + q.expr + ")")(); assert(Math.abs(v - E.parseNum(q.answer)) < 1e-9, u.id + ": " + q.prompt + " expr " + q.expr + " = " + v + " but answer " + q.answer); }
      });
    }
  });
  return { total, typed, withSvg, withPlay, evald };
}
let r = check("math", [1, 2, 3, 4, 5, 6]); console.log("    math:", JSON.stringify(r)); assert(r.total > 20000 && r.evald > 2500 && r.withSvg > 8000); ok("math: every question well-formed; " + r.evald + " arithmetic answers re-computed independently; " + r.withSvg + " carry diagrams");
r = check("music", [1, 2, 3, 4, 5, 6]); console.log("    music:", JSON.stringify(r)); assert(r.withSvg > 500 && r.withPlay > 500); ok("music: every question well-formed; " + r.withSvg + " with staff or piano pictures, " + r.withPlay + " with sound");

assert.strictEqual(E.parseNum("3/4"), 0.75); assert.strictEqual(E.parseNum(" −5 "), -5); assert.strictEqual(E.parseNum("1,000"), 1000); assert.strictEqual(E.parseNum("0,5"), 0.5); assert.strictEqual(E.parseNum("abc"), null); assert.strictEqual(E.parseNum("1/0"), null);
assert(E.grade({ type: "type", numeric: true, answer: "3/4" }, "6/8").ok && E.grade({ type: "type", numeric: true, answer: "0.5" }, ".5").ok && !E.grade({ type: "type", numeric: true, answer: "5" }, "").ok);
ok("numeric grading accepts equal forms (3/4 = 6/8 = 0.75, −5, 1,000) and rejects blanks");

const staffs = Subj.buildLesson("music", 0, 1, 7).filter((q) => q.svg && /music staff/.test(q.svg)); assert(staffs.length >= 3 && staffs.every((q) => q.play));
ok("music: note-reading questions draw a staff and can be played");
// determinism: the same seed gives the same lesson, different seeds differ
const a1 = JSON.stringify(Subj.buildLesson("math", 10, 1, 5).map((q) => q.prompt + (q.svg || "") + q.answer)), a2 = JSON.stringify(Subj.buildLesson("math", 10, 1, 5).map((q) => q.prompt + (q.svg || "") + q.answer)), a3 = JSON.stringify(Subj.buildLesson("math", 10, 1, 6).map((q) => q.prompt + (q.svg || "") + q.answer));
assert.strictEqual(a1, a2); assert.notStrictEqual(a1, a3); ok("lessons are reproducible per seed and vary between seeds");
const pr = Subj.buildPractice("math", [0, 5, 20, 40], 3, 10); assert.strictEqual(pr.length, 10); ok("mixed practice builds ten questions from chosen units");
console.log("\n" + pass + " tests passed");

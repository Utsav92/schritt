// Run: node test_engine.js
const fs = require("fs"), vm = require("vm"), assert = require("assert");
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/public/data.js", "utf8"), ctx);
["packs_more.js", "units_adv.js", "adv1.js", "adv2.js", "adv3.js", "units_more.js", "adv4.js", "adv5.js", "adv6.js"].forEach(f => { if (fs.existsSync(__dirname + "/public/" + f)) vm.runInContext(fs.readFileSync(__dirname + "/public/" + f, "utf8"), ctx); });
const { UNITS, PACKS } = ctx.window;
const E = require("./public/engine.js");
let pass = 0; const t = (n, f) => { f(); pass++; console.log("ok  " + n); };

t("every pack matches the unit skeleton", () => {
  for (const id in PACKS) { const e = E.validatePack(PACKS[id], UNITS); assert.deepStrictEqual(e, [], id + ": " + e.join("; ")); }
});
t("every built-in pack covers every level A1 to C2", () => {
  for (const id in PACKS) for (const u of UNITS) assert(Array.isArray(PACKS[id].units[u.id]), id + " lacks " + u.id);
  assert.deepStrictEqual([...new Set(UNITS.map(u => u.lvl))], ["A1", "A2", "B1", "B2", "C1", "C2"]);
  for (const l of ["A1", "A2", "B1", "B2", "C1", "C2"]) assert.strictEqual(UNITS.filter(u => u.lvl === l).length, 6, l + " should have 6 units (30 lessons)");
  assert.strictEqual(UNITS.length * 5, 180);
});
t("no duplicate target text inside a unit's words (select questions stay unambiguous)", () => {
  for (const id in PACKS) for (const u of UNITS) {
    const w = PACKS[id].units[u.id].slice(0, 10).map(E.fold);
    assert.strictEqual(new Set(w).size, w.length, id + "/" + u.id);
  }
});
t("validatePack rejects a short unit and missing tts", () => {
  const bad = JSON.parse(JSON.stringify(PACKS.es)); bad.units.food.pop(); delete bad.tts;
  const e = E.validatePack(bad, UNITS); assert(e.length >= 2);
});
t("fold: umlauts, accents, case, punctuation, curly quotes", () => {
  assert.strictEqual(E.fold("Käse"), E.fold("Kaese")); assert.strictEqual(E.fold("Käse"), E.fold("kase") === "kase" ? "kaese" : "x");
  assert.strictEqual(E.fold("¿Cómo estás?"), E.fold("como estas"));
  assert.strictEqual(E.fold("l’eau"), E.fold("l'eau"));
});
t("grade type: exact, accent-free, one typo accepted, two typos rejected", () => {
  const ch = { type: "type", answer: "Entschuldigung" };
  assert(E.grade(ch, "entschuldigung").ok); assert(!E.grade(ch, "entschuldigung").typo);
  assert(E.grade(ch, "entschuldigng").typo); assert(!E.grade(ch, "entschuldgng").ok);
  const short = { type: "type", answer: "Ja" }; assert(!E.grade(short, "Jo").ok);
});
t("grade build and select", () => {
  const b = { type: "build", tokens: ["Ich", "heiße", "Anna"], answerText: "Ich heiße Anna." };
  assert(E.grade(b, ["ich", "heisse", "anna"]).ok); assert(!E.grade(b, ["Anna", "heiße", "Ich"]).ok);
  assert(E.grade({ type: "select", answer: "x" }, "x").ok); assert(!E.grade({ type: "select", answer: "x" }, "y").ok);
});

for (const lang of Object.keys(PACKS)) {
  t(lang + ": all 30 lessons generate valid, answerable challenges", () => {
    const course = E.buildCourse(lang, UNITS, PACKS);
    assert.strictEqual(course.units.length, UNITS.length); assert.strictEqual(UNITS.length, 36);
    const state = { items: {} };
    let n = 0;
    for (let u = 0; u < course.units.length; u++) for (let l = 0; l < 5; l++) for (const speech of [false, true]) {
      const rng = E.mulberry32(u * 100 + l * 10 + (speech ? 1 : 0));
      const lesson = E.buildLesson(course, u, l, state, { rng, speech, now: 1e12 });
      assert(lesson.length >= 5 && lesson.length <= 16, "length " + lesson.length);
      const uids = new Set(lesson.map(c => c.uid)); assert.strictEqual(uids.size, lesson.length);
      for (const c of lesson) {
        n++;
        if (c.type === "select" || c.type === "listen") {
          assert(c.options.includes(c.answer)); assert.strictEqual(new Set(c.options.map(E.fold)).size, c.options.length);
          assert(c.options.length >= 3, "options " + c.options.length);
          assert(E.grade(c, c.answer).ok);
        } else if (c.type === "type") { assert(E.grade(c, c.answer).ok); assert(c.prompt);
        } else if (c.type === "build" || c.type === "listenbuild") {
          const bank = c.bank.slice(); for (const tk of c.tokens) { const i = bank.indexOf(tk); assert(i >= 0, "token missing"); bank.splice(i, 1); }
          assert(E.grade(c, c.tokens).ok);
        } else if (c.type === "match") { assert(c.pairs.length >= 4); assert(E.grade(c, 0).ok); assert(!E.grade(c, 1).ok);
        } else assert.fail("unknown type " + c.type);
        if (c.key && !c.key.startsWith("match")) E.touch(state, c.key, true, 1e12);
      }
    }
    assert(n > 400);
  });
}
t("wrong options for a word come from the same unit when it has enough words", () => {
  const course = E.buildCourse("de", UNITS, PACKS);
  for (let u = 0; u < course.units.length; u++) for (let seed = 0; seed < 5; seed++) {
    const lesson = E.buildLesson(course, u, 0, { items: {} }, { rng: E.mulberry32(seed), now: 1e12 });
    const unitTl = new Set(course.units[u].items.map(i => i.tl)), unitEn = new Set(course.units[u].items.map(i => i.en));
    for (const c of lesson.filter(c => c.type === "select")) {
      const set = c.dir === "tl2en" ? unitEn : unitTl;
      assert(c.options.every(o => set.has(o)), "option from another unit in unit " + u + ": " + c.options.join("|"));
    }
  }
});
t("touch: correct raises strength, wrong drops it by 2, intervals grow", () => {
  const s = { items: {} }; const now = 1e12;
  E.touch(s, "k", true, now); E.touch(s, "k", true, now); E.touch(s, "k", true, now);
  assert.strictEqual(s.items.k.s, 3); assert(s.items.k.t > now + 2 * 86400000);
  E.touch(s, "k", false, now); assert.strictEqual(s.items.k.s, 1); assert.strictEqual(s.items.k.miss, 1);
  for (let i = 0; i < 9; i++) E.touch(s, "k", true, now); assert.strictEqual(s.items.k.s, 5);
});
t("practice: empty before learning, up to 10 challenges after", () => {
  const course = E.buildCourse("de", UNITS, PACKS), s = { items: {} };
  assert.deepStrictEqual(E.buildPractice(course, s, {}), []);
  course.units[0].items.forEach(i => E.touch(s, i.key, true, 1e12));
  const p = E.buildPractice(course, s, { now: 2e12, rng: E.mulberry32(3) }); assert(p.length > 0 && p.length <= 10);
});
t("spanish questions get inverted opening mark", () => {
  const item = { k: "s", tl: "Cómo estás", en: "How are you", p: "?" };
  assert.strictEqual(E.fullText(item, "es", "tl"), "¿Cómo estás?"); assert.strictEqual(E.fullText(item, "de", "tl"), "Cómo estás?");
});
t("weak items are scheduled before strong ones", () => {
  const course = E.buildCourse("fr", UNITS, PACKS), s = { items: {} };
  const pool = course.units[0].lessons[0].pool;
  pool.slice(0, 4).forEach(i => { for (let k = 0; k < 4; k++) E.touch(s, i.key, true, 1e12); });
  const lesson = E.buildLesson(course, 0, 0, s, { rng: E.mulberry32(1), now: 1e12 });
  assert(lesson.some(c => c.key === pool[4].key));
});
t("unspaced languages: sentences tokenized, no typing exercises, roman guides present", () => {
  for (const id of ["zh", "ja", "th"]) {
    assert(PACKS[id].nospace && PACKS[id].noType);
    const course = E.buildCourse(id, UNITS, PACKS);
    for (const u of course.units) for (const it of u.items.filter(i => i.k === "s")) { assert(it.tk && it.tk.length >= 2, id + " " + it.tl); assert(!it.tl.includes("|") && !it.tl.includes(" ")); }
    for (let u = 0; u < course.units.length; u++) for (let l = 0; l < 5; l++) for (const c of E.buildLesson(course, u, l, { items: {} }, { rng: E.mulberry32(u + l), speech: true, now: 1e12 })) assert(c.type !== "type", id + " has a type challenge");
  }
  for (const id of ["zh", "ja", "th", "hi", "ur", "ar", "ko"]) { const c = E.buildCourse(id, UNITS, PACKS); assert(Object.keys(c.rom).length >= 80, id + " roman " + Object.keys(c.rom).length); }
  const zh = E.buildCourse("zh", UNITS, PACKS);
  assert.strictEqual(E.romanOf(zh, "你好吗？"), "nǐ hǎo ma"); assert.strictEqual(E.fullText(zh.units[0].items[11], "zh", "tl"), "你好吗？");
});
t("typing without dots or accents works for Swedish, Turkish, German", () => {
  assert(E.grade({ type: "type", answer: "Förlåt" }, "forlat").ok);
  assert(E.grade({ type: "type", answer: "Ben Hindistan'danım" }, "ben hindistandanim").ok);
  assert(E.grade({ type: "type", answer: "Käse" }, "Kase").ok); assert(E.grade({ type: "type", answer: "Käse" }, "Kaese").ok);
});
t("Mexican Spanish also gets the inverted marks", () => {
  const c = E.buildCourse("esmx", UNITS, PACKS); assert.strictEqual(E.fullText(c.units[0].items[11], "esmx", "tl"), "¿Cómo estás?");
});
console.log("\n" + pass + " tests passed");

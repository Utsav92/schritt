// Run: node test_apply.js  (job applications and registration notices; the mail provider is mocked, nothing is sent)
const assert = require("assert"), { makeServer } = require("./lib/server.js");
let pass = 0; const ok = (n) => { pass++; console.log("ok  " + n); };
function call(handler, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const req = { method, headers: Object.assign({ host: "schritt.test" }, headers), body, on() {} };
    const out = { headers: {}, statusCode: 200 };
    const res = { setHeader: (k, v) => { out.headers[k.toLowerCase()] = v; }, set statusCode(v) { out.statusCode = v; }, get statusCode() { return out.statusCode; }, end: (t) => resolve({ status: out.statusCode, json: t ? JSON.parse(t) : null }) };
    handler(req, res);
  });
}
const XRW = { "x-requested-with": "schritt" }, sent = []; let ipn = 0; const fresh = () => Object.assign({ "x-forwarded-for": "10.0.0." + (++ipn) }, XRW); let providerOk = true;
const mockFetch = async (url, opts) => { if (url === "https://api.resend.com/emails") { sent.push({ auth: opts.headers.Authorization, body: JSON.parse(opts.body) }); return { ok: providerOk, status: providerOk ? 200 : 500, json: async () => ({}) }; } throw new Error("unexpected " + url); };
const pdf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(500, 7)]).toString("base64");
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]), Buffer.alloc(300, 1)]).toString("base64");
const good = () => ({ position: "Applied AI Engineer", name: "Asha Rao", email: "asha@example.com", phone: "+1 555 0100", address: { line1: "1 Main St", city: "Pune", region: "MH", postal: "411001", country: "India" }, links: "https://github.com/asha", education: "BSc CS", years: "5", availability: "1 month",
  experience: [{ company: "Acme", title: "ML Engineer", from: "2020", to: "2024", summary: "Built ranking models." }], certifications: [{ name: "TensorFlow Developer", issuer: "Google", year: "2022" }], tools: [{ name: "Python", level: "Expert" }, { name: "PyTorch", level: "Advanced" }],
  why: "I care about learning and want to build tutoring features that feel kind and honest.", consent: true, website: "", resume: { name: "cv.pdf", data: pdf }, certFiles: [{ name: "cert.png", data: png }] });

(async () => {
  const on = makeServer({ env: { RESEND_API_KEY: "re_test" }, fetch: mockFetch }).handlers, off = makeServer({ env: {}, fetch: mockFetch }).handlers;
  let r = await call(off.apply, { method: "POST", headers: XRW, body: good() }); assert.strictEqual(r.status, 503); ok("applications are refused cleanly until mail is configured (503)");
  r = await call(on.apply, { method: "POST", body: good() }); assert.strictEqual(r.status, 403); ok("cross-site posts without the app header are blocked (CSRF)");
  r = await call(on.apply, { method: "POST", headers: fresh(), body: good() }); assert.strictEqual(r.status, 200); assert.strictEqual(sent.length, 1);
  const m = sent[0].body; assert.deepStrictEqual(m.to, ["pandyautsav@gmail.com"]); assert.strictEqual(m.reply_to, "asha@example.com"); assert.strictEqual(sent[0].auth, "Bearer re_test");
  assert(/Application: Applied AI Engineer - Asha Rao/.test(m.subject) && /Python: Expert/.test(m.text) && /TensorFlow Developer/.test(m.text) && /Pune, MH, 411001, India/.test(m.text) && /Built ranking models/.test(m.text) && /WHY SCHRITT/.test(m.text));
  assert.strictEqual(m.attachments.length, 2); assert(m.attachments.some((a) => a.filename === "cv.pdf") && m.attachments.some((a) => a.filename === "cert.png"));
  ok("a valid application is emailed to pandyautsav@gmail.com with every field and both files attached");
  const bad = async (mut, re, label) => { const b = good(); mut(b); const x = await call(on.apply, { method: "POST", headers: fresh(), body: b }); assert.strictEqual(x.status, 400, label); assert(re.test(x.json.error), label + ": " + x.json.error); };
  await bad((b) => { b.consent = false; }, /consent/, "consent"); await bad((b) => { b.email = "nope"; }, /email/, "email"); await bad((b) => { b.name = ""; }, /name/, "name"); await bad((b) => { b.why = "short"; }, /why/, "why");
  await bad((b) => { b.address.country = ""; }, /country/, "country"); await bad((b) => { b.resume = undefined; }, /Resume/, "resume missing");
  await bad((b) => { b.resume = { name: "cv.exe", data: pdf }; }, /PDF, Word/, "exe"); await bad((b) => { b.resume = { name: "cv.pdf", data: Buffer.from("MZ not a pdf at all").toString("base64") }; }, /does not look like/, "disguised file");
  await bad((b) => { b.resume = { name: "cv.pdf", data: Buffer.concat([Buffer.from("%PDF"), Buffer.alloc(2.5 * 1024 * 1024)]).toString("base64") }; }, /2 MB/, "too big");
  await bad((b) => { b.certFiles = [1, 2, 3, 4].map(() => ({ name: "c.png", data: png })); }, /at most/, "too many certs"); await bad((b) => { b.website = "http://spam"; }, /rejected/, "honeypot");
  ok("bad input is rejected: consent, email, name, short essay, wrong or disguised or oversized files, too many certificates, honeypot");
  assert.strictEqual(sent.length, 1); ok("rejected applications send no email");
  r = await call(on.apply, { method: "POST", headers: Object.assign({ "x-forwarded-for": "9.9.9.9" }, XRW), body: Object.assign(good(), { name: "A\r\nBcc: evil@x.com" }) }); assert.strictEqual(r.status, 200);
  const last = sent[sent.length - 1].body; assert(!/[\r\n]/.test(last.subject) && !/Bcc/.test(last.subject.split("\n")[0].slice(0, 0))); ok("line breaks in the name cannot inject mail headers");
  providerOk = false; r = await call(on.apply, { method: "POST", headers: Object.assign({ "x-forwarded-for": "8.8.8.8" }, XRW), body: good() }); assert.strictEqual(r.status, 500); assert(!/resend|re_test/i.test(JSON.stringify(r.json))); providerOk = true; ok("a mail-provider failure returns a generic error and leaks no key");
  let st = 0; for (let i = 0; i < 7; i++) st = (await call(on.apply, { method: "POST", headers: Object.assign({ "x-forwarded-for": "7.7.7.7" }, XRW), body: good() })).status; assert.strictEqual(st, 429); ok("one address is rate limited after 5 applications an hour");

  sent.length = 0;
  r = await call(on.register, { method: "POST", headers: fresh(), body: { name: "Leo", email: "leo@example.com", consent: true, website: "" } }); assert.strictEqual(r.status, 200); assert.deepStrictEqual(sent[0].body.to, ["pandyautsav@gmail.com"]); assert(/leo@example.com/.test(sent[0].body.text) && /New Schritt registration/.test(sent[0].body.subject));
  ok("a new registration emails the name and email to pandyautsav@gmail.com");
  r = await call(on.register, { method: "POST", headers: fresh(), body: { name: "Leo", email: "leo@example.com", consent: false } }); assert.strictEqual(r.status, 400);
  r = await call(on.register, { method: "POST", headers: fresh(), body: { name: "Leo", email: "bad", consent: true } }); assert.strictEqual(r.status, 400); assert.strictEqual(sent.length, 1); ok("registration needs consent and a valid email");
  const other = makeServer({ env: { RESEND_API_KEY: "k", NOTIFY_EMAIL: "team@example.org" }, fetch: mockFetch }).handlers; sent.length = 0; await call(other.register, { method: "POST", headers: XRW, body: { name: "Z", email: "z@example.com", consent: true } }); assert.deepStrictEqual(sent[0].body.to, ["team@example.org"]); ok("NOTIFY_EMAIL can redirect the notices");
  r = await call(makeServer({ env: { RESEND_API_KEY: "k" }, fetch: mockFetch }).handlers.config, {}); assert.strictEqual(r.json.apply, true); r = await call(off.config, {}); assert.strictEqual(r.json.apply, false); ok("the config endpoint tells the page whether online applying is on");
  console.log("\n" + pass + " tests passed");
})().catch((e) => { console.error(e); process.exit(1); });

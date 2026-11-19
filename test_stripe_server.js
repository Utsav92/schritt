// Run: node test_stripe_server.js  (checks signature verification and the verify endpoint with locally signed events)
const assert = require("assert"), crypto = require("crypto"), http = require("http"), fs = require("fs"), os = require("os"), path = require("path");
process.env.PLUS_STORE = path.join(os.tmpdir(), "plus-store-test-" + process.pid + ".json");
const S = require("./stripe-server.js");
const secret = "whsec_test_secret";
const sign = (raw, t) => "t=" + t + ",v1=" + crypto.createHmac("sha256", secret).update(t + "." + raw).digest("hex");
const now = Math.floor(Date.now() / 1000);
let pass = 0; const ok = (n) => { pass++; console.log("ok  " + n); };

assert(S.verifySignature("{}", sign("{}", now), secret, now)); ok("valid signature accepted");
assert(!S.verifySignature("{}", sign("{}", now), "other", now)); ok("wrong secret rejected");
assert(!S.verifySignature("{ }", sign("{}", now), secret, now)); ok("tampered body rejected");
assert(!S.verifySignature("{}", sign("{}", now - 1000), secret, now)); ok("stale timestamp rejected");
assert(!S.verifySignature("{}", "", secret, now) && !S.verifySignature("{}", "t=1", secret, now)); ok("missing signature rejected");

const server = S.createServer(secret, "*");
server.listen(0, () => {
  const port = server.address().port;
  const call = (method, p, body, headers) => new Promise((res) => {
    const r = http.request({ port, method, path: p, headers }, (resp) => { let d = ""; resp.on("data", (c) => d += c); resp.on("end", () => res({ status: resp.statusCode, body: d })); });
    if (body) r.write(body); r.end();
  });
  (async () => {
    const ev = JSON.stringify({ type: "checkout.session.completed", data: { object: { client_reference_id: "abc123", mode: "subscription", customer: "cus_1", subscription: "sub_1", metadata: { plan: "yearly" } } } });
    let r = await call("POST", "/webhook", ev, { "Stripe-Signature": "t=" + now + ",v1=00" }); assert.strictEqual(r.status, 400); ok("webhook rejects bad signature");
    r = await call("GET", "/verify?ref=abc123"); assert.deepStrictEqual(JSON.parse(r.body), { active: false }); ok("unknown ref is not active");
    r = await call("POST", "/webhook", ev, { "Stripe-Signature": sign(ev, now) }); assert.strictEqual(r.status, 200); ok("signed checkout event accepted");
    r = await call("GET", "/verify?ref=abc123"); const j = JSON.parse(r.body); assert(j.active && j.plan === "yearly"); ok("paid ref is active with its plan");
    const del = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { customer: "cus_1", status: "canceled" } } });
    r = await call("POST", "/webhook", del, { "Stripe-Signature": sign(del, now) }); assert.strictEqual(r.status, 200);
    r = await call("GET", "/verify?ref=abc123"); assert.strictEqual(JSON.parse(r.body).active, false); ok("cancelled subscription turns Plus off");
    server.close(); try { fs.unlinkSync(process.env.PLUS_STORE); } catch (e) { /* none */ }
    console.log("\n" + pass + " tests passed");
  })().catch((e) => { console.error(e); process.exit(1); });
});

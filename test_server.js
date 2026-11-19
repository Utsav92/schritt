// Run: node test_server.js  (no network: Google, Stripe and the database are mocked)
const assert = require("assert"), crypto = require("crypto"), { makeServer } = require("./lib/server.js");
let pass = 0; const ok = (n) => { pass++; console.log("ok  " + n); };

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = Object.assign(publicKey.export({ format: "jwk" }), { kid: "k1", alg: "RS256", use: "sig" });
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
function idToken(over, key) {
  const h = b64({ alg: "RS256", kid: "k1", typ: "JWT" }), p = b64(Object.assign({ iss: "https://accounts.google.com", aud: "client-123", sub: "g-42", email: "asha@example.com", email_verified: true, name: "Asha", exp: Math.floor(Date.now() / 1000) + 3600 }, over));
  return h + "." + p + "." + crypto.sign("RSA-SHA256", Buffer.from(h + "." + p), key || privateKey).toString("base64url");
}

const store = new Map(), stripeCalls = []; let nowMs = Date.now();
const mockFetch = async (url, opts) => {
  opts = opts || {}; const json = (o, status) => ({ ok: !status, status: status || 200, json: async () => o });
  if (url === "https://www.googleapis.com/oauth2/v3/certs") return json({ keys: [jwk] });
  if (url === "https://redis.test") {
    assert.strictEqual(opts.headers.Authorization, "Bearer redis-token"); const c = JSON.parse(opts.body);
    if (c[0] === "SET") { store.set(c[1], c[2]); return json({ result: "OK" }); }
    if (c[0] === "GET") return json({ result: store.has(c[1]) ? store.get(c[1]) : null });
    return json({ error: "unsupported" });
  }
  if (url.startsWith("https://api.stripe.com/v1/")) {
    assert.strictEqual(opts.headers.Authorization, "Bearer sk_test_x"); stripeCalls.push({ url, body: opts.body, method: opts.method });
    if (url.endsWith("/checkout/sessions")) return json({ id: "cs_1", url: "https://checkout.stripe.com/c/pay/cs_1" });
    if (url.endsWith("/billing_portal/sessions")) return json({ url: "https://billing.stripe.com/p/session/x" });
    if (url.includes("/subscriptions/")) return json({ id: "sub_1", status: "active", current_period_end: Math.floor((nowMs + 30 * 86400000) / 1000) });
  }
  return json({ error: { message: "unexpected " + url } }, 500);
};
const env = { SESSION_SECRET: "s".repeat(40), GOOGLE_CLIENT_ID: "client-123", UPSTASH_REDIS_REST_URL: "https://redis.test", UPSTASH_REDIS_REST_TOKEN: "redis-token", STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_t", STRIPE_PRICE_MONTHLY: "price_m", STRIPE_PRICE_YEARLY: "price_y", APP_URL: "https://schritt.test" };
const S = makeServer({ env, fetch: mockFetch, now: () => nowMs }), H = S.handlers;

function call(handler, { method = "GET", headers = {}, body, rawBody } = {}) {
  return new Promise((resolve) => {
    const req = { method, headers: Object.assign({ host: "schritt.test" }, headers), body, rawBody, on() {} };
    const out = { headers: {}, statusCode: 200 };
    const res = { setHeader: (k, v) => { out.headers[k.toLowerCase()] = v; }, set statusCode(v) { out.statusCode = v; }, get statusCode() { return out.statusCode; }, end: (t) => resolve({ status: out.statusCode, headers: out.headers, json: t ? JSON.parse(t) : null }) };
    handler(req, res);
  });
}
const XRW = { "x-requested-with": "schritt" };
const cookieOf = (r) => String(r.headers["set-cookie"]).split(";")[0];

(async () => {
  let r = await call(H.config); assert(r.json.cloud && r.json.checkout && r.json.googleClientId === "client-123" && !JSON.stringify(r.json).includes("sk_")); ok("public config exposes no secrets");
  r = await call(H.authMe); assert.strictEqual(r.json.user, null); ok("no cookie means signed out");
  r = await call(H.authGoogle, { method: "POST", body: { credential: idToken() } }); assert.strictEqual(r.status, 403); ok("sign-in without the CSRF header is refused");
  for (const [name, over, key] of [["wrong audience", { aud: "other" }], ["wrong issuer", { iss: "https://evil.example" }], ["expired", { exp: 1 }], ["unverified email", { email_verified: false }], ["forged signature", {}, crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey]]) {
    r = await call(H.authGoogle, { method: "POST", headers: XRW, body: { credential: idToken(over, key) } }); assert.strictEqual(r.status, 401, name);
  }
  ok("bad Google tokens rejected (audience, issuer, expiry, unverified email, forged signature)");
  r = await call(H.authGoogle, { method: "POST", headers: XRW, body: { credential: idToken() } });
  assert.strictEqual(r.status, 200); assert.strictEqual(r.json.user.name, "Asha");
  const ck = String(r.headers["set-cookie"]); assert(/HttpOnly/.test(ck) && /SameSite=Lax/.test(ck) && /Secure/.test(ck) && /Max-Age=2592000/.test(ck)); ok("valid token signs in with an HttpOnly, Secure, SameSite cookie");
  const cookie = { cookie: cookieOf(r) };
  r = await call(H.authMe, { headers: cookie }); assert.strictEqual(r.json.user.email, "asha@example.com"); ok("session cookie identifies the user");
  const tampered = { cookie: cookie.cookie.slice(0, -3) + (cookie.cookie.slice(-3) === "AAA" ? "BBB" : "AAA") };
  r = await call(H.authMe, { headers: tampered }); assert.strictEqual(r.json.user, null); ok("tampered cookie is ignored");
  nowMs += 31 * 86400000; r = await call(H.authMe, { headers: cookie }); assert.strictEqual(r.json.user, null); nowMs -= 31 * 86400000; ok("expired session is ignored");

  r = await call(H.sync, { headers: cookie }); assert.strictEqual(r.json.state, null); ok("fresh account has no cloud state");
  r = await call(H.sync, { method: "PUT", headers: Object.assign({}, cookie, XRW), body: { state: { xp: 120, streak: 3 } } }); assert.strictEqual(r.status, 200); ok("state can be saved");
  r = await call(H.sync, { headers: cookie }); assert.deepStrictEqual(r.json.state, { xp: 120, streak: 3 }); ok("state comes back");
  r = await call(H.sync, { method: "PUT", headers: Object.assign({}, cookie, XRW), body: { state: { blob: "x".repeat(210 * 1024) } } }); assert.strictEqual(r.status, 413); ok("oversized state refused");
  r = await call(H.sync, { method: "PUT", headers: Object.assign({}, cookie, XRW), body: { state: [1] } }); assert.strictEqual(r.status, 400); ok("non-object state refused");
  r = await call(H.sync, { method: "PUT", headers: Object.assign({}, cookie, { origin: "https://evil.example" }, XRW), body: { state: {} } }); assert.strictEqual(r.status, 403); ok("cross-site origin refused");
  r = await call(H.sync, {}); assert.strictEqual(r.status, 401); ok("sync requires sign-in");
  const bobToken = idToken({ sub: "g-99", email: "bob@example.com", name: "Bob" }); const bob = await call(H.authGoogle, { method: "POST", headers: XRW, body: { credential: bobToken } });
  r = await call(H.sync, { headers: { cookie: cookieOf(bob) } }); assert.strictEqual(r.json.state, null); ok("accounts cannot see each other's data");

  r = await call(H.plus, { headers: cookie }); assert.strictEqual(r.json.active, false); ok("no payment means no Plus");
  r = await call(H.stripeCheckout, { method: "POST", headers: Object.assign({}, cookie, XRW), body: { plan: "yearly" } });
  assert(r.status === 200 && r.json.url.startsWith("https://checkout.stripe.com/")); const sent = decodeURIComponent(stripeCalls.pop().body);
  assert(sent.includes("line_items[0][price]=price_y") && sent.includes("client_reference_id=g-42") && sent.includes("customer_email=asha@example.com") && sent.includes("mode=subscription") && sent.includes("success_url=https://schritt.test/index.html?plus=success")); ok("checkout session created for the signed-in user with the right price");
  r = await call(H.stripeCheckout, { method: "POST", headers: Object.assign({}, cookie, XRW), body: { plan: "lifetime" } }); assert.strictEqual(r.status, 400); ok("unknown plan refused");
  r = await call(H.stripeCheckout, { method: "POST", headers: XRW, body: { plan: "yearly" } }); assert.strictEqual(r.status, 401); ok("checkout requires sign-in");

  const evt = JSON.stringify({ type: "checkout.session.completed", data: { object: { mode: "subscription", client_reference_id: "g-42", customer: "cus_1", subscription: "sub_1", metadata: { plan: "yearly" } } } });
  const t = Math.floor(nowMs / 1000), sig = (raw) => "t=" + t + ",v1=" + crypto.createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(t + "." + raw).digest("hex");
  r = await call(H.stripeWebhook, { method: "POST", rawBody: evt, headers: { "stripe-signature": "t=" + t + ",v1=deadbeef" } }); assert.strictEqual(r.status, 400); ok("webhook with a bad signature refused");
  r = await call(H.stripeWebhook, { method: "POST", rawBody: evt, headers: { "stripe-signature": sig(evt) } }); assert.strictEqual(r.status, 200); ok("signed webhook accepted");
  r = await call(H.plus, { headers: cookie }); assert(r.json.active && r.json.plan === "yearly" && r.json.until > nowMs); ok("paid account gets Plus with its period end");
  r = await call(H.plus, { headers: { cookie: cookieOf(bob) } }); assert.strictEqual(r.json.active, false); ok("another account is unaffected");
  r = await call(H.stripePortal, { method: "POST", headers: Object.assign({}, cookie, XRW) }); assert(r.json.url.startsWith("https://billing.stripe.com/")); ok("billing portal link for subscribers");
  const del = JSON.stringify({ type: "customer.subscription.deleted", data: { object: { customer: "cus_1", status: "canceled" } } });
  r = await call(H.stripeWebhook, { method: "POST", rawBody: del, headers: { "stripe-signature": sig(del) } }); r = await call(H.plus, { headers: cookie }); assert.strictEqual(r.json.active, false); ok("cancelled subscription turns Plus off");
  r = await call(H.authLogout, { method: "POST", headers: Object.assign({}, cookie, XRW) }); assert(/Max-Age=0/.test(String(r.headers["set-cookie"]))); ok("logout clears the cookie");
  const bare = makeServer({ env: {}, fetch: mockFetch }).handlers; r = await call(bare.authGoogle, { method: "POST", headers: XRW, body: { credential: "x" } }); assert.strictEqual(r.status, 503); ok("unconfigured server fails closed");
  console.log("\n" + pass + " tests passed");
})().catch((e) => { console.error(e); process.exit(1); });

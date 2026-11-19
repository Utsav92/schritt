/* Schritt server logic for Vercel functions (api/*.js). No dependencies: Node crypto + fetch.
   Secrets come from environment variables only (never from files):
     SESSION_SECRET              long random string used to sign login cookies
     GOOGLE_CLIENT_ID            OAuth client id (Google Cloud Console, type "Web application")
     UPSTASH_REDIS_REST_URL/TOKEN  storage (Vercel Marketplace > Upstash Redis); the KV_REST_API_URL/TOKEN names it may add instead also work
     STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY
     APP_URL                     e.g. https://schritt.vercel.app (used for Stripe return links)
     RESEND_API_KEY              resend.com key; lets the server email job applications and new registrations
     NOTIFY_EMAIL                who receives them (default pandyautsav@gmail.com)
     MAIL_FROM                   sender, default "Schritt <onboarding@resend.dev>" (Resend free tier sends only to the account owner)  */
"use strict";
const crypto = require("crypto");

const SESSION_DAYS = 30, MAX_STATE_BYTES = 200 * 1024, COOKIE = "schritt_sid";
const b64url = (b) => Buffer.from(b).toString("base64url");
const fromB64url = (s) => Buffer.from(String(s), "base64url");


/* ---------- applications and registrations (emailed to the site owner) ---------- */
const NOTIFY_DEFAULT = "pandyautsav@gmail.com";
const clean = (s, max) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
const EMAIL_RE = /^[^@\s<>"',;]{1,64}@[^@\s<>"',;]{1,190}\.[^@\s<>"',;]{2,24}$/;
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const FILE_MAX = 2 * 1024 * 1024, FILES_TOTAL_MAX = 3 * 1024 * 1024, MAX_CERT_FILES = 3;
const MAGIC = { pdf: (b) => b.slice(0, 4).toString() === "%PDF", docx: (b) => b[0] === 0x50 && b[1] === 0x4b, doc: (b) => b[0] === 0xd0 && b[1] === 0xcf, png: (b) => b[0] === 0x89 && b.slice(1, 4).toString() === "PNG", jpg: (b) => b[0] === 0xff && b[1] === 0xd8 };
function badInput(m) { const e = new Error(m); e.status = 400; e.expose = true; return e; }
function checkFile(f, label) {
  if (!f || typeof f !== "object" || typeof f.data !== "string") throw badInput(label + " is missing");
  const ext = (String(f.name || "").toLowerCase().match(/\.([a-z0-9]{2,4})$/) || [])[1]; const kind = ext === "jpeg" ? "jpg" : ext;
  if (!MAGIC[kind]) throw badInput(label + " must be a PDF, Word, PNG or JPG file");
  const buf = Buffer.from(f.data, "base64");
  if (!buf.length || buf.length > FILE_MAX) throw badInput(label + " must be under 2 MB");
  if (!MAGIC[kind](buf)) throw badInput(label + " does not look like a ." + kind + " file");
  return { filename: clean(String(f.name).replace(/[\\/:*?"<>|]+/g, "_"), 80) || ("file." + kind), buf };
}
function validateApplication(b) {
  if (!b || typeof b !== "object") throw badInput("empty application");
  if (b.website) throw badInput("rejected");  // honeypot field, hidden from people
  if (b.consent !== true) throw badInput("please tick the consent box");
  const a = { position: clean(b.position, 80), name: clean(b.name, 100), email: clean(b.email, 254), phone: clean(b.phone, 40), links: clean(b.links, 300), education: clean(b.education, 200), years: clean(b.years, 10), availability: clean(b.availability, 100), why: clean(b.why, 2500) };
  const ad = b.address || {}; a.address = { line1: clean(ad.line1, 120), city: clean(ad.city, 80), region: clean(ad.region, 80), postal: clean(ad.postal, 20), country: clean(ad.country, 60) };
  if (!a.position) throw badInput("choose the position"); if (a.name.length < 2) throw badInput("enter your full name");
  if (!EMAIL_RE.test(a.email)) throw badInput("enter a valid email address"); if (!a.address.city || !a.address.country) throw badInput("enter your city and country");
  if (a.why.length < 30) throw badInput("tell us a little more about why you want to join (at least 30 characters)");
  a.experience = (Array.isArray(b.experience) ? b.experience : []).slice(0, 8).map((x) => ({ company: clean(x && x.company, 100), title: clean(x && x.title, 100), from: clean(x && x.from, 20), to: clean(x && x.to, 20), summary: clean(x && x.summary, 800) })).filter((x) => x.company || x.title);
  a.certifications = (Array.isArray(b.certifications) ? b.certifications : []).slice(0, 8).map((x) => ({ name: clean(x && x.name, 120), issuer: clean(x && x.issuer, 100), year: clean(x && x.year, 10) })).filter((x) => x.name);
  a.tools = (Array.isArray(b.tools) ? b.tools : []).slice(0, 20).map((x) => ({ name: clean(x && x.name, 60), level: LEVELS.indexOf(x && x.level) >= 0 ? x.level : "Intermediate" })).filter((x) => x.name);
  const certFiles = Array.isArray(b.certFiles) ? b.certFiles : []; if (certFiles.length > MAX_CERT_FILES) throw badInput("attach at most " + MAX_CERT_FILES + " certificate files");
  const files = [checkFile(b.resume, "Resume")].concat(certFiles.map((f, i) => checkFile(f, "Certificate " + (i + 1))));
  if (files.reduce((n, f) => n + f.buf.length, 0) > FILES_TOTAL_MAX) throw badInput("attachments together must be under 3 MB");
  return { app: a, files };
}
function applicationText(a) {
  const L = [];
  L.push("New application: " + a.position, "", "Name: " + a.name, "Email: " + a.email, "Phone: " + (a.phone || "-"), "Address: " + [a.address.line1, a.address.city, a.address.region, a.address.postal, a.address.country].filter(Boolean).join(", "), "Links: " + (a.links || "-"), "Education: " + (a.education || "-"), "Years of experience: " + (a.years || "-"), "Availability: " + (a.availability || "-"), "");
  L.push("WORK EXPERIENCE"); if (a.experience.length) a.experience.forEach((x) => L.push("- " + x.title + " at " + x.company + " (" + (x.from || "?") + " to " + (x.to || "present") + ")" + (x.summary ? "\n  " + x.summary.replace(/\n/g, "\n  ") : ""))); else L.push("- none listed");
  L.push("", "CERTIFICATIONS"); if (a.certifications.length) a.certifications.forEach((x) => L.push("- " + x.name + (x.issuer ? ", " + x.issuer : "") + (x.year ? " (" + x.year + ")" : ""))); else L.push("- none listed");
  L.push("", "TOOLS AND SKILL LEVEL"); if (a.tools.length) a.tools.forEach((x) => L.push("- " + x.name + ": " + x.level)); else L.push("- none listed");
  L.push("", "WHY SCHRITT", a.why);
  return L.join("\n");
}

function makeServer(deps) {
  deps = deps || {};
  const env = deps.env || process.env, fetchFn = deps.fetch || ((...a) => fetch(...a)), now = deps.now || (() => Date.now());
  let jwksCache = { keys: null, at: 0 };


  const redisUrl = () => env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL, redisToken = () => env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  /* ---------- outgoing mail (Resend) ---------- */
  const notifyTo = () => clean(env.NOTIFY_EMAIL, 254) || NOTIFY_DEFAULT;
  const mailOn = () => !!env.RESEND_API_KEY;
  async function sendMail(m) {
    const r = await fetchFn("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM || "Schritt <onboarding@resend.dev>", to: [notifyTo()], reply_to: m.replyTo || undefined, subject: clean(m.subject, 150).replace(/[\r\n]+/g, " "), text: m.text, attachments: (m.attachments || []).map((f) => ({ filename: f.filename, content: f.buf.toString("base64") })) }) });
    if (!r.ok) throw new Error("mail provider refused");
  }
  const hits = new Map();   // per-instance throttle; the provider's own limits are the real backstop
  function throttle(req, key, max, windowMs) {
    const ip = String((req.headers["x-forwarded-for"] || "").split(",")[0] || (req.socket && req.socket.remoteAddress) || "?").trim(), k = key + ":" + ip, t = now();
    const arr = (hits.get(k) || []).filter((x) => t - x < windowMs); if (arr.length >= max) throw fail(429, "too many requests, try again later"); arr.push(t); hits.set(k, arr);
    if (hits.size > 5000) hits.clear();
  }
  async function notifyNewUser(u, how) {
    if (!mailOn()) return;
    try {
      let fresh = true; try { fresh = (await redis(["SET", "seen:" + (u.sub || u.email), "1", "NX"])) === "OK"; } catch (e) { fresh = true; }
      if (fresh) await sendMail({ subject: "New Schritt registration: " + clean(u.name || u.email, 60), replyTo: EMAIL_RE.test(u.email || "") ? u.email : undefined, text: "A new user registered on Schritt (" + how + ").\n\nName: " + clean(u.name, 100) + "\nEmail: " + clean(u.email, 254) + "\nTime: " + new Date(now()).toISOString() });
    } catch (e) { /* never block sign-in on a mail failure */ }
  }

  /* ---------- sessions ---------- */
  function sign(body) { return b64url(crypto.createHmac("sha256", env.SESSION_SECRET || "").update(body).digest()); }
  function makeSession(user) { const body = b64url(JSON.stringify({ sub: user.sub, name: user.name, email: user.email, exp: now() + SESSION_DAYS * 86400000 })); return body + "." + sign(body); }
  function readSession(req) {
    if (!env.SESSION_SECRET) return null;
    const m = String(req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find((c) => c[0] === COOKIE);
    if (!m || !m[1]) return null;
    const [body, sig] = m[1].split("."); if (!body || !sig) return null;
    const a = fromB64url(sig), b = fromB64url(sign(body));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try { const p = JSON.parse(fromB64url(body).toString("utf8")); return p.exp > now() && p.sub ? p : null; } catch (e) { return null; }
  }
  function cookie(value, maxAgeS, secure) { return COOKIE + "=" + value + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + maxAgeS + (secure ? "; Secure" : ""); }
  const isSecure = (req) => /^https/.test(env.APP_URL || "") || req.headers["x-forwarded-proto"] === "https";

  /* ---------- http helpers ---------- */
  function send(res, code, obj, headers) {
    res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store");
    for (const k in (headers || {})) res.setHeader(k, headers[k]);
    res.end(JSON.stringify(obj));
  }
  function readRaw(req, limit) {
    if (typeof req.rawBody === "string") return Promise.resolve(req.rawBody);
    return new Promise((resolve, reject) => {
      const chunks = []; let n = 0;
      req.on("data", (c) => { n += c.length; if (n > limit) { reject(new Error("too large")); } else chunks.push(c); });
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8"))); req.on("error", reject);
    });
  }
  async function readJson(req, limit) {
    if (req.body && typeof req.body === "object") return req.body;
    const raw = typeof req.body === "string" ? req.body : await readRaw(req, limit || (MAX_STATE_BYTES + 4096));
    return raw ? JSON.parse(raw, (k, v) => (k === "__proto__" || k === "constructor" || k === "prototype") ? undefined : v) : {};
  }
  function sameOrigin(req) {
    if (req.headers["x-requested-with"] !== "schritt") return false;
    const o = req.headers.origin; if (!o) return true;
    try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
  }
  const appUrl = (req) => (env.APP_URL || ("https://" + req.headers.host)).replace(/\/$/, "");

  /* ---------- storage (Upstash REST) ---------- */
  async function redis(cmd) {
    if (!redisUrl() || !redisToken()) throw new Error("storage not configured");
    const r = await fetchFn(redisUrl(), { method: "POST", headers: { Authorization: "Bearer " + redisToken(), "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
    const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
  }
  const getJson = async (k) => { const v = await redis(["GET", k]); return v ? JSON.parse(v) : null; };
  const setJson = (k, o) => redis(["SET", k, JSON.stringify(o)]);

  /* ---------- Google ID token ---------- */
  async function googleKeys() {
    if (jwksCache.keys && now() - jwksCache.at < 3600000) return jwksCache.keys;
    const r = await fetchFn("https://www.googleapis.com/oauth2/v3/certs"); const j = await r.json();
    jwksCache = { keys: j.keys || [], at: now() }; return jwksCache.keys;
  }
  async function verifyGoogle(idToken) {
    const parts = String(idToken || "").split("."); if (parts.length !== 3) throw new Error("bad token");
    const header = JSON.parse(fromB64url(parts[0]).toString("utf8")), p = JSON.parse(fromB64url(parts[1]).toString("utf8"));
    if (header.alg !== "RS256") throw new Error("bad alg");
    const jwk = (await googleKeys()).find((k) => k.kid === header.kid); if (!jwk) throw new Error("unknown key");
    const ok = crypto.verify("RSA-SHA256", Buffer.from(parts[0] + "." + parts[1]), crypto.createPublicKey({ key: jwk, format: "jwk" }), fromB64url(parts[2]));
    if (!ok) throw new Error("bad signature");
    if (!env.GOOGLE_CLIENT_ID || p.aud !== env.GOOGLE_CLIENT_ID) throw new Error("wrong audience");
    if (p.iss !== "https://accounts.google.com" && p.iss !== "accounts.google.com") throw new Error("wrong issuer");
    if (!p.exp || p.exp * 1000 < now()) throw new Error("expired");
    if (!p.sub || p.email_verified !== true) throw new Error("email not verified");
    return { sub: String(p.sub), name: String(p.name || p.email || "Learner").slice(0, 60), email: String(p.email || "") };
  }

  /* ---------- Stripe ---------- */
  function form(obj, prefix, out) {
    out = out || []; for (const k in obj) { const key = prefix ? prefix + "[" + k + "]" : k, v = obj[k];
      if (v && typeof v === "object") form(v, key, out); else if (v !== undefined && v !== null) out.push(encodeURIComponent(key) + "=" + encodeURIComponent(v)); }
    return out;
  }
  async function stripe(path, params, method) {
    if (!env.STRIPE_SECRET_KEY) throw new Error("stripe not configured");
    const r = await fetchFn("https://api.stripe.com/v1/" + path, { method: method || "POST", headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" }, body: method === "GET" ? undefined : form(params || {}).join("&") });
    const j = await r.json(); if (!r.ok) throw new Error((j.error && j.error.message) || "stripe error"); return j;
  }
  function verifyStripeSignature(raw, header, secret, nowS) {
    if (!header || !secret) return false;
    const parts = {}; String(header).split(",").forEach((kv) => { const i = kv.indexOf("="); if (i > 0) (parts[kv.slice(0, i)] = parts[kv.slice(0, i)] || []).push(kv.slice(i + 1)); });
    const t = parts.t && parts.t[0], sigs = parts.v1 || []; if (!t || !sigs.length) return false;
    if (Math.abs((nowS || Math.floor(now() / 1000)) - Number(t)) > 300) return false;
    const expected = crypto.createHmac("sha256", secret).update(t + "." + raw).digest();
    return sigs.some((s) => { try { const b = Buffer.from(s, "hex"); return b.length === expected.length && crypto.timingSafeEqual(b, expected); } catch (e) { return false; } });
  }
  const periodEnd = (sub) => { const t = sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end); return t ? t * 1000 : 0; };
  const plusActive = (rec) => !!rec && rec.active && (!rec.until || rec.until > now());

  /* ---------- handlers ---------- */
  const guard = (fn) => async (req, res) => { try { await fn(req, res); } catch (e) { send(res, e && e.status ? e.status : 500, { error: e && e.expose ? e.message : "server error" }); } };
  const fail = (status, message) => { const e = new Error(message); e.status = status; e.expose = true; return e; };
  function need(req, methods, csrf) {
    if (methods.indexOf(req.method) < 0) throw fail(405, "method not allowed");
    if (req.method !== "GET" && csrf !== false && !sameOrigin(req)) throw fail(403, "bad origin");
  }
  function user(req) { const s = readSession(req); if (!s) throw fail(401, "not signed in"); return s; }

  const handlers = {
    apply: guard(async (req, res) => {
      need(req, ["POST"]); throttle(req, "apply", 5, 3600e3);
      if (!mailOn()) throw fail(503, "online applications are not switched on yet");
      const body = await readJson(req, 4.4 * 1024 * 1024), v = validateApplication(body);
      await sendMail({ subject: "Application: " + v.app.position + " - " + v.app.name, replyTo: v.app.email, text: applicationText(v.app), attachments: v.files });
      send(res, 200, { ok: true });
    }),
    register: guard(async (req, res) => {
      need(req, ["POST"]); throttle(req, "register", 10, 3600e3);
      if (!mailOn()) throw fail(503, "registration notices are not switched on yet");
      const b = await readJson(req); if (b.website) throw badInput("rejected");
      if (b.consent !== true) throw badInput("please tick the consent box");
      const u = { name: clean(b.name, 100), email: clean(b.email, 254) }; if (u.name.length < 1 || !EMAIL_RE.test(u.email)) throw badInput("enter a name and a valid email");
      await notifyNewUser(u, "profile created on the website");
      send(res, 200, { ok: true });
    }),
    config: guard(async (req, res) => {
      need(req, ["GET"]);
      send(res, 200, { apply: mailOn(), googleClientId: env.GOOGLE_CLIENT_ID || "", cloud: !!(env.SESSION_SECRET && env.GOOGLE_CLIENT_ID && redisUrl()), checkout: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_MONTHLY && env.STRIPE_PRICE_YEARLY) });
    }),
    authGoogle: guard(async (req, res) => {
      need(req, ["POST"]); if (!env.SESSION_SECRET) throw fail(503, "sign-in is not configured");
      const body = await readJson(req); let u;
      try { u = await verifyGoogle(body.credential); } catch (e) { throw fail(401, "Google sign-in could not be verified"); }
      const prev = await getJson("user:" + u.sub); await setJson("user:" + u.sub, { name: u.name, email: u.email, created: (prev && prev.created) || now() });
      await notifyNewUser(u, "signed in with Google");
      send(res, 200, { user: { name: u.name, email: u.email } }, { "Set-Cookie": cookie(makeSession(u), SESSION_DAYS * 86400, isSecure(req)) });
    }),
    authMe: guard(async (req, res) => { need(req, ["GET"]); const s = readSession(req); send(res, 200, { user: s ? { name: s.name, email: s.email } : null }); }),
    authLogout: guard(async (req, res) => { need(req, ["POST"]); send(res, 200, { ok: true }, { "Set-Cookie": cookie("", 0, isSecure(req)) }); }),
    sync: guard(async (req, res) => {
      need(req, ["GET", "PUT"]); const s = user(req);
      if (req.method === "GET") { const rec = await getJson("state:" + s.sub); return send(res, 200, rec ? { state: rec.state, updated: rec.updated } : { state: null, updated: 0 }); }
      const body = await readJson(req);
      if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) throw fail(400, "bad state");
      const text = JSON.stringify(body.state); if (Buffer.byteLength(text) > MAX_STATE_BYTES) throw fail(413, "state too large");
      const rec = { state: body.state, updated: now() }; await setJson("state:" + s.sub, rec); send(res, 200, { updated: rec.updated });
    }),
    plus: guard(async (req, res) => {
      need(req, ["GET"]); const s = user(req); const rec = await getJson("plus:" + s.sub);
      send(res, 200, plusActive(rec) ? { active: true, plan: rec.plan, until: rec.until } : { active: false });
    }),
    stripeCheckout: guard(async (req, res) => {
      need(req, ["POST"]); const s = user(req); const body = await readJson(req);
      const price = body.plan === "yearly" ? env.STRIPE_PRICE_YEARLY : body.plan === "monthly" ? env.STRIPE_PRICE_MONTHLY : null;
      if (!price) throw fail(400, "unknown plan");
      const rec = await getJson("plus:" + s.sub);
      const params = { mode: "subscription", "line_items": [{ price, quantity: 1 }], client_reference_id: s.sub, allow_promotion_codes: "true", metadata: { plan: body.plan },
        success_url: appUrl(req) + "/index.html?plus=success&plan=" + body.plan, cancel_url: appUrl(req) + "/index.html#plus" };
      if (rec && rec.customer) params.customer = rec.customer; else if (s.email) params.customer_email = s.email;
      const session = await stripe("checkout/sessions", params); send(res, 200, { url: session.url });
    }),
    stripePortal: guard(async (req, res) => {
      need(req, ["POST"]); const s = user(req); const rec = await getJson("plus:" + s.sub);
      if (!rec || !rec.customer) throw fail(404, "no subscription found");
      const p = await stripe("billing_portal/sessions", { customer: rec.customer, return_url: appUrl(req) + "/index.html#plus" }); send(res, 200, { url: p.url });
    }),
    stripeWebhook: guard(async (req, res) => {
      need(req, ["POST"], false);
      const raw = await readRaw(req, 1e6);
      if (!verifyStripeSignature(raw, req.headers["stripe-signature"], env.STRIPE_WEBHOOK_SECRET)) throw fail(400, "bad signature");
      const ev = JSON.parse(raw), o = (ev.data && ev.data.object) || {};
      if (ev.type === "checkout.session.completed" && o.mode === "subscription" && o.client_reference_id) {
        const sub = o.subscription ? await stripe("subscriptions/" + encodeURIComponent(o.subscription), null, "GET") : {};
        await setJson("plus:" + o.client_reference_id, { active: true, plan: (o.metadata && o.metadata.plan) || "plus", customer: o.customer || "", subscription: o.subscription || "", until: periodEnd(sub), updated: now() });
        if (o.customer) await redis(["SET", "cust:" + o.customer, o.client_reference_id]);
      } else if (ev.type === "customer.subscription.updated" || ev.type === "customer.subscription.deleted") {
        const sub = await redis(["GET", "cust:" + o.customer]); const rec = sub && await getJson("plus:" + sub);
        if (rec) { const ok = ev.type !== "customer.subscription.deleted" && ["active", "trialing", "past_due"].indexOf(o.status) >= 0; rec.active = ok; rec.until = ok ? periodEnd(o) : 0; rec.updated = now(); await setJson("plus:" + sub, rec); }
      }
      send(res, 200, { received: true });
    })
  };
  return { handlers, internals: { makeSession, readSession, verifyGoogle, verifyStripeSignature, form, validateApplication, applicationText } };
}

module.exports = makeServer();
module.exports.makeServer = makeServer;

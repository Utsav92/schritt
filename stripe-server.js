/* Optional payment-verification server for Schritt Plus. Node 18+, no dependencies.

   It does two things:
     POST /webhook   Stripe calls this. The signature is checked with your webhook signing secret, then the
                     subscription state is stored against the client_reference_id the app put on the Payment Link.
     GET  /verify    The app asks "is this device's reference id an active subscriber?" and gets {active, plan, until}.

   Run:
     STRIPE_WEBHOOK_SECRET=whsec_xxx ALLOW_ORIGIN=https://your-domain node stripe-server.js
   Then in Stripe Dashboard > Developers > Webhooks add  https://your-server/webhook  for the events
     checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
   and set verifyUrl in config.js to  https://your-server/verify

   No Stripe secret API key is needed; only the webhook signing secret. Keep it in the environment, never in a file
   you publish. This is a small reference server: put it behind HTTPS and back up plus-store.json. */
"use strict";
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const STORE = process.env.PLUS_STORE || path.join(__dirname, "plus-store.json");
const TOLERANCE_S = 300;

function loadStore() { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch (e) { return { byRef: {}, byCustomer: {} }; } }
function saveStore(s) { fs.writeFileSync(STORE, JSON.stringify(s, null, 1)); }

/* Stripe-Signature: t=timestamp,v1=hex(hmac_sha256(secret, `${t}.${rawBody}`)) */
function verifySignature(raw, header, secret, nowS) {
  if (!header || !secret) return false;
  const parts = {}; String(header).split(",").forEach((kv) => { const i = kv.indexOf("="); if (i > 0) (parts[kv.slice(0, i)] = parts[kv.slice(0, i)] || []).push(kv.slice(i + 1)); });
  const t = parts.t && parts.t[0], sigs = parts.v1 || [];
  if (!t || !sigs.length) return false;
  if (Math.abs((nowS || Math.floor(Date.now() / 1000)) - Number(t)) > TOLERANCE_S) return false;
  const expected = crypto.createHmac("sha256", secret).update(t + "." + raw).digest();
  return sigs.some((s) => { try { const b = Buffer.from(s, "hex"); return b.length === expected.length && crypto.timingSafeEqual(b, expected); } catch (e) { return false; } });
}

function periodEnd(sub) {
  const t = sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end);
  return t ? t * 1000 : 0;
}

function applyEvent(store, ev) {
  const o = ev.data && ev.data.object ? ev.data.object : {};
  if (ev.type === "checkout.session.completed") {
    const ref = o.client_reference_id; if (!ref || o.mode !== "subscription") return false;
    const rec = { active: true, plan: (o.metadata && o.metadata.plan) || "plus", customer: o.customer || "", subscription: o.subscription || "", until: 0, updated: Date.now() };
    store.byRef[ref] = rec; if (o.customer) store.byCustomer[o.customer] = ref; return true;
  }
  if (ev.type === "customer.subscription.updated" || ev.type === "customer.subscription.deleted") {
    const ref = store.byCustomer[o.customer]; if (!ref || !store.byRef[ref]) return false;
    const rec = store.byRef[ref];
    const ok = ev.type !== "customer.subscription.deleted" && ["active", "trialing", "past_due"].includes(o.status);
    rec.active = ok; rec.until = ok ? periodEnd(o) : 0; rec.updated = Date.now(); return true;
  }
  return false;
}

function createServer(secret, allowOrigin) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const cors = { "Access-Control-Allow-Origin": allowOrigin || "*", "Access-Control-Allow-Headers": "content-type", "Cache-Control": "no-store" };
    if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
    if (req.method === "GET" && url.pathname === "/verify") {
      const ref = url.searchParams.get("ref") || "", rec = loadStore().byRef[ref];
      const active = !!rec && rec.active && (!rec.until || rec.until > Date.now());
      res.writeHead(200, Object.assign({ "Content-Type": "application/json" }, cors));
      return res.end(JSON.stringify(active ? { active: true, plan: rec.plan, until: rec.until } : { active: false }));
    }
    if (req.method === "POST" && url.pathname === "/webhook") {
      const chunks = []; let size = 0;
      req.on("data", (c) => { size += c.length; if (size > 1e6) req.destroy(); else chunks.push(c); });
      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        if (!verifySignature(raw, req.headers["stripe-signature"], secret)) { res.writeHead(400, cors); return res.end("bad signature"); }
        let ev; try { ev = JSON.parse(raw); } catch (e) { res.writeHead(400, cors); return res.end("bad json"); }
        const store = loadStore(); if (applyEvent(store, ev)) saveStore(store);
        res.writeHead(200, cors); res.end("ok");
      });
      return;
    }
    res.writeHead(404, cors); res.end("not found");
  });
}

module.exports = { verifySignature, applyEvent, createServer };

if (require.main === module) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) { console.error("Set STRIPE_WEBHOOK_SECRET (the whsec_... signing secret of your webhook endpoint)."); process.exit(1); }
  const port = Number(process.env.PORT || 8890);
  createServer(secret, process.env.ALLOW_ORIGIN).listen(port, () => console.log("Plus verification server on port " + port));
}

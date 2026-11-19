# Going live: Google sign-in and email notices

> The premium plan was removed: every lesson and feature is free, so **Stripe is no longer needed** and section 3 can be skipped.

The code for all three is finished and tested with mocked services. What is missing are **accounts and keys that only you
can create**. Each step below is a few minutes. Secret values (anything marked SECRET) must be typed by you in your own
terminal; do not paste them into a chat. Values marked PUBLIC are safe to share.

Already set on Vercel (production): `SESSION_SECRET` (random, generated), `APP_URL`, `NOTIFY_EMAIL=pandyautsav@gmail.com`.

Run commands from this folder. In Claude Code, prefix with `!` so they run in your session, for example `! vercel env add ...`.

## 1. Google sign-in  (needed: GOOGLE_CLIENT_ID, PUBLIC)

1. Open https://console.cloud.google.com, create or choose a project.
2. APIs and Services > OAuth consent screen: External, app name Schritt, your email, save.
3. Credentials > Create credentials > OAuth client ID > **Web application**.
4. Authorized JavaScript origins: `https://schritt-rosy.vercel.app` (and `http://localhost:8880` to test locally).
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`). This is PUBLIC.
6. `vercel env add GOOGLE_CLIENT_ID production` and paste it.

## 2. Storage for accounts and subscriptions  (Upstash Redis)

Vercel dashboard > your project > Storage > Create > **Upstash Redis** (free tier is fine) > connect to the project.
It adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically. (Accepting Upstash's terms needs your click.)

## 3. Stripe  (real payments)

1. Stripe dashboard > Product catalog > create product **Schritt Plus** with two recurring prices:
   monthly (for example 6.99) and yearly (for example 59.99). Copy each **price id** (`price_...`, PUBLIC).
2. Developers > API keys > copy the **Secret key** (`sk_live_...`, SECRET). Start with test mode (`sk_test_...`) first.
3. Settings > Billing > **Customer portal**: switch it on (lets people cancel from the Plus page).
4. Developers > Webhooks > Add endpoint: `https://schritt-rosy.vercel.app/api/stripe/webhook`, events
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Copy the **Signing secret** (`whsec_...`, SECRET).
5. Add them (you type the secrets):
   ```
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   vercel env add STRIPE_PRICE_MONTHLY production
   vercel env add STRIPE_PRICE_YEARLY production
   ```
6. Test with Stripe's test card 4242 4242 4242 4242 before switching to live keys.

## 4. Email for registrations and job applications  (Resend)

1. Sign up at https://resend.com **with pandyautsav@gmail.com** (the free plan can only send to the account owner's own address,
   which is exactly what we need).
2. API Keys > create a key (`re_...`, SECRET): `vercel env add RESEND_API_KEY production`.

## 5. Publish

```
vercel deploy --prod --yes
```

Then open the site: the Google button and Plus checkout switch on by themselves, because `/api/config` reports what is configured.
Check status any time at https://schritt-rosy.vercel.app/api/config

| Result | Meaning |
|---|---|
| `googleClientId` set, `cloud: true` | Google sign-in and cloud sync work |
| `checkout: true` | Plus uses real Stripe Checkout |
| `apply: true` | Applications and registrations are emailed to you |

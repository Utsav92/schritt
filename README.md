# Schritt

A language-learning web app (installable PWA) with 17 languages for English speakers, six CEFR levels (A1 to C2) and 180 lessons per language.

Languages: German, Spanish, Spanish (Mexico), French, Italian, Portuguese, Dutch, Swedish, Turkish, Vietnamese, Korean, Chinese, Japanese, Thai, Hindi, Urdu, Arabic. Add more from Profile > Add a language.

## Run it
- Double-click `start.bat` (needs Python). It serves the app at http://localhost:8880/index.html with caching switched off so updates show immediately.
- In Edge or Chrome, use the install icon in the address bar to add it as an app. It then works offline.
- Tests: `node test_engine.js` (lesson engine and content) and `node test_stripe_server.js` (payment verification server).

## Use it on your phone
Installing and offline use on a phone need HTTPS, so host the folder on any static host (GitHub Pages, Netlify, Vercel). It is plain static files with no build step. Progress is stored on each device; use Profile > Export backup to move it.

## Levels and plans
- 6 levels (A1, A2, B1, B2, C1, C2) x 6 sections x 5 lessons = 180 lessons. Each section teaches 10 words or phrases and 5 sentences, so a level is a focused slice (about 90 items), not the whole CEFR syllabus.
- **Basic (free):** levels A1 to B1 (90 lessons), 5 hearts that refill every 25 minutes, daily goal, streak, daily quests, gems and the shop, practice, word list, offline use.
- **Plus:** levels B2, C1 and C2 (90 more lessons), unlimited hearts, mistakes review, 2x gems, hold 2 streak freezes plus 1 free each week, a gold ring on your avatar.
- Which levels are free is set by `freeLevels` in `config.js`.

## Connecting Stripe (Plus payments)
The app never touches card details. Plus is sold through Stripe-hosted Payment Links.
1. In Stripe, create a product with a monthly and a yearly recurring price, then one Payment Link for each.
2. On each link set "After payment" to redirect to `https://YOUR-DOMAIN/index.html?plus=success&plan=monthly` (or `plan=yearly`). Optionally add metadata `plan`.
3. Paste both links, and the prices you charge, into `config.js`. Until you do, the buttons say "Not connected".
4. Recommended: run `stripe-server.js` so Plus turns on only after Stripe confirms payment. It needs only the webhook signing secret:
   `STRIPE_WEBHOOK_SECRET=whsec_xxx ALLOW_ORIGIN=https://YOUR-DOMAIN node stripe-server.js`
   Add `https://YOUR-SERVER/webhook` in Stripe > Developers > Webhooks for `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`, then set `verifyUrl` in `config.js` to `https://YOUR-SERVER/verify`.
   Without `verifyUrl` the app trusts the redirect URL, which anyone can type, so treat that as honour-system only.
5. Optional: set `portalLink` to your Stripe customer portal link so subscribers can manage or cancel.

The "7-day free trial" is local to the device and asks for no card. Plus state is saved in the browser, so a determined user could edit it; the server check protects against casual misuse, not against that.

## Accounts
Profiles live on the device (Profile > Create a profile, Log in, Log out). Each has its own progress, gems and Plus. There are no passwords and no cloud sync, so anyone using the browser can open them. Real accounts with sync would need a backend.

## What it does
- Exercises: pick the meaning, listen and choose, match pairs, build the sentence from tiles, type the translation, listen and build. Languages that are hard to type (Chinese, Japanese, Thai, Hindi, Urdu, Arabic) use choosing and tile building instead of typing. A pronunciation guide (romanization) can be shown for those and for Korean.
- Hearts, XP, daily goal, streak, streak freezes, gems, a shop, daily quests, avatars and reaction art.
- Spaced review: each item has a strength 0 to 5 and a review date. Practice picks weak and due items.
- Spoken audio uses the voices installed on the device, so quality varies and some devices have no voice for a language.

## Files
`data.js`, `units_adv.js`, `units_more.js` lesson outline; `packs_more.js`, `adv1.js` to `adv6.js` translations; `engine.js` lesson logic; `app.js` interface; `config.js` plans and Stripe links; `stripe-server.js` optional payment verification; `style.css`; `sw.js` offline cache; `art/` images; `serve.py` dev server.

## Adding a language
Profile > Add a language > Copy blank template. Each entry shows the English meaning in brackets; replace it with the translation. Word and sentence entries stay in the same order. `tts` is the language code used for speech (for example `nl-NL`). For languages written without spaces add `"nospace": true` and put `|` between words in the sentences. Higher levels are optional in imported packs.

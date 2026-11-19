# Publishing Schritt to the App Store and Google Play

**Status:** the logo, every icon size, the screenshots, the feature graphic and the mobile project are ready. **Nothing has been submitted**,
because both stores need things only you can provide: a developer account in your name (identity and payment), signing keys, and for
iOS a Mac with Xcode. This guide is the exact path from here.

## What is already prepared

| Item | Where |
|---|---|
| Logo (SVG) and mark without background | `public/icon.svg`, `store/logo-mark.svg` |
| Web / PWA icons, favicons, Apple touch icon, maskable icon | `public/icon-*.png`, `apple-touch-icon.png`, `favicon-*.png` |
| App Store icon 1024x1024 (square, no transparency) | `store/ios-app-store-1024.png` |
| Play Store icon 512x512 and feature graphic 1024x500 | `store/play-store-icon-512.png`, `store/play-feature-graphic-1024x500.png` |
| Screenshots: iPhone 6.7" (1290x2796), Android phone (1080x1920) | `store/ios/*.png`, `store/android/*.png` |
| Native wrapper project (Capacitor) with icon and splash sources | `mobile/` |

Regenerate the art any time: `cd demo && node make_icons.js && node store_shots.js https://schritt-rosy.vercel.app/`.

## Before you submit (both stores)

1. **Fill in the legal details.** The Privacy and Terms pages still show placeholders until you set `legal.operator` and `legal.contact` in
   `public/config.js`. Both stores require a working privacy-policy URL and a contact email. Your policy URL is
   `https://schritt-rosy.vercel.app/#privacy` (terms: `#terms`) and support is the Help page email.
2. **Choose the app id.** `mobile/capacitor.config.json` uses `app.schritt.learn`. It must be unique and cannot be changed after release.
   Use a reverse-domain you control, for example `com.yourname.schritt`.
3. **Age rating / content:** educational, no user-generated content shared between users, no purchases, no ads. Expect 4+ (Apple) / Everyone (Google).
4. **Data you collect** (for the store privacy forms): name and email only if the user creates a profile or signs in with Google (sent to you
   by email); job-application details if someone applies. Lessons and progress stay on the device. No analytics, no ads, no tracking.

## Google Play (works from Windows)

1. Create a Google Play Console account at https://play.google.com/console (one-time $25; identity verification). New personal accounts must run a
   **closed test with 12 testers for 14 days** before production access.
2. Install on this PC: Android Studio (includes the SDK) and JDK 17+ (JDK 21 is already installed).
3. Build the project:
   ```
   cd mobile
   npm install
   npm run prepare-web
   npx cap add android
   npm run assets          # builds adaptive icons and splash from mobile/resources
   npx cap sync
   npx cap open android    # opens Android Studio
   ```
4. In Android Studio: Build > Generate Signed App Bundle (AAB). Create a keystore and **back it up** (losing it means you cannot update the app).
   Enable Play App Signing when asked.
5. Play Console > Create app > upload the AAB to an internal/closed test, then fill: store listing (use the text below), `store/play-store-icon-512.png`,
   `store/play-feature-graphic-1024x500.png`, `store/android/*.png`, Data safety, Content rating, target audience.
6. Roll out to production after the closed-test period.

## Apple App Store (requires a Mac)

1. Join the Apple Developer Program at https://developer.apple.com/programs (US$99/year, identity verification).
2. On a Mac with Xcode: copy this repo, then
   ```
   cd mobile && npm install && npm run prepare-web && npx cap add ios && npm run assets && npx cap sync && npx cap open ios
   ```
3. In Xcode: set your Team, confirm the bundle id, then Product > Archive > Distribute App > App Store Connect.
   (No Mac? Use a cloud build service such as Codemagic or GitHub Actions macOS runners; you still need your Apple account and certificates.)
4. App Store Connect: create the app, upload `store/ios-app-store-1024.png` is already inside the build, add `store/ios/*.png` as 6.7" screenshots
   (and 6.5"/5.5" if asked), fill privacy "nutrition labels", age rating, support URL, privacy URL, review notes.
5. Submit for review.

**Apple review risk (Guideline 4.2, minimum functionality):** Apple rejects apps that are only a website in a frame. This one bundles all lessons
for offline use, has spoken audio, a full touch interface and needs no internet to learn, which is the strongest case a wrapper can make.
To improve the odds, add one or two native features (local daily-reminder notifications, native share sheet) before submitting.

## Limits of the first native build

- Lessons, math, music, progress, streaks and gems all work offline inside the app.
- **Cloud features need extra work for the native shell:** Google sign-in, cloud sync, the online job-application form and registration emails call
  `/api/...` on the website, which a bundled app cannot reach with relative URLs (and the server blocks other origins). Until an API base URL and a
  server-side allow-list for the app's origin are added, those features are web-only; the app shows its offline fallbacks.
- The Music Studio (SonicStudioAI) needs a server on the user's own computer, so it will not work on phones.
- Translations have not been reviewed by native speakers; say so in the store description.

## Store listing text (edit freely)

**Name:** Schritt: Languages, Music, Math  
**Subtitle / short description (80 chars):** Learn 17 languages, music and math. Free for everyone.  
**Full description:**
Schritt turns learning into small daily steps. Pick a language, an instrument-friendly music course or a math grade and play your way up.

- 17 languages from A1 to C2: German, Spanish, French, Italian, Portuguese, Dutch, Swedish, Turkish, Vietnamese, Korean, Chinese, Japanese, Thai, Hindi, Urdu, Arabic and more
- Math from grade 1 to grade 12 with pictures, number lines, shapes and graphs
- Music from first notes to chords: read the staff, hear the sound, name the note
- Lessons that mix listening, matching, building sentences and typing
- Friendly coach characters, streaks, gems and daily quests
- Works offline. No ads. No paywall. Your progress stays on your device

**Keywords (Apple, 100 chars):** language,learn,german,spanish,french,math,music,lessons,study,vocabulary,notes,grammar,kids,school  
**Category:** Education  
**Support URL:** https://schritt-rosy.vercel.app/  **Privacy URL:** your site's Privacy page (set the contact first)

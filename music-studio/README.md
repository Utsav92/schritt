# Music Studio (SonicStudioAI) setup

The **Studio** tab (Music section) is a front end for your own SonicStudioAI backend
(https://github.com/Utsav92/SonicStudioAI, ACE-Step 1.5 Turbo). The model needs a GPU-class Apple Silicon Mac, so it
cannot run inside the browser or on Vercel. The website only sends your prompt to the backend you run.

## 1. Allow the website to call the backend

SonicStudioAI has no CORS support, so a browser page cannot call it. `cors.patch` adds an opt-in setting:

```bash
cd SonicStudioAI
git apply --recount /path/to/schritt/music-studio/cors.patch
```

Nothing changes unless you set `SONIC_CORS_ORIGINS`. Only the origins you list are allowed, cookies are not shared, and
the bearer token travels in a header. (This patch is not pushed to your repo. Review it and commit it yourself.)

## 2. Start the backend

```bash
SONIC_API_TOKEN=choose-a-long-random-secret \
SONIC_CORS_ORIGINS=https://schritt-rosy.vercel.app \
scripts/start_backend.sh          # add --mock to try the screen with demo tones
```

## 3. Connect

Open Schritt > Music > Studio, enter `http://127.0.0.1:8765` and the token, press **Connect**.

- Use Chrome, Edge or Firefox on the same computer. Safari blocks an https page from reaching http localhost.
- The token stays in that browser tab (sessionStorage) and is never sent to Schritt's servers.
- Plain `http` addresses are accepted only for this computer. For another machine, put the backend behind https.
- Prompt and lyrics can be in any language; set **Vocal language** for sung words. The model follows English style
  descriptions best, and results vary by language.

## What was verified

Tested against the backend's **mock engine** on Windows: preflight, wrong-token error, connect, job polling, playback and
the song list all work. The real ACE-Step model was **not** run here (it needs your Mac and the downloaded weights), so
audio quality and generation time are untested. "Write lyrics for me" needs `SONIC_LYRICS_PROVIDER` set on the backend.

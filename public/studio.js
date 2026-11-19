/* Music Studio: a prompt-to-music screen that talks to a SonicStudioAI backend (ACE-Step 1.5 Turbo) that you run yourself.
   The model cannot run inside a web page or on Vercel; this screen is the front end. See music-studio/README.md for setup.
   Describe the music in any language; set "Vocal language" for sung lyrics. The token stays in this tab (sessionStorage). */
(function (root) {
  "use strict";
  var URL_KEY = "schritt.studio.url";
  var LANGS = [["unknown", "Auto-detect"], ["en", "English"], ["zh", "Chinese"], ["ja", "Japanese"], ["ko", "Korean"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"], ["pt", "Portuguese"], ["ru", "Russian"], ["ar", "Arabic"], ["hi", "Hindi"], ["tr", "Turkish"], ["nl", "Dutch"], ["sv", "Swedish"], ["th", "Thai"], ["vi", "Vietnamese"], ["ur", "Urdu"]];
  var st = { url: "", token: "", connected: false, mock: false, busy: false, job: null, songs: [], play: null, msg: "", err: "" };
  try { st.url = localStorage.getItem(URL_KEY) || ""; st.token = sessionStorage.getItem("schritt.studio.token") || ""; } catch (e) { /* storage blocked */ }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* only a local backend over http, or any https backend; never a bearer token over plain http to another machine */
  function cleanUrl(u) {
    try { var x = new URL(String(u).trim()); var local = x.hostname === "127.0.0.1" || x.hostname === "localhost" || x.hostname === "[::1]";
      if (x.protocol === "https:" || (x.protocol === "http:" && local)) return x.origin; } catch (e) { /* invalid */ }
    return "";
  }
  function api(path, opts) {
    opts = opts || {}; opts.headers = Object.assign({}, opts.headers || {}); opts.cache = "no-store";
    if (st.token) opts.headers.Authorization = "Bearer " + st.token;
    if (opts.body && typeof opts.body !== "string") { opts.body = JSON.stringify(opts.body); opts.headers["Content-Type"] = "application/json"; }
    return fetch(st.url + path, opts);
  }
  var errText = function (r, j) { return (j && (j.detail && (typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail)) || j.error)) || ("Server answered " + r.status); };

  function connect(view, h) {
    var u = cleanUrl(view.querySelector("#stUrl").value), tok = view.querySelector("#stTok").value.trim();
    if (!u) { st.err = "Enter the studio address, like http://127.0.0.1:8765 (http works only for this computer)."; return draw(view, h); }
    st.url = u; st.token = tok; st.err = ""; st.msg = "Connecting..."; st.busy = true; draw(view, h);
    try { localStorage.setItem(URL_KEY, u); sessionStorage.setItem("schritt.studio.token", tok); } catch (e) { /* blocked */ }
    fetch(u + "/health", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("health"); return api("/v1/capabilities"); }).then(function (r) {
      if (r.status === 401) throw new Error("The studio says the token is missing or wrong. Start it with SONIC_API_TOKEN and paste the same value here.");
      if (!r.ok) throw new Error("The studio answered " + r.status + ".");
      return r.json();
    }).then(function (caps) { st.connected = true; st.msg = ""; st.busy = false; return loadSongs(view, h); })
      .catch(function (e) { st.connected = false; st.busy = false; st.msg = ""; st.err = e && e.message && e.message !== "health" && e.message !== "Failed to fetch" ? e.message : "Could not reach the studio at " + u + ". Is it running, and was it started with SONIC_CORS_ORIGINS for this website? (See the setup steps below.)"; draw(view, h); });
  }
  function loadSongs(view, h) {
    return api("/v1/songs").then(function (r) { return r.ok ? r.json() : []; }).then(function (j) { st.songs = (Array.isArray(j) ? j : j.songs || []).filter(function (x) { return x.status === "completed"; }).slice(0, 12); draw(view, h); }).catch(function () { draw(view, h); });
  }
  function playSong(view, h, song) {
    st.msg = "Loading audio..."; draw(view, h);
    api("/v1/songs/" + encodeURIComponent(song.id) + "/audio").then(function (r) { if (!r.ok) throw new Error("audio"); return r.blob(); }).then(function (b) {
      if (st.play && st.play.url) URL.revokeObjectURL(st.play.url);
      st.play = { url: URL.createObjectURL(b), title: song.title, mock: song.is_mock, id: song.id }; st.msg = ""; draw(view, h);
    }).catch(function () { st.msg = ""; st.err = "Could not load that song's audio."; draw(view, h); });
  }
  function generate(view, h) {
    var q = function (s) { return view.querySelector(s); }, prompt = q("#stPrompt").value.trim();
    if (!prompt) { st.err = "Describe the music first."; return draw(view, h); }
    var lyrics = q("#stLyrics").value.trim(), req = { prompt: prompt.slice(0, 400), instrumental: q("#stInst").checked || !lyrics && q("#stInst").checked, lyrics: lyrics.slice(0, 4000), duration: +q("#stDur").value || 30, vocal_language: q("#stLang").value };
    if (q("#stTitle").value.trim()) req.title = q("#stTitle").value.trim().slice(0, 120);
    if (+q("#stBpm").value) req.bpm = Math.max(30, Math.min(300, +q("#stBpm").value));
    if (q("#stKey").value.trim()) req.key = q("#stKey").value.trim().slice(0, 20);
    st.err = ""; st.busy = true; st.job = { status: "queued", progress: 0, stage: "Sending request" }; draw(view, h);
    api("/v1/jobs", { method: "POST", body: req }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(errText(r, j)); return j; }); }).then(function (job) { poll(view, h, job.id); })
      .catch(function (e) { st.busy = false; st.job = null; st.err = e.message || "Could not start the job."; draw(view, h); });
  }
  function poll(view, h, id) {
    api("/v1/jobs/" + encodeURIComponent(id)).then(function (r) { return r.json(); }).then(function (j) {
      st.job = j;
      if (j.status === "completed") { st.busy = false; var sid = (j.song_ids || [])[0]; return loadSongs(view, h).then(function () { var s = st.songs.filter(function (x) { return x.id === sid; })[0]; if (s) playSong(view, h, s); else draw(view, h); }); }
      if (j.status === "failed" || j.status === "cancelled") { st.busy = false; st.err = j.error || "The job " + j.status + "."; st.job = null; return draw(view, h); }
      draw(view, h); setTimeout(function () { if (document.getElementById("stRoot") && st.busy) poll(view, h, id); }, 2000);
    }).catch(function () { st.busy = false; st.err = "Lost the connection to the studio."; draw(view, h); });
  }
  function lyricsFor(view, h) {
    var prompt = view.querySelector("#stPrompt").value.trim(); if (!prompt) { st.err = "Describe the music first, then I can draft lyrics from it."; return draw(view, h); }
    var lang = LANGS.filter(function (x) { return x[0] === view.querySelector("#stLang").value; })[0]; st.msg = "Writing lyrics..."; draw(view, h);
    api("/v1/lyrics", { method: "POST", body: { topic: prompt.slice(0, 300), language: lang && lang[0] !== "unknown" ? lang[1] : "English" } }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(errText(r, j)); return j; }); })
      .then(function (j) { st.msg = ""; draw(view, h); view.querySelector("#stLyrics").value = j.lyrics || ""; })
      .catch(function (e) { st.msg = ""; st.err = "Lyrics helper: " + (e.message || "not available") + " (it needs SONIC_LYRICS_PROVIDER set on the studio)."; draw(view, h); });
  }

  var keep = {};
  function draw(view, h) {
    ["#stPrompt", "#stLyrics", "#stTitle", "#stBpm", "#stKey", "#stUrl", "#stTok"].forEach(function (id) { var el = view.querySelector(id); if (el) keep[id] = el.value; });
    var kd = view.querySelector("#stDur") ? view.querySelector("#stDur").value : "30", kl = view.querySelector("#stLang") ? view.querySelector("#stLang").value : "unknown", ki = view.querySelector("#stInst") ? view.querySelector("#stInst").checked : false;
    var defUrl = (h.CFG && h.CFG.studio && h.CFG.studio.url) || "http://127.0.0.1:8765", job = st.job;
    var html = '<div class="stack" id="stRoot"><div class="page-head"><h1>Music Studio</h1>' + h.em("love", "", 56) + '</div>' +
      '<p class="muted" style="margin:0">Type what you want to hear in any language and an AI model writes the music. It runs on your own computer through SonicStudioAI.</p>' +
      '<div class="card stack"><h2>1. Connect</h2><label class="stack" style="gap:6px"><span>Studio address</span><input type="text" id="stUrl" value="' + esc(keep["#stUrl"] != null ? keep["#stUrl"] : (st.url || defUrl)) + '" autocomplete="off" spellcheck="false"></label>' +
      '<label class="stack" style="gap:6px"><span>Access token (SONIC_API_TOKEN)</span><input type="password" id="stTok" value="' + esc(keep["#stTok"] != null ? keep["#stTok"] : st.token) + '" autocomplete="off" spellcheck="false"></label>' +
      '<button class="btn" id="stConnect"' + (st.busy ? " disabled" : "") + ">" + (st.connected ? "Reconnect" : "Connect") + '</button>' +
      '<p class="st-status ' + (st.connected ? "ok" : "") + '">' + (st.connected ? "Connected to " + esc(st.url) : esc(st.msg || "Not connected")) + "</p>" + (st.err ? '<p class="st-err" role="alert">' + esc(st.err) + "</p>" : "") +
      '<details class="st-help"><summary>How to start the studio</summary><ol><li>On your Mac, install SonicStudioAI (see its README: <code>scripts/install.sh</code>, then <code>scripts/download_models.sh</code>).</li>' +
      '<li>Start it with this website allowed: <code>SONIC_API_TOKEN=choose-a-long-secret SONIC_CORS_ORIGINS=' + esc(location.origin) + ' scripts/start_backend.sh</code>. Add <code>--mock</code> to try the screen with demo tones instead of the real model.</li>' +
      '<li>Paste the same token above and press Connect. Use Chrome, Edge or Firefox on that computer. The model runs on that Mac, not in the browser or on the website\'s server.</li></ol><p class="muted">The CORS option comes from a small patch to the backend, in <code>music-studio/</code> of the Schritt repo.</p></details></div>';
    html += '<div class="card stack st-create' + (st.connected ? "" : " st-off") + '"><h2>2. Describe your music</h2>' +
      '<label class="stack" style="gap:6px"><span>What should it sound like? (any language, up to 400 characters)</span><textarea id="stPrompt" maxlength="400" rows="3" placeholder="calm piano at night &middot; música alegre para bailar &middot; 雨の日のジャズ &middot; موسيقى هادئة للدراسة" dir="auto">' + esc(keep["#stPrompt"] || "") + '</textarea></label>' +
      '<div class="st-row"><label class="stack" style="gap:6px"><span>Vocal language</span><select id="stLang">' + LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (kl === l[0] ? " selected" : "") + ">" + l[1] + "</option>"; }).join("") + '</select></label>' +
      '<label class="stack" style="gap:6px"><span>Length: <b id="stDurV">' + esc(kd) + '</b> s</span><input type="range" id="stDur" min="10" max="120" step="5" value="' + esc(kd) + '"></label></div>' +
      '<label class="toggle"><span>Instrumental (no singing)</span><input type="checkbox" id="stInst"' + (ki ? " checked" : "") + "></label>" +
      '<label class="stack" style="gap:6px"><span>Lyrics (optional, any language)</span><textarea id="stLyrics" maxlength="4000" rows="4" dir="auto" placeholder="[verse] ...">' + esc(keep["#stLyrics"] || "") + '</textarea></label>' +
      '<div class="st-row"><label class="stack" style="gap:6px"><span>Title (optional)</span><input type="text" id="stTitle" maxlength="120" value="' + esc(keep["#stTitle"] || "") + '"></label><label class="stack" style="gap:6px"><span>BPM (optional)</span><input type="number" id="stBpm" min="30" max="300" value="' + esc(keep["#stBpm"] || "") + '"></label><label class="stack" style="gap:6px"><span>Key (optional)</span><input type="text" id="stKey" maxlength="20" placeholder="A minor" value="' + esc(keep["#stKey"] || "") + '"></label></div>' +
      '<div class="row"><button class="btn" id="stGen"' + (st.busy || !st.connected ? " disabled" : "") + '>Create music</button><button class="btn secondary" id="stLyr"' + (st.busy || !st.connected ? " disabled" : "") + ">Write lyrics for me</button></div>" +
      (job ? '<div class="st-job" aria-live="polite"><b>' + esc(job.stage || job.status) + "</b>" + (job.queue_ahead ? " &middot; " + job.queue_ahead + " ahead of you" : "") + '<span class="lc-bar" aria-hidden="true"><i style="width:' + Math.round((job.progress || 0) * (job.progress > 1 ? 1 : 100)) + '%"></i></span><span class="muted">' + esc(job.message || "The first song loads the model and takes longer.") + "</span></div>" : "") +
      '<p class="muted" style="margin:0;font-size:13.5px">The model understands styles best when described in English; other languages work for the description and for sung lyrics when you set the vocal language, but results vary by language. Generated music is AI output: check the model licence before commercial use.</p></div>';
    if (st.play) html += '<div class="card stack st-player"><h2>' + esc(st.play.title) + '</h2>' + (st.play.mock ? '<p class="st-mock">Demo engine: these are synthetic test tones, not AI-composed music.</p>' : "") + '<audio controls src="' + st.play.url + '"></audio><a class="btn secondary" href="' + st.play.url + '" download="' + esc((st.play.title || "song").replace(/[^\w\- ]+/g, "")) + '.wav">Download</a></div>';
    if (st.songs.length) html += '<div class="card"><h2>Your songs</h2><div class="shop-list">' + st.songs.map(function (s, i) { return '<div class="shop-row"><div class="sr-body"><b>' + esc(s.title) + '</b><span class="muted">' + Math.round(s.duration || 0) + " s &middot; " + esc((s.prompt || "").slice(0, 70)) + (s.is_mock ? " &middot; demo" : "") + '</span></div><button class="btn secondary" data-song="' + i + '">Play</button></div>'; }).join("") + "</div></div>";
    view.innerHTML = html + "</div>";
    var q = function (s) { return view.querySelector(s); };
    q("#stConnect").onclick = function () { connect(view, h); };
    q("#stGen").onclick = function () { generate(view, h); }; q("#stLyr").onclick = function () { lyricsFor(view, h); };
    q("#stDur").oninput = function () { q("#stDurV").textContent = q("#stDur").value; };
    view.querySelectorAll("[data-song]").forEach(function (b) { b.onclick = function () { playSong(view, h, st.songs[+b.dataset.song]); }; });
  }
  root.Studio = { render: function (view, h) { keep = {}; draw(view, h); }, _state: st, _cleanUrl: cleanUrl };
})(window);

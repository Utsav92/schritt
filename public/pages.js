/* Company pages: About, Mission and values, Products, Careers, Help and support, Legal (privacy, terms, security).
   Every claim about the app is true of this build. Things only the operator can supply (support email, social links, job
   openings) come from config.js and stay hidden or clearly marked until set. All art is original inline SVG / CSS (no
   third-party logos, no images to download). Motion respects prefers-reduced-motion. Edit the wording freely. */
(function (root) {
  "use strict";
  var CFG = root.SCHRITT_CONFIG || {}, L = CFG.legal || {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var mail = function () { return L.contact && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(L.contact) ? L.contact : ""; };
  var fill = function (t) { return esc(t).replace(/\{operator\}/g, L.operator ? esc(L.operator) : "[operator name: set legal.operator in config.js]").replace(/\{contact\}/g, L.contact ? esc(L.contact) : "[contact email: set legal.contact in config.js]"); };

  var NAV = [["about", "About us"], ["mission", "Mission and values"], ["products", "Products"], ["careers", "Careers"], ["help", "Help and support"], ["legal", "Legal"], ["privacy", "Privacy"], ["terms", "Terms"], ["security", "Security"]];
  var SUBNAV = { privacy: 1, terms: 1, security: 1 };
  var ACCENT = { about: "#0b8aa6", mission: "#e0584a", products: "#7a5cd6", careers: "#e09a2b", help: "#2f9e6b", legal: "#3f6fd1", privacy: "#3f6fd1", terms: "#6b5bd6", security: "#1f8a8a" };

  /* line icons, 24x24 */
  var IC = {
    gift: '<path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3M12 15v2"/>',
    scale: '<path d="M12 3v18M5 21h14M4 7h16M4 7l-2 7a3 3 0 006 0zM20 7l-2 7a3 3 0 006 0z" transform="translate(-1 0)"/>',
    people: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.500 3-6 6.500-6s6.500 2.500 6.500 6M16 5a3 3 0 010 6M18 14c2 .8 3.500 2.800 3.500 6"/>',
    spark: '<path d="M12 2l2.400 6.600L21 11l-6.600 2.400L12 20l-2.400-6.600L3 11l6.600-2.400z"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.500"/><path d="M11 18h2"/>',
    star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
    math: '<path d="M18 5H7l6.500 7L7 19h11"/>',
    note: '<path d="M9 18V5l11-2v13"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="17.500" cy="16" r="2.500"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500L16 9.500"/>',
    scroll: '<path d="M6 3h11a2 2 0 012 2v13a3 3 0 01-3 3H8a3 3 0 01-3-3V4a1 1 0 011-1zM9 8h7M9 12h7M9 16h4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 114 2c-1 .8-1.500 1.200-1.500 2.500M12 17v.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>',
    audio: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.500 6.500a8 8 0 010 11"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.500 4.500 0 018-2.500A4.500 4.500 0 0120 9c0 6-8 11-8 11z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  var ico = function (n, cls) { return '<svg class="pgx-ic ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (IC[n] || "") + "</svg>"; };

  var FAQ = [
    ["start", "How do the levels work?", "Every language has six levels, A1 to C2. Each level has six sections of five lessons, so 30 lessons per level and 180 per language. Math runs from grade 1 to grade 12 with the same 30 lessons per grade, and Music has six levels of its own. Lessons unlock in order."],
    ["plus", "What does Schritt cost?", "Nothing. Every language level A1 to C2, every math grade from 1 to 12 and every music level is free, with no ads and no hearts to run out of. There is no paid plan."],
    ["app", "How do I install the app on my phone?", "iPhone or iPad: open the site in Safari, tap the Share button, then Add to Home Screen. Android: open it in Chrome and tap Install app (or the menu, then Install app). It then opens full screen and works offline."],
    ["start", "How do I switch between languages, music and math?", "Use the three buttons under the top bar: Languages, Music and Math. Each section keeps its own path, levels and progress. In Languages, tap the language button at the top to change language, or open Profile, then Add a language, to import your own."],
    ["math", "How are math answers checked?", "Answers are numbers. You can type a whole number, a decimal, a negative number, or a fraction like 3/4. Equal forms count the same, so 6/8 is accepted for 3/4. Many questions come with a picture such as a number line, shape or graph."],
    ["music", "How does the music section work?", "Music lessons teach reading notes on a staff, rhythm, the piano keyboard, intervals, scales and chords. Some questions play a sound, so turn your volume up. They use your device's built-in audio, with no downloads."],
    ["music", "What is the Studio tab, and why can it not find a server?", "Studio turns a text prompt, in any language, into music. It needs the SonicStudioAI program running on your own Mac, because the AI model cannot run in a web page. Start that program, paste its address and token into Studio, and press Connect. Setup steps are in the music-studio folder of the project."],
    ["audio", "The spoken audio does not play. What can I do?", "Spoken audio uses the voices installed on your device. Some devices have no voice for every language. Add a voice in your system settings (for example Settings > Accessibility > Spoken content), or turn spoken audio off in Profile > Settings."],
    ["data", "How do I back up or move my progress?", "Profile > Your data > Export backup saves a file; Import backup restores it on another device. Signing in with Google, when your site has it switched on, syncs for you."],
    ["data", "What does a profile do?", "A profile keeps its own progress and gems on this device. There is no password, so anyone using the browser can open it. Log out on shared computers."],
    ["data", "How do I delete my data?", "Profile > Privacy, safety and data > Erase all data on this device removes everything Schritt stored in this browser. See the Legal pages for cloud accounts."],
    ["start", "Are the translations checked by native speakers?", "Not yet. They were written as study aids and may contain mistakes, especially at C1 and C2. If you are a native speaker and would like to help review a language, see Careers."]
  ];
  var CATS = [["all", "All"], ["start", "Getting started"], ["app", "Install"], ["math", "Math"], ["music", "Music"], ["audio", "Audio"], ["data", "Your data"]];

  var VALUES = [
    ["gift", "Free for everyone", "Every language level, every math grade and every music level is free, with all features included."],
    ["eye", "Respect your attention", "There are no ads and nothing is locked behind a paywall. Streaks are there to help, not to guilt you."],
    ["lock", "Private by default", "No analytics, no tracking cookies, no third-party fonts. Your progress lives on your device unless you decide to sync it."],
    ["scale", "Honest about limits", "We say what is checked and what is not, what a plan includes, and what the app cannot do."],
    ["people", "Open to everyone", "Keyboard friendly, screen-reader labels, light and dark themes, reduced-motion support, and languages that read right to left."],
    ["spark", "Playful on purpose", "Short lessons, bright colours and small rewards, because people practise what feels good."]
  ];

  /* ---------- reusable pieces ---------- */
  function hero(key, eyebrow, title, lede, stage, extra) {
    return '<header class="pgx-hero" style="--ac:' + ACCENT[key] + '" data-tilt><div class="pgx-blob b1"></div><div class="pgx-blob b2"></div><div class="pgx-hero-t"><span class="pgx-eye">' + esc(eyebrow) + "</span><h2>" + esc(title) + "</h2><p>" + esc(lede) + "</p>" + (extra || "") + '</div><div class="pgx-stage" aria-hidden="true">' + stage + "</div></header>";
  }
  var sec = function (inner, cls) { return '<section class="pgx-sec pgx-rv ' + (cls || "") + '">' + inner + "</section>"; };
  var h3 = function (t, sub) { return '<h3 class="pgx-h">' + esc(t) + "</h3>" + (sub ? '<p class="pgx-sub">' + esc(sub) + "</p>" : ""); };
  function flagMarquee() {
    var F = root.Front, ord = F && F.ORDER ? F.ORDER : [], names = F && F.NAMES ? F.NAMES : {};
    var one = ord.map(function (id) { return '<span class="pgx-flag">' + F.flag(id) + "<i>" + esc(names[id] || id) + "</i></span>"; }).join("");
    return one ? '<div class="pgx-marq" aria-hidden="true"><div class="pgx-track">' + one + one + "</div></div>" : "";
  }
  function stat(n, label, suffix) { return '<div class="pgx-stat"><b data-count="' + n + '">' + n + "</b>" + (suffix ? "<small>" + suffix + "</small>" : "") + "<span>" + esc(label) + "</span></div>"; }

  /* ---------- hero stages (CSS 3D / SVG) ---------- */
  function stageAbout() {
    var chips = [["Hallo", 8, 12], ["¿Qué tal?", 78, 6], ["你好", 4, 70], ["x² + 1", 82, 62], ["♪ ♩", 44, 90], ["Ciao", 60, 28], ["bonjour", 18, 40]];
    return '<div class="cube3"><div class="cf f1"><b>Aa</b><span>Languages</span></div><div class="cf f2"><b>&sum;</b><span>Math</span></div><div class="cf f3"><b>&#9835;</b><span>Music</span></div><div class="cf f4"><b>&#8635;</b><span>Review</span></div></div>' +
      chips.map(function (c, i) { return '<span class="pgx-chip" style="--x:' + c[1] + "%;--y:" + c[2] + "%;--d:" + (i * 0.7) + 's">' + c[0] + "</span>"; }).join("");
  }
  function stageMission() {
    var pos = VALUES.map(function (v, i) { return '<div class="orb" style="--a:' + (i * 60) + 'deg"><div class="orb-i"><span class="orb-dot">' + ico(v[0]) + "</span><em>" + esc(v[1]) + "</em></div></div>"; }).join("");
    return '<div class="orbit"><div class="orbit-core"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5-8-11a4.500 4.500 0 018-2.500A4.500 4.500 0 0120 10c0 6-8 11-8 11z"/></svg></div><div class="orbit-ring"></div>' + pos + "</div>";
  }
  function stageProducts() {
    var nodes = ["#58a700", "#1cb0f6", "#ce82ff", "#ff9600"].map(function (c, i) { return '<i style="--c:' + c + ";--o:" + (i % 2 ? 22 : -22) + 'px"></i>'; }).join("");
    return '<div class="phone3"><div class="ph-scr"><div class="ph-top"><b>Schritt</b><span></span></div><div class="ph-tabs"><u class="on">Languages</u><u>Music</u><u>Math</u></div><div class="ph-path">' + nodes + '</div></div></div><div class="card3 c1"><b>&sum;</b></div><div class="card3 c2"><b>&#9835;</b></div><div class="card3 c3"><b>Aa</b></div>';
  }
  function stageCareers() {
    var items = [["Native speakers", 6, 14], ["Teachers", 62, 8], ["Designers", 70, 56], ["Engineers", 8, 62], ["Musicians", 38, 78]];
    return '<div class="rings"><i></i><i></i><i></i></div>' + items.map(function (c, i) { return '<span class="pgx-badge" style="--x:' + c[1] + "%;--y:" + c[2] + "%;--d:" + (i * 0.8) + 's">' + c[0] + "</span>"; }).join("") + '<div class="wave3"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>';
  }
  function stageHelp() {
    return '<div class="bubbles"><div class="bub b1">How do I start?</div><div class="bub b2">Languages, math, music&hellip;</div><div class="bub b3">We have answers</div></div><div class="lifebuoy"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="18" stroke-dasharray="30 30"/><circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/><circle cx="50" cy="50" r="29" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/></svg></div>';
  }
  function stageLegal(kind) {
    var icon = kind === "terms" ? "scroll" : kind === "security" ? "key" : "shield";
    return '<div class="shield3"><div class="sh-face">' + ico(icon, "big") + '</div><div class="sh-back">' + ico("lock", "big") + '</div></div><span class="pgx-orb o1"></span><span class="pgx-orb o2"></span><span class="pgx-orb o3"></span>';
  }

  /* ---------- pages ---------- */
  function aboutPage() {
    var steps = [
      ["Choose", '<svg viewBox="0 0 80 50" aria-hidden="true"><rect x="6" y="6" width="68" height="10" rx="5" class="a"/><rect x="6" y="20" width="68" height="10" rx="5" class="b"/><rect x="6" y="34" width="68" height="10" rx="5" class="a"/></svg>', "Pick the right answer from a few options."],
      ["Listen", '<svg viewBox="0 0 80 50" aria-hidden="true"><g class="bars"><rect x="12" y="18" width="6" height="14" rx="3"/><rect x="24" y="8" width="6" height="34" rx="3"/><rect x="36" y="14" width="6" height="22" rx="3"/><rect x="48" y="4" width="6" height="42" rx="3"/><rect x="60" y="16" width="6" height="18" rx="3"/></g></svg>', "Hear words and notes, then answer what you heard."],
      ["Build", '<svg viewBox="0 0 80 50" aria-hidden="true"><rect x="4" y="8" width="22" height="14" rx="5" class="a"/><rect x="30" y="8" width="26" height="14" rx="5" class="b"/><rect x="60" y="8" width="16" height="14" rx="5" class="a"/><rect x="14" y="30" width="24" height="14" rx="5" class="b"/><rect x="42" y="30" width="20" height="14" rx="5" class="a"/></svg>', "Put words in order to build a whole sentence."],
      ["Type", '<svg viewBox="0 0 80 50" aria-hidden="true"><rect x="6" y="12" width="68" height="26" rx="8" class="line"/><rect x="14" y="19" width="2.500" height="12" class="caret"/><rect x="20" y="22" width="26" height="6" rx="3" class="a"/></svg>', "Write the answer yourself, even a fraction like 3/4."]
    ];
    return hero("about", "About Schritt", "Learn a little every day. Three subjects, one calm app.", "Schritt is a free-to-start learning app for languages, music and math, built to feel like a game and to respect your privacy.", stageAbout()) +
      sec('<div class="pgx-stats">' + stat(17, "languages, A1 to C2") + stat(180, "lessons per language") + stat(360, "math lessons, grades 1-12") + stat(90, "music lessons, 6 levels") + "</div>") +
      sec(h3("What Schritt is", "One app, three sections.") + '<div class="pgx-3">' +
        '<article class="pgx-card" style="--ac:#0b8aa6"><span class="pgx-ico">' + ico("globe") + "</span><h4>Languages</h4><p>17 languages for English speakers: German, Spanish, Spanish (Mexico), French, Italian, Portuguese, Dutch, Swedish, Turkish, Vietnamese, Korean, Chinese, Japanese, Thai, Hindi, Urdu and Arabic.</p></article>" +
        '<article class="pgx-card" style="--ac:#7a5cd6"><span class="pgx-ico">' + ico("math") + "</span><h4>Math</h4><p>Grade 1 to grade 12, with diagrams, number lines, shapes and graphs. Counting and shapes first; algebra and calculus later.</p></article>" +
        '<article class="pgx-card" style="--ac:#e0584a"><span class="pgx-ico">' + ico("note") + "</span><h4>Music</h4><p>Read notes, learn rhythm, the keyboard, intervals, scales and chords, with sounds you can hear. A Studio tab can also make music from a prompt.</p></article></div>") +
      sec(h3("How a lesson feels", "Short, varied and never a wall of text.") + '<div class="pgx-4">' + steps.map(function (s, i) { return '<article class="pgx-step" style="--i:' + i + '">' + s[1] + "<b>" + s[0] + "</b><p>" + s[2] + "</p></article>"; }).join("") + "</div><p>Words and questions you miss come back sooner through spaced review. Hearts, streaks, gems and daily quests keep practice regular without getting in the way.</p>") +
      sec(h3("Who makes it") + '<div class="pgx-quote"><p>Schritt is built and run by ' + (L.operator ? esc(L.operator) : "the Schritt team") + ". It is its own app with its own lessons, art and code, and is not affiliated with any other learning company.</p></div>") +
      sec(h3("What makes it different") + '<div class="pgx-checks"><div>' + ico("check") + "<span>Starts free and works offline once installed</span></div><div>" + ico("check") + "<span>No analytics or advertising trackers</span></div><div>" + ico("check") + "<span>Progress stays on your device unless you sign in</span></div><div>" + ico("check") + "<span>No ads and no paywall: everything is free for everyone</span></div></div>") +
      sec(h3("Honest limits") + '<div class="pgx-note">' + ico("scale") + "<p>Lessons are a focused slice of each level, not the whole syllabus, and translations have not all been checked by native speakers. We would rather say so than pretend otherwise.</p></div>") + socialSec();
  }
  function missionPage() {
    return hero("mission", "Mission and values", "Make a great start free, playful and private.", "A world where picking up a new language, a new instrument or a new kind of math feels as natural as picking up your phone, and where nobody pays with their data to learn.", stageMission()) +
      sec('<div class="pgx-2"><article class="pgx-big" style="--ac:#e0584a"><span class="pgx-eye">Our mission</span><p>To make a great start in a new subject free, playful and private.</p></article><article class="pgx-big alt" style="--ac:#7a5cd6"><span class="pgx-eye">Our vision</span><p>Learning that fits into five minutes, and feels good enough that you come back tomorrow.</p></article></div>') +
      sec(h3("What we stand for", "Six promises we try to keep.") + '<div class="pgx-3">' + VALUES.map(function (v, i) { return '<article class="pgx-card val" style="--ac:' + ["#2f9e6b", "#e09a2b", "#3f6fd1", "#e0584a", "#0b8aa6", "#7a5cd6"][i] + '"><span class="pgx-ico">' + ico(v[0]) + "</span><h4>" + esc(v[1]) + "</h4><p>" + esc(v[2]) + "</p></article>"; }).join("") + "</div>") + socialSec();
  }
  function productsPage() {
    var P = [
      ["phone", "#0b8aa6", "Schritt app", "Free", "The full learning app in your browser, installable on iPhone, iPad and Android, and usable offline. Daily goal, streak, gems, shop, quests, practice, avatars and profiles.", "mini-path"],
      ["globe", "#58a700", "Languages", "A1 to B1 free", "17 languages, six levels each, 180 lessons per language. Add another with a language pack.", "mini-lang"],
      ["math", "#7a5cd6", "Math", "Grades 1-7 free", "Grade 1 to 12, 360 lessons with pictures, number lines, shapes and graphs.", "mini-math"],
      ["note", "#e0584a", "Music", "Levels 1-3 free", "Staff reading, rhythm, keyboard, intervals, scales and chords, with sound.", "mini-music"],
      ["mic", "#1cb0f6", "Music Studio", "Bring your own server", "Turns a prompt in any language into music through SonicStudioAI running on your Mac. Optional.", "mini-studio"]
    ];
    var arts = {
      "mini-path": '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M20 55 C60 55 40 15 80 15 S120 55 140 20" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round" opacity=".45"/><circle cx="20" cy="55" r="9" fill="#58a700"/><circle cx="80" cy="15" r="9" fill="#1cb0f6"/><circle cx="140" cy="20" r="9" fill="#ff9600"/></svg>',
      "mini-plus": '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M80 8l9 20 21 2-16 14 5 21-19-11-19 11 5-21L50 30l21-2z" fill="#ffc800" class="spin-s"/><circle cx="30" cy="20" r="3" fill="#ffc800"/><circle cx="132" cy="52" r="4" fill="#ffc800"/><circle cx="125" cy="14" r="2" fill="#ffc800"/></svg>',
      "mini-lang": '<svg viewBox="0 0 160 70" aria-hidden="true"><g font-family="sans-serif" font-weight="700" fill="currentColor"><text x="12" y="30" font-size="22">Hallo</text><text x="74" y="22" font-size="16">你好</text><text x="96" y="52" font-size="20">Hola</text><text x="20" y="60" font-size="16">こんにちは</text></g></svg>',
      "mini-math": '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M10 60h140M10 60V8" stroke="currentColor" stroke-width="2" fill="none" opacity=".4"/><path d="M14 56C50 56 60 10 80 10s30 46 66 46" fill="none" stroke="#7a5cd6" stroke-width="3.500" stroke-linecap="round"/><circle cx="80" cy="10" r="4.500" fill="#7a5cd6"/></svg>',
      "mini-music": '<svg viewBox="0 0 160 70" aria-hidden="true"><g stroke="currentColor" stroke-width="1.500" opacity=".5"><path d="M10 18h140M10 28h140M10 38h140M10 48h140M10 58h140"/></g><ellipse cx="50" cy="43" rx="7" ry="5" fill="#e0584a"/><path d="M57 43V14" stroke="#e0584a" stroke-width="2.500"/><ellipse cx="96" cy="33" rx="7" ry="5" fill="#e0584a"/><path d="M103 33V6" stroke="#e0584a" stroke-width="2.500"/></svg>',
      "mini-studio": '<svg viewBox="0 0 160 70" aria-hidden="true"><g fill="#1cb0f6" class="bars-s"><rect x="14" y="26" width="8" height="18" rx="4"/><rect x="30" y="14" width="8" height="42" rx="4"/><rect x="46" y="22" width="8" height="26" rx="4"/><rect x="62" y="6" width="8" height="58" rx="4"/><rect x="78" y="20" width="8" height="30" rx="4"/><rect x="94" y="12" width="8" height="46" rx="4"/><rect x="110" y="24" width="8" height="22" rx="4"/><rect x="126" y="18" width="8" height="34" rx="4"/></g></svg>'
    };
    return hero("products", "Products", "Everything in one pocket-sized app.", "Languages, math and music, every level free.", stageProducts()) +
      sec('<div class="pgx-3 prod">' + P.map(function (p) { return '<article class="pgx-card prod-c" style="--ac:' + p[1] + '"><div class="prod-art">' + arts[p[5]] + '</div><div class="prod-h"><span class="pgx-ico">' + ico(p[0]) + '</span><h4>' + esc(p[2]) + '</h4></div><span class="pgx-tag">' + esc(p[3]) + "</span><p>" + esc(p[4]) + "</p></article>"; }).join("") + "</div>") +
      sec(h3("Language packs", "Bring your own language.") + '<p>Add any language that separates words with spaces, or mark it as unspaced, by importing a simple text template from Profile. Chinese, Japanese and Thai are supported with word-boundary markers.</p>') +
      sec(h3("Not available yet") + '<div class="pgx-chips"><span>Native iOS app</span><span>Native Android app</span><span>Leaderboards</span><span>Friends</span><span>Classrooms</span></div>') + socialSec();
  }
  function careerMail() { var e = (CFG.careers || {}).email || ""; return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : mail(); }
  function jobHtml(j, m, i) {
    var li = function (arr) { return "<ul>" + (arr || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
    var chips = function (arr) { return '<div class="pgx-chips tools">' + (arr || []).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>"; };
    var subj = encodeURIComponent("Application: " + j.title), body = encodeURIComponent("Hello,\n\nI would like to apply for the " + j.title + " role.\n\nAbout me:\n\nLinks (portfolio, LinkedIn, GitHub):\n\nThank you,\n");
    var ok = false; try { ok = j.url && new URL(j.url).protocol === "https:"; } catch (e) { ok = false; }
    return '<details class="pgx-job"' + (i === 0 ? " open" : "") + "><summary><span class=\"pgx-jt\"><b>" + esc(j.title) + "</b><i>" + esc(j.summary || "") + '</i></span><span class="pgx-jm">' + [j.team, j.location, j.type].filter(Boolean).map(function (x) { return "<u>" + esc(x) + "</u>"; }).join("") + "</span></summary>" +
      '<div class="pgx-jb">' + (j.responsibilities ? "<h5>What you will do</h5>" + li(j.responsibilities) : "") + (j.qualifications ? "<h5>What you bring</h5>" + li(j.qualifications) : "") +
      (j.tools ? "<h5>Tools you will use</h5>" + chips(j.tools) : "") + (j.nice ? "<h5>Nice to have</h5>" + li(j.nice) : "") +
      '<div class="pgx-row">' + '<button class="btn" data-pg="apply:' + i + '">Apply for this role</button>' + (m ? '<a class="btn secondary" href="mailto:' + esc(m) + "?subject=" + subj + "&body=" + body + '">Ask a question</a>' : "") + (ok ? '<a class="btn secondary" href="' + esc(j.url) + '" target="_blank" rel="noopener noreferrer">Details</a>' : "") + '</div><p class="pgx-small">Applying takes about ten minutes: your details, experience, certifications, tools and a resume upload.</p></div></details>';
  }
  function careersPage() {
    var jobs = ((CFG.careers || {}).openings || []).filter(function (j) { return j && j.title; }), m = careerMail();
    var list = jobs.length ? '<div class="pgx-jobs2">' + jobs.map(function (j, i) { return jobHtml(j, m, i); }).join("") + "</div>" :
      '<div class="pgx-empty"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="22" y="26" width="76" height="46" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M46 26v-8a6 6 0 016-6h16a6 6 0 016 6v8M22 46h76" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="46" r="5" fill="currentColor"/></svg><p>There are no open roles right now. Check back soon, or say hello below.</p></div>';
    var ways = [["flag", "#e09a2b", "Check our lessons", "Native speakers of any of our 17 languages: tell us what sounds wrong or unnatural."], ["math", "#7a5cd6", "Teach with us", "Teachers and tutors can help us find unclear math questions and better pictures."], ["note", "#e0584a", "Make it musical", "Musicians can review the notation, ear training and the chords and scales units."]];
    return hero("careers", "Careers", "Help people learn. Make it feel good.", "We are a small team and we are hiring. The best way in is to help us make the lessons better.", stageCareers(), jobs.length ? '<p class="pgx-pill">' + jobs.length + " open roles</p>" : "") +
      sec(flagMarquee()) +
      sec(h3("Open roles", jobs.length ? "Tap a role to read the full description." : "") + list) +
      sec(h3("Ways to help", "No résumé needed to start.") + '<div class="pgx-3">' + ways.map(function (w) { return '<article class="pgx-card" style="--ac:' + w[1] + '"><span class="pgx-ico">' + ico(w[0]) + "</span><h4>" + esc(w[2]) + "</h4><p>" + esc(w[3]) + "</p></article>"; }).join("") + "</div>") +
      sec(h3("How we work") + '<div class="pgx-checks"><div>' + ico("check") + "<span>Small steps, shipped often</span></div><div>" + ico("check") + "<span>Say what is checked and what is not</span></div><div>" + ico("check") + "<span>Privacy and accessibility from day one</span></div><div>" + ico("check") + "<span>Learners first, always</span></div></div>") +
      sec(h3("Get in touch") + (m ? '<a class="btn" href="mailto:' + esc(m) + '?subject=Schritt%20careers">' + ico("mail", "sm") + " " + esc(m) + '</a><p class="pgx-small">Send a short note about yourself and the role you are interested in, or tell us how you would like to help.</p>' : '<div class="pgx-note">' + ico("mail") + "<p>Our contact email has not been set up yet.</p></div>")) + socialSec();
  }
  function helpPage() {
    var m = mail(), info = "App: Schritt\nBrowser: " + (root.navigator ? root.navigator.userAgent : "") + "\nScreen: " + (root.innerWidth || "") + "x" + (root.innerHeight || "");
    var topics = [["start", "play", "Getting started", "#2f9e6b"], ["app", "phone", "Install the app", "#0b8aa6"], ["math", "math", "Math", "#7a5cd6"], ["music", "note", "Music and Studio", "#e0584a"], ["data", "lock", "Your data", "#3f6fd1"]];
    var search = '<div class="pgx-search">' + ico("search") + '<input type="search" id="faqQ" placeholder="Search the help centre" aria-label="Search help"></div>';
    return hero("help", "Help and support", "How can we help?", "Quick answers to the most common questions, and a way to reach us when they are not enough.", stageHelp(), search) +
      sec(h3("Browse by topic") + '<div class="pgx-chipbar" id="faqCats">' + CATS.map(function (c, i) { return '<button class="pgx-cat' + (i ? "" : " on") + '" data-cat="' + c[0] + '">' + esc(c[1]) + "</button>"; }).join("") + "</div>") +
      sec('<div class="pgx-faq" id="faqList">' + FAQ.map(function (f) { return '<details data-cat="' + f[0] + '"><summary>' + esc(f[1]) + "</summary><p>" + esc(f[2]) + "</p></details>"; }).join("") + '</div><p class="pgx-empty-s" id="faqNone" hidden>No answer matches that yet. Try fewer words, or contact us below.</p>') +
      sec(h3("Still stuck?") + '<div class="pgx-2"><article class="pgx-card" style="--ac:#2f9e6b"><span class="pgx-ico">' + ico("mail") + "</span><h4>Contact support</h4><p>" + (m ? 'Email <a href="mailto:' + esc(m) + '?subject=Schritt%20support">' + esc(m) + "</a>. Tell us what you expected, what happened and what device you use." : "The support email has not been set up yet. Until then, the answers above cover most questions.") + "</p>" +
        (m ? '<a class="btn" href="mailto:' + esc(m) + "?subject=" + encodeURIComponent("Schritt problem report") + "&body=" + encodeURIComponent("What happened:\n\n\nWhat I expected:\n\n\n---\n" + info) + '">Report a problem</a><p class="pgx-small">The email opens in your own mail app with technical details of this browser filled in. Nothing is sent until you press send.</p>' : "") + '</article><article class="pgx-card" style="--ac:#3f6fd1"><span class="pgx-ico">' + ico("shield") + "</span><h4>Safety</h4><p>Schritt has no chat or messages between users. If you think an account has been misused or you found a security issue, see the Security page.</p><button class=\"btn secondary\" data-pg=\"security\">Read about security</button></article></div>") + socialSec();
  }
  function legalHub() {
    var cards = [["privacy", "shield", "Privacy", "What Schritt stores, where, and how to erase it."], ["terms", "scroll", "Terms of use", "The rules for using the app."], ["security", "key", "Security and safety", "How accounts are protected, and what we cannot promise."]];
    return hero("legal", "Legal", "Clear terms, in plain language.", "Everything about your data, your rights and how the app protects you, written to be read.", stageLegal("privacy")) +
      sec('<div class="pgx-3">' + cards.map(function (c) { var d = root.POLICY && root.POLICY[c[0]]; return '<article class="pgx-card link" style="--ac:' + ACCENT[c[0]] + '" tabindex="0" role="link" data-pg="' + c[0] + '"><span class="pgx-ico">' + ico(c[1]) + "</span><h4>" + esc(c[2]) + "</h4><p>" + esc(c[3]) + "</p>" + (d && d.sections ? '<span class="pgx-tag">' + d.sections.length + " sections</span>" : "") + "</article>"; }).join("") + "</div>") +
      sec(h3("In short") + '<div class="pgx-checks"><div>' + ico("check") + "<span>No analytics and no advertising trackers</span></div><div>" + ico("check") + "<span>Progress stays on your device unless you sign in</span></div><div>" + ico("check") + "<span>Erase everything on a device in one tap</span></div><div>" + ico("check") + "<span>No chat or messages between users</span></div></div>") +
      sec('<div class="pgx-note">' + ico("scale") + "<p>These pages are plain-language templates, not legal advice. The operator should have them reviewed for their country and fill in their name and contact in config.js. Schritt does not claim HIPAA compliance, since it handles no health information.</p></div>");
  }
  function policyPage(key, d) {
    var intro = key === "terms" ? "The rules of the road for using Schritt." : key === "security" ? "How accounts are protected, and where the limits are." : "What we collect, why, and how you stay in control.";
    var secs = d.sections || [];
    var toc = '<nav class="pgx-toc" aria-label="On this page">' + secs.map(function (x, i) { return '<a href="#" data-jump="s' + i + '"><i>' + (i + 1) + "</i>" + esc(x[0]) + "</a>"; }).join("") + "</nav>";
    return hero(key, "Legal", d.title, intro, stageLegal(key), d.note ? '<p class="pgx-pill">' + esc(d.note) + "</p>" : "") +
      sec(toc) + secs.map(function (x, i) { return sec('<div class="pgx-clause" id="pgx-s' + i + '"><span class="pgx-num">' + (i + 1) + "</span><div><h4>" + esc(x[0]) + "</h4><p>" + fill(x[1]) + "</p></div></div>"); }).join("") +
      sec('<div class="pgx-row"><button class="btn secondary" data-pg="legal">All legal pages</button><button class="btn secondary" data-pg="help">Help and support</button></div>');
  }
  function socialSec() {
    var s = CFG.social || {}, out = Object.keys(s).filter(function (k) { try { return new URL(s[k]).protocol === "https:"; } catch (e) { return false; } });
    if (!out.length) return "";
    return sec(h3("Follow us") + '<div class="pgx-row">' + out.map(function (k) { return '<a class="btn secondary" href="' + esc(new URL(s[k]).toString()) + '" target="_blank" rel="noopener noreferrer me">' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</a>"; }).join("") + "</div>");
  }
  function socialLinks() {
    var s = CFG.social || {};
    return Object.keys(s).filter(function (k) { try { return new URL(s[k]).protocol === "https:"; } catch (e) { return false; } }).map(function (k) { return '<a href="' + esc(new URL(s[k]).toString()) + '" target="_blank" rel="noopener noreferrer me">' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</a>"; });
  }
  function socialHtml() { var l = socialLinks(); return l.length ? '<h3>Follow us</h3><div class="pg-social">' + l.join(" ") + "</div>" : ""; }

  function pageHtml(key) {
    if (key === "about") return aboutPage();
    if (key === "mission") return missionPage();
    if (key === "products") return productsPage();
    if (key === "careers") return careersPage();
    if (key === "help") return helpPage();
    if (key === "legal") return legalHub();
    var am = /^apply:(\d+)$/.exec(key);
    if (am) { var jb = ((CFG.careers || {}).openings || [])[+am[1]]; return jb && root.Apply ? hero("careers", "Apply", jb.title, jb.summary || "", stageCareers()) + sec(root.Apply.html(jb, +am[1])) : careersPage(); }
    var d = root.POLICY && root.POLICY[key]; return d ? policyPage(key, d) : aboutPage();
  }

  /* ---------- behaviour ---------- */
  var prevFocus = null, io = null, rafs = [];
  function close() { var el = document.getElementById("pages"); if (el) el.remove(); document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; if (io) { io.disconnect(); io = null; } if (prevFocus && prevFocus.focus) prevFocus.focus(); }
  function onKey(e) { if (e.key === "Escape") close(); }
  function countUp(el) {
    var to = +el.dataset.count || 0, t0 = performance.now(), dur = 1100;
    if (!window.requestAnimationFrame || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) { el.textContent = to; return; }
    (function f(t) { var p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function bindNav(el, open) {
    el.querySelectorAll("[data-pg]").forEach(function (b) { b.onclick = function () { open(b.dataset.pg); }; b.onkeydown = function (e) { if ((e.key === "Enter" || e.key === " ") && b.getAttribute("role") === "link") { e.preventDefault(); open(b.dataset.pg); } }; });
  }
  function wire(el, open) {
    var main = el.querySelector(".pg-main");
    bindNav(el, open);
    var rv = el.querySelectorAll(".pgx-rv"), seen = function (n) { n.classList.add("in"); n.querySelectorAll("[data-count]").forEach(countUp); };
    if ("IntersectionObserver" in window) { io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { seen(e.target); io.unobserve(e.target); } }); }, { root: main, threshold: 0.12 }); rv.forEach(function (n) { io.observe(n); }); } else rv.forEach(seen);
    var hr = el.querySelector("[data-tilt]");
    if (hr && window.matchMedia && !matchMedia("(prefers-reduced-motion: reduce)").matches) hr.addEventListener("pointermove", function (e) { var r = hr.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; hr.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg"); hr.style.setProperty("--ry", (x * 14).toFixed(2) + "deg"); });
    el.querySelectorAll("[data-jump]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var t = el.querySelector("#pgx-" + a.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" }); }; });
    var q = el.querySelector("#faqQ"), cats = el.querySelector("#faqCats"), cat = "all";
    if (q) {
      var apply = function () { var t = q.value.trim().toLowerCase(), n = 0; el.querySelectorAll("#faqList details").forEach(function (d) { var ok = (cat === "all" || d.dataset.cat === cat) && (!t || d.textContent.toLowerCase().indexOf(t) >= 0); d.hidden = !ok; if (ok) n++; }); el.querySelector("#faqNone").hidden = n > 0; };
      q.oninput = apply;
      cats.onclick = function (e) { var b = e.target.closest("[data-cat]"); if (!b) return; cat = b.dataset.cat; cats.querySelectorAll(".pgx-cat").forEach(function (x) { x.classList.toggle("on", x === b); }); apply(); };
    }
  }
  function open(key) {
    var am = /^apply:(\d+)$/.exec(key), jobsList = (CFG.careers || {}).openings || [];
    var navKey = am ? "careers" : key;
    key = am ? (jobsList[+am[1]] && root.Apply ? key : "careers") : (NAV.some(function (n) { return n[0] === key; }) ? key : "about"); navKey = /^apply:/.test(key) ? "careers" : key;
    var el = document.getElementById("pages");
    if (io) { io.disconnect(); io = null; }
    if (!el) { prevFocus = document.activeElement; el = document.createElement("div"); el.id = "pages"; el.className = "pages"; document.body.appendChild(el); document.addEventListener("keydown", onKey); }
    var label = (NAV.filter(function (n) { return n[0] === navKey; })[0] || [0, "Schritt"])[1];
    el.innerHTML = '<div class="pg" role="dialog" aria-modal="true" aria-label="' + esc(label) + '"><div class="pg-bar"><b>Schritt</b><button class="btn secondary" id="pgClose">Close</button></div>' +
      '<div class="pg-body"><nav class="pg-nav" aria-label="Pages">' + NAV.map(function (n) { return '<button data-pgn="' + n[0] + '"' + (SUBNAV[n[0]] ? ' class="sub"' : "") + (n[0] === navKey ? ' aria-current="page"' : "") + ">" + esc(n[1]) + "</button>"; }).join("") + '</nav><article class="pg-main" id="pgMain" style="--ac:' + ACCENT[navKey] + '">' + pageHtml(key) + "</article></div></div>";
    document.body.style.overflow = "hidden";
    el.querySelector("#pgClose").onclick = close;
    el.querySelectorAll("[data-pgn]").forEach(function (b) { b.onclick = function () { open(b.dataset.pgn); }; });
    wire(el, open);
    if (/^apply:/.test(key) && root.Apply) root.Apply.wire(el, jobsList[+key.split(":")[1]], +key.split(":")[1], function () { bindNav(el, open); });
    var mainEl = el.querySelector("#pgMain"); if (mainEl) { mainEl.tabIndex = -1; mainEl.focus({ preventScroll: true }); }
  }
  root.Pages = { open: open, close: close, socialHtml: socialHtml, socialLinks: socialLinks, NAV: NAV };
})(window);

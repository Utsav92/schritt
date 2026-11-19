/* Visual layer for lessons: a coach avatar with a speech bubble on top, emoji companions peeking in from the left, right and
   bottom, a big emoji for common vocabulary, and a confetti burst on correct answers. Pure decoration (aria-hidden), driven by
   app.js after each question renders and after each answer is checked. Uses the app's own art/*.webp emoji set. */
(function (root) {
  "use strict";
  var IDLE = ["thinking", "happy", "determined", "wink", "robot", "cat", "bear", "dragon", "axolotl", "violet", "afro", "curly", "fox"];
  var GOOD = ["celebrate", "starstruck", "love", "wink", "happy"], BAD = ["oops", "shocked", "sad", "relieved"];
  var SAY = { ask: ["You've got this!", "Take your time.", "Think it through.", "Ready when you are!", "Let's go!", "Nice and easy.", "Trust your gut."],
    good: ["Perfect!", "Nailed it!", "Yes!", "Brilliant!", "Great job!", "Spot on!", "That's it!"], bad: ["Not quite.", "So close!", "Next time!", "Mistakes help you learn.", "Almost there."] };
  var CONF = ["⭐", "✨", "🎉", "💫", "🎊", "🌟"];
  var calm = function () { return root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var pick = function (a, n) { return a[Math.abs(n | 0) % a.length]; };
  var img = function (n, px, cls) { return '<img class="' + (cls || "") + '" src="art/' + n + '.webp" alt="" width="' + px + '" height="' + px + '" decoding="async">'; };

  /* common English words to a picture; matched on the English side of a question */
  var RAW = {
    "👋": "hello|hi|hey|goodbye|bye|see you|welcome|greetings", "🌅": "good morning|morning", "🌆": "good evening|evening", "🌙": "good night|night|moon", "🙏": "please|thank you|thanks|you're welcome",
    "😔": "sorry|apologize", "✅": "yes|correct|right", "❌": "no|wrong", "🙋": "excuse me", "💬": "how are you|talk|speak|say|tell|language", "💧": "water", "🍞": "bread|toast|bakery", "☕": "coffee|cafe|café", "🍵": "tea",
    "🥛": "milk", "🍺": "beer", "🍷": "wine", "🧃": "juice", "🍎": "apple", "🍌": "banana", "🍊": "orange", "🧀": "cheese", "🥚": "egg", "🥩": "meat|steak", "🐟": "fish", "🍗": "chicken", "🍚": "rice", "🍲": "soup",
    "🥗": "salad", "🍕": "pizza", "🎂": "cake|birthday", "🍦": "ice cream", "🍫": "chocolate", "🥔": "potato|potatoes", "🍅": "tomato", "🥕": "carrot", "🥦": "vegetable|vegetables", "🍓": "fruit|strawberry", "🍳": "breakfast|kitchen|cook|fry",
    "🥪": "lunch|sandwich", "🍽️": "dinner|meal|food|eat|plate", "🥤": "drink|thirsty", "🍴": "restaurant|fork", "📋": "menu|list", "🧾": "bill|receipt|check", "🏠": "house|home", "🏢": "apartment|office|building", "🛏️": "bed|bedroom|room",
    "🚿": "bathroom|shower", "🚪": "door", "🪟": "window", "🔑": "key", "🚗": "car|drive", "🚌": "bus", "🚆": "train", "✈️": "plane|airplane|flight|fly", "🚲": "bike|bicycle", "🚕": "taxi", "🚢": "boat|ship", "🛣️": "street|road|way",
    "🏙️": "city|town", "🏘️": "village", "🏫": "school", "🎓": "university|student|graduate", "🏥": "hospital", "🩺": "doctor", "💊": "pharmacy|medicine|pill", "🏪": "shop|store", "🛒": "market|buy|shopping", "🏦": "bank", "🏨": "hotel",
    "🛫": "airport", "🚉": "station", "⛪": "church", "🌳": "park|tree|trees", "🏖️": "beach", "⛰️": "mountain|mountains", "🌊": "sea|ocean|wave", "🏞️": "river|lake|nature", "🌲": "forest", "🌸": "flower|flowers|spring",
    "☀️": "sun|sunny|summer|day", "⭐": "star|stars", "🌧️": "rain|rainy", "❄️": "snow|winter|snowy", "💨": "wind|windy", "☁️": "cloud|cloudy", "🥵": "hot|warm", "🥶": "cold|freezing", "🌤️": "weather", "🍂": "autumn|fall",
    "🐶": "dog|puppy", "🐱": "cat|kitten", "🐦": "bird", "🐴": "horse", "🐄": "cow", "🐖": "pig", "🐑": "sheep", "🐭": "mouse", "🐰": "rabbit", "🐻": "bear", "🦁": "lion", "🐘": "elephant", "🐒": "monkey", "🐝": "bee",
    "👨‍👩‍👧": "family|parents", "👩": "mother|mom|mum|woman|wife|grandmother", "👨": "father|dad|man|husband|grandfather", "👦": "brother|boy|son", "👧": "sister|girl|daughter", "👶": "baby", "🧒": "child|children|kid|kids",
    "🤝": "friend|friends|meet|nice to meet you", "🧑‍🏫": "teacher|lesson|class", "🎒": "backpack|pupil", "📖": "book|read|books|library", "✏️": "pen|pencil|write|writing", "📄": "paper|document", "💻": "computer|laptop",
    "📱": "phone|mobile|call", "📺": "television|tv", "🎵": "music|sing|song|songs", "🎬": "film|movie|cinema", "🎮": "game|play|games", "⚽": "ball|football|soccer", "🏅": "sport|sports|win", "🏊": "swim|swimming", "🏃": "run|running",
    "🚶": "walk|walking", "😴": "sleep|tired|sleepy", "👂": "ear|listen|hear", "👀": "eyes|see|look|watch", "❤️": "love|heart|like", "👍": "good|great|fine|ok|okay", "😊": "happy|glad|smile", "😢": "sad|cry",
    "🤤": "hungry", "💰": "money|pay|cash|rich", "🏷️": "price|cost|cheap|expensive", "💶": "euro|dollar|coin", "💼": "work|job|business|briefcase", "⏰": "time|clock|hour|alarm|late|early", "📅": "week|month|today|tomorrow|date|calendar",
    "🎆": "year|new year", "🎁": "gift|present", "🎉": "party|celebrate|congratulations", "🏝️": "holiday|vacation", "🧳": "travel|trip|journey|luggage|suitcase", "🎫": "ticket", "🛂": "passport", "🗺️": "map",
    "🎩": "hat", "👕": "shirt|clothes|t-shirt", "👟": "shoes|shoe|sneakers", "👗": "dress", "👖": "trousers|pants|jeans", "🧥": "jacket|coat", "👓": "glasses", "👜": "bag|handbag", "☂️": "umbrella",
    "🔴": "red", "🔵": "blue", "🟢": "green", "🟡": "yellow", "⚫": "black", "⚪": "white", "🟠": "orange color", "🟣": "purple", "🟤": "brown", "1️⃣": "one", "2️⃣": "two", "3️⃣": "three", "4️⃣": "four", "5️⃣": "five",
    "6️⃣": "six", "7️⃣": "seven", "8️⃣": "eight", "9️⃣": "nine", "🔟": "ten", "✋": "hand", "👁️": "eye", "👃": "nose", "👄": "mouth|kiss", "🦷": "tooth|teeth", "🦵": "leg", "🦶": "foot|feet", "💇": "hair", "🤒": "sick|ill|fever",
    "🆘": "help", "⚠️": "danger|careful|warning", "👮": "police", "🔥": "fire|burn", "🚻": "toilet|restroom", "📶": "wifi|internet", "🎸": "guitar", "🎹": "piano|keyboard", "🥁": "drum|drums", "🎻": "violin", "🎤": "microphone|concert",
    "🛌": "rest", "🏃‍♀️": "hurry|quickly", "🤔": "think|maybe|question|why", "💡": "idea|light", "🌍": "world|country|earth", "🧭": "direction|north|south|east|west"
  };
  var MAP = {};
  Object.keys(RAW).forEach(function (e) { RAW[e].split("|").forEach(function (w) { if (!MAP[w]) MAP[w] = e; }); });
  function norm(s) { return String(s || "").toLowerCase().replace(/[.,!?¿¡;:"()]/g, " ").replace(/\s+/g, " ").trim().replace(/^(to|the|a|an|my|your|some|i|we|you|it) /, "").replace(/^(the|a|an|my|your) /, ""); }
  function emojiForText(t) {
    var s = norm(t); if (!s) return ""; if (MAP[s]) return MAP[s];
    var ws = s.split(" "), i; for (i = 0; i < ws.length; i++) { var w = ws[i]; if (MAP[w]) return MAP[w]; if (w.length > 3 && MAP[w.replace(/e?s$/, "")]) return MAP[w.replace(/e?s$/, "")]; }
    return "";
  }
  function emojiFor(ch) {
    if (!ch) return ""; var cands = [];
    if (ch.dir === "tl2en") cands.push(ch.answer, ch.answerText); else cands.push(ch.prompt);
    cands.push(ch.gloss, ch.en, ch.answerText, ch.answer, ch.prompt);
    for (var i = 0; i < cands.length; i++) { if (typeof cands[i] === "string" && cands[i].length < 60) { var e = emojiForText(cands[i]); if (e) return e; } }
    return "";
  }

  function decorate(el, o) {
    if (!el) return; o = o || {}; var seed = o.seed || 0, body = el.querySelector(".l-body"), foot = el.querySelector(".l-foot");
    el.querySelectorAll(".dc,.coach,.q-emo,.confetti").forEach(function (n) { n.remove(); });
    var mood = pick(SAY.ask, seed), av = o.avatar || "fox";
    if (body) {
      var c = document.createElement("div"); c.className = "coach"; c.setAttribute("aria-hidden", "true");
      c.innerHTML = img(av, 56, "coach-av") + '<div class="bubble"><span>' + (o.combo >= 3 ? "🔥 " + o.combo + " in a row!" : mood) + "</span></div>"; body.insertBefore(c, body.firstChild);
      var pr = body.querySelector(".q-prompt"), e = emojiFor(o.ch); if (pr && e) { var s = document.createElement("span"); s.className = "q-emo"; s.setAttribute("aria-hidden", "true"); s.textContent = e; pr.insertBefore(s, pr.firstChild); }
    }
    var L = pick(IDLE.filter(function (n) { return n !== av; }), seed * 3 + 1), R = pick(IDLE.filter(function (n) { return n !== av; }), seed * 5 + 4), B = pick(IDLE.filter(function (n) { return n !== av; }), seed * 7 + 2);
    el.insertAdjacentHTML("beforeend", '<div class="dc dc-l" aria-hidden="true">' + img(L, 84, "dci") + '</div><div class="dc dc-r" aria-hidden="true">' + img(R, 84, "dci") + "</div>");
    if (foot) foot.insertAdjacentHTML("beforeend", '<div class="dc dc-b" aria-hidden="true">' + img(B, 76, "dci") + "</div>");
  }
  function react(el, ok, o) {
    if (!el) return; o = o || {}; var seed = (o.seed || 0) + (ok ? 1 : 2);
    var bub = el.querySelector(".coach .bubble span"), co = el.querySelector(".coach");
    if (bub) bub.textContent = ok ? (o.combo >= 3 ? "🔥 " + o.combo + " in a row!" : pick(SAY.good, seed)) : pick(SAY.bad, seed);
    if (co) { co.classList.remove("hop", "wobble"); void co.offsetWidth; co.classList.add(ok ? "hop" : "wobble"); }
    var ft = el.querySelector(".l-foot"); if (ft && !ft.querySelector(".dc-b")) ft.insertAdjacentHTML("beforeend", '<div class="dc dc-b" aria-hidden="true">' + img("happy", 76, "dci") + "</div>");
    el.querySelectorAll(".dc img").forEach(function (im, i) { im.src = "art/" + (ok ? pick(GOOD, seed + i) : pick(BAD, seed + i)) + ".webp"; im.parentNode.classList.remove("jump", "sad"); void im.offsetWidth; im.parentNode.classList.add(ok ? "jump" : "sad"); });
    if (ok && !calm()) confetti(el);
  }
  function confetti(el, big) {
    var n = big ? 34 : 14, box = document.createElement("div"); box.className = "confetti"; box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) { var s = document.createElement("span"); s.textContent = CONF[i % CONF.length]; var a = (Math.random() * 2 - 1) * (big ? 1.3 : 0.9); s.style.setProperty("--dx", (Math.sin(a) * (big ? 260 : 150)).toFixed(0) + "px"); s.style.setProperty("--dy", (-(big ? 280 : 170) - Math.random() * (big ? 220 : 90)).toFixed(0) + "px"); s.style.setProperty("--r", ((Math.random() * 2 - 1) * 260).toFixed(0) + "deg"); s.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s"; s.style.fontSize = (16 + Math.random() * 14).toFixed(0) + "px"; box.appendChild(s); }
    el.appendChild(box); setTimeout(function () { box.remove(); }, big ? 2200 : 1500);
  }
  function celebrate(el) { if (el && !calm()) confetti(el, true); }
  root.Visuals = { decorate: decorate, react: react, celebrate: celebrate, emojiFor: emojiFor, emojiForText: emojiForText };
})(window);

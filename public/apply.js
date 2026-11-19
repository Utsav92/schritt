/* Job application form: one page per open position (Pages.open("apply:<index>")). Sends JSON to /api/apply, which emails the
   application to the Schritt team. Nothing is stored in this browser. If the server mailer is not switched on, the person can
   download a summary and send it by email themselves. */
(function (root) {
  "use strict";
  var CFG = root.SCHRITT_CONFIG || {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"], MAX_FILE = 2 * 1024 * 1024, MAX_TOTAL = 3 * 1024 * 1024, OK_EXT = /\.(pdf|docx?|png|jpe?g)$/i;
  var careerMail = function () { var e = (CFG.careers || {}).email || ""; return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : ""; };

  function field(id, label, extra, type, attrs) { return '<label class="ap-f"><span>' + label + (extra && extra.req ? ' <b aria-hidden="true">*</b>' : "") + '</span><input id="' + id + '" type="' + (type || "text") + '" ' + (attrs || "") + (extra && extra.req ? " required" : "") + "></label>"; }
  function expRow() { return '<div class="ap-row ap-exp"><div class="ap-grid"><label class="ap-f"><span>Company</span><input data-k="company" maxlength="100"></label><label class="ap-f"><span>Job title</span><input data-k="title" maxlength="100"></label><label class="ap-f"><span>From</span><input data-k="from" placeholder="2021" maxlength="20"></label><label class="ap-f"><span>To</span><input data-k="to" placeholder="Present" maxlength="20"></label></div><label class="ap-f"><span>What you did</span><textarea data-k="summary" rows="2" maxlength="800"></textarea></label><button type="button" class="ap-x" data-rm aria-label="Remove this job">Remove</button></div>'; }
  function certRow() { return '<div class="ap-row ap-cert"><div class="ap-grid c3"><label class="ap-f"><span>Certification</span><input data-k="name" maxlength="120"></label><label class="ap-f"><span>Issued by</span><input data-k="issuer" maxlength="100"></label><label class="ap-f"><span>Year</span><input data-k="year" maxlength="10" inputmode="numeric"></label></div><button type="button" class="ap-x" data-rm aria-label="Remove this certification">Remove</button></div>'; }
  function toolRow(name, level) { return '<div class="ap-row ap-tool"><div class="ap-grid c2"><label class="ap-f"><span>Tool or skill</span><input data-k="name" list="apTools" maxlength="60" value="' + esc(name || "") + '"></label><label class="ap-f"><span>Skill level</span><select data-k="level">' + LEVELS.map(function (l) { return "<option" + (l === (level || "Intermediate") ? " selected" : "") + ">" + l + "</option>"; }).join("") + '</select></label></div><button type="button" class="ap-x" data-rm aria-label="Remove this tool">Remove</button></div>'; }

  function html(job, idx) {
    var jobs = (CFG.careers || {}).openings || [];
    var opts = jobs.map(function (j, i) { return '<option value="' + esc(j.title) + '"' + (i === idx ? " selected" : "") + ">" + esc(j.title) + "</option>"; }).join("");
    return '<form class="ap" id="apForm" novalidate>' +
      '<div class="ap-head"><button type="button" class="btn ghost" data-pg="careers">&larr; All roles</button><h3>Apply: ' + esc(job.title) + '</h3><p>' + esc([job.team, job.location, job.type].filter(Boolean).join(" · ")) + ". Fields marked * are required. Takes about ten minutes.</p></div>" +
      '<fieldset><legend>1. The role</legend><label class="ap-f"><span>Position <b aria-hidden="true">*</b></span><select id="apPos">' + opts + "</select></label></fieldset>" +
      '<fieldset><legend>2. About you</legend><div class="ap-grid">' + field("apName", "Full name", { req: 1 }, "text", 'maxlength="100" autocomplete="name"') + field("apEmail", "Email", { req: 1 }, "email", 'maxlength="254" autocomplete="email"') + field("apPhone", "Phone", 0, "tel", 'maxlength="40" autocomplete="tel"') + field("apLinks", "LinkedIn, portfolio or GitHub", 0, "url", 'maxlength="300" placeholder="https://"') + "</div></fieldset>" +
      '<fieldset><legend>3. Address</legend><div class="ap-grid">' + field("apL1", "Street address", 0, "text", 'maxlength="120" autocomplete="address-line1"') + field("apCity", "City", { req: 1 }, "text", 'maxlength="80" autocomplete="address-level2"') + field("apRegion", "State or region", 0, "text", 'maxlength="80" autocomplete="address-level1"') + field("apPostal", "Postal code", 0, "text", 'maxlength="20" autocomplete="postal-code"') + field("apCountry", "Country", { req: 1 }, "text", 'maxlength="60" autocomplete="country-name"') + "</div></fieldset>" +
      '<fieldset><legend>4. Work experience</legend><div id="apExp">' + expRow() + '</div><button type="button" class="btn secondary" id="apAddExp">+ Add another job</button><div class="ap-grid" style="margin-top:12px">' + field("apYears", "Total years of experience", 0, "text", 'maxlength="10" inputmode="decimal"') + field("apEdu", "Highest education", 0, "text", 'maxlength="200" placeholder="e.g. BSc Computer Science"') + field("apAvail", "Earliest start date or notice period", 0, "text", 'maxlength="100"') + "</div></fieldset>" +
      '<fieldset><legend>5. Certifications</legend><div id="apCerts">' + certRow() + '</div><button type="button" class="btn secondary" id="apAddCert">+ Add a certification</button><label class="ap-f ap-file"><span>Upload certificates (optional, up to 3 files: PDF, Word, PNG or JPG, 2 MB each)</span><input id="apCertFiles" type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"></label><div class="ap-files" id="apCertList"></div></fieldset>' +
      '<fieldset><legend>6. Tools and skill level</legend><p class="ap-hint">Add the tools you have used and how well you know them. Tap a suggestion to add it.</p><div class="ap-sugg" id="apSugg">' + (job.tools || []).map(function (t) { return '<button type="button" data-add-tool="' + esc(t) + '">+ ' + esc(t) + "</button>"; }).join("") + '</div><div id="apTools2"></div><button type="button" class="btn secondary" id="apAddTool">+ Add a tool</button><datalist id="apTools">' + (job.tools || []).concat(job.nice || []).map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + "</datalist></fieldset>" +
      '<fieldset><legend>7. Why Schritt?</legend><label class="ap-f"><span>Why do you want to join Schritt, and what would you bring? <b aria-hidden="true">*</b></span><textarea id="apWhy" rows="6" maxlength="2500" placeholder="Tell us in your own words."></textarea></label><div class="ap-count"><span id="apCount">0</span> / 2500 (at least 30)</div></fieldset>' +
      '<fieldset><legend>8. Resume</legend><label class="ap-f ap-file"><span>Upload your resume <b aria-hidden="true">*</b> (PDF, Word, PNG or JPG, up to 2 MB)</span><input id="apResume" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"></label><div class="ap-files" id="apResumeList"></div></fieldset>' +
      '<input type="text" id="apWebsite" tabindex="-1" autocomplete="off" aria-hidden="true" class="ap-hp"><label class="ap-consent"><input type="checkbox" id="apConsent"><span>I agree that Schritt may receive and read the details and files I am sending, to consider my application and reply to me. They are emailed to the Schritt team and not stored in this browser. See Privacy.</span></label>' +
      '<div class="ap-err" id="apErr" role="alert" hidden></div><div class="ap-actions"><button type="submit" class="btn" id="apSubmit">Submit application</button><button type="button" class="btn secondary" data-pg="careers">Cancel</button></div></form>';
  }

  function readFile(f) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res({ name: f.name, data: String(r.result).split(",")[1] || "" }); }; r.onerror = function () { rej(new Error("Could not read " + f.name)); }; r.readAsDataURL(f); }); }
  function listFiles(input, box) { box.innerHTML = Array.prototype.map.call(input.files, function (f) { return "<span>" + esc(f.name) + " &middot; " + Math.max(1, Math.round(f.size / 1024)) + " KB</span>"; }).join(""); }
  function rows(box, kinds) { return Array.prototype.map.call(box.querySelectorAll(".ap-row"), function (r) { var o = {}; r.querySelectorAll("[data-k]").forEach(function (i) { o[i.dataset.k] = i.value.trim(); }); return o; }); }

  function summaryText(a) {
    var L = ["Application: " + a.position, "", "Name: " + a.name, "Email: " + a.email, "Phone: " + (a.phone || "-"), "Address: " + [a.address.line1, a.address.city, a.address.region, a.address.postal, a.address.country].filter(Boolean).join(", "), "Links: " + (a.links || "-"), "Education: " + (a.education || "-"), "Years of experience: " + (a.years || "-"), "Availability: " + (a.availability || "-"), "", "WORK EXPERIENCE"];
    (a.experience.length ? a.experience : [{ title: "none listed" }]).forEach(function (x) { L.push("- " + (x.company ? x.title + " at " + x.company + " (" + (x.from || "?") + " to " + (x.to || "present") + ")" : x.title) + (x.summary ? "\n  " + x.summary : "")); });
    L.push("", "CERTIFICATIONS"); (a.certifications.length ? a.certifications : [{ name: "none listed" }]).forEach(function (x) { L.push("- " + x.name + (x.issuer ? ", " + x.issuer : "") + (x.year ? " (" + x.year + ")" : "")); });
    L.push("", "TOOLS AND SKILL LEVEL"); (a.tools.length ? a.tools : [{ name: "none listed", level: "" }]).forEach(function (x) { L.push("- " + x.name + (x.level ? ": " + x.level : "")); });
    L.push("", "WHY SCHRITT", a.why, "", "(Attach your resume and certificates to the email.)"); return L.join("\n");
  }

  function wire(el, job, idx, nav) {
    var $ = function (id) { return el.querySelector("#" + id); }, form = $("apForm"), err = $("apErr");
    var show = function (m) { err.textContent = m; err.hidden = !m; if (m) err.scrollIntoView({ behavior: "smooth", block: "center" }); };
    var addTool = function (name) { var box = $("apTools2"); box.insertAdjacentHTML("beforeend", toolRow(name)); var last = box.lastElementChild.querySelector("input"); if (!name) last.focus(); };
    $("apAddExp").onclick = function () { if ($("apExp").children.length < 8) $("apExp").insertAdjacentHTML("beforeend", expRow()); };
    $("apAddCert").onclick = function () { if ($("apCerts").children.length < 8) $("apCerts").insertAdjacentHTML("beforeend", certRow()); };
    $("apAddTool").onclick = function () { if ($("apTools2").children.length < 20) addTool(""); };
    el.querySelector("#apSugg").onclick = function (e) { var b = e.target.closest("[data-add-tool]"); if (!b) return; addTool(b.dataset.addTool); b.disabled = true; };
    form.addEventListener("click", function (e) { var rm = e.target.closest("[data-rm]"); if (rm) rm.closest(".ap-row").remove(); });
    $("apWhy").oninput = function () { $("apCount").textContent = $("apWhy").value.length; };
    $("apCertFiles").onchange = function () { listFiles($("apCertFiles"), $("apCertList")); };
    $("apResume").onchange = function () { listFiles($("apResume"), $("apResumeList")); };
    form.onsubmit = function (e) {
      e.preventDefault(); show("");
      var need = function (id, msg) { if (!$(id).value.trim()) { $(id).focus(); throw new Error(msg); } };
      try {
        need("apName", "Enter your full name."); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($("apEmail").value.trim())) { $("apEmail").focus(); throw new Error("Enter a valid email address."); }
        need("apCity", "Enter your city."); need("apCountry", "Enter your country.");
        if ($("apWhy").value.trim().length < 30) { $("apWhy").focus(); throw new Error("Tell us a little more about why you want to join (at least 30 characters)."); }
        var rf = $("apResume").files[0]; if (!rf) throw new Error("Upload your resume.");
        var cf = Array.prototype.slice.call($("apCertFiles").files); if (cf.length > 3) throw new Error("Attach at most 3 certificate files.");
        var all = [rf].concat(cf); all.forEach(function (f) { if (!OK_EXT.test(f.name)) throw new Error(f.name + " must be a PDF, Word, PNG or JPG file."); if (f.size > MAX_FILE) throw new Error(f.name + " is larger than 2 MB."); });
        if (all.reduce(function (n, f) { return n + f.size; }, 0) > MAX_TOTAL) throw new Error("The files together must be under 3 MB.");
        if (!$("apConsent").checked) throw new Error("Please tick the consent box.");
      } catch (x) { show(x.message); return; }
      var app = { position: $("apPos").value, name: $("apName").value.trim(), email: $("apEmail").value.trim(), phone: $("apPhone").value.trim(), links: $("apLinks").value.trim(), education: $("apEdu").value.trim(), years: $("apYears").value.trim(), availability: $("apAvail").value.trim(), why: $("apWhy").value.trim(),
        address: { line1: $("apL1").value.trim(), city: $("apCity").value.trim(), region: $("apRegion").value.trim(), postal: $("apPostal").value.trim(), country: $("apCountry").value.trim() },
        experience: rows($("apExp")).filter(function (x) { return x.company || x.title; }), certifications: rows($("apCerts")).filter(function (x) { return x.name; }), tools: rows($("apTools2")).filter(function (x) { return x.name; }) };
      var btn = $("apSubmit"); btn.disabled = true; btn.textContent = "Sending...";
      Promise.all([readFile(rf), Promise.all(cf.map(readFile))]).then(function (fs) {
        var body = Object.assign({}, app, { consent: true, website: $("apWebsite").value, resume: fs[0], certFiles: fs[1] });
        return fetch("/api/apply", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Requested-With": "schritt" }, body: JSON.stringify(body) }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, json: j }; }); });
      }).then(function (res) {
        if (res.status === 200) return done(el, job, nav);
        btn.disabled = false; btn.textContent = "Submit application";
        if (res.status === 503 || res.status === 404) return fallback(el, app, job, nav);
        show(res.json && res.json.error ? "We could not send it: " + res.json.error + "." : "We could not send it. Please try again in a moment.");
      }).catch(function (x) { btn.disabled = false; btn.textContent = "Submit application"; show(x && x.message && !/fetch/i.test(x.message) ? x.message : "Could not reach the server. Check your connection and try again."); });
    };
  }
  function done(el, job, nav) {
    el.querySelector("#apForm").outerHTML = '<div class="ap-done"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="5"/><path d="M24 41l11 11 21-24" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><h3>Application sent</h3><p>Thank you. The Schritt team has received your application for <b>' + esc(job.title) + '</b> and will reply to the email you gave.</p><button class="btn" data-pg="careers">Back to careers</button></div>';
    nav(); var m = document.getElementById("pgMain"); if (m) m.scrollTop = 0;
  }
  function fallback(el, app, job, nav) {
    var m = careerMail(), text = summaryText(app), url = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    var mail = m ? "mailto:" + m + "?subject=" + encodeURIComponent("Application: " + app.position + " - " + app.name) + "&body=" + encodeURIComponent(text.slice(0, 1500)) : "";
    el.querySelector("#apForm").outerHTML = '<div class="ap-done warn"><h3>One more step</h3><p>Online sending is not switched on for this site yet, so nothing has been sent. Your answers are ready: download them, or open an email, then attach your resume and certificates yourself' + (m ? " and send it to <b>" + esc(m) + "</b>" : "") + ".</p><div class=\"pgx-row\"><a class=\"btn\" href=\"" + url + "\" download=\"application-" + esc(app.name.replace(/[^\w]+/g, "-").toLowerCase()) + ".txt\">Download my application</a>" + (mail ? '<a class="btn secondary" href="' + esc(mail) + '">Open email</a>' : "") + '<button class="btn ghost" data-pg="careers">Back to careers</button></div></div>';
    nav();
  }
  root.Apply = { html: html, wire: wire };
})(window);

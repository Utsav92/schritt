// Drives the application form in headless Chrome against the local site; /api/apply is intercepted so nothing is really sent.
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs"), os = require("os");
const base = process.argv[2] || "http://localhost:8880/index.html";
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "apply-")), pdf = path.join(tmp, "cv.pdf"), png = path.join(tmp, "cert.png"), bad = path.join(tmp, "x.exe");
  fs.writeFileSync(pdf, Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(900, 5)])); fs.writeFileSync(png, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]), Buffer.alloc(400, 2)])); fs.writeFileSync(bad, "MZ");
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--no-sandbox"] });
  const ctx = await b.createBrowserContext(), p = await ctx.newPage(); await p.setViewport({ width: 1280, height: 900 });
  const errs = [], posts = []; p.on("pageerror", (e) => errs.push(e.message));
  let mode = "ok"; await p.setRequestInterception(true);
  p.on("request", (r) => { if (r.url().endsWith("/api/apply")) { posts.push(JSON.parse(r.postData())); const code = mode === "ok" ? 200 : mode === "off" ? 503 : 400; r.respond({ status: code, contentType: "application/json", body: JSON.stringify(mode === "bad" ? { error: "Resume must be under 2 MB" } : { ok: true }) }); } else r.continue(); });
  await p.goto(base + "?apply=" + Date.now(), { waitUntil: "networkidle0" });
  const out = {};
  await p.evaluate(() => Pages.open("careers")); await new Promise((r) => setTimeout(r, 600));
  out.roles = await p.evaluate(() => document.querySelectorAll(".pgx-job").length);
  out.applyBtns = await p.evaluate(() => [...document.querySelectorAll("[data-pg^='apply:']")].map((b) => b.dataset.pg));
  await p.screenshot({ path: path.join(__dirname, "stills", "pages", "careers-jobs.png") });
  await p.click(".pgx-job:nth-child(2) summary"); await new Promise((r) => setTimeout(r, 300)); await p.click("[data-pg='apply:1']"); await new Promise((r) => setTimeout(r, 700));
  out.heroTitle = await p.evaluate(() => document.querySelector(".pgx-hero h2").innerText); out.preselected = await p.evaluate(() => document.getElementById("apPos").value); out.navCareers = await p.evaluate(() => document.querySelector("[aria-current=page]").innerText);
  // empty submit => message
  await p.click("#apSubmit"); out.emptyErr = await p.evaluate(() => document.getElementById("apErr").innerText);
  const T = async (sel, v) => { await p.click(sel, { clickCount: 3 }); await p.type(sel, v); };
  await T("#apName", "Asha Rao"); await T("#apEmail", "asha@example.com"); await T("#apPhone", "+91 98765 43210"); await T("#apLinks", "https://github.com/asha");
  await T("#apL1", "12 Park Road"); await T("#apCity", "Pune"); await T("#apRegion", "Maharashtra"); await T("#apPostal", "411001"); await T("#apCountry", "India");
  await p.type("#apExp [data-k=company]", "Acme Labs"); await p.type("#apExp [data-k=title]", "ML Engineer"); await p.type("#apExp [data-k=from]", "2020"); await p.type("#apExp [data-k=summary]", "Built ranking models for 2M users.");
  await p.click("#apAddExp"); out.expRows = await p.evaluate(() => document.querySelectorAll("#apExp .ap-row").length);
  await T("#apYears", "5"); await T("#apEdu", "BSc Computer Science"); await T("#apAvail", "1 month");
  await p.type("#apCerts [data-k=name]", "TensorFlow Developer"); await p.type("#apCerts [data-k=issuer]", "Google"); await p.type("#apCerts [data-k=year]", "2022");
  await p.click("#apSugg [data-add-tool]"); await p.click("#apSugg [data-add-tool]:not(:disabled)"); await p.select("#apTools2 .ap-row:first-child [data-k=level]", "Expert");
  out.toolRows = await p.evaluate(() => document.querySelectorAll("#apTools2 .ap-row").length);
  await p.type("#apWhy", "I love tools that teach kindly and honestly, and I want to help build them.");
  // wrong file type first
  await (await p.$("#apResume")).uploadFile(bad); await p.click("#apConsent"); await p.click("#apSubmit"); out.badFileErr = await p.evaluate(() => document.getElementById("apErr").innerText);
  await (await p.$("#apResume")).uploadFile(pdf); await (await p.$("#apCertFiles")).uploadFile(png);
  out.fileChips = await p.evaluate(() => document.querySelectorAll(".ap-files span").length);
  await p.screenshot({ path: path.join(__dirname, "stills", "pages", "apply-form.png"), fullPage: false });
  await p.evaluate(() => document.getElementById("pgMain").scrollTo(0, 1400)); await new Promise((r) => setTimeout(r, 300)); await p.screenshot({ path: path.join(__dirname, "stills", "pages", "apply-form2.png") });
  // 1) server error text
  mode = "bad"; await p.click("#apSubmit"); await new Promise((r) => setTimeout(r, 600)); out.serverErr = await p.evaluate(() => document.getElementById("apErr").innerText);
  // 2) not switched on => fallback
  mode = "off"; await p.click("#apSubmit"); await new Promise((r) => setTimeout(r, 600)); out.fallback = await p.evaluate(() => ({ h: document.querySelector(".ap-done h3")?.innerText, dl: !!document.querySelector(".ap-done a[download]"), mail: document.querySelector(".ap-done a[href^='mailto:']")?.href.slice(0, 40) }));
  await p.screenshot({ path: path.join(__dirname, "stills", "pages", "apply-fallback.png") });
  // 3) success: reopen the form, fill minimal, submit
  await p.evaluate(() => Pages.open("apply:0")); await new Promise((r) => setTimeout(r, 500));
  await T("#apName", "Leo Park"); await T("#apEmail", "leo@example.com"); await T("#apCity", "Seoul"); await T("#apCountry", "South Korea"); await p.type("#apWhy", "Learning should feel good and respect your privacy; I want to work on that.");
  await (await p.$("#apResume")).uploadFile(pdf); await p.click("#apConsent"); mode = "ok"; await p.click("#apSubmit"); await new Promise((r) => setTimeout(r, 700));
  out.success = await p.evaluate(() => document.querySelector(".ap-done h3")?.innerText);
  const last = posts[posts.length - 1]; out.payload = { position: last.position, name: last.name, tools: last.tools, resumeName: last.resume.name, resumeB64: last.resume.data.length > 10, certFiles: last.certFiles.length, consent: last.consent };
  const first = posts[0]; out.firstPayload = { position: first.position, exp: first.experience.length, certs: first.certifications.length, tools: first.tools, certFiles: first.certFiles.map((f) => f.name), years: first.years, addr: first.address };
  await p.screenshot({ path: path.join(__dirname, "stills", "pages", "apply-done.png") });
  out.stored = await p.evaluate(() => JSON.stringify(localStorage).includes("Asha") || JSON.stringify(sessionStorage).includes("Asha"));
  console.log(JSON.stringify(out, null, 1)); console.log("page errors:", errs.length ? errs : "none");
  await b.close();
})();

/* Schritt Plus: payment settings. Edit this file, nothing else is needed for the client side.

   HOW TO CONNECT YOUR STRIPE ACCOUNT (no secret key goes in this file):
   1. Stripe Dashboard > Product catalog > create a product "Schritt Plus" with two recurring prices
      (monthly and yearly). Use the same amounts you show below.
   2. Stripe Dashboard > Payment Links > create one link per price. In "After payment" choose
      "Don't show confirmation page" > redirect to
        https://YOUR-DOMAIN/index.html?plus=success&plan=monthly      (and ...&plan=yearly for the yearly link)
      Optional: add metadata  plan = monthly|yearly  on each link (used by the verification server).
   3. Paste the two https://buy.stripe.com/... links below.
   4. Optional but recommended: run stripe-server.js (see README) so Plus is switched on only after Stripe
      confirms the payment, then put its address in verifyUrl.
   5. Optional: Settings > Billing > Customer portal > copy the portal link into portalLink so subscribers can
      manage or cancel.

   Leave a link empty and that plan shows "not connected" instead of a broken button. */
window.SCHRITT_CONFIG = {
  trialDays: 7,
  freeLevels: { lang: ["A1", "A2", "B1"], math: ["G1", "G2", "G3", "G4", "G5", "G6", "G7"], music: ["M1", "M2", "M3"] }, // levels everyone can use in each section; the rest need Plus
  plans: {
    monthly: { price: "$6.99", per: "month", link: "" },
    yearly: { price: "$59.99", per: "year", link: "" }
  },
  /* Ads shown to free accounts after every few finished lessons (never during a lesson). Plus has none.
     creatives = sponsors you have a real agreement with, e.g.
       { sponsor: "Acme", headline: "Try Acme", body: "One line.", cta: "Visit", url: "https://acme.example/?ref=schritt", image: "art/ads/acme.webp" }
     url must be https. image is optional and must live in art/. With no creatives only a Schritt Plus promo is shown. */
  ads: { enabled: false, everyLessons: 3, skipAfterSeconds: 5, creatives: [] },
  legal: { operator: "", contact: "" }, // shown in the privacy policy and terms; fill these in before you go public
  /* Company pages. Leave things empty and they stay hidden. Only https links are used. */
  social: {}, // e.g. { instagram: "https://instagram.com/yourname", youtube: "https://youtube.com/@yourname", x: "https://x.com/yourname" }
  careers: {
    email: "pandyautsav@gmail.com", // where applications go (shown on the Careers page)
    /* Drafted role descriptions: edit freely before hiring. No salary figures are stated on purpose. */
    openings: [
      {
        title: "Applied AI Engineer", team: "Engineering", location: "Remote, flexible hours", type: "Full-time",
        summary: "Build the AI features that make Schritt feel like a patient personal tutor: lesson generation, answer explanations, pronunciation feedback and the Music Studio.",
        responsibilities: [
          "Design and ship LLM-powered features: explanations for wrong answers, adaptive practice, conversation practice and lyric or lesson drafting.",
          "Build retrieval, prompt and evaluation pipelines so every generated lesson is accurate, level-appropriate (CEFR A1 to C2, grades 1 to 12) and safe for all ages.",
          "Integrate speech and music models (text to speech, speech recognition, ACE-Step based music generation) into the product with sensible latency and cost.",
          "Create automatic and human-in-the-loop evaluations, red-team tests and monitoring for quality, bias and hallucinations.",
          "Work with designers and teachers to turn learning-science ideas into working prototypes within days, not months."
        ],
        qualifications: [
          "3+ years building production software, with at least 1 year shipping features on top of large language models.",
          "Strong Python and TypeScript; comfortable with REST APIs, async programming and testing.",
          "Experience with prompt design, structured outputs, tool calling and retrieval-augmented generation.",
          "A habit of measuring: you build eval sets before you tune prompts.",
          "Clear written communication and care about learners, including children and non-native speakers."
        ],
        tools: ["Python", "TypeScript / Node.js", "Anthropic and OpenAI APIs", "PyTorch", "FastAPI", "Postgres and Redis", "Docker", "Git and CI"],
        nice: ["Multilingual NLP, especially low-resource or right-to-left languages", "Experience with speech or audio models", "Knowledge of spaced repetition or adaptive testing", "Published or open-source ML work", "Teaching or tutoring experience"]
      },
      {
        title: "Machine Learning Engineer", team: "Engineering", location: "Remote, flexible hours", type: "Full-time",
        summary: "Own the models behind personalisation: what to teach next, when to review a word, and how to keep every learner at the edge of their ability.",
        responsibilities: [
          "Build and improve the knowledge-tracing and spaced-repetition models that choose each learner's next question.",
          "Run offline experiments and online A/B tests; turn results into clear decisions with confidence intervals, not hunches.",
          "Create feature pipelines and training jobs that are reproducible, monitored and cheap to run.",
          "Deploy models for low-latency inference, on the server and on the device where privacy matters.",
          "Partner with the content team to detect weak questions, ambiguous answers and translation errors automatically."
        ],
        qualifications: [
          "3+ years of applied machine learning in production (recommendation, ranking, forecasting or similar).",
          "Solid statistics: experiment design, causal inference basics, calibration and metrics for ranking.",
          "Fluent in Python, SQL and one deep learning framework (PyTorch or JAX).",
          "Experience taking models from notebook to monitored service.",
          "Respect for privacy: you can build useful models from minimal data."
        ],
        tools: ["Python", "PyTorch", "scikit-learn", "SQL", "Airflow or similar orchestration", "MLflow or Weights & Biases", "Docker", "ONNX or TensorFlow Lite"],
        nice: ["Item response theory or Bayesian knowledge tracing", "On-device or edge inference", "Federated or differential-privacy techniques", "Education technology background", "Experience with time-series or sequence models"]
      },
      {
        title: "Head of Marketing", team: "Growth", location: "Remote, flexible hours", type: "Full-time",
        summary: "Lead how the world discovers Schritt. Build a brand that is playful, honest and private, and grow an audience of learners who stay.",
        responsibilities: [
          "Own brand, positioning and the annual marketing plan across languages, music and math.",
          "Build the acquisition engine: content and SEO, social video, partnerships with teachers and creators, app-store presence and lifecycle email.",
          "Run a disciplined experiment programme on landing pages, onboarding and retention, and report on it weekly.",
          "Manage the marketing budget, agencies and freelancers; hire and coach the first marketers.",
          "Work with product on launches and community, always honest about what the app does and does not do."
        ],
        qualifications: [
          "7+ years in consumer marketing, including 2+ leading a team or function, ideally in education or consumer apps.",
          "A record of growing a consumer product from early users to a sustained audience, with numbers you can explain.",
          "Strong writing and a good eye for creative; you can brief designers and video editors clearly.",
          "Comfortable with analytics, attribution and growth metrics (acquisition cost, retention, lifetime value).",
          "Judgement about ethics: no dark patterns, no misleading claims."
        ],
        tools: ["Google Analytics 4 and a product analytics tool", "App Store Connect and Google Play Console", "Email and lifecycle tools", "SEO tools", "Figma and Canva", "Video editing tools", "Spreadsheet-based budgeting"],
        nice: ["Experience marketing to several countries and languages", "Creator or teacher community building", "Paid acquisition for apps", "PR and partnerships experience", "Fluency in a second language"]
      },
      {
        title: "Accounts Manager", team: "Finance and Operations", location: "Remote, flexible hours", type: "Full-time",
        summary: "Keep the books accurate and the business healthy: payments, payouts, tax, vendors and the monthly numbers the team relies on.",
        responsibilities: [
          "Run bookkeeping end to end: accounts payable and receivable, bank and card reconciliation and month-end close.",
          "Reconcile income and payouts from payment providers, including refunds, chargebacks and fees.",
          "Prepare monthly management accounts, cash-flow forecasts and budget-versus-actual reports.",
          "Handle sales tax and VAT filings, invoicing, expense policy and relationships with accountants and auditors.",
          "Improve processes and controls as the company grows, and keep records ready for investors or audits."
        ],
        qualifications: [
          "4+ years in accounting or bookkeeping, ideally for a software or consumer-app business.",
          "Accounting qualification or equivalent experience (for example ACCA, CPA, CA or AAT).",
          "Working knowledge of revenue recognition and of VAT or sales tax across countries.",
          "Very accurate, organised and comfortable meeting deadlines.",
          "Discretion with confidential financial and personal information."
        ],
        tools: ["Xero or QuickBooks", "Stripe dashboard and reports", "Excel or Google Sheets", "Expense tools such as Expensify or Ramp", "Payroll software", "Bank portals"],
        nice: ["Experience with app-store payouts and multi-currency accounting", "Basic SQL or scripting to automate reports", "Startup or small-team finance experience", "Experience supporting an audit or fundraising"]
      },
      {
        title: "Head of Human Resources", team: "People", location: "Remote, flexible hours", type: "Full-time",
        summary: "Build the people side of Schritt: hiring, culture, fairness and growth, for a small team that will become a bigger one.",
        responsibilities: [
          "Own hiring end to end: job design, sourcing, structured interviews, offers and a welcoming onboarding.",
          "Define compensation bands, levels, performance and feedback practices that are fair and transparent.",
          "Build a remote-first culture: communication norms, wellbeing, recognition and team rituals.",
          "Ensure compliance with employment law in each country we hire in, working with local advisers.",
          "Handle employee relations with care and confidentiality; coach managers on difficult conversations."
        ],
        qualifications: [
          "8+ years in HR or people operations, with 2+ years leading the function in a startup or fast-growing company.",
          "Experience hiring and managing distributed teams across countries and time zones.",
          "Knowledge of employment law, contracts, payroll and benefits in several jurisdictions, or a clear way to learn them fast.",
          "Skilled in structured interviewing and building inclusive hiring processes.",
          "Calm, fair, a good listener, and trusted with sensitive matters."
        ],
        tools: ["An applicant tracking system (for example Greenhouse or Lever)", "An HRIS (for example Deel, Rippling or BambooHR)", "Google Workspace", "Slack or similar", "Survey tools for engagement and feedback"],
        nice: ["Experience in education or consumer technology", "Experience with equity plans and employer-of-record services", "Training in coaching or mediation", "Fluency in more than one language"]
      }
    ]
  },
  /* Music Studio (your SonicStudioAI backend). See music-studio/README.md. url is where the backend runs. */
  studio: { url: "http://127.0.0.1:8765" },
  portalLink: "",
  verifyUrl: ""
};

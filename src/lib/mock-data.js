// Static demo content for dashboards, library, admin and landing page.

export const TRENDING_TOPICS = [
  { topic: "Ashwagandha", tag: "Supplement", heat: 96, verdict: "proven", delta: "+18%" },
  { topic: "Does turmeric cure cancer?", tag: "Claim Check", heat: 94, verdict: "false", delta: "+41%" },
  { topic: "Magnesium for sleep", tag: "Sleep", heat: 91, verdict: "proven", delta: "+12%" },
  { topic: "Intermittent fasting", tag: "Diet", heat: 89, verdict: "mixed", delta: "+9%" },
  { topic: "Creatine for women", tag: "Fitness", heat: 87, verdict: "proven", delta: "+27%" },
  { topic: "Apple cider vinegar for fat loss", tag: "Trend", heat: 85, verdict: "misleading", delta: "+22%" },
  { topic: "Vitamin D & immunity", tag: "Immunity", heat: 82, verdict: "mixed", delta: "+6%" },
  { topic: "Collagen for skin", tag: "Beauty", heat: 80, verdict: "mixed", delta: "+15%" },
  { topic: "Detox tea cleanse", tag: "Myth Watch", heat: 78, verdict: "false", delta: "+33%" },
  { topic: "Green tea metabolism", tag: "Metabolism", heat: 74, verdict: "mixed", delta: "+4%" },
];

export const SUGGESTED_TOPICS = [
  "Ashwagandha for stress",
  "Does turmeric cure cancer?",
  "Magnesium glycinate for sleep",
  "Is intermittent fasting safe?",
  "Creatine monohydrate benefits",
  "Apple cider vinegar weight loss",
];

export const RECENT_GENERATIONS = [
  {
    id: "gen_8a1",
    topic: "Ashwagandha for stress",
    language: "tanglish",
    tone: "tamil_creator",
    platform: "reels",
    verdict: "proven",
    confidence: 86,
    createdAt: "2026-05-22T07:40:00Z",
    saved: true,
  },
  {
    id: "gen_7b9",
    topic: "Does turmeric cure cancer?",
    language: "en",
    tone: "myth",
    platform: "carousel",
    verdict: "false",
    confidence: 18,
    createdAt: "2026-05-21T15:05:00Z",
    saved: true,
  },
  {
    id: "gen_6c2",
    topic: "Magnesium for sleep",
    language: "ta",
    tone: "doctor",
    platform: "shorts",
    verdict: "proven",
    confidence: 83,
    createdAt: "2026-05-21T09:22:00Z",
    saved: false,
  },
  {
    id: "gen_5d4",
    topic: "Intermittent fasting",
    language: "hi",
    tone: "educational",
    platform: "reels",
    verdict: "mixed",
    confidence: 64,
    createdAt: "2026-05-20T18:30:00Z",
    saved: false,
  },
  {
    id: "gen_4e7",
    topic: "Apple cider vinegar weight loss",
    language: "tanglish",
    tone: "viral",
    platform: "tiktok",
    verdict: "misleading",
    confidence: 41,
    createdAt: "2026-05-20T11:12:00Z",
    saved: true,
  },
  {
    id: "gen_3f8",
    topic: "Creatine for women",
    language: "en",
    tone: "professional",
    platform: "twitter",
    verdict: "proven",
    confidence: 92,
    createdAt: "2026-05-19T14:48:00Z",
    saved: false,
  },
];

export const SAVED_LIBRARY = RECENT_GENERATIONS.filter((g) => g.saved);

export const USAGE_HISTORY = [
  { date: "Mon", generations: 4, verifications: 4 },
  { date: "Tue", generations: 7, verifications: 9 },
  { date: "Wed", generations: 5, verifications: 6 },
  { date: "Thu", generations: 11, verifications: 13 },
  { date: "Fri", generations: 9, verifications: 10 },
  { date: "Sat", generations: 14, verifications: 17 },
  { date: "Sun", generations: 6, verifications: 8 },
];

export const STAT_CARDS = [
  { label: "Generations", value: 56, hint: "this month", trend: "+23%" },
  { label: "Avg. Confidence", value: "74%", hint: "evidence score", trend: "+4%" },
  { label: "Claims Verified", value: 67, hint: "research checks", trend: "+31%" },
  { label: "Languages Used", value: 5, hint: "of 7 supported", trend: "new" },
];

/* --------------------------- Landing page ----------------------------- */

export const TRUST_SOURCES = [
  { name: "PubMed", note: "37M+ citations", abbr: "PM" },
  { name: "NIH", note: "National Institutes of Health", abbr: "NIH" },
  { name: "WHO", note: "World Health Organization", abbr: "WHO" },
  { name: "FDA", note: "U.S. Food & Drug Admin.", abbr: "FDA" },
  { name: "ClinicalTrials.gov", note: "470K+ studies", abbr: "CT" },
];

export const FEATURES = [
  {
    icon: "shield-check",
    title: "Scientific Verification",
    desc: "Every topic is checked against peer-reviewed research before a single word is written.",
  },
  {
    icon: "languages",
    title: "Multilingual Creator Mode",
    desc: "Native-feel output in English, Tamil, Tanglish, Hindi, Malayalam, Telugu & Kannada — never literal translation.",
  },
  {
    icon: "flame",
    title: "Viral Reel Scripts",
    desc: "Platform-native hooks, scripts and carousels engineered for retention and shares.",
  },
  {
    icon: "book-open",
    title: "Research Citations",
    desc: "Auto-attached source cards with study type, sample size and evidence strength.",
  },
  {
    icon: "gauge",
    title: "Confidence Scoring",
    desc: "A transparent 0–100 evidence score so your audience always sees the certainty level.",
  },
  {
    icon: "alert-triangle",
    title: "Misinformation Detection",
    desc: "The safety engine flags dangerous 'cure' claims and reframes them responsibly.",
  },
];

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Enter a topic",
    desc: "Type any supplement, condition, claim or wellness trend into the AI workspace.",
  },
  {
    step: 2,
    title: "AI verifies the science",
    desc: "The engine cross-checks PubMed, NIH, WHO & FDA and returns a confidence score.",
  },
  {
    step: 3,
    title: "Generate multilingual content",
    desc: "Produce reels, shorts, carousels and captions in 7 languages with one click.",
  },
  {
    step: 4,
    title: "Export & publish",
    desc: "Send straight to Instagram, YouTube Shorts, TikTok or a teleprompter — citations attached.",
  },
];

export const SHOWCASE = [
  {
    lang: "Tanglish",
    flag: "🔥",
    topic: "Magnesium for sleep",
    text: "Magnesium use panna sleep quality improve ஆகலாம் nu studies suggest panranga 😴 — aana deficiency irundha mattum dhaan periya effect. Confidence: 83% 🔬",
  },
  {
    lang: "Tamil",
    flag: "🇮🇳",
    topic: "Ashwagandha",
    text: "தினமும் Ashwagandha எடுத்தா மன அழுத்தம் கொஞ்சம் குறையுதுன்னு ஆராய்ச்சி சொல்லுது — ஆனா மருத்துவரை கேட்டுட்டு பண்ணுங்க. நம்பகத்தன்மை: 86%",
  },
  {
    lang: "English",
    flag: "🌐",
    topic: "Turmeric & cancer",
    text: "Turmeric does NOT cure cancer. It has mild anti-inflammatory effects — that's the honest science. Anyone selling it as a cure is selling a myth. Confidence in the cure claim: 18%.",
  },
  {
    lang: "Hindi",
    flag: "🇮🇳",
    topic: "Intermittent fasting",
    text: "इंटरमिटेंट फास्टिंग से वज़न थोड़ा कम हो सकता है — पर सिर्फ़ इसलिए कि कैलोरी घटती है, जादू से नहीं। भरोसा: 64%।",
  },
];

export const TESTIMONIALS = [
  {
    name: "Dr. Meera Raghavan",
    role: "Physician & Health Educator",
    handle: "@drmeera.health",
    text: "Finally a tool that won't let me overstate a claim. The confidence score and citations appear before the script — it changed how my team reviews content.",
    hue: 190,
  },
  {
    name: "Arjun Selvam",
    role: "Tamil Fitness Creator · 480K",
    handle: "@arjun.fitscience",
    text: "The Tanglish output actually sounds like me, not Google Translate. My reels feel native and my audience trusts the science callouts.",
    hue: 215,
  },
  {
    name: "Priya Nair",
    role: "Wellness Brand Founder",
    handle: "@nourish.priya",
    text: "We scaled to 5 languages without hiring 5 writers. The misinformation flags saved us from a compliance headache twice already.",
    hue: 165,
  },
  {
    name: "Karthik Bose",
    role: "YouTube Shorts Creator · 1.2M",
    handle: "@karthikexplains",
    text: "Research panel on one side, script on the other. It's like Perplexity and a teleprompter had a very productive baby.",
    hue: 235,
  },
];

export const PRICING = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    tagline: "Test the science engine",
    credits: "15 generations / mo",
    features: [
      "All 7 languages",
      "Scientific verification",
      "Confidence scoring",
      "2 export formats",
      "Community support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: 19,
    period: "month",
    tagline: "For solo health creators",
    credits: "300 generations / mo",
    features: [
      "Everything in Free",
      "Side-by-side language compare",
      "All export formats + Teleprompter",
      "Saved content library",
      "Viral hook generator",
      "Priority generation",
    ],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro Research",
    price: 49,
    period: "month",
    tagline: "For studios & agencies",
    credits: "1,500 generations / mo",
    features: [
      "Everything in Creator",
      "Evidence timeline & contradictions",
      "Citation export (APA / MLA)",
      "Content safety scanner",
      "3 team seats",
      "API access",
    ],
    cta: "Start 7-day trial",
    highlight: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "custom",
    tagline: "For brands & health orgs",
    credits: "Unlimited generations",
    features: [
      "Everything in Pro Research",
      "Custom evidence sources",
      "Compliance & moderation tools",
      "SSO + audit logs",
      "Dedicated success manager",
      "SLA & onboarding",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

export const FAQS = [
  {
    q: "How does Magic Script verify medical accuracy?",
    a: "Every topic is matched against an evidence base drawn from PubMed, NIH, WHO, FDA and ClinicalTrials.gov. The engine returns a transparent 0–100 confidence score, an evidence-strength rating and source cards before any creative content is written — so accuracy comes first, not last.",
  },
  {
    q: "Is the multilingual output just machine translation?",
    a: "No. Each language — especially Tamil and Tanglish — uses a dedicated creator-voice pack. Output is written natively and conversationally for that audience, not translated word-for-word from English. A Tanglish reel reads like a real Tamil creator wrote it.",
  },
  {
    q: "How does it prevent medical misinformation?",
    a: "The safety engine blocks diagnoses, dosage prescriptions and 'cure' claims. Dangerous phrasings (e.g. 'cures cancer') are detected, the misinformation-risk meter spikes, and the verdict is hardened to 'False / Unsafe Claim'. The AI reframes the topic responsibly instead of amplifying it.",
  },
  {
    q: "Which languages are supported?",
    a: "English, Tamil, Tanglish (Tamil + English mix), Hindi, Malayalam, Telugu and Kannada — with one-click switching and side-by-side comparison.",
  },
  {
    q: "What are the AI's limitations?",
    a: "Magic Script is a content tool, not a doctor. It never diagnoses, prescribes or replaces medical care. Evidence is summarised from existing research, which evolves over time. Every output ends with a consult-a-professional disclaimer.",
  },
  {
    q: "Can I use the generated content commercially?",
    a: "Yes. Content you generate on a paid plan is yours to publish across Instagram, YouTube, TikTok, X and LinkedIn. Citations are attached so you can substantiate every claim.",
  },
];

/* ----------------------------- Admin ---------------------------------- */

export const ADMIN_STATS = [
  { label: "Total Users", value: 18420, trend: "+12.4%", hint: "1,204 new this week" },
  { label: "Generations", value: 248910, trend: "+19.8%", hint: "8,930 today" },
  { label: "Flagged Claims", value: 312, trend: "+6.1%", hint: "27 awaiting review" },
  { label: "MRR", value: "$42.8K", trend: "+9.3%", hint: "from 2,140 paid seats" },
];

export const ADMIN_GROWTH = [
  { month: "Dec", users: 6200, mrr: 14 },
  { month: "Jan", users: 8100, mrr: 19 },
  { month: "Feb", users: 10400, mrr: 24 },
  { month: "Mar", users: 12900, mrr: 31 },
  { month: "Apr", users: 15600, mrr: 37 },
  { month: "May", users: 18420, mrr: 43 },
];

export const ADMIN_LANGUAGE_SPLIT = [
  { name: "English", value: 38, color: "#5b8cff" },
  { name: "Tanglish", value: 24, color: "#22d3ee" },
  { name: "Tamil", value: 16, color: "#2dd4bf" },
  { name: "Hindi", value: 12, color: "#818cf8" },
  { name: "Others", value: 10, color: "#475569" },
];

export const ADMIN_API_USAGE = [
  { source: "PubMed", calls: 142300, share: 41 },
  { source: "NIH", calls: 86400, share: 25 },
  { source: "WHO", calls: 58100, share: 17 },
  { source: "FDA", calls: 41200, share: 12 },
  { source: "ClinicalTrials.gov", calls: 17600, share: 5 },
];

export const MODERATION_QUEUE = [
  {
    id: "flg_201",
    topic: "Turmeric cures stage 4 cancer in 30 days",
    user: "wellness_guru_88",
    risk: 97,
    verdict: "false",
    flaggedFor: "Unproven cure claim · serious disease",
    status: "pending",
    at: "2026-05-22T06:10:00Z",
  },
  {
    id: "flg_202",
    topic: "Stop your diabetes medication and drink karela juice",
    user: "natural_healer_in",
    risk: 99,
    verdict: "false",
    flaggedFor: "Advises replacing medication",
    status: "pending",
    at: "2026-05-22T05:02:00Z",
  },
  {
    id: "flg_203",
    topic: "Apple cider vinegar melts belly fat overnight",
    user: "fitlife.deepa",
    risk: 81,
    verdict: "misleading",
    flaggedFor: "Exaggerated weight-loss claim",
    status: "pending",
    at: "2026-05-21T19:44:00Z",
  },
  {
    id: "flg_204",
    topic: "Detox tea flushes all toxins from your liver",
    user: "teatox_official",
    risk: 88,
    verdict: "false",
    flaggedFor: "Unverified detox claim",
    status: "reviewing",
    at: "2026-05-21T16:20:00Z",
  },
  {
    id: "flg_205",
    topic: "Vitamin C megadose prevents all infections",
    user: "immunity.raj",
    risk: 72,
    verdict: "misleading",
    flaggedFor: "Overstated prevention claim",
    status: "pending",
    at: "2026-05-21T12:08:00Z",
  },
  {
    id: "flg_206",
    topic: "Ashwagandha dosage for teenagers",
    user: "supplement.ta",
    risk: 44,
    verdict: "mixed",
    flaggedFor: "Dosage guidance request",
    status: "resolved",
    at: "2026-05-20T22:15:00Z",
  },
];

export const ADMIN_RECENT_USERS = [
  { name: "Aarav Krishnan", email: "creator@gmail.com", plan: "creator", gen: 56, at: "2026-05-22T07:40:00Z" },
  { name: "Lakshmi Iyer", email: "lakshmi.health@gmail.com", plan: "pro", gen: 214, at: "2026-05-22T05:30:00Z" },
  { name: "Sana Qureshi", email: "sana.wellness@outlook.com", plan: "creator", gen: 41, at: "2026-05-21T20:10:00Z" },
  { name: "Dev Menon", email: "dev.fit@gmail.com", plan: "free", gen: 9, at: "2026-05-21T14:55:00Z" },
  { name: "Ananya Rao", email: "ananya.nutri@gmail.com", plan: "pro", gen: 178, at: "2026-05-21T09:18:00Z" },
];

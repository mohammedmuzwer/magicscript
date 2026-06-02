// Static bucket config + trending subtopics for the Reels Agent
// Cache key format: reels_topics_[bucket]_[timestamp] — TTL 4 hours

export const BUCKETS = [
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: "🌿",
    accent: "emerald",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    activeBg: "bg-emerald-500",
    topics: [
      "Morning sunlight and cortisol reset",
      "Why walking after meals works",
      "Cold shower benefits — real science",
      "Sleep debt is real — here's the fix",
      "Screen time and melatonin suppression",
      "Circadian rhythm and productivity",
    ],
  },
  {
    id: "weight-loss",
    label: "Weight Loss",
    icon: "🔥",
    accent: "orange",
    color: "#f97316",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    activeBg: "bg-orange-500",
    topics: [
      "Ozempic side effects — what they hide",
      "Why crash diets fail long term",
      "Visceral fat and insulin resistance",
      "Sleep and metabolism connection",
      "Calorie deficit myths — the truth",
      "Why you plateau after 2 weeks",
    ],
  },
  {
    id: "kids",
    label: "Kids",
    icon: "🧒",
    accent: "sky",
    color: "#0ea5e9",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    activeBg: "bg-sky-500",
    topics: [
      "Screen time and dopamine in children",
      "Why kids skip breakfast — the risk",
      "Iron deficiency and learning in school",
      "Sugar and ADHD — what science says",
      "Sleep hours for growing children",
      "Gut health and immunity in kids",
    ],
  },
  {
    id: "gut-secrets",
    label: "Gut Secrets",
    icon: "🦠",
    accent: "amber",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    activeBg: "bg-amber-500",
    topics: [
      "Leaky gut — real condition or myth?",
      "Probiotics — who actually needs them",
      "Why bloating happens after 40",
      "Gut-brain axis explained simply",
      "Fermented food vs probiotic pills",
      "Antibiotics destroying your microbiome",
    ],
  },
  {
    id: "diabetes",
    label: "Diabetes",
    icon: "💉",
    accent: "red",
    color: "#ef4444",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    activeBg: "bg-red-500",
    topics: [
      "Pre-diabetes reversal — is it possible?",
      "Rice and blood sugar — Tamil diet truth",
      "Metformin side effects no one tells you",
      "Walking vs gym for diabetes control",
      "Dawn phenomenon — why fasting sugar spikes",
      "Cinnamon for blood sugar — evidence?",
    ],
  },
  {
    id: "metabolic",
    label: "Metabolic Disease",
    icon: "⚡",
    accent: "purple",
    color: "#a855f7",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    activeBg: "bg-purple-500",
    topics: [
      "Fatty liver — silent epidemic in India",
      "Thyroid and weight gain — real link",
      "PCOD vs PCOS — what's the difference",
      "Uric acid and metabolic syndrome",
      "Triglycerides — the forgotten marker",
      "Metabolic flexibility — what is it?",
    ],
  },
  {
    id: "women-health",
    label: "Women Health",
    icon: "🌸",
    accent: "rose",
    color: "#f43f5e",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    activeBg: "bg-rose-500",
    topics: [
      "PCOS and insulin resistance link",
      "Perimenopause symptoms nobody talks about",
      "Iron deficiency in menstruating women",
      "Hormonal acne — root cause explained",
      "Bone density after 35 — what to do",
      "Estrogen dominance — signs and fixes",
    ],
  },
];

export const getBucketById = (id) => BUCKETS.find((b) => b.id === id) || null;

export const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export function getCachedTopics(bucketId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`reels_topics_${bucketId}`);
    if (!raw) return null;
    const { topics, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return topics;
  } catch {
    return null;
  }
}

export function setCachedTopics(bucketId, topics) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `reels_topics_${bucketId}`,
      JSON.stringify({ topics, ts: Date.now() })
    );
  } catch {}
}

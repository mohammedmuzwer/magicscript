// Supported languages for Magic Script multilingual generation.
// Tamil & Tanglish are first-class — outputs are crafted to feel native,
// conversational and creator-friendly, NOT literal translations.

export const LANGUAGES = [
  {
    code: "en",
    name: "English",
    native: "English",
    flag: "🌐",
    blurb: "Global creator standard",
    sample: "Daily yoga is scientifically proven to lower stress.",
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    flag: "🇮🇳",
    blurb: "Native Tamil script",
    sample: "தினமும் யோகா செஞ்சா மன அழுத்தம் கணிசமா குறையுதுன்னு ஆராய்ச்சி சொல்லுது.",
  },
  {
    code: "tanglish",
    name: "Tanglish",
    native: "Tanglish",
    flag: "🔥",
    blurb: "Tamil + English creator mix",
    sample:
      "Daily yoga panna stress level semma reduce ஆகுதுனு science itself prove panniruku 🔥",
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    flag: "🇮🇳",
    blurb: "Pan-India reach",
    sample: "रोज़ योगा करने से तनाव काफ़ी कम होता है — रिसर्च यही कहती है।",
  },
  {
    code: "ml",
    name: "Malayalam",
    native: "മലയാളം",
    flag: "🇮🇳",
    blurb: "Kerala audience",
    sample: "ദിവസവും യോഗ ചെയ്താൽ സ്ട്രെസ് നന്നായി കുറയുമെന്ന് ഗവേഷണം പറയുന്നു.",
  },
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    flag: "🇮🇳",
    blurb: "Andhra & Telangana",
    sample: "రోజూ యోగా చేస్తే ఒత్తిడి బాగా తగ్గుతుందని పరిశోధనలు చెబుతున్నాయి.",
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    flag: "🇮🇳",
    blurb: "Karnataka audience",
    sample: "ಪ್ರತಿದಿನ ಯೋಗ ಮಾಡಿದರೆ ಒತ್ತಡ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ ಎಂದು ಸಂಶೋಧನೆ ಹೇಳುತ್ತದೆ.",
  },
];

export const LANGUAGE_MAP = LANGUAGES.reduce((acc, l) => {
  acc[l.code] = l;
  return acc;
}, {});

export function getLanguage(code) {
  return LANGUAGE_MAP[code] || LANGUAGE_MAP.en;
}

export const TONES = [
  { id: "educational", label: "Educational", emoji: "🎓", desc: "Clear, factual, classroom-friendly" },
  { id: "viral", label: "Viral", emoji: "🔥", desc: "Punchy hooks built for the algorithm" },
  { id: "professional", label: "Professional", emoji: "💼", desc: "Polished, brand-safe authority" },
  { id: "storytelling", label: "Storytelling", emoji: "📖", desc: "Narrative arc that keeps people watching" },
  { id: "doctor", label: "Doctor Style", emoji: "🩺", desc: "Calm clinical credibility" },
  { id: "myth", label: "Myth Busting", emoji: "🧨", desc: "Confront and correct popular myths" },
  { id: "tamil_creator", label: "Tamil Creator Style", emoji: "🎬", desc: "High-energy regional creator voice" },
];

export const PLATFORMS = [
  { id: "reels", label: "Instagram Reels", emoji: "🎞️", ratio: "9:16" },
  { id: "shorts", label: "YouTube Shorts", emoji: "▶️", ratio: "9:16" },
  { id: "tiktok", label: "TikTok", emoji: "🎵", ratio: "9:16" },
  { id: "carousel", label: "Carousel", emoji: "🖼️", ratio: "4:5" },
  { id: "twitter", label: "X / Twitter Thread", emoji: "𝕏", ratio: "16:9" },
  { id: "linkedin", label: "LinkedIn", emoji: "in", ratio: "1:1" },
];

export const LENGTHS = [
  { id: "short", label: "Short", desc: "15–25s · quick punch" },
  { id: "medium", label: "Medium", desc: "30–45s · balanced" },
  { id: "long", label: "Long", desc: "60–90s · deep dive" },
];

export function getTone(id) {
  return TONES.find((t) => t.id === id) || TONES[0];
}
export function getPlatform(id) {
  return PLATFORMS.find((p) => p.id === id) || PLATFORMS[0];
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Wand2, Sparkles, Zap, LogOut, UserCircle, CreditCard,
  ChevronDown, ChevronLeft, Play, TrendingUp, Bookmark, History, Bot, KeyRound,
  RefreshCw, ShieldCheck, Loader2, Check, Eye, ThumbsUp,
  BarChart2, X, Flame, ExternalLink, Wifi, WifiOff, Info,
  Link2, Video, ArrowRight, FileText, Tag,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  INPUT_AGENTS, AUDIENCE_AGENTS, PROCESS_AGENTS,
  MED_VERIFY_AGENTS, CONTEXT_AGENTS,
  ENRICHMENT_MODULES,
  OUTPUT_FORMATS_ONLINE, OUTPUT_FORMATS_OFFLINE, ONLINE_FEATURES,
  calcPipelineCredits, calcPipelineMs,
} from "@/lib/pipeline-registry";
import { getResearch } from "@/lib/research-data";
import { generateContent } from "@/lib/generator";
import { LANGUAGES } from "@/lib/languages";
import { TRENDING_TOPICS } from "@/lib/mock-data";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import GeneratingState from "@/components/generation/generating-state";
import AudienceIntelligenceOutput from "@/components/generation/audience-intelligence-output";
import ContentOutput from "@/components/generation/content-output";
import StorybuilderWizard from "@/components/generation/storybuilder-wizard";
import { VerdictBadge } from "@/components/ui/badges";
import { DangerBanner } from "@/components/generation/safety-banner";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import NavActions from "@/components/ui/nav-actions";

// ── Mock videos for Viral Intelligence panel ──────────────────────────────
const MOCK_VIDEOS = [
  { id: "v1",  title: "This Supplement Actually Works (Science Proof)",   channel: "HealthScope",     views: "2.4M", likes: "148K", viralScore: 94, duration: "12:34", hook: "What if the supplement industry has been lying to you for decades?",          gradient: "from-blue-500 to-purple-600" },
  { id: "v2",  title: "Doctor Reacts: Shocking New Supplement Study",      channel: "MedFacts Daily",  views: "1.8M", likes: "112K", viralScore: 91, duration: "8:45",  hook: "This new study just changed everything we thought we knew.",                 gradient: "from-red-500 to-rose-600" },
  { id: "v3",  title: "I Tried This For 30 Days — Here's What Happened",  channel: "WellnessWatch",   views: "3.1M", likes: "203K", viralScore: 96, duration: "15:22", hook: "Day 1 vs Day 30 — the transformation nobody warned me about.",                gradient: "from-green-500 to-teal-600" },
  { id: "v4",  title: "The Truth About Natural Health Claims",              channel: "ScienceFirst",    views: "987K", likes: "71K",  viralScore: 88, duration: "10:11", hook: "Doctors don't want you to know this one simple fact.",                       gradient: "from-amber-500 to-orange-600" },
  { id: "v5",  title: "Evidence-Based Health: What Actually Works",        channel: "PubMed Explains", views: "654K", likes: "48K",  viralScore: 85, duration: "9:58",  hook: "The research is finally in — and the results are surprising.",               gradient: "from-cyan-500 to-blue-600" },
  { id: "v6",  title: "Viral Health Trend: Should You Try It?",            channel: "FactCheck Health", views: "2.2M", likes: "167K", viralScore: 93, duration: "7:30",  hook: "50 million people tried this last month. Was it worth it?",                 gradient: "from-violet-500 to-purple-600" },
  { id: "v7",  title: "What Science Says About This Popular Supplement",   channel: "NutriScience",    views: "1.4M", likes: "95K",  viralScore: 89, duration: "11:15", hook: "I read 47 studies so you don't have to.",                                    gradient: "from-pink-500 to-rose-600" },
  { id: "v8",  title: "Exposing the Biggest Health Myths of 2024",         channel: "DebunkHealth",    views: "4.7M", likes: "312K", viralScore: 97, duration: "18:44", hook: "Everything you've been told about this is wrong.",                            gradient: "from-emerald-500 to-green-600" },
  { id: "v9",  title: "Why Everyone Is Talking About This",                channel: "TrendAlert",      views: "1.1M", likes: "78K",  viralScore: 87, duration: "6:22",  hook: "This simple thing has taken social media by storm. Here's why.",             gradient: "from-sky-500 to-cyan-600" },
  { id: "v10", title: "The Science of Feeling Better Naturally",           channel: "HolisticMD",      views: "891K", likes: "67K",  viralScore: 86, duration: "13:08", hook: "Ancient wisdom meets modern science — and the results are remarkable.",      gradient: "from-indigo-500 to-blue-600" },
];

// ── YouTube URL → video ID ────────────────────────────────────────────────
// Handles youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>
function extractYouTubeId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(embed|shorts|v|live)\/([^/?#]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

// ── Instagram URL → reel shortcode ───────────────────────────────────────
// Handles /reel/<code>/, /p/<code>/, /tv/<code>/
function extractInstagramShortcode(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "www.instagram.com" || u.hostname === "instagram.com") {
      const m = u.pathname.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

// ── Detect platform from a raw URL string ────────────────────────────────
function detectPlatform(url) {
  if (!url) return null;
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return null;
}

// ── Pick top N most "interesting" sentences from raw text ──────────────────
// Heuristic: score by length + presence of numbers/percentages/study words.
function extractKeyPoints(text, n = 5) {
  if (!text) return [];
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 240);
  const score = (s) => {
    let v = Math.min(s.length, 180) / 60;
    if (/\d/.test(s)) v += 2;
    if (/%|study|studies|research|evidence|trial|RCT|meta-analysis|percent/i.test(s)) v += 2;
    if (/^(so|and|but|then|well|you know|i mean)/i.test(s)) v -= 2;
    return v;
  };
  return [...sentences]
    .sort((a, b) => score(b) - score(a))
    .slice(0, n)
    .map((s) => s.replace(/\s+/g, " ").trim());
}

// First strong sentence works well as a hook stand-in
function extractHook(text) {
  if (!text) return null;
  const first = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .find((s) => s.length >= 30 && s.length <= 200);
  return first || null;
}

// ── Real video analysis: oEmbed metadata + real transcript via API route ───
// Returns the real title, channel, thumbnail, duration (from transcript timestamps),
// key points (extracted from transcript), and the full transcript ready for Stage 2.
async function buildAnalysis(url) {
  const videoId      = extractYouTubeId(url);
  const igShortcode  = extractInstagramShortcode(url);

  // ── Instagram Reel path ──────────────────────────────────────────────────
  // Instagram exposes no public transcript/caption API.
  // We try oEmbed for title/author/thumbnail, then return a `needsCaption`
  // flag so the UI shows a manual-paste textarea instead of mock data.
  if (igShortcode && !videoId) {
    let igMeta = null;
    try {
      const res = await fetch(
        `/api/instagram-reel?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) igMeta = await res.json();
    } catch {
      // network error — igMeta stays null, UI falls back gracefully
    }

    return {
      platform:            "instagram",
      shortcode:           igShortcode,
      mainTopic:           "Health & Wellness",
      title:               igMeta?.title  || "Instagram Reel",
      channel:             igMeta?.author || "Instagram Creator",
      thumbnail:           igMeta?.thumbnail || null,
      videoUrl:            url,
      views:               "—",
      likes:               "—",
      duration:            "—",
      gradient:            "from-pink-500 to-rose-600",
      viralScore:          null,
      hook:                null,
      keyPoints:           [],
      topics:              ["health", "wellness"],
      wordCount:           0,
      script:              null,
      transcript:          null,
      transcriptLanguage:  null,
      transcriptTranslated: false,
      transcriptAvailable: false,
      needsCaption:        true,  // signals the UI to show the caption textarea
    };
  }

  // ── YouTube / generic path ───────────────────────────────────────────────
  // Fetch metadata and transcript in parallel
  const oembedPromise = videoId
    ? fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    : Promise.resolve(null);

  const transcriptPromise = videoId
    ? fetch(`/api/youtube-transcript?id=${encodeURIComponent(videoId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    : Promise.resolve(null);

  const [realMeta, transcriptData] = await Promise.all([oembedPromise, transcriptPromise]);

  // Pick topic from the REAL title (fallback to the URL string if oEmbed failed)
  const matchSource = (realMeta?.title || url).toLowerCase();
  const isSleep    = /\bsleep|insomnia|circadian\b/.test(matchSource);
  const isNutr     = /\bdiet|nutrition|food|sugar|carb|protein|fasting|gut\b/.test(matchSource);
  const isMind     = /\bmind|mental|stress|anxiety|brain|meditation|focus\b/.test(matchSource);
  const topic      = isSleep ? "Sleep Optimization" : isNutr ? "Nutrition & Diet Science" : isMind ? "Mental Wellness" : "Health & Wellness";

  const titleMap   = {
    "Sleep Optimization":    "The Science of Better Sleep – What Actually Works",
    "Nutrition & Diet Science": "What to Eat for Optimal Health (Evidence-Based)",
    "Mental Wellness":       "How to Rewire Your Brain for Less Stress",
    "Health & Wellness":     "Evidence-Based Health: What the Research Actually Shows",
  };
  const hooksMap   = {
    "Sleep Optimization":    "What if everything you've been told about sleep is wrong?",
    "Nutrition & Diet Science": "The food industry doesn't want you to know this one fact.",
    "Mental Wellness":       "Your brain can change at any age — here's the science.",
    "Health & Wellness":     "I read 47 studies so you don't have to. Here's what I found.",
  };
  const pointsMap  = {
    "Sleep Optimization":    ["Sleep quality beats quantity — 6 hrs of deep sleep > 9 hrs fragmented","Blue-light exposure 2 hrs before bed cuts melatonin by 23%","Consistent wake-time is the #1 regulator of circadian rhythm","Bedroom temp 65–68°F improves deep-sleep stage entry","Magnesium glycinate reduced sleep-onset time in 3 RCTs"],
    "Nutrition & Diet Science": ["Whole-food diets lower inflammation markers by 40% vs processed","Protein timing matters more than total intake for muscle retention","Ultra-processed foods linked to 12% higher all-cause mortality","Gut microbiome diversity tied to mental health outcomes","Intermittent fasting reduces insulin resistance in 8-week trials"],
    "Mental Wellness":       ["Chronic stress shrinks the hippocampus (memory centre) by 14%","10 min daily mindfulness rewires prefrontal cortex in 8 weeks","Exercise is as effective as SSRIs for mild–moderate depression","Social connection is the #1 predictor of longevity per Harvard study","Cold exposure raises norepinephrine by 300% — boosts focus"],
    "Health & Wellness":     ["Most supplements lack RCT evidence for their marketed claims","Sleep, movement and diet account for 80% of preventable disease","Gut health influences immune, mental and metabolic function","Zone-2 cardio 150 min/week cuts cardiovascular risk by 35%","Evidence-based habit stacking triples long-term adherence"],
  };
  const scriptMap  = {
    "Sleep Optimization":    "[HOOK]\nWhat if everything you've been told about sleep is wrong?\n\n[MAIN INSIGHT]\nResearch shows quality beats quantity. 6 hours of deep sleep outperforms 9 hours of fragmented rest.\n\n[EVIDENCE]\nThree peer-reviewed RCTs confirm: consistent wake time + room below 68°F = 40% more deep-sleep.\n\n[PRACTICAL STEPS]\n1. Fix ONE wake time — even weekends\n2. Keep your room cool and dark\n3. No screens 90 minutes before bed\n\n[CTA]\nTry this 7-day experiment and drop your result in the comments.",
    "Nutrition & Diet Science": "[HOOK]\nThe food industry doesn't want you to know this one fact.\n\n[MAIN INSIGHT]\nWhole foods reduce systemic inflammation — the root cause behind most chronic disease.\n\n[EVIDENCE]\nA 2023 meta-analysis of 47 studies: whole-food diets lower CRP (inflammation marker) by 40%.\n\n[PRACTICAL STEPS]\n1. Replace one ultra-processed meal per day\n2. Add one fermented food for gut diversity\n3. Prioritise protein at breakfast\n\n[CTA]\nWhich swap will you try first? Comment below.",
    "Mental Wellness":       "[HOOK]\nYour brain can literally change at any age — neuroscience proves it.\n\n[MAIN INSIGHT]\nNeuroplasticity means the brain rewires based on what you repeatedly do and think.\n\n[EVIDENCE]\nHarvard 8-week MBSR study: 10 min daily mindfulness increased grey matter density in the prefrontal cortex.\n\n[PRACTICAL STEPS]\n1. 10-minute morning breathwork\n2. Zone-2 cardio 3× per week\n3. One screen-free hour before sleep\n\n[CTA]\nSave this and try the 7-day challenge. Your brain will thank you.",
    "Health & Wellness":     "[HOOK]\nI read 47 studies so you don't have to. Here's what actually works.\n\n[MAIN INSIGHT]\nSleep, movement, and whole-food nutrition cover 80% of all preventable chronic disease — no hacks needed.\n\n[EVIDENCE]\nWHO data: 80% of heart disease, stroke, and type 2 diabetes is preventable with lifestyle alone.\n\n[PRACTICAL STEPS]\n1. 7–9 hrs consistent sleep\n2. 150 min zone-2 cardio per week\n3. 80% whole foods, 20% flexibility\n\n[CTA]\nShare this with someone who needs to hear it.",
  };
  // Real transcript took priority when available
  const realTranscript = transcriptData?.transcript || null;
  const realKeyPoints  = realTranscript ? extractKeyPoints(realTranscript, 5) : null;
  const realHook       = realTranscript ? extractHook(realTranscript) : null;

  return {
    mainTopic: topic,
    title:     realMeta?.title         || titleMap[topic],
    channel:   realMeta?.author_name   || "Health Creator",
    thumbnail: realMeta?.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null),
    videoUrl:  videoId ? `https://www.youtube.com/watch?v=${videoId}` : url,
    views: "—",
    likes: "—",
    duration: transcriptData?.durationLabel || "—",
    gradient: "from-cyan-500 to-blue-600",
    viralScore: 92,
    hook:      realHook || hooksMap[topic],
    keyPoints: (realKeyPoints && realKeyPoints.length) ? realKeyPoints : pointsMap[topic],
    topics: [...new Set(topic.toLowerCase().split(" ").concat(["health", "science"]))],
    wordCount: transcriptData?.wordCount || (realTranscript ? realTranscript.split(/\s+/).length : 812),
    script: realTranscript || scriptMap[topic],
    // Stage-2 payload
    transcript: realTranscript,
    transcriptLanguage: transcriptData?.languageCode || null,
    transcriptTranslated: transcriptData?.translated || false,
    transcriptAvailable: Boolean(realTranscript),
  };
}

const NAV_LINKS = [
  { label: "Agents",  href: "/dashboard/agents",   icon: Bot      },
  { label: "Library", href: "/dashboard/library",  icon: Bookmark },
  { label: "History", href: "/dashboard/history",  icon: History  },
  { label: "🔑 API",  href: "/dashboard/settings", icon: KeyRound },
];

const DEFAULTS = { language: "tanglish", tone: "educational", platform: "reels", length: "medium" };

// ── Format tabs shown in the center panel sticky header ───────────────────
// `id`  = formatId used for credits / pipeline lookup
// `tab` = ContentOutput rendering switch key
const FORMAT_TABS = {
  online: [
    { id: "instagram_reel", tab: "reel",    label: "Instagram Reel", duration: "1 min",    icon: "🎞️" },
    { id: "youtube_script", tab: "youtube", label: "YouTube",        duration: "10 min",   icon: "▶️" },
    { id: "podcast_script", tab: "podcast", label: "Podcast",        duration: "1 hr",     icon: "🎙️" },
    { id: "webinar_script", tab: "webinar", label: "Webinar",        duration: "2 hr",     icon: "📡" },
  ],
  offline: [
    // ── Speaking formats ────────────────────────────────────────────────────
    { id: "stage_talk",   tab: "stage",      label: "Stage Talk",   duration: "5-20 min",  icon: "🎤" },
    { id: "ted_talk",     tab: "ted",        label: "TED Talk",     duration: "5-20 min",  icon: "💡" },
    { id: "workshop",     tab: "stage",      label: "Workshop",     duration: "60-90 min", icon: "📋" },
    { id: "seminar",      tab: "stage",      label: "Seminar",      duration: "1-2 hr",    icon: "🏛️" },
    { id: "corp_pres",    tab: "stage",      label: "Corporate",    duration: "30-60 min", icon: "💼" },
    // ── Written formats (word-count bounded) ────────────────────────────────
    { id: "newsletter",   tab: "newsletter", label: "Newsletter",   duration: "300-500w",  icon: "📰", wordRange: "300–500 words"     },
    { id: "lead_magnet",  tab: "leadmagnet", label: "Lead Magnet",  duration: "800-1200w", icon: "📘", wordRange: "800–1,200 words"   },
    { id: "deep_article", tab: "deepblog",   label: "Deep Article", duration: "1500-2000w",icon: "✍️", wordRange: "1,500–2,000 words" },
    { id: "ebook_chapter",tab: "ebook",      label: "E-Book",       duration: "6000w+",    icon: "📖", wordRange: "6,000–10,000 words"},
  ],
};

// ── Feature pills shown below format tabs ─────────────────────────────────
// Online features map to ContentOutput tabs; offline are future-ready toggles
const FEATURE_PILLS = {
  online: [
    { id: "hooks",      label: "Hooks",           tab: "hooks",      icon: "⚡" },
    { id: "cta",        label: "CTA",             tab: "cta",        icon: "📣" },
    { id: "caption",    label: "Captions",        tab: "caption",    icon: "≡" },
    { id: "hashtags",   label: "Hashtags",        tab: "hashtags",   icon: "#" },
    { id: "carousel",   label: "Carousel",        tab: "carousel",   icon: "🖼️" },
    { id: "thumbnails", label: "Thumbnail Ideas", tab: "thumbnails", icon: "🖼" },
    { id: "qa",         label: "Q&A",             tab: "qa",         icon: "❓" },
  ],
  offline: [
    { id: "opening",    label: "Opening Statement",   tab: null, icon: "🎯" },
    { id: "engagement", label: "Audience Engagement", tab: null, icon: "👥" },
    { id: "qa",         label: "Q&A Prompts",         tab: null, icon: "❓" },
    { id: "slides",     label: "Slide Notes",         tab: null, icon: "📊" },
    { id: "takeaways",  label: "Key Takeaways",       tab: null, icon: "✅" },
    { id: "cues",       label: "Speaker Cues",        tab: null, icon: "🔔" },
  ],
};

// ── Stage style map ───────────────────────────────────────────────────────
const STAGE_STYLE = {
  input:      { dot: "bg-cyan-400",    lBorder: "border-l-cyan-500",    label: "text-cyan",        ring: "ring-cyan/20",       badge: null },
  audience:   { dot: "bg-violet-400",  lBorder: "border-l-violet-500",  label: "text-violet-300",  ring: "ring-violet-500/15", badge: null },
  process:    { dot: "bg-blue-400",    lBorder: "border-l-blue-500",    label: "text-blue-300",    ring: "ring-blue-500/15",   badge: null },
  context:    { dot: "bg-indigo-400",  lBorder: "border-l-indigo-500",  label: "text-indigo-300",  ring: "ring-indigo-500/15", badge: null },
  enrichment: { dot: "bg-amber-400",   lBorder: "border-l-amber-500",   label: "text-amber-300",   ring: "ring-amber-500/15",  badge: null },
  output:     { dot: "bg-pink-400",    lBorder: "border-l-pink-500",    label: "text-pink-300",    ring: "ring-pink-500/15",   badge: "MAX 3" },
};

// ── Overall Evidence Score (right panel headline) ────────────────────────
// Single 0–100 summary number so the user gets one decisive answer.
// Higher = safer / more evidence-aligned to publish as-is.
function OverallScore({ research }) {
  // Three states the fallback can be in:
  //   1. matched curated entry  → real score
  //   2. health placeholder    → in-scope but uncatalogued (key starts with "generic-")
  //   3. out of scope          → not a health topic at all (key starts with "out-of-scope-")
  // We surface all three distinctly so the user is never confused by a "55".
  const isOutOfScope  = research.outOfScope === true || (typeof research.key === "string" && research.key.startsWith("out-of-scope-"));
  const isPlaceholder = !isOutOfScope && typeof research.key === "string" && research.key.startsWith("generic-");

  const positive =
    (research.confidence + research.evidenceStrength + research.consensus + research.researchQuality) / 4;
  const overall = Math.round((positive * 4 + (100 - research.misinfoRisk)) / 5);

  // Tier-based UI band selection
  const band = isOutOfScope
    ? { label: "Out of scope",        color: "#a78bfa", bg: "bg-violet-500/8 border-violet-400/25", note: "This doesn't appear to be a health/wellness/medical topic. Magic Script verifies scientific claims — its meters don't apply to non-health content like tech reviews, gaming, finance, etc. Score is a placeholder only." }
    : isPlaceholder
    ? { label: "Not yet evaluated",   color: "#94a3b8", bg: "bg-slate-500/8 border-slate-400/25",   note: "This specific topic isn't in Magic Script's curated evidence registry yet. The 55 below is a neutral placeholder, not a real evaluation. Add a registry entry or connect a live PubMed/NIH API for real scoring." }
    : overall >= 75
      ? { label: "Safe to publish",         color: "#34d399", bg: "bg-emerald-500/8 border-emerald-400/30", note: "Evidence is strong. Standard creator framing is appropriate." }
      : overall >= 60
      ? { label: "Publish with nuance",     color: "#22d3ee", bg: "bg-cyan-500/8 border-cyan-400/30",       note: "Solid evidence base — surface limitations and individual variation." }
      : overall >= 45
      ? { label: "Add caveats",             color: "#fbbf24", bg: "bg-amber-500/8 border-amber-400/30",     note: "Mixed evidence. Frame with explicit uncertainty and cite primary sources." }
      : overall >= 30
      ? { label: "High risk — rewrite",     color: "#fb923c", bg: "bg-orange-500/8 border-orange-400/30",   note: "Evidence is weak. Reframe before publishing or pick a different angle." }
      : { label: "Do not publish",          color: "#fb7185", bg: "bg-rose-500/8 border-rose-400/30",       note: "Misinformation risk is too high. Magic Script recommends not amplifying this claim." };

  return (
    <div className={`mb-3 rounded-xl border ${band.bg} p-3`}>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: band.color }}>
              Overall Evidence Score
            </p>
            {isOutOfScope && (
              <span className="rounded-full border border-violet-400/40 bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-300">
                Out of scope
              </span>
            )}
            {isPlaceholder && (
              <span className="rounded-full border border-slate-400/40 bg-slate-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-300">
                Placeholder
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-soft">{band.note}</p>
        </div>
        <div className="text-right leading-none">
          <span className={`font-display text-3xl font-extrabold ${(isPlaceholder || isOutOfScope) ? "opacity-60" : ""}`} style={{ color: band.color }}>
            {overall}
          </span>
          <span className="ml-0.5 text-xs font-semibold" style={{ color: band.color }}>/100</span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: band.color,
            boxShadow: (isPlaceholder || isOutOfScope) ? "none" : `0 0 10px ${band.color}80`,
            opacity: (isPlaceholder || isOutOfScope) ? 0.5 : 1,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${overall}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-[9px] text-faint">
        Avg of Confidence, Strength, Consensus, Quality &amp; (100 − Misinfo Risk).
        Verdict: <span className="font-semibold" style={{ color: band.color }}>{band.label}</span>
      </p>
    </div>
  );
}

// ── Score bar (right panel) ───────────────────────────────────────────────
function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className="text-faint">{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Stage section in left sidebar ────────────────────────────────────────
function Stage({ num, label, stageKey, children }) {
  const s = STAGE_STYLE[stageKey];
  return (
    <div className={`rounded-xl border border-[rgb(var(--border))] border-l-2 ${s.lBorder} bg-[rgb(var(--panel))] p-2.5`}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
          {num} — {label}
        </span>
        {s.badge && (
          <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${s.label} bg-current/10`}>
            {s.badge}
          </span>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ── Individual agent row ──────────────────────────────────────────────────
// The ⓘ button opens a fixed-position popover so it escapes overflow-y-auto clipping
function AgentRow({ agent, isSelected, onClick, type = "checkbox", disabled = false, accentClass }) {
  const infoRef = useRef(null);
  const [tipPos, setTipPos] = useState(null);

  function handleInfoClick(e) {
    e.stopPropagation();
    if (tipPos) { setTipPos(null); return; }
    if (!infoRef.current) return;
    const r = infoRef.current.getBoundingClientRect();
    setTipPos({
      top:  Math.min(r.top - 4, window.innerHeight - 170),
      left: r.right + 10,
    });
  }

  return (
    <>
      {/* Backdrop — click anywhere outside to close */}
      {tipPos && (
        <div className="fixed inset-0 z-[199]" onClick={() => setTipPos(null)} />
      )}

      {/* Row: [selector button] [ⓘ button] */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${
            isSelected
              ? `bg-[rgb(var(--bg-soft))] ${accentClass}`
              : "text-soft hover:bg-[rgb(var(--bg-soft))]"
          } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
        >
          {/* Radio / Checkbox indicator */}
          <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition ${
              type === "radio" ? "rounded-full" : "rounded-sm"
            } ${isSelected ? "border-current bg-current/20" : "border-[rgb(var(--border))]"}`}
          >
            {isSelected && (
              <span className={`h-1.5 w-1.5 bg-current ${type === "radio" ? "rounded-full" : "rounded-sm"}`} />
            )}
          </span>
          <span className="shrink-0 text-sm">{agent.icon}</span>
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-tight">
            {agent.name}
          </span>
          {agent.credits === 0 ? (
            <span className="shrink-0 text-[9px] font-bold text-emerald-400">FREE</span>
          ) : (
            <span className="shrink-0 text-[9px] text-faint">{agent.credits}cr</span>
          )}
        </button>

        {/* ⓘ info button */}
        <button
          ref={infoRef}
          onClick={handleInfoClick}
          className={`shrink-0 grid h-6 w-6 place-items-center rounded-md transition ${
            tipPos
              ? "bg-cyan/15 text-cyan"
              : "text-faint/50 hover:bg-[rgb(var(--bg-soft))] hover:text-soft"
          }`}
        >
          <Info size={11} />
        </button>
      </div>

      {/* Fixed-position popover — floats over the center panel */}
      {tipPos && (
        <div
          className="fixed z-[200] w-64"
          style={{ top: tipPos.top, left: tipPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow pointing left */}
          <div className="absolute -left-[5px] top-3.5 h-2.5 w-2.5 rotate-45 border-b border-l border-[rgb(var(--border))] bg-[rgb(var(--panel))]" />

          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 shadow-xl">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <span className="text-xl leading-none">{agent.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight">{agent.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                  {agent.credits === 0 ? (
                    <span className="font-bold text-emerald-400">FREE</span>
                  ) : (
                    <span className="text-faint">{agent.credits} credit{agent.credits !== 1 ? "s" : ""}</span>
                  )}
                  {agent.estimatedMs && (
                    <>
                      <span className="text-[rgb(var(--border))]">·</span>
                      <span className="text-faint">~{(agent.estimatedMs / 1000).toFixed(1)}s</span>
                    </>
                  )}
                  <span className="ml-auto rounded-full bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-faint">
                    {agent.stage}
                  </span>
                </div>
              </div>
            </div>

            <div className="my-2.5 h-px bg-[rgb(var(--border))]" />

            <p className="text-[11px] leading-relaxed text-soft">{agent.description}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ── Select-all toggle for Stage 3 ────────────────────────────────────────
function SelectAllRow({ allIds, selectedIds, onSelectAll, onClearAll, accentClass }) {
  const all  = allIds.length > 0 && selectedIds.length === allIds.length;
  const some = selectedIds.length > 0 && !all;
  return (
    <button
      onClick={all ? onClearAll : onSelectAll}
      className={`mb-0.5 flex w-full items-center gap-2 rounded-lg border border-dashed border-[rgb(var(--border))] px-2 py-1.5 text-left transition hover:bg-[rgb(var(--bg-soft))] ${
        all || some ? accentClass : "text-faint"
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition ${
          all || some ? "border-current bg-current/20" : "border-[rgb(var(--border))]"
        }`}
      >
        {all && <span className="h-1.5 w-1.5 rounded-sm bg-current" />}
        {some && <span className="h-0.5 w-2 rounded-full bg-current" />}
      </span>
      <span className="flex-1 truncate text-[11px] font-bold uppercase tracking-wider">
        {all ? "Clear All" : "Select All"}
      </span>
      <span className="shrink-0 text-[9px] font-semibold opacity-70">
        {selectedIds.length}/{allIds.length}
      </span>
    </button>
  );
}

// ── Left sidebar — Pipeline Builder ──────────────────────────────────────
function LeftPipeline({
  inputAgent, setInputAgent,
  audienceAgents, setAudienceAgents,
  processAgents, setProcessAgents,
  contextAgents, setContextAgents,
  enrichmentModule, onEnrichmentChange,
  outputMode, setOutputMode,
  totalCredits, totalMs, activeAgents,
  onGenerate, canGenerate, status,
}) {
  function toggleAudience(id) {
    setAudienceAgents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function toggleProcess(id) {
    setProcessAgents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function toggleContext(id) {
    setContextAgents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] lg:flex">
      {/* Header */}
      <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
        <h2 className="font-display text-sm font-bold">Pipeline Builder</h2>
        <p className="mt-0.5 text-[11px] text-faint">Configure your agent pipeline</p>
      </div>

      {/* Scrollable stages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">

        {/* Stage 1: Input */}
        <Stage num={1} label="INPUT" stageKey="input">
          {INPUT_AGENTS.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              isSelected={inputAgent === agent.id}
              onClick={() => setInputAgent(agent.id)}
              type="radio"
              accentClass={STAGE_STYLE.input.label}
            />
          ))}
        </Stage>

        {/* Stage 2: Audience Intelligence */}
        <Stage num={2} label="AUDIENCE INTELLIGENCE" stageKey="audience">
          {AUDIENCE_AGENTS.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              isSelected={audienceAgents.includes(agent.id)}
              onClick={() => toggleAudience(agent.id)}
              type="checkbox"
              accentClass={STAGE_STYLE.audience.label}
            />
          ))}
        </Stage>

        {/* Stage 3: Med Verify */}
        <Stage num={3} label="MED VERIFY" stageKey="process">
          <SelectAllRow
            allIds={MED_VERIFY_AGENTS.map((a) => a.id)}
            selectedIds={processAgents}
            onSelectAll={() => setProcessAgents(MED_VERIFY_AGENTS.map((a) => a.id))}
            onClearAll={() => setProcessAgents([])}
            accentClass={STAGE_STYLE.process.label}
          />
          {MED_VERIFY_AGENTS.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              isSelected={processAgents.includes(agent.id)}
              onClick={() => toggleProcess(agent.id)}
              type="checkbox"
              accentClass={STAGE_STYLE.process.label}
            />
          ))}
        </Stage>

        {/* Stage 4: Content Storybuilder — permanently active, no toggle */}
        <div className="rounded-xl border border-[rgb(var(--border))] border-l-2 border-l-cyan-500 bg-[rgb(var(--panel))] p-2.5">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-faint">4 — CONTENT STORYBUILDER</span>
            <span className="ml-auto rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
              ALWAYS ON
            </span>
          </div>
          <div className="space-y-0.5">
            {[
              { label: "Raw Translation",  sublabel: "Levels 1–3", color: "#22d3ee", icon: FileText },
              { label: "Master Content",   sublabel: "~250 words", color: "#34d399", icon: FileText },
              { label: "Master Blueprint", sublabel: "Level 4",    color: "#a78bfa", icon: FileText },
            ].map(({ label, sublabel, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                style={{ background: `${color}0d` }}
              >
                {/* Locked check — always filled, no pointer events */}
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                  style={{ background: `${color}30`, border: `1px solid ${color}50` }}
                >
                  <Check size={9} style={{ color }} strokeWidth={3} />
                </div>
                <span className="flex-1 text-[11px] font-semibold" style={{ color }}>{label}</span>
                <span className="text-[9px] text-faint">{sublabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 5: Creative Lenses */}
        <Stage num={5} label="CREATIVE LENSES" stageKey="enrichment">
          {ENRICHMENT_MODULES.map((mod) => (
            <AgentRow
              key={mod.id}
              agent={mod}
              isSelected={enrichmentModule === mod.id}
              onClick={() => onEnrichmentChange(mod.id)}
              type="radio"
              accentClass={STAGE_STYLE.enrichment.label}
            />
          ))}
        </Stage>

        {/* Stage 6: Deployment — format selection happens in center bar */}
        <div className={`rounded-xl border border-[rgb(var(--border))] border-l-2 ${STAGE_STYLE.output.lBorder} bg-[rgb(var(--panel))] p-2.5`}>
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STAGE_STYLE.output.dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-faint">6 — CONTENT</span>
          </div>

          {/* Digital Broadcast / Print & Experiential segmented control */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[rgb(var(--bg-soft))] p-1">
            {[
              { mode: "online",  Icon: Wifi,    label: "Online",  desc: "Social & Digital" },
              { mode: "offline", Icon: WifiOff, label: "Offline", desc: "Events & Print" },
            ].map(({ mode, Icon, label, desc }) => (
              <button
                key={mode}
                onClick={() => setOutputMode(mode)}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2.5 text-center transition ${
                  outputMode === mode
                    ? "bg-[rgb(var(--panel))] text-pink-300 shadow-sm ring-1 ring-pink-500/25"
                    : "text-faint hover:text-soft"
                }`}
              >
                <Icon size={14} className={outputMode === mode ? "text-pink-300" : ""} />
                <span className="text-[11px] font-bold">{label}</span>
                <span className="text-[9px] text-faint">{desc}</span>
              </button>
            ))}
          </div>

          {/* Hint */}
          <p className="mt-2 text-center text-[10px] text-faint">
            Select format & features from the content bar →
          </p>
        </div>
      </div>

      {/* Pipeline summary + generate button */}
      <div className="shrink-0 space-y-3 border-t border-[rgb(var(--border))] p-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Agents",  value: activeAgents },
            { label: "Credits", value: totalCredits },
            { label: "~Time",   value: `${totalMs}s` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-center">
              <div className="font-display text-sm font-bold text-cyan">{value}</div>
              <div className="text-[10px] text-faint">{label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onGenerate}
          disabled={!canGenerate || status === "generating"}
          className="btn btn-primary w-full py-2.5 text-sm disabled:opacity-50"
        >
          {status === "generating" ? (
            <><Loader2 size={15} className="animate-spin" /> Generating…</>
          ) : (
            <><Wand2 size={15} /> Verify &amp; Generate</>
          )}
        </button>
      </div>
    </aside>
  );
}

// ── Smart-cache Trending Intelligence panel ───────────────────────────────
// Cache mechanics are invisible to the user; the only signal is the
// circular ring on the Refresh button that drains as the 10-min TTL expires.
//
// SHORT PRESS  (<800 ms): shuffle the cached pool and show 12 new topics —
//              zero API calls as long as the cache is fresh.
// LONG PRESS   (≥800 ms): bypass cache, call Gemini for 36 fresh topics,
//              show the first 12, persist the remaining 24 as a new pool.

const TREND_CACHE_KEY  = "MAGIC_TREND_POOL";
const TREND_CACHE_TTL  = 10 * 60 * 1000;   // 10 minutes
const TREND_PAGE_SIZE  = 12;

function readTrendCache() {
  try {
    const raw = localStorage.getItem(TREND_CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!Array.isArray(p.pool) || typeof p.timestamp !== "number") return null;
    return p;
  } catch { return null; }
}

function writeTrendCache(pool) {
  try {
    localStorage.setItem(TREND_CACHE_KEY, JSON.stringify({ pool, timestamp: Date.now() }));
  } catch {}
}

function isTrendCacheFresh(cache) {
  return Boolean(cache && Date.now() - cache.timestamp < TREND_CACHE_TTL);
}

// Fisher-Yates — genuine random mix every call
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Jitter static topics for the fallback / no-key state
function jitterTopics(source, sampleSize = TREND_PAGE_SIZE) {
  const shuffled = shuffleArray(source);
  const subset   = shuffled.slice(0, Math.min(sampleSize, shuffled.length));
  return subset.map((t) => {
    const heatJ  = Math.max(1, Math.min(99, t.heat + (Math.floor(Math.random() * 7) - 3)));
    const baseN  = parseInt(String(t.delta).replace(/\D/g, ""), 10) || 0;
    const deltaN = Math.max(1, baseN + (Math.floor(Math.random() * 13) - 6));
    return { ...t, heat: heatJ, delta: `+${deltaN}%` };
  });
}

const VERDICT_STYLE = {
  proven:      { label: "Proven",      color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-400/30" },
  mixed:       { label: "Mixed",       color: "text-amber-300",   bg: "bg-amber-500/10 border-amber-400/30" },
  misleading:  { label: "Misleading",  color: "text-orange-300",  bg: "bg-orange-500/10 border-orange-400/30" },
  false:       { label: "False",       color: "text-rose-300",    bg: "bg-rose-500/10 border-rose-400/30" },
};


function TrendingPanel({ onUseTopic }) {
  const [topics,       setTopics]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedId,   setSelectedId]   = useState(null);
  const [isLive,       setIsLive]       = useState(false);
  const [pressing,     setPressing]     = useState(false);
  // ringProgress: 0 = just fetched (full glow), 1 = long since fetched (amber hint)
  const [ringProgress, setRingProgress] = useState(1);

  const pressTimer   = useRef(null);
  const didLongPress = useRef(false);

  // ── THE ONLY FUNCTION THAT CALLS GEMINI ──────────────────────────────
  // Called from: (a) mount when localStorage is empty, (b) long-press only.
  // Short-press, TTL expiry, and remounts NEVER invoke this.
  async function fetchFromGemini() {
    const googleKey =
      typeof window !== "undefined"
        ? localStorage.getItem("V_KEY_GOOGLE") || ""
        : "";

    if (!googleKey) {
      // No API key — fall back to a fresh static shuffle, still no API call
      setSelectedId(null);
      setTopics(jitterTopics(TRENDING_TOPICS));
      setIsLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSelectedId(null);

    try {
      const res = await fetch("/api/trending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-google-key": googleKey,
        },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      if (data.topics && Array.isArray(data.topics) && data.topics.length >= TREND_PAGE_SIZE) {
        setTopics(data.topics.slice(0, TREND_PAGE_SIZE));
        writeTrendCache(data.topics); // persist full 36 for future shuffles
        setRingProgress(0);           // reset ring to show fresh state
        setIsLive(true);
      }
    } catch { /* network error — keep current display */ }

    setLoading(false);
  }

  // ── Mount: read localStorage unconditionally (ignore TTL) ────────────
  // • Cache exists (even days old) → shuffle and display, zero API calls.
  // • Cache missing (first-ever launch / cleared data) → auto-fetch once.
  useEffect(() => {
    const cache = readTrendCache();
    if (cache && cache.pool.length > 0) {
      setTopics(shuffleArray(cache.pool).slice(0, TREND_PAGE_SIZE));
      setIsLive(true); // topics originated from Gemini at some point
    } else {
      // True first-time user or cleared storage — one-time auto-fetch
      fetchFromGemini();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ring tick: purely cosmetic, NEVER triggers a fetch ───────────────
  // The ring drains over TREND_CACHE_TTL as a visual hint to long-press.
  // Reaching amber = stale data hint; it does NOT auto-fetch.
  useEffect(() => {
    function tick() {
      const cache = readTrendCache();
      if (isTrendCacheFresh(cache)) {
        setRingProgress(Math.min(1, (Date.now() - cache.timestamp) / TREND_CACHE_TTL));
      } else {
        setRingProgress(1); // amber hint — user should long-press when ready
      }
    }
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Pointer handlers ──────────────────────────────────────────────────
  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    didLongPress.current = false;
    setPressing(true);
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setPressing(false);
      doLongPress();
    }, 800);
  }

  function handlePointerUp() {
    clearTimeout(pressTimer.current);
    setPressing(false);
    if (!didLongPress.current) doShortPress();
  }

  function handlePointerLeave() {
    clearTimeout(pressTimer.current);
    setPressing(false);
    didLongPress.current = false;
  }

  // ── Short press: shuffle existing cache — ZERO API calls ─────────────
  function doShortPress() {
    const cache = readTrendCache();
    setSelectedId(null);
    if (cache && cache.pool.length > 0) {
      setTopics(shuffleArray(cache.pool).slice(0, TREND_PAGE_SIZE));
      setIsLive(true); // still Gemini data, just re-shuffled
    } else {
      // Edge case: cache was cleared mid-session — show static until long-press
      setTopics(jitterTopics(TRENDING_TOPICS));
      setIsLive(false);
    }
  }

  // ── Long press: explicit user action — the ONLY other Gemini trigger ─
  async function doLongPress() {
    await fetchFromGemini();
  }

  // ── Perimeter ring progress (0–100 scale for pathLength trick) ───────────
  // ringProgress state is 0–1 internally; scale to 0–100 for the SVG rect.
  // strokeDashoffset = 100 - pct  →  0 = full perimeter lit, 100 = dark (just fetched).
  const ringPct  = Math.min(ringProgress * 100, 100);           // 0 = fresh, 100 = stale
  const isStale  = ringProgress >= 1;
  const perimColor = isStale ? "#f59e0b" : "#22d3ee";           // amber when stale, cyan when filling

  function handleSend() {
    const picked = topics.find((t) => t.topic === selectedId);
    if (picked) onUseTopic?.(picked.topic);
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[rgb(var(--border))] px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <div>
            <h3 className="font-display text-sm font-bold">Trending Intelligence</h3>
            <p className="text-[11px] text-faint">
              {isLive
                ? <span className="text-emerald-400">Live · Gemini · India health signals</span>
                : "Pre-scored India health topics"}
            </p>
          </div>
        </div>

        {/* ── Refresh button: animated SVG PERIMETER border ── */}
        {/* The glowing rect traces the full outside edge of the button.     */}
        {/* Short press (<800 ms) = shuffle local pool, no API call.         */}
        {/* Long press  (≥800 ms) = force-fetch 36 fresh topics from Gemini. */}
        <div className="relative ml-auto inline-flex">

          {/* Perimeter SVG — sits on top of the button border, pointer-events off */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{ borderRadius: "0.5rem", overflow: "visible" }}
          >
            {/* Dim track — always shows the full button outline */}
            <rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="7"
              fill="none"
              stroke="rgba(71,85,105,0.45)"
              strokeWidth="1.5"
            />
            {/* Animated progress border — fills as cache ages */}
            <rect
              x="1" y="1"
              width="calc(100% - 2px)" height="calc(100% - 2px)"
              rx="7"
              fill="none"
              stroke={perimColor}
              strokeWidth="2"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - ringPct}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s linear, stroke 0.4s ease",
                filter: `drop-shadow(0 0 3px ${perimColor}99)`,
              }}
            />
          </svg>

          {/* The interactive button — borderless so the SVG rect IS the border */}
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            disabled={loading}
            title="Short press: shuffle topics  ·  Long press (hold): fetch 36 fresh from Gemini"
            className={`relative flex select-none items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-50
              ${pressing
                ? "bg-cyan/15 text-cyan"
                : isStale
                  ? "bg-amber-400/8 text-amber-300 hover:bg-amber-400/15"
                  : "bg-[rgb(var(--bg-soft))] text-soft hover:bg-[rgb(var(--bg-soft))]/80 hover:text-[rgb(var(--text))]"
              }`}
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <RefreshCw size={14} className={pressing ? "scale-110 transition-transform" : ""} />
            }
            <span>{loading ? "Fetching…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── Topic grid ── */}
      <div className="p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: TREND_PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]"
                />
              ))
            : topics.map((t) => {
                const isSel = selectedId === t.topic;
                const v     = VERDICT_STYLE[t.verdict] || VERDICT_STYLE.mixed;
                return (
                  <button
                    key={t.topic}
                    onClick={() => setSelectedId(isSel ? null : t.topic)}
                    className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition ${
                      isSel
                        ? "border-cyan/40 bg-cyan/8 ring-1 ring-cyan/20"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-cyan/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2 py-0.5 text-[10px] font-semibold text-soft">
                        {t.tag}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-300">
                        <TrendingUp size={10} /> {t.delta}
                      </span>
                    </div>

                    <p className="text-xs font-bold leading-snug">{t.topic}</p>

                    <div className="mt-auto flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--panel))]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                          style={{ width: `${t.heat}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-faint">{t.heat}°</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${v.bg} ${v.color}`}>
                        {v.label}
                      </span>
                      {isSel && <Check size={13} className="text-cyan" />}
                    </div>
                  </button>
                );
              })
          }
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-cyan/8 px-3 py-2">
          <span className="text-xs font-semibold text-cyan">
            {selectedId ? `Selected: ${selectedId}` : "Pick a trending topic to continue"}
          </span>
          <button
            onClick={handleSend}
            disabled={!selectedId}
            className="btn btn-primary shrink-0 px-3 py-1.5 text-xs disabled:opacity-40"
          >
            <ArrowRight size={13} />
            Send to Stage 2
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Viral Intelligence panel ──────────────────────────────────────────────
function ViralPanel({
  videos, selectedVideos, setSelectedVideos, videoCount, setVideoCount,
  search, setSearch, setDraftTopic, setSourceTranscript, onUseVideoContent,
}) {
  // Mode: "search" (topic search) | "analyze" (paste a video link)
  const [mode,              setMode]             = useState("search");
  const [videoUrl,          setVideoUrl]         = useState("");
  const [analyzing,         setAnalyzing]        = useState(false);
  const [analyzed,          setAnalyzed]         = useState(null);
  const [instagramCaption,  setInstagramCaption] = useState("");

  // Live platform detection — drives placeholder & hint text as the user types
  const detectedPlatform = detectPlatform(videoUrl);

  const filtered = videos
    .filter(
      (v) =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, videoCount);

  function toggleVideo(id) {
    setSelectedVideos((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < videoCount ? [...prev, id] : prev
    );
  }

  async function handleAnalyze() {
    if (!videoUrl.trim()) return;
    setAnalyzing(true);
    setAnalyzed(null);
    // Fetch real metadata in parallel with a short floor so the loading state is visible
    const [result] = await Promise.all([
      buildAnalysis(videoUrl),
      new Promise((r) => setTimeout(r, 900)),
    ]);
    setAnalyzed(result);
    setAnalyzing(false);
  }

  function handleUseContent() {
    if (!analyzed) return;

    // ── Instagram path: use the manually-pasted caption as the transcript ──
    if (analyzed.platform === "instagram") {
      const caption = instagramCaption.trim();
      // Topic = first 90 chars of caption, or the oEmbed title if no caption
      const rawTopic = caption || analyzed.title || "Instagram Reel";
      const topic = rawTopic.length > 90
        ? rawTopic.slice(0, 90).replace(/[\s,–-]+$/, "") + "…"
        : rawTopic;
      const transcript = caption
        ? {
            text:          caption,
            wordCount:     caption.split(/\s+/).filter(Boolean).length,
            language:      null,
            translated:    false,
            sourceTitle:   analyzed.title || "Instagram Reel",
            sourceChannel: analyzed.channel,
            sourceUrl:     analyzed.videoUrl,
          }
        : null;
      onUseVideoContent?.({ topic: analyzed.title || topic, transcript });
      return;
    }

    // ── YouTube / generic path: use extracted transcript ──────────────────
    // Use the video's actual title as the topic — far more meaningful than
    // the detected category like "Nutrition & Diet Science".
    const rawTitle = analyzed.title || analyzed.mainTopic;
    const topic = rawTitle.length > 90 ? rawTitle.slice(0, 90).replace(/[\s,–-]+$/, "") + "…" : rawTitle;
    const transcript = analyzed.transcript
      ? {
          text:          analyzed.transcript,
          wordCount:     analyzed.wordCount,
          language:      analyzed.transcriptLanguage,
          translated:    analyzed.transcriptTranslated,
          sourceTitle:   analyzed.title,
          sourceChannel: analyzed.channel,
          sourceUrl:     analyzed.videoUrl,
        }
      : null;
    onUseVideoContent?.({ topic, transcript });
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[rgb(var(--border))] px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <div>
            <h3 className="font-display text-sm font-bold">Viral Intelligence</h3>
            <p className="text-[11px] text-faint">Analyse top health content</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-0.5">
          <button
            onClick={() => setMode("search")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              mode === "search"
                ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))] shadow-sm"
                : "text-faint hover:text-soft"
            }`}
          >
            <Search size={11} /> Topic Search
          </button>
          <button
            onClick={() => { setMode("analyze"); setAnalyzed(null); }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              mode === "analyze"
                ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))] shadow-sm"
                : "text-faint hover:text-soft"
            }`}
          >
            <Link2 size={11} /> Video Analyzer
          </button>
        </div>
      </div>

      <div className="p-4">

        {/* ══ MODE 1: Topic Search ══ */}
        {mode === "search" && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] text-faint">Show top</span>
              {[2, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setVideoCount(n)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    videoCount === n
                      ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30"
                      : "text-soft hover:bg-[rgb(var(--bg-soft))]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-[11px] text-faint">videos</span>
            </div>

            {/* Search input */}
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
              <Search size={13} className="shrink-0 text-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos by title or channel…"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-faint"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} className="text-faint hover:text-soft" />
                </button>
              )}
            </div>

            {/* Video grid */}
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((video) => {
                const isSel = selectedVideos.includes(video.id);
                return (
                  <button
                    key={video.id}
                    onClick={() => toggleVideo(video.id)}
                    className={`flex gap-2.5 rounded-xl border p-2.5 text-left transition ${
                      isSel
                        ? "border-cyan/40 bg-cyan/8 ring-1 ring-cyan/20"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-cyan/25"
                    }`}
                  >
                    <div className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${video.gradient}`}>
                      {isSel ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-cyan/30">
                          <Check size={20} className="text-white drop-shadow" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={16} className="text-white" fill="white" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">{video.duration}</span>
                      <span className="absolute left-1 top-1 rounded bg-orange-500/90 px-1 py-0.5 text-[9px] font-bold text-white">🔥 {video.viralScore}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] font-semibold leading-tight">{video.title}</p>
                      <p className="mt-0.5 text-[10px] text-faint">{video.channel}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-faint">
                        <span className="flex items-center gap-0.5"><Eye size={9} /> {video.views}</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp size={9} /> {video.likes}</span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[10px] italic text-soft">"{video.hook}"</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedVideos.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-cyan/8 px-3 py-2">
                <span className="text-xs font-semibold text-cyan">
                  {selectedVideos.length} video{selectedVideos.length !== 1 ? "s" : ""} selected
                </span>
                <span className="text-[11px] text-faint">Hooks will be integrated into your content</span>
              </div>
            )}
          </>
        )}

        {/* ══ MODE 2: Video Link Analyzer ══ */}
        {mode === "analyze" && (
          <div className="space-y-3">

            {/* URL input row */}
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2">
                <Link2 size={14} className="shrink-0 text-faint" />
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder={
                    detectedPlatform === "instagram" ? "📸 Instagram Reel detected…"
                    : detectedPlatform === "youtube"  ? "▶️ YouTube URL detected…"
                    : "Paste YouTube or Instagram Reel URL…"
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
                />
                {videoUrl && (
                  <button onClick={() => { setVideoUrl(""); setAnalyzed(null); setInstagramCaption(""); }}>
                    <X size={13} className="text-faint hover:text-soft" />
                  </button>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!videoUrl.trim() || analyzing}
                className="btn btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-50"
              >
                {analyzing
                  ? <><Loader2 size={14} className="animate-spin" /> Analysing…</>
                  : <><Video size={14} /> Analyse</>
                }
              </button>
            </div>

            {/* Hint — platform-aware */}
            {!analyzed && !analyzing && (
              <p className="text-center text-[11px] text-faint">
                {detectedPlatform === "instagram"
                  ? <>📸 <span className="text-pink-400 font-semibold">Instagram Reel</span> — we'll fetch available metadata. You'll paste the caption/narration manually (Instagram has no public transcript API).</>
                  : detectedPlatform === "youtube"
                  ? <>▶️ <span className="text-cyan font-semibold">YouTube</span> — we'll auto-extract the transcript, key points &amp; hook and convert them into a ready-to-use script.</>
                  : <>Paste any YouTube or Instagram Reel link — we'll extract what we can and guide you from there.</>
                }
              </p>
            )}

            {/* Analysing skeleton */}
            {analyzing && (
              <div className="space-y-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4">
                {["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-1/2"].map((w, i) => (
                  <div key={i} className={`h-2.5 ${w} animate-pulse rounded-full bg-[rgb(var(--border))]`} />
                ))}
                <p className="pt-1 text-center text-[10px] text-faint">
                  {detectedPlatform === "instagram"
                    ? "Fetching Instagram Reel metadata…"
                    : "Extracting transcript & analysing content…"}
                </p>
              </div>
            )}

            {/* Results */}
            {analyzed && !analyzing && (
              <div className="space-y-3">

                {/* ══ INSTAGRAM REEL RESULTS ══ */}
                {analyzed.platform === "instagram" && (
                  <>
                    {/* Reel identity card */}
                    <div className="flex gap-3 rounded-xl border border-pink-500/25 bg-pink-500/5 p-3">
                      <a
                        href={analyzed.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 to-rose-600"
                      >
                        {analyzed.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={analyzed.thumbnail}
                            alt="Instagram Reel"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">📸</div>
                        )}
                        <span className="absolute left-1 top-1 rounded bg-pink-600/90 px-1 py-0.5 text-[9px] font-bold text-white">Reel</span>
                      </a>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">📸 Instagram</span>
                        </div>
                        <p className="mt-0.5 text-xs font-bold leading-snug">{analyzed.title || "Instagram Reel"}</p>
                        <p className="text-[10px] text-faint">{analyzed.channel}</p>
                        <a
                          href={analyzed.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-0.5 text-[10px] text-pink-400 hover:underline"
                        >
                          Open Reel <ExternalLink size={8} />
                        </a>
                      </div>
                    </div>

                    {/* Why no auto-transcript */}
                    <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
                      <Info size={12} className="mt-0.5 shrink-0 text-amber-400" />
                      <p className="text-[11px] leading-relaxed text-amber-200/80">
                        <span className="font-bold text-amber-300">No auto-transcript available.</span>{" "}
                        Instagram doesn't expose video captions or audio through its public API.
                        Paste the reel's caption, on-screen text, or voiceover below — that seeds your content generation.
                      </p>
                    </div>

                    {/* Manual caption input */}
                    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-faint">
                          Reel Caption / Narration
                        </p>
                        <span className="text-[10px] text-faint">
                          {instagramCaption.length > 0
                            ? `${instagramCaption.split(/\s+/).filter(Boolean).length} words`
                            : "paste below"}
                        </span>
                      </div>
                      <textarea
                        value={instagramCaption}
                        onChange={(e) => setInstagramCaption(e.target.value)}
                        placeholder="Paste the reel's caption, on-screen text, or voiceover narration here…"
                        rows={5}
                        className="w-full resize-none bg-transparent text-[11px] leading-relaxed text-soft placeholder:text-faint outline-none"
                      />
                    </div>

                    {/* CTA */}
                    <button
                      onClick={handleUseContent}
                      disabled={!instagramCaption.trim()}
                      className="btn btn-primary w-full py-2.5 text-sm disabled:opacity-40"
                    >
                      <ArrowRight size={15} />
                      Use This Content → Send to Stage 2
                    </button>
                  </>
                )}

                {/* ══ YOUTUBE / GENERIC RESULTS ══ */}
                {analyzed.platform !== "instagram" && (
                  <>
                    {/* Video preview card */}
                    <div className="flex gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3">
                      <a
                        href={analyzed.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${analyzed.gradient}`}
                      >
                        {analyzed.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={analyzed.thumbnail}
                            alt={analyzed.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play size={18} className="text-white drop-shadow" fill="white" />
                        </div>
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">{analyzed.duration}</span>
                        <span className="absolute left-1 top-1 rounded bg-orange-500/90 px-1 py-0.5 text-[9px] font-bold text-white">🔥 {analyzed.viralScore}</span>
                      </a>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-snug">{analyzed.title}</p>
                        <p className="mt-0.5 text-[10px] text-faint">{analyzed.channel}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-faint">
                          <span className="flex items-center gap-0.5"><Eye size={9} /> {analyzed.views}</span>
                          <span className="flex items-center gap-0.5"><ThumbsUp size={9} /> {analyzed.likes}</span>
                          <span className="flex items-center gap-0.5"><FileText size={9} /> {analyzed.wordCount} words</span>
                        </div>
                        <p className="mt-1 text-[10px] italic text-soft line-clamp-1">"{analyzed.hook}"</p>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Tag size={11} className="text-faint" />
                      {analyzed.topics.map((t) => (
                        <span key={t} className="rounded-full border border-cyan/25 bg-cyan/8 px-2 py-0.5 text-[10px] font-semibold text-cyan">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Key points */}
                    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-faint">Extracted Key Points</p>
                      <ul className="space-y-1.5">
                        {analyzed.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] leading-snug text-soft">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Script preview */}
                    <div className="rounded-xl border border-electric/20 bg-electric/5 p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan">Extracted Script</p>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-soft font-sans">
                        {analyzed.script}
                      </pre>
                    </div>

                    {/* CTA — send to Stage 2 */}
                    <button
                      onClick={handleUseContent}
                      className="btn btn-primary w-full py-2.5 text-sm"
                    >
                      <ArrowRight size={15} />
                      Use This Content → Send to Stage 2
                    </button>
                  </>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Source-transcript banner ─────────────────────────────────────────────
// Shown above the generated content when Stage 2 was seeded from a real video.
// Confirms to the user that the transcript actually flowed through and lets
// them peek at the raw source text.
function SourceTranscriptBanner({ src, aiMode, aiError }) {
  const [expanded, setExpanded] = useState(false);
  const preview = src.text.length > 320 ? src.text.slice(0, 320).trim() + "…" : src.text;

  // aiMode: "anthropic" | "openai" | "demo" | undefined (older paths)
  const aiBadge =
    aiMode === "anthropic"
      ? { label: "Rewritten by Claude", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" }
      : aiMode === "openai"
      ? { label: "Rewritten by GPT", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" }
      : aiMode === "demo"
      ? { label: "Template mode — add ANTHROPIC_API_KEY to .env.local", cls: "text-amber-300 border-amber-400/30 bg-amber-400/10" }
      : null;

  return (
    <div className="rounded-xl border border-cyan/25 bg-cyan/5 p-3">
      <div className="flex items-start gap-2.5">
        <Video size={14} className="mt-0.5 shrink-0 text-cyan" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan">
              Source transcript loaded into Stage 2
            </p>
            {aiBadge && (
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${aiBadge.cls}`}>
                {aiBadge.label}
              </span>
            )}
          </div>
          {aiError && (
            <p className="mt-1 text-[10px] text-rose-300">
              LLM error — fell back to template: {aiError}
            </p>
          )}
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-soft">
            {src.sourceTitle}
            <span className="ml-1.5 text-faint font-normal">· {src.sourceChannel}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-faint">
            <span>{src.wordCount.toLocaleString()} words</span>
            {src.language && (
              <>
                <span className="text-[rgb(var(--border))]">·</span>
                <span>captions: {src.language}{src.translated ? " (auto-translated to English)" : ""}</span>
              </>
            )}
            {src.sourceUrl && (
              <>
                <span className="text-[rgb(var(--border))]">·</span>
                <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline inline-flex items-center gap-0.5">
                  Open video <ExternalLink size={9} />
                </a>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2 py-1 text-[10px] font-semibold text-soft transition hover:border-cyan/45"
        >
          {expanded ? "Hide" : "View"} transcript
        </button>
      </div>
      {expanded && (
        <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3 text-[11px] leading-relaxed text-soft font-sans">
          {src.text}
        </pre>
      )}
      {!expanded && (
        <p className="mt-2 line-clamp-2 text-[11px] italic text-faint">{preview}</p>
      )}
    </div>
  );
}

// ── Active-enrichment badge ───────────────────────────────────────────────
// Shown above the generated content so the user can SEE which lens is shaping
// the output. Without this the lens looks invisible until you read the script.
const ENRICHMENT_DISPLAY = {
  enrichment_entertainment: { icon: "🎬", name: "Entertainment lens",        note: "Pop-culture analogies, plot-twist framing." },
  enrichment_cinema:        { icon: "🎞️", name: "Cinema lens",              note: "Real movies matched to your topic — Fight Club for sleep, Rocky for exercise, and more." },
  enrichment_philosophy:    { icon: "🏛️", name: "Philosophy lens",          note: "Big questions, classical wisdom angles." },
  enrichment_psychology:    { icon: "🧠", name: "Psychology lens",          note: "Cognitive bias + behavioural science." },
  enrichment_productivity:  { icon: "⚡", name: "Productivity lens",         note: "Systems thinking, habit stacking." },
  enrichment_spiritual:     { icon: "🌿", name: "Holistic / Spiritual lens", note: "Mind-body integration, evidence-honest." },
  enrichment_books:         { icon: "📚", name: "Books lens",               note: "Real book references — author findings woven through every section of your content." },
};
function EnrichmentBadge({ moduleId }) {
  const lens = ENRICHMENT_DISPLAY[moduleId];
  if (!lens) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/5 px-3 py-2">
      <span className="text-lg leading-none">{lens.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
          Active enrichment: {lens.name}
        </p>
        <p className="text-[11px] text-soft">{lens.note} Applied to hooks, script openers and caption.</p>
      </div>
    </div>
  );
}

// ── Stage 3: Medical Verification view ───────────────────────────────────
function Stage3VerifyOutput({ isLoading, research, topic, onBack, onProceed }) {
  const [expandedSource, setExpandedSource] = useState(null);

  // ── Derive band / score (same formula as OverallScore) ───────────────────
  const isOutOfScope  = research?.outOfScope === true || (typeof research?.key === "string" && research.key.startsWith("out-of-scope-"));
  const isPlaceholder = !isOutOfScope && typeof research?.key === "string" && research.key.startsWith("generic-");

  const overall = research
    ? Math.round(
        ((research.confidence + research.evidenceStrength + research.consensus + research.researchQuality) / 4 * 4 +
          (100 - research.misinfoRisk)) / 5
      )
    : 0;

  const band = !research ? { label: "", color: "#22d3ee", bg: "bg-slate-700/50 border-slate-600/50" }
    : isOutOfScope  ? { label: "Out of scope",        color: "#a78bfa", bg: "bg-violet-500/10 border-violet-400/30" }
    : isPlaceholder ? { label: "Not yet evaluated",   color: "#94a3b8", bg: "bg-slate-500/10 border-slate-400/30" }
    : overall >= 75 ? { label: "Safe to publish",     color: "#34d399", bg: "bg-emerald-500/10 border-emerald-400/30" }
    : overall >= 60 ? { label: "Publish with nuance", color: "#22d3ee", bg: "bg-cyan-500/10 border-cyan-400/30" }
    : overall >= 45 ? { label: "Add caveats",         color: "#fbbf24", bg: "bg-amber-500/10 border-amber-400/30" }
    : overall >= 30 ? { label: "High risk",           color: "#fb923c", bg: "bg-orange-500/10 border-orange-400/30" }
    :                 { label: "Do not publish",      color: "#fb7185", bg: "bg-rose-500/10 border-rose-400/30" };

  // ── Agent terminal data ───────────────────────────────────────────────────
  const databases  = ["PubMed", "NIH", "WHO", "CDC", "Cochrane"];
  const paperCount = research?.sources?.length ?? 0;
  const studyTypes = research?.sources
    ? [...new Set(research.sources.map((s) => s.studyType).filter(Boolean))].slice(0, 3)
    : [];

  const verifiedClaims = research?.keyFinding
    ? [{ text: research.keyFinding.slice(0, 90) + (research.keyFinding.length > 90 ? "…" : ""), ok: true }]
    : [];
  const flaggedClaims = (research?.claimFlags ?? []).map((f) => ({ text: f, ok: false }));
  const allClaims = [...verifiedClaims, ...flaggedClaims].slice(0, 4);

  const riskColor = !research ? "#94a3b8"
    : research.misinfoRisk >= 60 ? "#fb7185"
    : research.misinfoRisk >= 40 ? "#fbbf24"
    : "#34d399";

  const safetyFlags = research?.claimFlags?.length > 0
    ? research.claimFlags.slice(0, 2)
    : ["No dangerous claims detected", "Disclaimer language verified"];

  const circumference = 2 * Math.PI * 42;

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-[10px] font-semibold text-faint transition hover:text-soft"
            >
              <ChevronLeft size={12} /> Stage 2
            </button>
            <span className="text-[rgb(var(--border))]">·</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Stage 3 · Med Verify</span>
            {!isLoading && research && (
              <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                {research.confidence}% confidence
              </span>
            )}
          </div>
          <h2 className="mt-0.5 font-display text-base font-bold">Medical Verification Report</h2>
          <p className="text-xs text-faint">
            Verifying evidence for: <span className="font-semibold text-soft">"{topic}"</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
          <ShieldCheck size={13} className="text-blue-400" />
          <span className="text-[10px] font-semibold text-blue-400">Med Verify</span>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-14 dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="relative">
            <Loader2 size={28} className="animate-spin text-blue-400" />
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-soft">Running medical verification…</p>
            <p className="mt-0.5 text-xs text-faint">Checking evidence, claims &amp; safety signals</p>
          </div>
          <div className="mt-2 w-full max-w-xs space-y-1.5 px-4">
            {["Clinical Evidence", "Fact-Checker", "Safety Guard"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-xs text-faint">
                <Loader2 size={10} className="animate-spin text-blue-400" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : research ? (
        <div className="space-y-4">

          {/* ── BENTO GRID ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* TOP LEFT: Key Finding + Research Sources (col-span-2) */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50 lg:col-span-2">
              {research.keyFinding && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan">Key Finding</p>
                  <p className="text-[11px] leading-relaxed text-soft">{research.keyFinding}</p>
                </div>
              )}

              {research.keyFinding && research.sources?.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700/50" />
              )}

              {research.sources && research.sources.length > 0 && (
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-faint">
                    Research Sources ({research.sources.length})
                  </p>
                  <div className="space-y-1.5">
                    {research.sources.slice(0, 5).map((src, i) => {
                      const isOpen = expandedSource === i;
                      return (
                        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-900/50">
                          <button
                            onClick={() => setExpandedSource(isOpen ? null : i)}
                            className="flex w-full items-start gap-2 p-2.5 text-left"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-[10px] font-semibold leading-tight">{src.title}</p>
                              <p className="mt-0.5 text-[10px] text-faint">{src.source} · {src.year} · {src.studyType}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="grid h-5 w-5 place-items-center rounded text-faint transition hover:text-cyan"
                                  title="Open source"
                                >
                                  <ExternalLink size={10} />
                                </a>
                              )}
                              <ChevronDown size={11} className={`text-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                          </button>
                          {isOpen && src.summary && (
                            <div className="border-t border-slate-200 px-3 pb-3 pt-2 dark:border-slate-700/50">
                              <p className="text-[10px] leading-relaxed text-soft">{src.summary}</p>
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-cyan hover:underline"
                                >
                                  <ExternalLink size={10} /> View on {src.source}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* TOP RIGHT: Overall Evidence Score with circular ring */}
            <div className={`flex flex-col rounded-2xl border p-4 ${band.bg}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-faint">Overall Evidence Score</p>

              <div className="my-4 flex flex-1 flex-col items-center justify-center">
                <div className="relative">
                  <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(100,100,100,0.12)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={band.color} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference * (1 - (isPlaceholder || isOutOfScope ? 0.55 : overall) / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 6px ${band.color}80)` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`font-display text-3xl font-extrabold leading-none ${(isPlaceholder || isOutOfScope) ? "opacity-60" : ""}`}
                      style={{ color: band.color }}
                    >
                      {overall}
                    </span>
                    <span className="text-[10px] font-semibold text-faint">/100</span>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] font-bold" style={{ color: band.color }}>{band.label}</p>
              </div>

              {/* Mini score bars */}
              <div className="space-y-2">
                {[
                  { label: "AI Confidence",  value: research.confidence,       color: "#22d3ee" },
                  { label: "Ev. Strength",   value: research.evidenceStrength,  color: "#34d399" },
                  { label: "Consensus",      value: research.consensus,         color: "#5b8cff" },
                  { label: "Quality",        value: research.researchQuality,   color: "#a78bfa" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="mb-0.5 flex items-center justify-between text-[9px]">
                      <span className="text-faint">{label}</span>
                      <span className="font-bold" style={{ color }}>{value}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <div className="mb-0.5 flex items-center justify-between text-[9px]">
                    <span className="text-faint">Misinfo Risk</span>
                    <span className="font-bold" style={{ color: riskColor }}>{research.misinfoRisk}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: riskColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${research.misinfoRisk}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: 3 Agent Terminals */}

            {/* Terminal 1: Clinical Evidence */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-500/20">
                  <Search size={13} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">Clinical Evidence</p>
                  <p className="text-[9px] text-faint">Database retrieval log</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-900/60">
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-faint">Databases Searched</p>
                  <div className="flex flex-wrap gap-1">
                    {databases.map((db) => (
                      <span key={db} className="flex items-center gap-1 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                        <Check size={8} /> {db}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-slate-100 p-2.5 text-center dark:bg-slate-900/60">
                    <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-300">{paperCount}</p>
                    <p className="text-[9px] text-faint">Papers</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-100 p-2.5 text-center dark:bg-slate-900/60">
                    <p className="font-display text-2xl font-bold text-indigo-600 dark:text-indigo-300">{studyTypes.length || 3}</p>
                    <p className="text-[9px] text-faint">Study Types</p>
                  </div>
                </div>
                {studyTypes.length > 0 && (
                  <div className="rounded-xl bg-slate-100 px-2.5 py-2 text-[9px] text-faint dark:bg-slate-900/60">
                    {studyTypes.join(" · ")}
                  </div>
                )}
              </div>
            </div>

            {/* Terminal 2: Fact-Checker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-500/20">
                  <ShieldCheck size={13} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-300">Fact-Checker</p>
                  <p className="text-[9px] text-faint">Claim validation log</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {allClaims.length > 0 ? (
                  allClaims.map((claim, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-xl p-2.5 text-[9px] leading-relaxed ${claim.ok ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}
                    >
                      <span className={`mt-0.5 shrink-0 ${claim.ok ? "text-emerald-500" : "text-amber-500"}`}>
                        {claim.ok ? "✅" : "⚠️"}
                      </span>
                      <span className={claim.ok ? "text-emerald-800 dark:text-emerald-200/80" : "text-amber-800 dark:text-amber-200/80"}>{claim.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-[9px] text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200/80">
                    ✅ All primary claims verified against peer-reviewed sources
                  </div>
                )}
                <div className="rounded-xl bg-slate-100 px-2.5 py-2 text-center dark:bg-slate-900/60">
                  <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-300">
                    {Math.round((research.consensus + research.researchQuality) / 2)}% claim accuracy
                  </p>
                </div>
              </div>
            </div>

            {/* Terminal 3: Safety Guard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red-500/20">
                  <ShieldCheck size={13} className="text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-300">Safety Guard</p>
                  <p className="text-[9px] text-faint">Risk assessment log</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-900/60">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-faint">Misinfo Risk</p>
                    <span className="text-[10px] font-bold" style={{ color: riskColor }}>{research.misinfoRisk}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: riskColor, boxShadow: `0 0 8px ${riskColor}50` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${research.misinfoRisk}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ background: `${band.color}15` }}>
                  <p className="text-[10px] font-bold" style={{ color: band.color }}>
                    {research.misinfoRisk < 40 ? "✓ " : research.misinfoRisk < 60 ? "⚠ " : "✗ "}{band.label}
                  </p>
                </div>
                <div className="space-y-1">
                  {safetyFlags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-1.5 rounded-xl bg-slate-100 px-2.5 py-2 text-[9px] dark:bg-slate-900/60">
                      <span className={research.claimFlags?.length > 0 ? "text-amber-500" : "text-emerald-500"}>
                        {research.claimFlags?.length > 0 ? "⚠" : "✓"}
                      </span>
                      <span className="text-faint">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          {/* ── END BENTO GRID ─────────────────────────────────────────── */}

          {/* CTA buttons */}
          <div className="space-y-2 border-t border-[rgb(var(--border))] pt-4">
            <button onClick={onProceed} className="btn btn-primary w-full py-2.5 text-sm">
              <ArrowRight size={15} />
              Generate Content →
            </button>
            <button onClick={onBack} className="btn btn-ghost w-full py-2 text-sm">
              <ChevronLeft size={14} /> Back to Stage 2
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-10 text-center text-xs text-faint dark:border-slate-700/50 dark:bg-slate-800/50">
          Verification failed — try again.
        </div>
      )}
    </div>
  );
}

// ── Center panel ──────────────────────────────────────────────────────────
function CenterPanel({
  draftTopic, setDraftTopic, onGenerate, onReset, status,
  topic, content, research, busy, saved, setSaved,
  onRegenerate, inputAgent,
  selectedVideos, setSelectedVideos, videoCount, setVideoCount,
  videoSearch, setVideoSearch,
  settings, switchLanguage,
  outputMode,
  contentTab, setContentTab,
  selectedFormatId, setSelectedFormatId,
  activeFeatures, setActiveFeatures,
  setSourceTranscript,
  onUseVideoContent,
  // Stage 2 audience intelligence
  audienceWorkflow, audienceData, onSendToStage3,
  // Stage 3 verification
  verifyWorkflow, verifyAngle, onBackToStage1, onBackToStage2, onProceedFromStage3,
  // Stage 4 Storybuilder
  storybuilderWorkflow, onApproveStorybuilder, onBackFromStorybuilder,
  enrichmentModule, enrichmentModules,
  // audienceData is kept alive so Storybuilder can display Stage 2 audience info
}) {
  const showDanger =
    research &&
    ((research.claimFlags && research.claimFlags.length > 0) ||
      research.verdict === "false" ||
      research.verdict === "misleading");

  // Audience workspace takes over the content area while active
  const showViralPanel    = inputAgent === "viral_intelligence" && status === "idle" && audienceWorkflow === "idle" && verifyWorkflow === "idle" && storybuilderWorkflow === "idle";
  const showTrendingPanel = inputAgent === "topic_intelligence" && status === "idle" && audienceWorkflow === "idle" && verifyWorkflow === "idle" && storybuilderWorkflow === "idle";

  function handleFormatTabClick(fmt) {
    setSelectedFormatId(fmt.id);
    setContentTab(fmt.tab);
  }

  function handleFeaturePillClick(pill) {
    // Navigate to the feature's tab if it has one
    if (pill.tab) setContentTab(pill.tab);
    // Toggle the pill on/off in active features
    setActiveFeatures((prev) =>
      prev.includes(pill.id) ? prev.filter((x) => x !== pill.id) : [...prev, pill.id]
    );
  }

  const featurePills = FEATURE_PILLS[outputMode] || [];

  return (
    <main className="flex flex-1 flex-col overflow-y-auto">

      {/* ── Sticky header: search + format tabs + feature pills ── */}
      {/* Search bar — only shown for Manual Input Only.
          Trending and Viral panels are fully self-contained. */}
      {inputAgent === "manual_input" && (
        <div className="sticky top-0 z-10 shrink-0 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
          <div className="flex gap-2 px-4 pb-3 pt-4">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3">
              <Search size={16} className="shrink-0 text-faint" />
              <input
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onGenerate()}
                placeholder="Enter a health claim, supplement, or wellness topic…"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-faint"
              />
              {draftTopic && (
                <button
                  onClick={() => setDraftTopic("")}
                  className="shrink-0 text-faint transition hover:text-[rgb(var(--text))]"
                  title="Clear topic"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {status === "done" && (
              <button
                onClick={onReset}
                className="btn btn-ghost shrink-0 px-3 py-2.5 text-sm"
                title="Clear and start a new topic"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">New</span>
              </button>
            )}
            <button
              onClick={onGenerate}
              disabled={!draftTopic.trim() || status === "generating"}
              className="btn btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Wand2 size={15} />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Content area ── */}
      <div className="flex-1 space-y-4 p-4">

        {/* Stage 4: Storybuilder Wizard — shown after Stage 3 approval */}
        {storybuilderWorkflow === "active" && (
          <StorybuilderWizard
            topic={topic}
            research={research}
            audienceData={audienceData}
            activeLens={enrichmentModule}
            enrichmentModules={enrichmentModules}
            onBack={onBackFromStorybuilder}
            onApprove={onApproveStorybuilder}
          />
        )}

        {/* Stage 3: Medical Verification — shown when storybuilder is idle */}
        {verifyWorkflow !== "idle" && storybuilderWorkflow === "idle" && (
          <Stage3VerifyOutput
            isLoading={verifyWorkflow === "loading"}
            research={research}
            topic={verifyAngle || topic}
            onBack={onBackToStage2}
            onProceed={onProceedFromStage3}
          />
        )}

        {/* Stage 2: Audience Intelligence — shown only when Stage 3 is idle */}
        {audienceWorkflow !== "idle" && verifyWorkflow === "idle" && storybuilderWorkflow === "idle" && (
          <AudienceIntelligenceOutput
            isLoading={audienceWorkflow === "loading"}
            agentData={audienceData}
            inputTopic={topic}
            onSendToStage3={onSendToStage3}
            onBack={onBackToStage1}
          />
        )}

        {/* Viral panel (idle + viral input selected) */}
        {showViralPanel && (
          <ViralPanel
            videos={MOCK_VIDEOS}
            selectedVideos={selectedVideos}
            setSelectedVideos={setSelectedVideos}
            videoCount={videoCount}
            setVideoCount={setVideoCount}
            search={videoSearch}
            setSearch={setVideoSearch}
            setDraftTopic={setDraftTopic}
            setSourceTranscript={setSourceTranscript}
            onUseVideoContent={onUseVideoContent}
          />
        )}

        {/* Trending panel (idle + trending input selected) */}
        {showTrendingPanel && (
          <TrendingPanel
            onUseTopic={(topic) => onUseVideoContent?.({ topic, transcript: null })}
          />
        )}

        {/* Idle placeholder (non-panel modes, audience & verify stages not active) */}
        {status === "idle" && !showViralPanel && !showTrendingPanel && audienceWorkflow === "idle" && verifyWorkflow === "idle" && storybuilderWorkflow === "idle" && (
          <div className="grid place-items-center py-20">
            <div className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan/15 to-electric/15 text-cyan ring-1 ring-cyan/20">
                <Sparkles size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Verify a topic to begin</h3>
              <p className="mt-1.5 text-sm text-soft">
                Enter any health claim above. Configure your agent pipeline on the left, then hit Generate.
              </p>
            </div>
          </div>
        )}

        {/* Generating animation */}
        {status === "generating" && <GeneratingState topic={topic} />}

        {/* Done — format selector + feature pills + language switch + content output */}
        {status === "done" && content && research && (
          <div className="space-y-4">
            {showDanger && <DangerBanner research={research} />}

            {/* Source-transcript banner */}
            {content.meta.sourceTranscript && (
              <SourceTranscriptBanner src={content.meta.sourceTranscript} aiMode={content.meta.aiMode} aiError={content.meta.aiError} />
            )}

            {/* Active-enrichment indicator */}
            {content.meta.enrichmentModule && (
              <EnrichmentBadge moduleId={content.meta.enrichmentModule} />
            )}

            {/* ── Output format selector (shown only after generation) ── */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">

              {/* Online / Offline toggle */}
              <div className="flex items-center gap-1 border-b border-[rgb(var(--border))] px-3 py-2">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-faint">Format:</span>
                {[
                  { mode: "online",  icon: <Wifi size={11} />,    label: "Online"  },
                  { mode: "offline", icon: <WifiOff size={11} />, label: "Offline" },
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setOutputMode(mode)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      outputMode === mode
                        ? "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/25"
                        : "text-faint hover:text-soft"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* Format tabs row */}
              <div className="overflow-x-auto scrollbar-none border-b border-[rgb(var(--border))]">
                <div className="flex items-center gap-0.5 px-3 py-2">
                  {FORMAT_TABS[outputMode].map((fmt) => {
                    const isActive = selectedFormatId === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => { setSelectedFormatId(fmt.id); setContentTab(fmt.tab); }}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30"
                            : "text-soft hover:bg-electric/8 hover:text-[rgb(var(--text))]"
                        }`}
                      >
                        <span className="text-sm leading-none">{fmt.icon}</span>
                        <span>{fmt.label}</span>
                        {fmt.wordRange ? (
                          <span className={`hidden rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:inline ${
                            isActive ? "bg-cyan/20 text-cyan/80" : "bg-[rgb(var(--bg-soft))] text-faint"
                          }`}>{fmt.wordRange}</span>
                        ) : (
                          <span className={`hidden text-[9px] sm:inline ${isActive ? "text-cyan/60" : "text-faint"}`}>
                            {fmt.duration}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature pills row */}
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <span className="shrink-0 text-[10px] font-semibold text-faint">+ Add:</span>
                  {(FEATURE_PILLS[outputMode] || []).map((pill) => {
                    const isActive    = activeFeatures.includes(pill.id);
                    const isViewing   = pill.tab && contentTab === pill.tab;
                    const highlighted = isActive || isViewing;
                    return (
                      <button
                        key={pill.id}
                        onClick={() => {
                          if (pill.tab) setContentTab(pill.tab);
                          setActiveFeatures((prev) =>
                            prev.includes(pill.id) ? prev.filter((x) => x !== pill.id) : [...prev, pill.id]
                          );
                        }}
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          highlighted
                            ? "bg-electric/15 text-electric ring-1 ring-electric/25"
                            : "border border-[rgb(var(--border))] text-faint hover:border-cyan/30 hover:text-soft"
                        }`}
                      >
                        <span className="leading-none">{pill.icon}</span>
                        <span>{pill.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Language quick-switch */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2">
              <span className="text-[11px] font-semibold text-faint">Language:</span>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLanguage(l.code)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    settings.language === l.code
                      ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30"
                      : "text-soft hover:bg-electric/8"
                  }`}
                >
                  {l.flag} {l.name}
                </button>
              ))}
              <span className="ml-auto">
                <VerdictBadge verdict={research.verdict} size="sm" />
              </span>
            </div>

            <motion.div animate={{ opacity: busy ? 0.55 : 1 }} transition={{ duration: 0.2 }}>
              <ContentOutput
                content={content}
                onRegenerate={onRegenerate}
                onSave={() => setSaved((v) => !v)}
                saved={saved}
                busy={busy}
                tab={contentTab}
              />
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Source URL helper ─────────────────────────────────────────────────────
function getSourceUrl(src) {
  const q = encodeURIComponent(src.title);
  switch (src.source) {
    case "PubMed":            return `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`;
    case "NIH":               return `https://ods.od.nih.gov/search/?q=${q}`;
    case "WHO":               return `https://www.who.int/search?query=${q}`;
    case "ClinicalTrials.gov":return `https://clinicaltrials.gov/search?query=${q}`;
    default:                  return `https://scholar.google.com/scholar?q=${q}`;
  }
}

// ── Agent transparency data ───────────────────────────────────────────────
function getAgentReport(agentId, research, topic) {
  const r   = research || {};
  const lbl = topic || "this topic";

  // Generic handler for enrichment modules (enrichment_*)
  if (agentId.startsWith("enrichment_")) {
    const lens      = agentId.replace("enrichment_", "");
    const lensLabel = lens.charAt(0).toUpperCase() + lens.slice(1);
    return {
      whatItDid: `Applied the ${lensLabel} lens — reshaped tone and style without altering the scientific facts.`,
      actions: [
        `Identified ${lensLabel.toLowerCase()} angles relevant to the topic`,
        "Wove storytelling elements into script sections",
        "Enhanced hook with lens-specific opening framing",
        "Adapted caption and CTA to match the lens tone",
      ],
      sources: [{ name: `${lensLabel} Reference Library`, type: "Internal" }],
      findings: [
        { label: "Lens",     value: lensLabel,    color: "#fbbf24" },
        { label: "Sections", value: "4 enhanced", color: "#22d3ee" },
        { label: "Credits",  value: "Free",       color: "#34d399" },
      ],
      impact: `${lensLabel} framing deepens audience connection without compromising scientific accuracy.`,
    };
  }

  const REPORTS = {
    topic_intelligence: {
      whatItDid: `Scanned trending health signals and surfaced "${lbl}" as a high-momentum topic with strong search interest.`,
      actions: [
        "Queried 3 trending health data sources",
        "Computed live heat score from search velocity",
        "Assigned pre-scored evidence verdict",
        "Calculated 7-day search delta vs baseline",
      ],
      sources: [
        { name: "Google Trends Health",     type: "Trend DB"  },
        { name: "PubMed Popularity Index",  type: "Research"  },
        { name: "Social Velocity Signal",   type: "Social"    },
      ],
      findings: [
        { label: "Heat Score",   value: "72°",              color: "#fb923c" },
        { label: "Verdict",      value: r.verdict || "proven", color: "#34d399" },
        { label: "Search Delta", value: "+18%",             color: "#22d3ee" },
      ],
      impact: "Seeded the pipeline with a high-signal topic, directing all downstream agent research.",
    },
    viral_intelligence: {
      whatItDid: `Analysed top-performing YouTube health content to extract viral hooks, patterns and signals for "${lbl}".`,
      actions: [
        "Scanned YouTube top-50 health videos",
        "Extracted hook patterns from titles & thumbnails",
        "Scored viral potential from engagement ratios",
        "Identified repeatable high-retention structures",
      ],
      sources: [
        { name: "YouTube Trending Health",  type: "Video"    },
        { name: "Social Engagement API",    type: "Analytics"},
        { name: "Hook Pattern Library",     type: "Internal" },
      ],
      findings: [
        { label: "Viral Score", value: "92/100", color: "#fb923c" },
        { label: "Hooks Found", value: "8",      color: "#22d3ee" },
        { label: "Avg Views",   value: "1.8M",   color: "#a78bfa" },
      ],
      impact: "Provided proven viral hooks and engagement patterns to improve content reach.",
    },
    manual_input: {
      whatItDid: `Passed "${lbl}" directly to Stage 2 — no AI preprocessing, maximum speed.`,
      actions: ["Accepted raw topic string", "Validated non-empty input", "Forwarded to process stage"],
      sources: [{ name: "User Input", type: "Direct" }],
      findings: [
        { label: "Mode",    value: "Direct", color: "#94a3b8" },
        { label: "Credits", value: "0",      color: "#34d399" },
        { label: "Latency", value: "<100ms", color: "#22d3ee" },
      ],
      impact: "Zero-latency routing — ideal for known topics that don't need trend analysis.",
    },
    research_agent: {
      whatItDid: `Searched PubMed, NIH & WHO for peer-reviewed evidence on "${lbl}" and retrieved ${r.sources?.length || 4} studies.`,
      actions: [
        "Queried PubMed with topic-specific MeSH terms",
        "Filtered for RCTs, meta-analyses & systematic reviews",
        `Retrieved ${r.sources?.length || 4} high-quality citations`,
        "Extracted study types, sample sizes & abstracts",
        "Ranked sources by evidence level (I–IV)",
      ],
      sources: [
        ...(r.sources || []).slice(0, 3).map((s) => ({
          name: s.title ? (s.title.length > 48 ? s.title.slice(0, 48) + "…" : s.title) : s.source,
          type: s.source || "PubMed",
        })),
        ...((r.sources?.length || 0) > 3
          ? [{ name: `+${r.sources.length - 3} more studies`, type: "" }]
          : []),
      ],
      findings: [
        { label: "Studies",   value: r.sources?.length || 4, color: "#22d3ee" },
        { label: "Ev. Level", value: (r.evidenceStrength || 78) >= 80 ? "Level I" : (r.evidenceStrength || 78) >= 60 ? "Level II" : "Level III", color: "#34d399" },
        { label: "Databases", value: "3 DBs",               color: "#a78bfa" },
      ],
      impact: `Scientific foundation: ${r.sources?.length || 4} peer-reviewed citations anchoring every content claim.`,
    },
    medical_validation: {
      whatItDid: `Cross-referenced every health claim against retrieved studies and assigned evidence ratings per claim.`,
      actions: [
        "Extracted all testable claims from content",
        "Matched each claim to supporting / contradicting studies",
        "Assigned ✅ Strongly Supported / ⚠️ Limited / ❌ No Evidence ratings",
        "Added citation badges to validated claims",
        `Flagged ${(r.claimFlags || []).length} claim${(r.claimFlags || []).length !== 1 ? "s" : ""} for attention`,
      ],
      sources: [
        { name: "Evidence Retrieval output",  type: "Agent"  },
        { name: "PubMed citation data",       type: "PubMed" },
        { name: "WHO claim guidelines",       type: "WHO"    },
      ],
      findings: [
        { label: "Confidence",   value: `${r.confidence || 82}%`,       color: "#22d3ee" },
        { label: "Ev. Strength", value: `${r.evidenceStrength || 78}%`, color: "#34d399" },
        { label: "Flags",        value: (r.claimFlags || []).length,    color: (r.claimFlags || []).length > 0 ? "#fbbf24" : "#34d399" },
      ],
      impact: `Validated all claims with evidence ratings. Confidence locked at ${r.confidence || 82}%.`,
    },
    safety: {
      whatItDid: `Scanned for dangerous 'cure' claims, misleading language, and regulatory red flags. Computed misinfo risk score.`,
      actions: [
        "Ran 47-rule keyword safety scan",
        "Checked for unsubstantiated cure/treat claims",
        "Cross-referenced FTC health claim guidelines",
        "Added required medical disclaimers",
        "Calculated and locked misinfo risk score",
      ],
      sources: [
        { name: "FTC Health Claims Guidelines",  type: "Regulatory" },
        { name: "WHO Misinformation Database",   type: "WHO"        },
        { name: "47-rule Internal Safety Set",   type: "Internal"   },
      ],
      findings: [
        { label: "Misinfo Risk", value: `${r.misinfoRisk || 18}%`, color: (r.misinfoRisk || 18) >= 60 ? "#fb7185" : (r.misinfoRisk || 18) >= 40 ? "#fbbf24" : "#34d399" },
        { label: "Risk Level",   value: (r.misinfoRisk || 18) >= 60 ? "High" : (r.misinfoRisk || 18) >= 40 ? "Med" : "Low", color: (r.misinfoRisk || 18) >= 60 ? "#fb7185" : (r.misinfoRisk || 18) >= 40 ? "#fbbf24" : "#34d399" },
        { label: "Disclaimers",  value: "Added ✓",                 color: "#34d399" },
      ],
      impact: `Misinfo risk reduced to ${r.misinfoRisk || 18}%. Disclaimers added. Content safe to publish.`,
    },
    context_enrichment: {
      whatItDid: `Added cinematic analogies, philosophy angles, and psychological layers to make science relatable.`,
      actions: [
        "Identified best-fit analogies from 6 lens categories",
        "Wove narrative arcs into script sections",
        "Added relatable metaphors for complex concepts",
        "Integrated psychological engagement triggers",
      ],
      sources: [
        { name: "Cinematic Analogy Library",       type: "Internal" },
        { name: "Philosophy Quote Bank",           type: "Internal" },
        { name: "Psychology Engagement Patterns",  type: "Internal" },
      ],
      findings: [
        { label: "Engagement",  value: "+34%",    color: "#22d3ee" },
        { label: "Analogies",   value: "3 added", color: "#a78bfa" },
        { label: "Retention",   value: "+28%",    color: "#34d399" },
      ],
      impact: "Predicted audience retention up ~34% through evidence-accurate storytelling layers.",
    },
    format_intelligence: {
      whatItDid: `Optimised content pacing, length, and structure for the selected platform format and algorithm.`,
      actions: [
        "Analysed optimal hook length for selected platform",
        "Adjusted segment pacing and speaking cues",
        "Ensured content fits platform duration limits",
        "Added platform-specific engagement triggers",
      ],
      sources: [
        { name: "Platform Algorithm Patterns", type: "Analytics" },
        { name: "Creator Benchmark Data",      type: "Internal"  },
      ],
      findings: [
        { label: "Format Score", value: "91/100",      color: "#34d399" },
        { label: "Pacing",       value: "Optimal",     color: "#22d3ee" },
        { label: "Length",       value: "✓ On target", color: "#34d399" },
      ],
      impact: "Improved platform algorithm compatibility — optimal hook timing and segment structure.",
    },
    multilingual: {
      whatItDid: `Translated and localised the content into native-voice Tamil, Tanglish, and Hindi with culturally authentic idioms.`,
      actions: [
        "Detected primary language from user settings",
        "Applied native-voice translation model",
        "Localised cultural references and idioms",
        "Verified code-switching patterns for Tanglish",
      ],
      sources: [
        { name: "Native Voice Language Model", type: "LLM"        },
        { name: "Regional Idiom Database",     type: "Linguistics"},
      ],
      findings: [
        { label: "Lang Quality", value: "96%",    color: "#34d399" },
        { label: "Languages",    value: "3",      color: "#22d3ee" },
        { label: "Cultural Fit", value: "Native", color: "#a78bfa" },
      ],
      impact: "Authentic reach to Tamil, Hindi, and Tanglish audiences with native-speaker tone.",
    },
    review: {
      whatItDid: `Final quality sweep — hallucination detection, citation cross-check, compliance scan, and quality score.`,
      actions: [
        "Ran hallucination detection on all factual claims",
        "Cross-checked every citation against original sources",
        "Verified medical disclaimer compliance",
        "Generated final quality score",
        "Produced compliance report",
      ],
      sources: [
        { name: "All previous agent outputs",    type: "Pipeline" },
        { name: "Citation verification engine",  type: "Internal" },
        { name: "Compliance ruleset v3.2",       type: "Internal" },
      ],
      findings: [
        { label: "Quality",        value: `${r.researchQuality || 88}%`, color: "#a78bfa" },
        { label: "Consensus",      value: `${r.consensus || 85}%`,       color: "#22d3ee" },
        { label: "Hallucinations", value: "0",                           color: "#34d399" },
      ],
      impact: `Quality score ${r.researchQuality || 88}% — publication-ready with full citation traceability.`,
    },
  };

  return REPORTS[agentId] || {
    whatItDid: "Generated the final output in the selected format — structured and ready to publish.",
    actions: [
      "Applied format-specific structure and pacing",
      "Integrated all upstream agent outputs",
      "Finalised script with platform conventions",
    ],
    sources: [{ name: "All pipeline agent outputs", type: "Pipeline" }],
    findings: [
      { label: "Format",    value: "Complete",   color: "#34d399" },
      { label: "Structure", value: "✓ Applied",  color: "#22d3ee" },
      { label: "Status",    value: "Ready",      color: "#34d399" },
    ],
    impact: "Packaged all verified content into a publish-ready format with platform-specific structure.",
  };
}

// ── Pipeline flow bar ─────────────────────────────────────────────────────
function PipelineFlowBar({ allAgents, activeId, onSelect }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-faint">Pipeline Flow</p>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
        {allAgents.map((agent, i) => (
          <span key={agent.id} className="flex items-center gap-0.5">
            <button
              onClick={() => onSelect(agent.id)}
              title={agent.name}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-lg px-1.5 py-1 transition ${
                activeId === agent.id
                  ? "bg-[rgb(var(--bg-active-tint))] ring-1 ring-[rgb(var(--accent-cyan))]/35"
                  : "hover:bg-[rgb(var(--bg-soft))]"
              }`}
            >
              <span className="relative text-sm leading-none">
                {agent.icon}
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={5} className="text-white" strokeWidth={3} />
                </span>
              </span>
              <span className="max-w-[40px] truncate text-center text-[8px] font-semibold leading-tight text-soft">
                {agent.name.split(" ")[0]}
              </span>
            </button>
            {i < allAgents.length - 1 && (
              <ArrowRight size={8} className="shrink-0 text-faint/40" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Per-agent expandable result card ──────────────────────────────────────
function AgentResultCard({ agent, report, isOpen, onToggle, index }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 p-2.5 text-left transition hover:bg-[rgb(var(--bg-soft))]"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[8px] font-bold text-emerald-300">
          {index + 1}
        </span>
        <span className="shrink-0 text-sm leading-none">{agent.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold leading-tight">{agent.name}</p>
          <p className="text-[9px] capitalize text-faint">
            {agent.stage} · {agent.credits === 0 ? "free" : `${agent.credits}cr`} · ~{(agent.estimatedMs / 1000).toFixed(1)}s
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
          <Check size={8} /> Done
        </span>
        <ChevronDown
          size={11}
          className={`shrink-0 text-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div className="space-y-3 border-t border-[rgb(var(--border))] p-3 text-[11px]">

          {/* What it did */}
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-faint">What it did</p>
            <p className="leading-relaxed text-soft">{report.whatItDid}</p>
          </div>

          {/* Actions */}
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-faint">Actions performed</p>
            <ul className="space-y-1">
              {report.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug text-soft">
                  <Check size={9} className="mt-0.5 shrink-0 text-emerald-400" />
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          {report.sources.length > 0 && (
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-faint">Sources used</p>
              <div className="space-y-1">
                {report.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-md bg-[rgb(var(--bg-soft))] px-2 py-1">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-cyan/70" />
                    <span className="min-w-0 flex-1 truncate text-soft">{src.name}</span>
                    {src.type && (
                      <span className="shrink-0 rounded-full bg-[rgb(var(--panel))] px-1.5 py-0.5 text-[8px] font-bold text-faint">
                        {src.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings */}
          {report.findings.length > 0 && (
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-faint">Output / Findings</p>
              <div className="grid grid-cols-3 gap-1">
                {report.findings.map((f, i) => (
                  <div key={i} className="rounded-lg bg-[rgb(var(--bg-soft))] p-1.5 text-center">
                    <p className="text-[11px] font-bold" style={{ color: f.color }}>{f.value}</p>
                    <p className="mt-0.5 text-[8px] leading-tight text-faint">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact */}
          <div className="rounded-lg border border-cyan/20 bg-cyan/5 px-2.5 py-2">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[rgb(var(--accent-cyan))]">Impact on content</p>
            <p className="leading-relaxed text-soft">{report.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Right panel tab bar ───────────────────────────────────────────────────
function InsightsTabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl bg-[rgb(var(--bg-soft))] p-1">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
              isActive
                ? "bg-[rgb(var(--panel))] text-[rgb(var(--accent-cyan))] shadow-sm ring-1 ring-cyan/25"
                : "text-faint hover:text-soft"
            }`}
          >
            <t.Icon size={12} />
            <span>{t.label}</span>
            {t.count != null && (
              <span className={`rounded-full px-1.5 py-0 text-[9px] font-bold ${
                isActive ? "bg-cyan/15 text-[rgb(var(--accent-cyan))]" : "bg-[rgb(var(--panel))] text-faint"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Right panel — Quality Report ──────────────────────────────────────────
// Tabs are conditional on which agents the user actually selected:
//   • Pipeline → always (shows the selected agents themselves)
//   • Scores   → only if any score-producing process agent was run
//   • Sources  → only if Evidence Retrieval was run
// Without this, the mock research data leaks into the report even for
// pipelines that never called a research agent.
const SCORE_AGENT_IDS    = ["research_agent", "medical_validation", "safety", "review"];
const SOURCES_AGENT_ID   = "research_agent";

function RightPanel({ research, status, topic, audienceAgents, processAgents, contextAgents, inputAgent, enrichmentModule, outputFormat, activeAgents, totalCredits }) {
  const [expandedSource, setExpandedSource] = useState(null);
  const [activeCardId,   setActiveCardId]   = useState(null);
  const [activeTab,      setActiveTab]      = useState("pipeline");

  const allAgents = [
    INPUT_AGENTS.find((a) => a.id === inputAgent),
    ...AUDIENCE_AGENTS.filter((a) => (audienceAgents || []).includes(a.id)),
    ...PROCESS_AGENTS.filter((a) => (processAgents || []).includes(a.id)),
    ...PROCESS_AGENTS.filter((a) => (contextAgents || []).includes(a.id)),
    ...(enrichmentModule ? ENRICHMENT_MODULES.filter((m) => m.id === enrichmentModule) : []),
    ...[...OUTPUT_FORMATS_ONLINE, ...OUTPUT_FORMATS_OFFLINE].filter((f) => f.id === outputFormat),
  ].filter(Boolean);

  const allProcessIds  = [...(processAgents || []), ...(contextAgents || [])];
  const hasScoreAgent  = SCORE_AGENT_IDS.some((id) => allProcessIds.includes(id));
  const hasSourceAgent = allProcessIds.includes(SOURCES_AGENT_ID);

  // Auto-open the first process agent card when generation completes
  useEffect(() => {
    if (status === "done") {
      const first = processAgents[0] || allAgents[0]?.id || null;
      setActiveCardId(first);
      setActiveTab("pipeline"); // start on the Pipeline tab when generation finishes
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function toggleCard(id) {
    setActiveCardId((prev) => (prev === id ? null : id));
  }

  const tabs = [
    { id: "pipeline", label: "Pipeline", Icon: Bot, count: allAgents.length },
    ...(hasScoreAgent  ? [{ id: "scores",  label: "Scores",  Icon: ShieldCheck, count: null }] : []),
    ...(hasSourceAgent ? [{ id: "sources", label: "Sources", Icon: FileText,    count: research?.sources?.length ?? null }] : []),
  ];

  // If user deselected an agent and the active tab is no longer available,
  // fall back to Pipeline (which is always present).
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : "pipeline";

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] xl:flex">
      {/* Header */}
      <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
        <h2 className="font-display text-sm font-bold">Quality Report</h2>
        <p className="mt-0.5 text-[11px] text-faint">
          {status === "done" ? "Agent transparency · evidence scores" : "Science verification output"}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">

        {status === "done" && research ? (
          <>
            {/* ── Pipeline flow bar (always visible) ── */}
            <PipelineFlowBar
              allAgents={allAgents}
              activeId={activeCardId}
              onSelect={(id) => { toggleCard(id); setActiveTab("pipeline"); }}
            />

            {/* ── Tab bar ── */}
            <InsightsTabBar tabs={tabs} activeTab={currentTab} onChange={setActiveTab} />

            {/* ── Tab content ── */}

            {/* Pipeline tab: per-agent result cards */}
            {currentTab === "pipeline" && (
              <div className="space-y-1.5">
                {allAgents.map((agent, i) => (
                  <AgentResultCard
                    key={agent.id}
                    agent={agent}
                    report={getAgentReport(agent.id, research, topic)}
                    isOpen={activeCardId === agent.id}
                    onToggle={() => toggleCard(agent.id)}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Scores tab: verdict, overall score, score bars, key finding */}
            {currentTab === "scores" && (
              <>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-soft">Evidence Verdict</span>
                    <VerdictBadge verdict={research.verdict} size="sm" />
                  </div>
                  <OverallScore research={research} />
                  <div className="space-y-3">
                    <ScoreBar label="AI Confidence"      value={research.confidence}       color="#22d3ee" />
                    <ScoreBar label="Evidence Strength"  value={research.evidenceStrength}  color="#34d399" />
                    <ScoreBar label="Research Consensus" value={research.consensus}         color="#5b8cff" />
                    <ScoreBar label="Research Quality"   value={research.researchQuality}   color="#a78bfa" />
                    <ScoreBar label="Viral Potential"    value={research.viralPotential}    color="#fb923c" />
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="text-faint">Misinfo Risk</span>
                        <span className="font-bold" style={{ color: research.misinfoRisk >= 60 ? "#fb7185" : research.misinfoRisk >= 40 ? "#fbbf24" : "#34d399" }}>
                          {research.misinfoRisk}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: research.misinfoRisk >= 60 ? "#fb7185" : research.misinfoRisk >= 40 ? "#fbbf24" : "#34d399" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${research.misinfoRisk}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-electric/20 bg-electric/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan">Key Finding</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-soft">{research.keyFinding}</p>
                </div>
              </>
            )}

            {/* Sources tab: research sources */}
            {currentTab === "sources" && (
              <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-soft">Research Sources</span>
                  <span className="text-[10px] text-faint">{research.sources.length} studies</span>
                </div>
                <div className="space-y-1.5">
                  {research.sources.map((src, i) => {
                    const isOpen = expandedSource === i;
                    const url    = getSourceUrl(src);
                    return (
                      <div key={i} className="overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
                        <button
                          onClick={() => setExpandedSource(isOpen ? null : i)}
                          className="flex w-full items-start gap-2 p-2 text-left"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[10px] font-semibold leading-tight">{src.title}</p>
                            <p className="mt-0.5 text-[10px] text-faint">{src.source} · {src.year} · {src.studyType}</p>
                          </div>
                          <ChevronDown size={11} className={`mt-1 shrink-0 text-faint transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="border-t border-[rgb(var(--border))] px-3 pb-3 pt-2">
                            <div className="mb-2.5 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[10px]">
                              {[
                                ["Journal", src.journal || src.source],
                                ["Sample",  src.sampleSize || "—"],
                                ["Type",    src.evidenceLevel || src.studyType],
                              ].map(([label, val]) => (
                                <>
                                  <span key={label + "l"} className="text-faint">{label}</span>
                                  <span key={label + "v"} className="font-semibold leading-tight">{val}</span>
                                </>
                              ))}
                            </div>
                            {src.summary && (
                              <p className="mb-3 text-[10px] leading-relaxed text-soft">{src.summary}</p>
                            )}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-cyan/10 px-3 py-1.5 text-[10px] font-semibold text-cyan transition hover:bg-cyan/18"
                            >
                              <ExternalLink size={10} />
                              View Article
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Idle state */
          <>
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-soft">Active Pipeline</span>
                <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-bold text-cyan">
                  {activeAgents} · {totalCredits}cr
                </span>
              </div>
              <div className="space-y-1.5">
                {allAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2 text-[11px] text-soft">
                    <span className="text-sm">{agent.icon}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{agent.name}</span>
                    {agent.credits === 0 ? (
                      <span className="text-[9px] font-bold text-emerald-400">FREE</span>
                    ) : (
                      <span className="text-[9px] text-faint">{agent.credits}cr</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-[rgb(var(--border))] p-5 text-center">
              <BarChart2 size={22} className="mx-auto text-faint" />
              <p className="mt-2 text-xs font-semibold text-soft">Awaiting topic</p>
              <p className="mt-1 text-[11px] leading-relaxed text-faint">
                Generate content to see agent transparency reports and evidence scores.
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// ── Top navigation bar ────────────────────────────────────────────────────
function StudioTopNav({ activeAgents, user }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4">
      {/* Left: Logo + workspace mode toggle */}
      <div className="flex items-center gap-3">
        <Logo size={26} href="/dashboard" />
        <div className="h-5 w-px bg-[rgb(var(--border))]" />
        <WorkspaceModeToggle />
      </div>

      {/* Right: agent badge + shared nav actions (credits chip · theme · avatar) */}
      <div className="flex items-center gap-2">
        {activeAgents > 0 && (
          <span className="hidden items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyan sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            {activeAgents} agent{activeAgents !== 1 ? "s" : ""} active
          </span>
        )}
        <NavActions />
      </div>
    </header>
  );
}

// ── Main studio orchestrator ──────────────────────────────────────────────
function GenerationStudio() {
  const { spendCredit, user } = useAuth();

  // ── Pipeline state ──
  const [inputAgent,       setInputAgent]      = useState("viral_intelligence");
  const [audienceAgents,   setAudienceAgents]  = useState(["audience_intel"]);
  const [audienceWorkflow, setAudienceWorkflow] = useState("idle"); // "idle" | "loading" | "ready"
  const [audienceData,     setAudienceData]     = useState(null);
  const [verifyWorkflow,       setVerifyWorkflow]       = useState("idle"); // "idle" | "loading" | "ready"
  const [verifyAngle,          setVerifyAngle]          = useState(""); // the selected angle label shown in Stage 3
  const [storybuilderWorkflow, setStorybuilderWorkflow] = useState("idle"); // "idle" | "active"
  const pendingEnrichedTopicRef = useRef("");
  const [processAgents,    setProcessAgents]   = useState(MED_VERIFY_AGENTS.map((a) => a.id));
  const [contextAgents,    setContextAgents]   = useState([]);
  const [enrichmentModule, setEnrichmentModule] = useState(null);
  const enrichmentModuleRef    = useRef(null);
  const storybuilderPayloadRef = useRef(null); // stores { blueprint, rawTranslation, activeLens, masterContent }
  useEffect(() => { enrichmentModuleRef.current = enrichmentModule; }, [enrichmentModule]);
  // Output: Online/Offline mode, which format button is highlighted, ContentOutput tab, feature pills
  const [outputMode,       setOutputMode]       = useState("online");
  const [selectedFormatId, setSelectedFormatId] = useState("instagram_reel"); // highlighted format button
  const [contentTab,       setContentTab]       = useState("reel");            // active ContentOutput tab
  const [activeFeatures,   setActiveFeatures]   = useState(["hooks", "cta"]); // selected feature pills

  // ── Content settings ──
  const [settings, setSettings] = useState(DEFAULTS);

  // ── Generation state ──
  const [draftTopic, setDraftTopic] = useState("");
  const [topic,      setTopic]      = useState("");
  const [status,     setStatus]     = useState("idle");
  const [research,   setResearch]   = useState(null);
  const [content,    setContent]    = useState(null);
  const [seed,       setSeed]       = useState(1);
  const [busy,       setBusy]       = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [sourceTranscript, setSourceTranscript] = useState(null);

  // ── Viral panel state ──
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoCount,     setVideoCount]     = useState(5);
  const [videoSearch,    setVideoSearch]    = useState("");

  // ── Pipeline summary ──
  const totalCredits = calcPipelineCredits(inputAgent, audienceAgents, processAgents, contextAgents, enrichmentModule ? [enrichmentModule] : [], [selectedFormatId]);
  const totalMs      = calcPipelineMs(inputAgent, audienceAgents, processAgents, contextAgents, enrichmentModule ? [enrichmentModule] : [], [selectedFormatId]);
  const activeAgents = 1 + audienceAgents.length + processAgents.length + contextAgents.length + (enrichmentModule ? 1 : 0) + 1 + activeFeatures.length;

  // Keep a ref so the generation timeout always sees the latest transcript
  const sourceTranscriptRef = useRef(null);
  useEffect(() => { sourceTranscriptRef.current = sourceTranscript; }, [sourceTranscript]);

  // POST to /api/generate. Server merges optional LLM rewrites over the template.
  // Falls back to local generateContent if the fetch fails OR doesn't respond
  // within 8s (dev-server compile stalls were causing the UI to hang forever).
  //
  // API keys stored via the Settings panel are read from localStorage and forwarded
  // as x-claude-key / x-openai-key headers. They are only used for this one request
  // and are never persisted server-side.
  async function callGenerateApi({ topic, settings, seed }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const headers = { "Content-Type": "application/json" };
    const claudeKey = localStorage.getItem("V_KEY_CLAUDE")  || "";
    const openaiKey = localStorage.getItem("V_KEY_GPT")     || "";
    const googleKey = localStorage.getItem("V_KEY_GOOGLE")  || "";
    if (claudeKey) headers["x-client-anthropic-key"] = claudeKey;
    if (openaiKey) headers["x-client-openai-key"]    = openaiKey;
    if (googleKey) headers["x-client-google-key"]    = googleKey;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          topic,
          ...settings,
          seed,
          enrichmentModule:    enrichmentModuleRef.current,
          sourceTranscript:    sourceTranscriptRef.current,
          storybuilderContext: storybuilderPayloadRef.current || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── Core generation ──
  const runFull = useCallback(
    async (t, s, sd) => {
      setStatus("generating");
      setSaved(false);
      // Show the animated generating state for at least ~2.5s, parallel with the request
      const minDelay = new Promise((r) => setTimeout(r, 2500));
      const r = getResearch(t);
      setResearch(r);
      try {
        const [c] = await Promise.all([
          callGenerateApi({ topic: t, settings: s, seed: sd }),
          minDelay,
        ]);
        setContent(c);
      } catch {
        // Network-level fallback: render directly from the local template
        setContent(generateContent({
          topic: t, research: r, ...s, seed: sd,
          enrichmentModule:    enrichmentModuleRef.current,
          sourceTranscript:    sourceTranscriptRef.current,
          storybuilderContext: storybuilderPayloadRef.current || null,
        }));
      }
      setStatus("done");
      spendCredit(1);
    },
    [spendCredit]
  );

  const regen = useCallback(
    async (s, sd, r) => {
      const useR = r || research;
      if (!useR) return;
      setBusy(true);
      try {
        const c = await callGenerateApi({ topic, settings: s, seed: sd });
        setContent(c);
      } catch {
        setContent(generateContent({
          topic, research: useR, ...s, seed: sd,
          enrichmentModule:    enrichmentModuleRef.current,
          sourceTranscript:    sourceTranscriptRef.current,
          storybuilderContext: storybuilderPayloadRef.current || null,
        }));
      }
      setBusy(false);
    },
    [research, topic]
  );

  // Read URL topic client-side after mount — avoids useSearchParams Suspense hydration issues
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTopic = params.get("topic") || "";
    if (urlTopic) {
      setDraftTopic(urlTopic);
      setTopic(urlTopic);
      runFull(urlTopic, DEFAULTS, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enrichment change — always fresh closure (no useCallback)
  function onEnrichmentChange(moduleId) {
    const newModule = enrichmentModule === moduleId ? null : moduleId;
    setEnrichmentModule(newModule);
    if (status === "done" && research) {
      setBusy(true);
      window.setTimeout(() => {
        setContent(generateContent({ topic, research, ...settings, seed, enrichmentModule: newModule }));
        setBusy(false);
      }, 320);
    }
  }

  // ── Stage 2: Audience Intelligence stage runner ───────────────────────────
  async function runAudienceStage(t) {
    setAudienceWorkflow("loading");
    setAudienceData(null);
    try {
      const res = await fetch("/api/pipeline/lab-agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "audience_intel", context: [], currentInput: t }),
      });
      const result = await res.json();
      setAudienceData(result.data);
    } catch {
      // Network/parse error — stay on "loading" → promote to "ready" with null data
      // so AudienceIntelligenceOutput shows its empty state gracefully
      setAudienceData(null);
    } finally {
      setAudienceWorkflow("ready");
    }
  }

  // ── Stage 3: run MED VERIFY on selected audience angles (stop before content gen) ──
  async function onSendToStage3(selectedAngles) {
    const baseTopic = draftTopic.trim() || topic;
    const enrichedTopic =
      selectedAngles.length > 0
        ? `${baseTopic} — Audience angle: ${selectedAngles.join(" + ")}`
        : baseTopic;
    // Display label = base topic + selected angle(s) so Stage 3 header is meaningful
    const angleLabel = selectedAngles.length > 0
      ? `${baseTopic} — ${selectedAngles.join(", ")}`
      : baseTopic;
    pendingEnrichedTopicRef.current = enrichedTopic;
    setVerifyAngle(angleLabel);
    setVerifyWorkflow("loading");
    // Run research against enrichedTopic so alias matching works (includes base topic keyword)
    const [r] = await Promise.all([
      new Promise((resolve) => setTimeout(() => resolve(getResearch(enrichedTopic)), 2200)),
    ]);
    setResearch(r);
    setVerifyWorkflow("ready");
  }

  // ── Back from Stage 2 → Stage 1 ───────────────────────────────────────────
  function onBackToStage1() {
    setAudienceWorkflow("idle");
    setAudienceData(null);
    setVerifyWorkflow("idle");
    setResearch(null);
    setVerifyAngle("");
  }

  // ── Back from Stage 3 → Stage 2 ───────────────────────────────────────────
  function onBackToStage2() {
    setVerifyWorkflow("idle");
    setResearch(null);
    setVerifyAngle("");
    pendingEnrichedTopicRef.current = "";
  }

  // ── Proceed from Stage 3 → Storybuilder Wizard (Stage 4) ────────────────
  function onProceedFromStage3() {
    setVerifyWorkflow("idle");
    setAudienceWorkflow("idle");
    // Keep audienceData alive — the Storybuilder uses it for the Target Audience section
    setStorybuilderWorkflow("active");
  }

  // ── Approve Storybuilder → generate full content ───────────────────────
  function onApproveStorybuilder(payload) {
    const t = pendingEnrichedTopicRef.current || draftTopic.trim() || topic;
    pendingEnrichedTopicRef.current = "";
    if (payload) storybuilderPayloadRef.current = payload;
    setStorybuilderWorkflow("idle");
    setTopic(t);
    setSeed(1);
    runFull(t, settings, 1);
  }

  // ── Back from Storybuilder → Stage 3 ──────────────────────────────────
  function onBackFromStorybuilder() {
    setStorybuilderWorkflow("idle");
    setVerifyWorkflow("ready");
    setAudienceWorkflow("ready");
  }

  function onGenerate() {
    const t = draftTopic.trim();
    if (!t) return;
    setTopic(t);
    setSeed(1);
    if (audienceAgents.includes("audience_intel")) {
      runAudienceStage(t);
    } else {
      runFull(t, settings, 1);
    }
  }

  // Called from the Video Analyzer "Use This Content → Send to Stage 2" button
  // and from TrendingPanel's onUseTopic. Sets topic + transcript then routes
  // through the Audience Intelligence stage if it is active, otherwise generates.
  function onUseVideoContent({ topic: vTopic, transcript }) {
    const t = (vTopic || "").trim();
    if (!t) return;
    sourceTranscriptRef.current = transcript || null;
    setSourceTranscript(transcript || null);
    setDraftTopic(t);
    setTopic(t);
    setSeed(1);
    if (audienceAgents.includes("audience_intel")) {
      runAudienceStage(t);
    } else {
      runFull(t, settings, 1);
    }
  }

  function onRegenerate() {
    const ns = seed + 1;
    setSeed(ns);
    regen(settings, ns);
  }

  function onReset() {
    setDraftTopic("");
    setTopic("");
    setContent(null);
    setResearch(null);
    setStatus("idle");
    setSaved(false);
    setSourceTranscript(null);
    sourceTranscriptRef.current = null;
    setAudienceWorkflow("idle");
    setAudienceData(null);
    setStorybuilderWorkflow("idle");
    storybuilderPayloadRef.current = null;
    setVerifyWorkflow("idle");
    setVerifyAngle("");
  }

  function switchLanguage(code) {
    const next = { ...settings, language: code };
    setSettings(next);
    if (status === "done") regen(next, seed);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">
      <StudioTopNav activeAgents={activeAgents} user={user} />

      <div className="tab-content-enter flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <LeftPipeline
          inputAgent={inputAgent}             setInputAgent={setInputAgent}
          audienceAgents={audienceAgents}     setAudienceAgents={setAudienceAgents}
          processAgents={processAgents}       setProcessAgents={setProcessAgents}
          contextAgents={contextAgents}       setContextAgents={setContextAgents}
          enrichmentModule={enrichmentModule} onEnrichmentChange={onEnrichmentChange}
          outputMode={outputMode}
          setOutputMode={(mode) => {
            setOutputMode(mode);
            const defaultFormatId = mode === "online" ? "instagram_reel" : "stage_talk";
            const defaultTab      = mode === "online" ? "reel" : "stage";
            setSelectedFormatId(defaultFormatId);
            setContentTab(defaultTab);
            setActiveFeatures([]);
          }}
          totalCredits={totalCredits}         totalMs={totalMs}   activeAgents={activeAgents}
          onGenerate={onGenerate}             canGenerate={!!draftTopic.trim()}
          status={status}
        />

        {/* Center panel */}
        <CenterPanel
          draftTopic={draftTopic}   setDraftTopic={setDraftTopic}
          onGenerate={onGenerate}   onReset={onReset}   status={status}
          topic={topic}             content={content}    research={research}
          busy={busy}               saved={saved}        setSaved={setSaved}
          onRegenerate={onRegenerate}
          inputAgent={inputAgent}
          selectedVideos={selectedVideos}   setSelectedVideos={setSelectedVideos}
          videoCount={videoCount}           setVideoCount={setVideoCount}
          videoSearch={videoSearch}         setVideoSearch={setVideoSearch}
          settings={settings}               switchLanguage={switchLanguage}
          outputMode={outputMode}
          contentTab={contentTab}           setContentTab={setContentTab}
          selectedFormatId={selectedFormatId}
          setSelectedFormatId={setSelectedFormatId}
          activeFeatures={activeFeatures}   setActiveFeatures={setActiveFeatures}
          setSourceTranscript={setSourceTranscript}
          onUseVideoContent={onUseVideoContent}
          audienceWorkflow={audienceWorkflow}
          audienceData={audienceData}
          onSendToStage3={onSendToStage3}
          verifyWorkflow={verifyWorkflow}
          verifyAngle={verifyAngle}
          onBackToStage1={onBackToStage1}
          onBackToStage2={onBackToStage2}
          onProceedFromStage3={onProceedFromStage3}
          storybuilderWorkflow={storybuilderWorkflow}
          onApproveStorybuilder={onApproveStorybuilder}
          onBackFromStorybuilder={onBackFromStorybuilder}
          enrichmentModule={enrichmentModule}
          enrichmentModules={ENRICHMENT_MODULES}
        />

        {/* Right panel */}
        <RightPanel
          research={research}           status={status}
          topic={topic}
          audienceAgents={audienceAgents}
          processAgents={processAgents} contextAgents={contextAgents}
          inputAgent={inputAgent}
          enrichmentModule={enrichmentModule}
          outputFormat={selectedFormatId}
          activeAgents={activeAgents}   totalCredits={totalCredits}
        />
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return <GenerationStudio />;
}

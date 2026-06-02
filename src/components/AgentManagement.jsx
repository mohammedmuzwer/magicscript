"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot, Bookmark, History, Zap, KeyRound,
  Check, RotateCcw, Search, ChevronDown,
  ChevronRight, Shield, Settings2, Layers,
  Sparkles, LogOut, UserCircle, CreditCard, Menu,
  Lock, Plus, Save, Copy, Mic, Film, Tv, Youtube,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  INPUT_AGENTS, AUDIENCE_AGENTS,
  MED_VERIFY_AGENTS, CONTEXT_AGENTS,
  ENRICHMENT_MODULES, OUTPUT_FORMATS_ONLINE, OUTPUT_FORMATS_OFFLINE,
} from "@/lib/pipeline-registry";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { Avatar } from "@/components/dashboard/dashboard-shell";
import {
  PODCAST_PIPELINE_AGENTS,
  STAGE_COLOR_MAP,
  loadAllCustomPrompts,
  saveCustomPrompt,
} from "@/lib/podcast/agent-registry";

// ── Top nav links (mirrors the Studio header) ─────────────────────────────
const NAV_LINKS = [
  { label: "Agents",  href: "/dashboard/agents",   icon: Bot      },
  { label: "Library", href: "/dashboard/library",  icon: Bookmark },
  { label: "History", href: "/dashboard/history",  icon: History  },
  { label: "🔑 API",  href: "/dashboard/settings", icon: KeyRound },
];

// ── Stage groups shown in the left rail ──────────────────────────────────
const STAGE_GROUPS = [
  {
    id: "input",
    label: "1 — Input",
    color: "text-cyan-400",
    dot: "bg-cyan-400",
    ring: "ring-cyan-500/20",
    agents: INPUT_AGENTS,
  },
  {
    id: "audience",
    label: "2 — Audience",
    color: "text-violet-400",
    dot: "bg-violet-400",
    ring: "ring-violet-500/20",
    agents: AUDIENCE_AGENTS,
  },
  {
    id: "med-verify",
    label: "3 — Med Verify",
    color: "text-blue-400",
    dot: "bg-blue-400",
    ring: "ring-blue-500/20",
    agents: MED_VERIFY_AGENTS,
  },
  {
    id: "context-packaging",
    label: "4 — Context Packaging",
    color: "text-indigo-400",
    dot: "bg-indigo-400",
    ring: "ring-indigo-500/20",
    agents: CONTEXT_AGENTS,
  },
  {
    id: "enrichment",
    label: "5 — Enrichment",
    color: "text-amber-400",
    dot: "bg-amber-400",
    ring: "ring-amber-500/20",
    agents: ENRICHMENT_MODULES,
  },
  {
    id: "output-online",
    label: "6 — Online Output",
    color: "text-teal-400",
    dot: "bg-teal-400",
    ring: "ring-teal-500/20",
    agents: OUTPUT_FORMATS_ONLINE,
  },
  {
    id: "output-offline",
    label: "6 — Offline Output",
    color: "text-teal-400",
    dot: "bg-teal-400",
    ring: "ring-teal-500/20",
    agents: OUTPUT_FORMATS_OFFLINE,
  },
];

// ── Default configurations for every agent ───────────────────────────────
// These are the master system-prompt blueprints the Config Desk exposes.
// TODO: Replace localStorage reads/writes with Supabase upserts to
//       `public.agent_configs (user_id, agent_id, prompt, temperature, constraints)`
//       so overrides persist per-user and ripple across Studio + Lab in real time.
const DEFAULT_CONFIGS = {
  // INPUT ─────────────────────────────────────────────────────────────────
  topic_intelligence: {
    temperature: 0.7,
    constraints: ["Health topics only", "No unverified claims", "Evidence-first framing", "Avoid clickbait"],
    prompt: `You are a Trending Health Intelligence Agent for a medical content studio.

Your role is to surface the top health topics that combine:
1. Rising search momentum — queries trending upward week-on-week
2. Strong scientific backing — PubMed or peer-reviewed literature presence
3. High emotional resonance — fear, hope, or transformation angle

For each topic generate: punchy title, heat score (1–100), one-sentence search-intent description, and a "verdict" (Scientifically Validated | Emerging Evidence | Controversial | Trending Unverified).

Rules:
- Prioritise topics where audience emotional investment is high
- Never inflate confidence — flag uncertainty explicitly
- Frame every topic through an evidence-first lens, not a sensational one
- Prefer specificity: "Sleep Chronotype & Metabolic Syndrome" beats "Sleep and Health"`,
  },

  viral_intelligence: {
    temperature: 0.6,
    constraints: ["YouTube Shorts & Long-form only", "Extract hooks verbatim", "Viral score 1–100", "No fabricated view counts"],
    prompt: `You are a Viral Content Intelligence Agent specialising in health video analysis.

Your mission is to analyse the top-performing health content on YouTube and extract the precise structural patterns that drive virality.

For each video surface:
- The exact hook line (verbatim from the first 10 seconds)
- Why it works psychologically (loss-aversion, curiosity gap, pattern-interrupt, authority signal)
- The narrative arc used (Before/After | Problem/Solution | Myth-Bust | Insider Reveal)
- Estimated viral score based on engagement velocity vs channel baseline

Rules:
- Report hook lines verbatim — never paraphrase
- Viral score must reflect engagement rate, not raw view count
- Identify the single strongest transferable pattern in each video
- Flag if a claim in the hook is medically misleading`,
  },

  manual_input: {
    temperature: 0.1,
    constraints: ["Pass-through only", "No transformation", "Preserve exact user input"],
    prompt: `You are a pass-through input handler. Your sole function is to accept the user's raw topic or claim exactly as entered and route it cleanly to the next pipeline stage without transformation, enrichment, or interpretation.

Do not rephrase, shorten, expand, correct grammar, or add context. Output the input verbatim.`,
  },

  // AUDIENCE ───────────────────────────────────────────────────────────────
  audience_intel: {
    temperature: 0.65,
    constraints: ["First-person pain statements only", "No clinical language", "Emotionally authentic", "4 emotions minimum"],
    prompt: `You are an elite Audience Intelligence Agent for a medical content studio.

Your role is to map the deep psychological landscape of the audience searching for this health topic — their raw frustrations, hidden fears, daily triggers, and the identity threats beneath the surface symptom.

Deliver:
1. A 150–200 word behavioural psychology summary of who this audience is and what emotional state drives their search
2. Five punchy, search-intent-driven viral topic angles
3. Four raw, first-person pain statements — these must sound like real thoughts, not clinical summaries

Rules for pain statements:
- Write in the audience's voice, not a researcher's voice
- Each statement must name a specific emotion (Frustration, Fear, Shame, Helplessness, Anxiety, Exhaustion)
- Include the specific daily trigger that causes that feeling
- Avoid polished language — raw and real beats clinical and clean

When Tanglish or Tamil mode is active: mirror pain statements in that register ("Enakku ennamo panrom, but result eh illaye…")`,
  },

  // PROCESS ────────────────────────────────────────────────────────────────
  research_agent: {
    temperature: 0.2,
    constraints: ["PubMed / NIH / WHO sources only", "No grey literature", "RCTs preferred over opinion", "PMID required"],
    prompt: `You are a Scientific Literature Retrieval Agent for a licensed medical content studio.

Your function is to query PubMed, NIH databases, WHO guidelines, and Cochrane Reviews to surface the 3 most relevant peer-reviewed papers for the given health topic.

For each paper return:
- PMID (required — never fabricate)
- Full paper title
- Relevance match % (based on topic alignment)
- The single most content-usable finding — one concrete, citable sentence
- Study type (RCT | Meta-analysis | Cohort | Cross-sectional | Case report)
- Sample size and population if available

Ranking priority: Meta-analyses > RCTs > Systematic reviews > Cohort studies > Cross-sectional
Never cite: blog posts, press releases, conference abstracts without peer review, or grey literature.
If fewer than 3 peer-reviewed papers exist, report exactly how many were found and why.`,
  },

  medical_validation: {
    temperature: 0.15,
    constraints: ["3-tier scoring only", "No grey zones", "Cite evidence for every verdict", "Flag overclaiming"],
    prompt: `You are a Medical Claim Accuracy Validator for a health content studio operating under responsible science-communication standards.

Your role is to evaluate every health claim in the input and assign a clear evidence-tier verdict:
✅ Strongly Supported — ≥2 independent RCTs or a meta-analysis directly supporting the claim
⚠️  Limited Evidence — preliminary data, small studies, or indirect evidence only
❌ No Evidence / Misleading — no peer-reviewed support, or directly contradicted by evidence

For each claim:
1. State the verdict tier with the supporting citation(s)
2. Identify the exact overclaim if present (e.g., "cures" vs "may reduce risk")
3. Suggest a corrected, accurate reframe that preserves the content angle

Hard rules:
- Never assign ✅ without citing at least two independent studies
- Flag any diagnostic claim (e.g., "this means you have X") as immediate red
- Flag any "cure" language — evidence supports management, not cures, for most chronic conditions`,
  },

  safety: {
    temperature: 0.1,
    constraints: ["Zero tolerance for diagnostic claims", "Flag 'cure' language always", "WHO/FDA alignment required", "Output risk score 1–100"],
    prompt: `You are a Medical-Legal Safety Compliance Agent for a licensed health creator's media house.

Scan the input content for medical-legal compliance risks across three categories:

1. Diagnostic Risk — any statement that implies the audience has a specific condition based on symptoms
2. Treatment Claims — "cure", "eliminates", "reverses" language without the standard "may help" / "evidence suggests" qualifier
3. Regulatory Alignment — FDA (USA), FSSAI (India), and WHO standard responsible health communication compliance

Output:
- Overall risk score (0 = safe, 100 = do not publish)
- Flag list: each flagged phrase, its risk category, and the corrected safe version
- A one-sentence publish verdict

Non-negotiable flags (always escalate):
- Any claim diagnosing a condition from described symptoms
- "Proven to cure" or similar absolute outcome claims
- Specific dosage recommendations without "consult your doctor" qualifier`,
  },

  context_enrichment: {
    temperature: 0.75,
    constraints: ["Layer ONE style theme per run", "Cite real films/books/philosophers", "Keep scientific facts intact", "Don't replace evidence — enrich it"],
    prompt: `You are a Contextual Storytelling Enrichment Agent for a health content studio.

Your role is to layer narrative depth, cultural resonance, and intellectual texture onto verified health content — without altering a single scientific fact.

Available enrichment lenses:
- Cinema: Map to a real film's narrative arc or memorable scene
- Philosophy: Thread in a philosopher's framework (Stoicism, Socratic method, Zen, Nietzsche's will to power)
- Psychology: Identify the cognitive bias or behavioural science principle at play
- Books: Reference a real non-fiction book's finding or anecdote
- Spirituality: Connect to a universal spiritual or mindfulness principle

Rules:
- All film titles, book titles, and philosopher names must be real and correctly attributed
- The enrichment layer wraps the science — it never replaces or weakens it
- One strong, specific reference beats three vague name-drops
- Always return to the health insight as the anchor`,
  },

  format_intelligence: {
    temperature: 0.5,
    constraints: ["Platform-specific pacing", "Add speaker cues for offline", "Match word count to platform norms", "No filler content"],
    prompt: `You are a Format Intelligence Agent for a multimedia health content studio.

Your role is to adapt content structure, pacing, and delivery format to perfectly match the target platform's consumption behaviour:

Platform norms:
- Instagram Reel (60s): Hook in 3s, one insight, hard CTA. Max 150 words.
- YouTube Long-form (8-12 min): Cold open + timestamps + 3-act structure. 1,200–1,800 words.
- Podcast (20-40 min): Conversational, story-led, chapter breaks, guest-ready format.
- TED Talk (12-18 min): Single "idea worth spreading", personal narrative arc, memorable close.
- LinkedIn Post: Professional authority voice, 150–300 words, insight-led, no hashtag spam.

Add for offline scripts: [PAUSE], [EMPHASISE], [AUDIENCE QUESTION], [GESTURE] cues.
Trim ruthlessly — every sentence must earn its place in the runtime.`,
  },

  multilingual: {
    temperature: 0.7,
    constraints: ["Preserve scientific meaning across languages", "Native-voice register — not word-for-word translation", "Tamil & Tanglish: balance local warmth with English medical terms"],
    prompt: `You are a Multilingual Health Content Adaptation Agent for Indian health creators.

Your role is to produce native-voice adaptations that feel culturally authentic — not translated, but re-voiced — in:
- Tamil (pure formal Tamil for older, educated audiences)
- Tanglish (conversational Tamil-English blend for urban millennial/Gen-Z audiences)
- Hindi (standard Hindustani, not Bombay slang unless specified)

Adaptation rules for Tanglish (most commonly used):
- Keep medical/scientific English terms in English: "cortisol", "REM sleep", "insulin resistance"
- Use Tamil for emotional beats, connective tissue, and warmth: "approm", "solren", "theriyuma"
- Hook lines should feel like something a Tamil doctor friend would say on a voice note
- Avoid Thamizh purity at the cost of natural speech — real Tanglish is fluid

For all languages: scientific accuracy must survive the translation. If a nuance is lost in adaptation, flag it with a [NOTE] for the editor.`,
  },

  review: {
    temperature: 0.2,
    constraints: ["Hallucination check mandatory", "Flag every unverified claim", "Quality score 1–100", "No approval for scores below 70"],
    prompt: `You are a Final Script Review Agent and Quality Gate for a medical content studio.

Before any content is cleared for publication, you perform three mandatory checks:

1. Hallucination Detection
   - Cross-reference every cited statistic, study, or expert against the evidence chain provided in prior pipeline steps
   - Flag any claim that wasn't established in the Evidence Retrieval or Validation stages
   - Mark as [HALLUCINATION RISK] — do not silently remove

2. Citation Integrity
   - Confirm every PMID reference matches the claim it supports
   - Flag weak citations used to support strong claims

3. Quality Scoring (1–100)
   - Hook strength (20 pts): First 3–5 seconds create genuine curiosity or pattern interrupt
   - Evidence quality (25 pts): Claims are accurately represented, tier-appropriate
   - Narrative flow (20 pts): Content moves logically from hook to insight to CTA
   - Compliance (20 pts): No diagnostic, cure, or regulatory red flags
   - Platform fit (15 pts): Format matches the target platform's consumption pattern

Output: Score, pass/fail verdict, and a prioritised fix list if score < 70.`,
  },

  // ENRICHMENT ─────────────────────────────────────────────────────────────
  enrichment_entertainment: {
    temperature: 0.8,
    constraints: ["Pop culture refs must be real and verifiable", "Keep science intact", "Relatable analogies only"],
    prompt: `You are an Entertainment Enrichment Agent. Add pop culture hooks, relatable everyday analogies, and storytelling flair that makes complex health science feel immediate and fun — without dumbing it down.

Use: viral meme formats, sports metaphors, celebrity health stories (publicly known), Netflix/film analogies, social media behaviour comparisons.
Never: compromise the scientific accuracy, invent celebrity endorsements, or prioritise laughs over health literacy.`,
  },

  enrichment_cinema: {
    temperature: 0.75,
    constraints: ["Real films only", "Narrative structure must be cited", "No spoilers without warning"],
    prompt: `You are a Cinema Storytelling Enrichment Agent. Map health content to real film narratives, directorial techniques, and cinematic structures to create emotionally resonant storytelling frames.

Use: documentary arcs (Morgan Spurlock style), protagonist-as-experiment setups, in medias res openings, three-act transformation structures, dramatic irony reveals.
Always cite the actual film. "Like the opening scene in [Film] (Year)..." is the target register.`,
  },

  enrichment_philosophy: {
    temperature: 0.7,
    constraints: ["Real philosophers only", "Quote accurately or don't quote", "One thread per piece"],
    prompt: `You are a Philosophy Enrichment Agent. Weave timeless philosophical frameworks into health content to elevate it from advice to insight — from tips to worldview.

Frameworks to consider: Stoicism (Marcus Aurelius, Epictetus), Socratic questioning (examine received wisdom), Existentialism (Sartre on choice and responsibility), Eastern philosophy (Zen impermanence, Buddhist middle way), Nietzsche (will to power as self-mastery).

One strong philosophical thread woven through is more powerful than three surface name-drops.`,
  },

  enrichment_psychology: {
    temperature: 0.65,
    constraints: ["Named biases must be real cognitive science terms", "Cite the psychologist/researcher", "Don't weaponise biases against audience"],
    prompt: `You are a Behavioural Psychology Enrichment Agent. Identify and integrate the cognitive biases, motivation science, and behavioural economics principles most relevant to the health topic — to help the audience understand their own behaviour and change it.

Key frameworks: Loss aversion (Kahneman), Status quo bias, Sunk cost fallacy, Social proof, Implementation intentions (Gollwitzer), Habit loops (Duhigg), Self-determination theory (Deci & Ryan).

Use psychology to create empathy and understanding — not manipulation.`,
  },

  enrichment_productivity: {
    temperature: 0.6,
    constraints: ["Action-first framing", "Specific implementation steps", "Evidence-based habit science"],
    prompt: `You are a Productivity & Habit Systems Enrichment Agent. Frame health content through an action-first, systems-thinking lens that gives the audience a clear path from knowledge to behaviour change.

Focus on: habit stacking, implementation intentions ("When X, I will Y"), environment design, minimal viable dose (what's the smallest effective intervention?), and compounding effects of consistency.

Every enrichment should end with one concrete next action the audience can take today.`,
  },

  enrichment_spiritual: {
    temperature: 0.7,
    constraints: ["Inclusive spirituality only — no religious doctrine", "Mind-body science must anchor spiritual claims", "No pseudoscience"],
    prompt: `You are a Spiritual & Holistic Wellness Enrichment Agent. Connect health science to universal mind-body-spirit principles in a way that resonates across spiritual traditions without favouring any one religion.

Draw from: mindfulness and contemplative traditions, Ayurvedic principles where science-aligned, mind-body medicine (Dr. Candace Pert's work on neuropeptides), flow states (Csikszentmihalyi), and the science of gratitude and meaning.

All spiritual claims must have a parallel in peer-reviewed mind-body medicine. No pseudoscience.`,
  },

  enrichment_books: {
    temperature: 0.6,
    constraints: ["Real books only — title, author, year required", "Quote accuracy is mandatory", "Prefer books available in India"],
    prompt: `You are a Book Reference Enrichment Agent. Weave real non-fiction book findings, author insights, and quotable moments into health content to add intellectual credibility and discovery excitement.

Prioritise books with: strong author credentials, scientific backing, cultural relevance to Indian and global audiences, and high discoverability (bestsellers or critically acclaimed).

Format: "In [Book Title] ([Year]), [Author] [describes/argues/found]..." — then connect the book's core insight to the health topic being covered.
Never paraphrase a quote and present it as verbatim. Either quote exactly or describe the concept.`,
  },

  // OUTPUT — ONLINE ────────────────────────────────────────────────────────
  instagram_reel: {
    temperature: 0.75,
    constraints: ["Hook in 3 seconds max", "One insight per reel", "Hard CTA required", "Max 150 words", "No jargon"],
    prompt: `You are an expert Instagram Reel Script Director for a health content studio.

Write punchy, human, conversational scripts that stop the scroll in the first 3 seconds and deliver one crystal-clear health insight before the viewer can swipe away.

Structure:
[HOOK] — Pattern-interrupt or bold claim (1 sentence, spoken to camera)
[INSIGHT] — The core evidence-based finding (2–3 sentences max)
[PROOF] — One stat or study reference, spoken naturally ("Studies show…" not "PMID 12345")
[PRACTICAL STEP] — One thing the viewer can do today
[CTA] — Save this / Drop a comment / Share with someone who needs this

When Tanglish is selected: open with a Tamil phrase, switch to English for the science, close with Tamil warmth.
When regional slang is active: use the natural code-switching pattern of an educated Tamil/Hindi speaker — not a translation.`,
  },

  youtube_script: {
    temperature: 0.7,
    constraints: ["Cold open required", "Timestamps every 2-3 min", "3-act narrative structure", "1200-1800 words", "Chapter titles for YouTube cards"],
    prompt: `You are a YouTube Long-Form Script Writer for a health education channel.

Structure every script with:
[COLD OPEN] (0:00–0:30): Hook with a bold claim, surprising stat, or relatable scenario — before the intro music
[INTRO] (0:30–1:30): Promise the video's payoff; tell them exactly what they'll learn
[ACT 1 — The Problem] (~25% of runtime): Build the problem with evidence and emotional resonance
[ACT 2 — The Science] (~40% of runtime): Deliver the evidence-based mechanism; cite studies naturally
[ACT 3 — The Solution] (~25% of runtime): Practical, implementable steps
[CLOSE + CTA] (~10%): Summarise, prompt engagement, mention next video

Include: [CHAPTER] markers for YouTube timestamps, [B-ROLL SUGGESTION] notes, and [GRAPHIC] cues for on-screen statistics.`,
  },

  podcast_script: {
    temperature: 0.72,
    constraints: ["Conversational register — spoken word, not written prose", "Host notes in [BRACKETS]", "Guest-ready segment breaks", "Natural pacing cues"],
    prompt: `You are a Podcast Script Writer for a health and science audio show.

Write in a natural spoken-word register — the kind of thing you'd say to an intelligent friend, not present to a conference. Avoid sentences that only work when read.

Format:
[COLD OPEN] — A story, a surprising fact, or a genuine question
[SEGMENT BREAKS] — Natural transition lines, not chapter headings
[HOST NOTES] — In square brackets: [pause for emphasis], [ask guest here], [callback to earlier point]
[SPONSOR READ] — Placeholder for natural mid-roll integration
[CLOSE] — Warm, memorable, and consistent with the show's sign-off style

For solo episodes: write as a personal, authority monologue. For interview format: write open-ended questions that feel genuinely curious, not interrogative.`,
  },

  webinar_script: {
    temperature: 0.6,
    constraints: ["Slide-by-slide format required", "Q&A prompts mandatory", "Audience interaction hooks every 10 min", "Professional tone"],
    prompt: `You are a Webinar Script and Facilitator Guide Writer for health education events.

Structure the webinar as slide-by-slide speaking notes:

[SLIDE X: Title]
Speaker notes: What to say on this slide (2–4 sentences)
[INTERACTION CUE]: Poll / Chat prompt / Raise-your-hand moment

Include:
- Welcome and housekeeping (5 min)
- Agenda overview slide
- Evidence delivery in 10-min teaching blocks
- Mandatory Q&A prompt at the 30-min mark
- Breakout room topic suggestions (if applicable)
- Close with a single clear CTA (download, book, follow-up session)

Professional register — this is a credentialed health professional's event.`,
  },

  twitter_thread: {
    temperature: 0.72,
    constraints: ["280 chars per tweet", "Hook tweet must stand alone", "Thread 8-12 tweets", "Numbered format", "End tweet = CTA + retweet hook"],
    prompt: `You are a Twitter/X Thread Writer for a health science creator.

Write viral threads where every single tweet can stand alone AND compels the reader to click "Show more."

Structure:
Tweet 1 (Hook): A bold claim, counter-intuitive fact, or question. Must be retweetable on its own.
Tweets 2–9: One insight per tweet. Lead with the finding, follow with the implication.
Tweet 10+ (Close): Summary → CTA ("Save this thread" / "Quote tweet with your experience")

Rules:
- No tweet over 280 characters
- No academic jargon — plain English only
- Use numbers: "3 studies show…", "After 8 weeks…", "1 in 4 people…"
- Strategic line breaks — short lines scan faster`,
  },

  linkedin_post: {
    temperature: 0.65,
    constraints: ["Professional authority tone", "Story-led hook", "150-300 words", "No hashtag spam (max 5)", "No corporate buzzwords"],
    prompt: `You are a LinkedIn Health Content Writer for a credentialed medical professional or health brand.

Write posts that establish authority through insight, not credential-dropping. The hook should be a story or a counter-intuitive observation — not "Excited to share…"

Structure:
Line 1 (Hook): A single sentence that earns the "See more" click
Lines 2–4: Expand the insight with evidence or a brief story
Lines 5–7: The practical implication or lesson
Lines 8–9: Reflection or invitation to the audience
Line 10: One actionable question to drive comments

Voice: Thoughtful, direct, evidence-grounded. Like a respected colleague sharing what they learned — not a brand post.
Max 5 hashtags, all niche-relevant.`,
  },

  // OUTPUT — OFFLINE ────────────────────────────────────────────────────────
  blog_article: {
    temperature: 0.6,
    constraints: ["SEO H2/H3 structure required", "Meta description required", "1500-2500 words", "Citations as inline links", "No keyword stuffing"],
    prompt: `You are an SEO Health Content Writer for a medical authority website.

Write long-form articles that rank for health search queries while genuinely serving the reader's informational need — not just their click.

Structure:
- Title (H1): Primary keyword-first, under 65 characters
- Meta description: 150–160 chars, includes CTA phrase
- Introduction: Answer the search intent in the first 100 words
- H2/H3 headers: Structured for featured snippets (question-format headers work well)
- Body: Evidence-first, one claim per paragraph, citations as inline "according to [Study/Source]"
- Conclusion: Practical summary + "Consult your doctor" advisory

SEO rules: Primary keyword in H1, first 100 words, one H2, and meta description. Natural semantic variation throughout — no stuffing.`,
  },

  stage_speech: {
    temperature: 0.7,
    constraints: ["[PAUSE] cues mandatory", "Audience interaction every 5-7 min", "Applause moments flagged", "Story-first structure"],
    prompt: `You are a Live Stage Speech Writer for a health professional speaker.

Write scripts that work in a room of 50 or 5,000 — structured for delivery, not reading.

Include:
[PAUSE — let this land] after key insights
[LOOK LEFT / LOOK RIGHT / LOOK CENTRE] for engagement cues
[AUDIENCE QUESTION] prompts for interaction
[ENERGY SHIFT] markers where tone changes
[APPLAUSE MOMENT] — the kind of line that earns a natural crowd response

Three-act structure: Open with a story (not a stat), build the case through science, close with a call to action that makes the audience feel capable and inspired.

Avoid PowerPoint-speak. Every line must work as audio only.`,
  },

  ted_talk: {
    temperature: 0.72,
    constraints: ["One 'idea worth spreading'", "12-18 min runtime (1800-2400 words)", "Personal story required", "Memorable closer required", "No Q&A — monologue only"],
    prompt: `You are a TED Talk Script Writer for a health or science speaker.

The TED format demands: one idea worth spreading, delivered with personal vulnerability and intellectual rigour in equal measure.

Structure:
Opening: A personal story or a vivid scene — not a statistic
The Problem: Why does this matter right now?
The Idea: The single insight the talk is built around (stated clearly at the ~1/3 mark)
The Evidence: Scientific backing delivered as narrative, not lecture
The Implication: What changes if we accept this idea?
The Close: A call to action + a memorable final image or phrase

Rules:
- The "idea" must be stated in one sentence
- The personal story must be true
- The close must be the most memorable moment in the talk
- No slides dependency — must work as audio-only`,
  },

  workshop_guide: {
    temperature: 0.6,
    constraints: ["Facilitator notes in [BRACKETS]", "Activities timed", "Handout copy included", "Discussion prompts per section"],
    prompt: `You are a Workshop Facilitator Guide Writer for health education programs.

Write complete facilitator guides that allow any trained health professional to run this workshop with confidence.

Include:
- Materials list and room setup notes
- Learning objectives (3–5 measurable outcomes)
- Time-boxed activity breakdown (60–90 min total)
- [FACILITATOR NOTE] annotations throughout
- Discussion prompt cards (2–3 per section)
- Handout copy (ready to print)
- Evaluation form template

Tone: Professional, practical, supportive of the facilitator. Assume competent delivery but provide enough scaffolding for a first-time facilitator.`,
  },
};

// Merge defaults with any saved overrides from localStorage
function loadConfigs() {
  if (typeof window === "undefined") return DEFAULT_CONFIGS;
  try {
    const saved = JSON.parse(localStorage.getItem("magicscript_agent_configs_v1") || "{}");
    return { ...DEFAULT_CONFIGS, ...saved };
  } catch {
    return DEFAULT_CONFIGS;
  }
}

// ── Stage badge colours ────────────────────────────────────────────────────
const STAGE_COLORS = {
  input:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  audience:   "bg-violet-500/15 text-violet-400 border-violet-500/25",
  process:    "bg-blue-500/15 text-blue-400 border-blue-500/25",
  enrichment: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  output:     "bg-teal-500/15 text-teal-400 border-teal-500/25",
};

// ── Editable constraint tag ───────────────────────────────────────────────
function ConstraintTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-0.5 text-[11px] font-semibold text-soft">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full text-faint transition hover:text-rose-400"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

// ── Left rail: single agent row ───────────────────────────────────────────
function AgentRow({ agent, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
        isActive
          ? "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] ring-1 ring-inset ring-cyan/20"
          : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-soft))]"
      }`}
    >
      <span className="shrink-0 text-base leading-none">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[12px] font-semibold leading-tight transition ${isActive ? "text-[rgb(var(--text))]" : "text-soft group-hover:text-[rgb(var(--text))]"}`}>
          {agent.name}
        </p>
        {agent.credits === 0 ? (
          <p className="text-[10px] text-emerald-400">FREE</p>
        ) : (
          <p className="text-[10px] text-faint">{agent.credits}cr · ~{(agent.estimatedMs / 1000).toFixed(1)}s</p>
        )}
      </div>
      {isActive && <ChevronRight size={11} className="shrink-0 text-cyan" />}
    </button>
  );
}

// ── Left rail: collapsible stage section ──────────────────────────────────
function StageSection({ group, selectedId, onSelect, isOpen, onToggle }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-1 py-1.5 text-left transition hover:opacity-80"
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${group.dot}`} />
        <span className={`flex-1 text-[10px] font-bold uppercase tracking-widest ${group.color}`}>
          {group.label}
        </span>
        <span className="text-[10px] text-faint">{group.agents.length}</span>
        <ChevronDown
          size={11}
          className={`shrink-0 text-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 space-y-0.5 pl-3.5">
          {group.agents.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              isActive={selectedId === agent.id}
              onClick={() => onSelect(agent)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product tabs shown above the left rail ────────────────────────────────
const PRODUCT_TABS = [
  { id: "studio",  label: "Studio",  icon: Tv,      active: true  },
  { id: "reels",   label: "Reels",   icon: Film,     active: false },
  { id: "podcast", label: "Podcast", icon: Mic,      active: true  },
  { id: "youtube", label: "YouTube", icon: Youtube,  active: false },
];

// ── Model badge helper ────────────────────────────────────────────────────
function ModelBadge({ model }) {
  const isGemini = model === "gemini";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
      isGemini
        ? "bg-cyan/10 text-cyan border-cyan/25"
        : "bg-violet-500/10 text-violet-400 border-violet-500/25"
    }`}>
      <span className={`h-1 w-1 rounded-full ${isGemini ? "bg-cyan" : "bg-violet-400"}`} />
      {isGemini ? "Gemini 2.5 Flash" : "Claude Sonnet 4.6"}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Podcast Agent Panel — full dual-box editor for pipeline stages
// ═══════════════════════════════════════════════════════════════════════════
function PodcastAgentPanel() {
  const [selectedStage, setSelectedStage] = useState(PODCAST_PIPELINE_AGENTS[0]);
  const [customPrompts, setCustomPrompts] = useState({});
  const [localCustom, setLocalCustom]     = useState("");
  const [saveState, setSaveState]         = useState("idle");
  const [copied, setCopied]               = useState(false);

  // Load all custom prompts on mount
  useEffect(() => {
    const all = loadAllCustomPrompts();
    setCustomPrompts(all);
    setLocalCustom(all[PODCAST_PIPELINE_AGENTS[0].id] ?? "");
  }, []);

  function selectStage(stage) {
    setSelectedStage(stage);
    setLocalCustom(customPrompts[stage.id] ?? "");
    setSaveState("idle");
  }

  function handleSave() {
    setSaveState("saving");
    saveCustomPrompt(selectedStage.id, localCustom);
    setCustomPrompts((prev) => ({ ...prev, [selectedStage.id]: localCustom }));
    setTimeout(() => setSaveState("saved"), 300);
    setTimeout(() => setSaveState("idle"), 2500);
  }

  function handleReset() {
    setLocalCustom("");
    saveCustomPrompt(selectedStage.id, "");
    setCustomPrompts((prev) => ({ ...prev, [selectedStage.id]: "" }));
    setSaveState("idle");
  }

  function handleCopyFixed() {
    navigator.clipboard?.writeText(selectedStage.fixedPrompt ?? "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const colorCls = STAGE_COLOR_MAP[selectedStage.color] ?? STAGE_COLOR_MAP.cyan;
  const hasCustom = (customPrompts[selectedStage.id] ?? "").trim().length > 0;
  const wordCount = localCustom.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── LEFT RAIL — stage list ──────────────────────────────────────── */}
      <aside className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
        <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Podcast Pipeline</p>
          <p className="mt-0.5 text-[10px] text-faint/60">10-stage production system</p>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
          {PODCAST_PIPELINE_AGENTS.map((agent) => {
            const isActive = agent.id === selectedStage.id;
            const hasSaved = (customPrompts[agent.id] ?? "").trim().length > 0;
            const c = STAGE_COLOR_MAP[agent.color] ?? STAGE_COLOR_MAP.cyan;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => selectStage(agent)}
                className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] ring-1 ring-inset ring-cyan/20"
                    : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-soft))]"
                }`}
              >
                {/* Stage number badge */}
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${c.bg} ${c.text} ${isActive ? "" : "opacity-70"}`}>
                  S{agent.stageNum}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[11px] font-semibold transition ${isActive ? "text-[rgb(var(--text))]" : "text-soft group-hover:text-[rgb(var(--text))]"}`}>
                    {agent.label}
                  </p>
                  <p className="text-[9px] text-faint">{agent.defaultModel === "claude" ? "Claude" : "Gemini"} default</p>
                </div>
                {/* Dot if has saved custom prompt */}
                {hasSaved && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" title="Has custom instructions" />
                )}
                {isActive && <ChevronRight size={10} className="shrink-0 text-cyan" />}
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-[rgb(var(--border))] px-4 py-2.5">
          <p className="text-[10px] text-faint">
            {PODCAST_PIPELINE_AGENTS.filter((a) => (customPrompts[a.id] ?? "").trim()).length} of 10 stages customised
          </p>
        </div>
      </aside>

      {/* ── RIGHT WORKSPACE — dual-box editor ──────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Identity bar */}
        <div className="shrink-0 border-b border-[rgb(var(--border))] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Stage badge */}
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${colorCls.bg} ${colorCls.text}`}>
                S{selectedStage.stageNum}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${colorCls.border} ${colorCls.text} ${colorCls.bg}`}>
                    <span className={`h-1 w-1 rounded-full ${colorCls.dot}`} />
                    Stage {selectedStage.stageNum} of 10
                  </span>
                  <ModelBadge model={selectedStage.defaultModel} />
                  {hasCustom && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                      <Plus size={8} />
                      Custom instructions active
                    </span>
                  )}
                </div>
                <h2 className="mt-0.5 text-base font-bold">{selectedStage.label}</h2>
                <p className="mt-0.5 text-xs text-faint">{selectedStage.description}</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasCustom}
                className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-semibold text-faint transition hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RotateCcw size={12} />
                Clear custom
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveState === "saving"}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  saveState === "saved"
                    ? "bg-emerald-500 text-black"
                    : "bg-cyan text-[rgb(var(--bg))] hover:opacity-90"
                }`}
              >
                {saveState === "saved" ? <Check size={13} /> : <Save size={13} />}
                {saveState === "saved" ? "Saved" : "Save instructions"}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable editor area */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 scrollbar-thin">

          {/* ── BOX 1: Fixed / Built-in System Prompt (read-only) ─────── */}
          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
            <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-4 py-3">
              <Lock size={12} className="shrink-0 text-faint" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                Built-in System Prompt
              </span>
              <span className="ml-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[9px] text-faint">
                read-only · baked into route
              </span>
              <button
                type="button"
                onClick={handleCopyFixed}
                className="ml-auto flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] font-semibold text-faint transition hover:border-cyan/40 hover:text-cyan"
              >
                <Copy size={10} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="relative">
              <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-relaxed text-soft scrollbar-thin">
                {selectedStage.fixedPrompt}
              </pre>
              {/* Fade bottom */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-xl bg-gradient-to-t from-[rgb(var(--panel))] to-transparent" />
            </div>
            <div className="border-t border-[rgb(var(--border))] px-4 py-2">
              <p className="text-[10px] text-faint">
                This prompt runs on every generation for Stage {selectedStage.stageNum}. It cannot be disabled — only supplemented.
              </p>
            </div>
          </section>

          {/* ── BOX 2: Additional / Custom Instructions (editable) ────── */}
          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
            <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-4 py-3">
              <Plus size={12} className="shrink-0 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                Additional Instructions
              </span>
              <span className="ml-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-400">
                appended after built-in prompt
              </span>
              {localCustom.trim() && (
                <span className="ml-auto text-[10px] text-faint">{wordCount} words</span>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={localCustom}
                onChange={(e) => { setLocalCustom(e.target.value); setSaveState("idle"); }}
                rows={12}
                spellCheck={false}
                placeholder={`Add extra conditions for Stage ${selectedStage.stageNum} — ${selectedStage.label}.\n\nExamples:\n• "Always include a specific example from a Chennai patient"\n• "End every answer with a bridge sentence to the next question"\n• "Never mention specific medication brand names"\n• "For this stage, prioritise questions from women aged 40–55"\n\nThese instructions are appended after the built-in prompt and take effect on every generation.`}
                className="w-full resize-none rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4 font-mono text-[12px] leading-relaxed text-soft placeholder-faint/50 focus:border-amber-400/40 focus:outline-none scrollbar-thin"
              />
            </div>
            <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-4 py-2.5">
              <p className="text-[10px] text-faint leading-relaxed">
                These instructions are appended to the built-in prompt and active on every generation for this stage.
                Saved to <span className="font-mono text-cyan/70">localStorage</span>.
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveState === "saving"}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  saveState === "saved"
                    ? "bg-emerald-500 text-black"
                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                }`}
              >
                {saveState === "saved" ? <Check size={12} /> : <Save size={12} />}
                {saveState === "saved" ? "Saved" : "Save"}
              </button>
            </div>
          </section>

          {/* ── How it works note ─────────────────────────────────────── */}
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
            <p className="text-[11px] font-semibold text-soft">How additional instructions work</p>
            <p className="mt-1 text-[11px] text-faint leading-relaxed">
              The final prompt sent to the AI is: <span className="font-mono text-cyan/80">[Built-in prompt]</span> +{" "}
              <span className="font-mono text-amber-400/80">[Your additional instructions]</span>.
              The built-in rules always run first and cannot be overridden — your instructions extend them.
              Changes take effect on the next generation — no page reload needed.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════════════
export default function AgentManagement() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState("studio");

  // Default to Audience Intel Agent
  const defaultAgent = AUDIENCE_AGENTS[0];
  const [selectedAgent, setSelectedAgent] = useState(defaultAgent);

  // Per-agent editable state
  const [configs, setConfigs]     = useState(DEFAULT_CONFIGS);
  const [prompt, setPrompt]       = useState("");
  const [temperature, setTemp]    = useState(0.65);
  const [constraints, setConstraints] = useState([]);
  const [newConstraint, setNewConstraint] = useState("");

  // UI state
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [openGroups, setOpenGroups] = useState({
    input: false, audience: true, process: true,
    enrichment: false, "output-online": false, "output-offline": false,
  });
  const [search, setSearch] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const merged = loadConfigs();
    setConfigs(merged);
    const cfg = merged[defaultAgent.id] || {};
    setPrompt(cfg.prompt || "");
    setTemp(cfg.temperature ?? 0.65);
    setConstraints(cfg.constraints || []);
  }, []);

  // Sync right panel when agent changes
  const switchAgent = useCallback((agent) => {
    setSelectedAgent(agent);
    const cfg = configs[agent.id] || {};
    setPrompt(cfg.prompt || `System prompt for ${agent.name}.\n\nDefine this agent's behaviour, output format, and constraints here.`);
    setTemp(cfg.temperature ?? 0.65);
    setConstraints(cfg.constraints || []);
    setSaveState("idle");
    setNewConstraint("");
  }, [configs]);

  // Save to localStorage (TODO: replace with Supabase upsert)
  function handleSave() {
    setSaveState("saving");
    const updated = {
      ...configs,
      [selectedAgent.id]: { prompt, temperature, constraints },
    };
    setConfigs(updated);
    try {
      localStorage.setItem("magicscript_agent_configs_v1", JSON.stringify(updated));
    } catch {}
    setTimeout(() => setSaveState("saved"), 400);
    setTimeout(() => setSaveState("idle"), 2600);
  }

  // Reset agent to shipped defaults
  function handleReset() {
    const def = DEFAULT_CONFIGS[selectedAgent.id];
    if (!def) return;
    setPrompt(def.prompt || "");
    setTemp(def.temperature ?? 0.65);
    setConstraints(def.constraints || []);
    setSaveState("idle");
  }

  function addConstraint() {
    const v = newConstraint.trim();
    if (v && !constraints.includes(v)) {
      setConstraints((p) => [...p, v]);
      setNewConstraint("");
    }
  }

  function removeConstraint(label) {
    setConstraints((p) => p.filter((c) => c !== label));
  }

  function toggleGroup(id) {
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  }

  // Filter agents by search
  const filteredGroups = STAGE_GROUPS.map((g) => ({
    ...g,
    agents: search
      ? g.agents.filter(
          (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.description?.toLowerCase().includes(search.toLowerCase())
        )
      : g.agents,
  })).filter((g) => g.agents.length > 0);

  // Temperature label
  const tempLabel =
    temperature <= 0.2 ? "Strict / Factual" :
    temperature <= 0.45 ? "Conservative" :
    temperature <= 0.6  ? "Balanced" :
    temperature <= 0.8  ? "Creative" : "Highly Creative";

  const tempColor =
    temperature <= 0.3 ? "text-blue-400" :
    temperature <= 0.6 ? "text-teal-400" :
    temperature <= 0.8 ? "text-amber-400" : "text-rose-400";

  const stageKey = selectedAgent.stage || "process";
  const stageBadgeCls = STAGE_COLORS[stageKey] || STAGE_COLORS.process;

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] glass-strong px-4 lg:px-6">
        {/* Left: Logo + mode toggle */}
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" />
          <WorkspaceModeToggle activeOverride={activeProduct} />
        </div>

        {/* Centre: nav links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard/agents";
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  active
                    ? "bg-[rgb(var(--bg-soft))] text-[rgb(var(--text))]"
                    : "text-faint hover:bg-[rgb(var(--bg-soft))] hover:text-soft"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: credits + theme + avatar */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/billing"
            className="hidden items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold sm:flex"
          >
            <Zap size={13} className="text-cyan" />
            <span className="text-cyan">{user.credits}</span>
            <span className="text-faint">credits</span>
          </Link>
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-1 pl-1 pr-2"
            >
              <Avatar user={user} />
              <ChevronDown size={14} className="hidden text-faint sm:block" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[rgb(var(--border))] glass-strong p-1.5 shadow-card">
                  <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-faint">{user.email}</div>
                  </div>
                  <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft transition hover:bg-electric/8">
                    <UserCircle size={15} /> Profile
                  </Link>
                  <Link href="/dashboard/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft transition hover:bg-electric/8">
                    <CreditCard size={15} /> Subscription
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Product selector strip (always visible, left edge) ─────── */}
        <div className="flex w-[72px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="shrink-0 border-b border-[rgb(var(--border))] px-2 py-3">
            <Settings2 size={14} className="mx-auto text-faint" />
          </div>
          <div className="flex flex-col gap-0.5 p-2 pt-3">
            {PRODUCT_TABS.map(({ id, label, icon: Icon, active }) => (
              <button
                key={id}
                type="button"
                disabled={!active}
                onClick={() => active && setActiveProduct(id)}
                title={!active ? `${label} — coming soon` : label}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[9px] font-bold uppercase tracking-wide transition-all ${
                  !active
                    ? "cursor-not-allowed opacity-25 border-transparent text-faint"
                    : activeProduct === id
                      ? id === "podcast"
                        ? "border-cyan/30 bg-cyan/15 text-cyan"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] text-[rgb(var(--text))]"
                      : "border-transparent text-faint hover:border-[rgb(var(--border))] hover:text-soft"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PODCAST mode — full remaining body ───────────────────────── */}
        {activeProduct === "podcast" && (
          <PodcastAgentPanel />
        )}

        {/* ── STUDIO mode — left rail + right workspace ─────────────── */}
        {activeProduct === "studio" && <>
        <aside className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

          {/* Rail header */}
          <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Tv size={12} className="text-faint" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-faint">Studio Agents</span>
            </div>
            <p className="mt-0.5 text-[10px] text-faint/60">Select an agent to edit its blueprint</p>
          </div>

          {/* Search */}
          <div className="shrink-0 px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
              <Search size={12} className="shrink-0 text-faint" />
              <input
                type="text"
                placeholder="Search agents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[rgb(var(--text))] placeholder-faint focus:outline-none"
              />
            </div>
          </div>

          {/* Scrollable agent list */}
          <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
            {filteredGroups.map((group) => (
              <StageSection
                key={group.id}
                group={group}
                selectedId={selectedAgent.id}
                onSelect={switchAgent}
                isOpen={search ? true : (openGroups[group.id] ?? false)}
                onToggle={() => toggleGroup(group.id)}
              />
            ))}
            {filteredGroups.length === 0 && (
              <p className="py-8 text-center text-xs text-faint">No agents match "{search}"</p>
            )}
          </div>

          {/* Rail footer: agent count */}
          <div className="shrink-0 border-t border-[rgb(var(--border))] px-4 py-2.5">
            <p className="text-[10px] text-faint">
              {STAGE_GROUPS.reduce((s, g) => s + g.agents.length, 0)} agents across 5 pipeline stages
            </p>
          </div>
        </aside>

        {/* Right workspace — Editor */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Identity bar */}
          <div className="shrink-0 border-b border-[rgb(var(--border))] px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl leading-none">{selectedAgent.icon}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${stageBadgeCls}`}
                    >
                      {stageKey}
                    </span>
                    {selectedAgent.credits === 0 && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">FREE</span>
                    )}
                  </div>
                  <h1 className="mt-0.5 font-display text-lg font-bold leading-tight">
                    {selectedAgent.name}
                  </h1>
                  <p className="mt-0.5 text-xs text-faint">{selectedAgent.description}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-semibold text-faint transition hover:border-rose-500/40 hover:text-rose-400"
                >
                  <RotateCcw size={12} />
                  Reset defaults
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                    saveState === "saved"
                      ? "bg-emerald-500 text-black"
                      : "bg-cyan text-[rgb(var(--bg))] hover:opacity-90"
                  }`}
                >
                  {saveState === "saved" ? <Check size={13} /> : <Layers size={13} />}
                  {saveState === "saved" ? "Blueprint locked" : "Update blueprint"}
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable editor content */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 scrollbar-thin">

            {/* Temperature */}
            <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-faint" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                    Creativity Variance · Temperature
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${tempColor}`}>
                  {temperature.toFixed(1)} — {tempLabel}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[rgb(var(--bg-soft))] accent-cyan"
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-faint">
                <span>Strict / Factual (0.0)</span>
                <span>Balanced (0.5)</span>
                <span>Highly Creative (1.0)</span>
              </div>
            </section>

            {/* Hard Constraints */}
            <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Shield size={13} className="text-faint" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                  Hard Constraints
                </span>
                <span className="ml-auto text-[10px] text-faint">
                  Rules this agent must always follow
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {constraints.map((c) => (
                  <ConstraintTag key={c} label={c} onRemove={() => removeConstraint(c)} />
                ))}
                {constraints.length === 0 && (
                  <span className="text-[11px] text-faint italic">No constraints set</span>
                )}
              </div>
              {/* Add constraint */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a constraint rule…"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addConstraint(); }}}
                  className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-1.5 text-[11px] text-[rgb(var(--text))] placeholder-faint focus:border-cyan/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addConstraint}
                  className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-[11px] font-semibold text-faint transition hover:border-cyan/40 hover:text-cyan"
                >
                  + Add
                </button>
              </div>
            </section>

            {/* Master System Prompt */}
            <section className="flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Bot size={13} className="text-faint" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                  Master System Prompt Blueprint
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={22}
                spellCheck={false}
                className="w-full resize-none rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4 font-mono text-[12px] leading-relaxed text-soft focus:border-cyan/40 focus:outline-none scrollbar-thin"
                placeholder="Define this agent's system-level identity, behaviour rules, and output format here…"
              />
              <p className="mt-2 text-right text-[10px] text-faint">
                {prompt.split(/\s+/).filter(Boolean).length} words · {prompt.length} chars
              </p>
            </section>

            {/* Info card */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
              <p className="text-[11px] text-faint leading-relaxed">
                <span className="font-semibold text-soft">Changes take effect immediately</span> across both Studio and Lab modes after saving.
                Currently persisted to <span className="font-mono text-xs text-cyan/70">localStorage</span> — connect Supabase
                (<span className="font-mono text-xs">agent_configs</span> table) to sync across devices and team members.
              </p>
            </div>

          </div>
        </main>
        </>}

      </div>
    </div>
  );
}

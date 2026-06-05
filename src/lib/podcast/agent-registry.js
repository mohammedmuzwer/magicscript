/**
 * Podcast Pipeline Agent Registry
 * Each entry represents one pipeline stage with:
 *   - fixedPrompt   : The built-in system instructions baked into the route (read-only display)
 *   - customKey     : localStorage key for the user's additional instructions
 */

export const PODCAST_PIPELINE_AGENTS = [
  {
    id: "podcast_s1",
    stageNum: 1,
    label: "Topic Discovery",
    description: "Takes a keyword or reference link and produces 5 ranked, scored topic candidates — each with demand score, competition gap, reframe, and a Tamil Nadu opening line.",
    color: "s1",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 1 — TOPIC DISCOVERY
Role: Surface 5 ranked, scored candidate topics from a keyword.

KEYWORD ANCHORING (runs before scoring — hard rejection if not met)
  Anchor A: keyword appears in title directly
  Anchor B: direct sub-topic — connection stated explicitly
  Anchor C: South Indian cultural intersection — practice named explicitly

SCORING FORMULA
  Raw = (Demand×0.35) + (SocialDemand×0.40) + (CompetitionGap×0.20) + (DFFit×0.20)
  Final = round((Raw / 115) × 100)

VERDICTS
  70–100 = APPROVED · 50–69 = REFRAME · 0–49 = REJECTED

HARD RULES
1. Keyword anchoring before scoring — always
2. Social Demand (40%) always outweighs Demand (35%)
3. Competition Gap is standalone — not inside DF Fit
4. Always reframe even approved topics
5. Weakness names a specific criterion
6. Weights are 35/40/20/20 — never change them
7. Reel opening line is Tamil Nadu specific
8. Religious fasting always relevant when keyword touches fasting
9. Reframe must score 5+ points higher
10. All 6 verify sources shown every time

OUTPUT: Valid JSON only — 5 topics array + summary object`,
  },

  {
    id: "podcast_s2",
    stageNum: 2,
    label: "Topic Lock",
    description: "Locks the chosen topic and defines the angle: frame, promise, Doctor Farmer authority statement, and safety flag. Generates 4 pillars + audience portraits + carry-forward signals for stages 3–9.",
    color: "s2",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 2 — TOPIC LOCK
Role: Lock one topic and define the angle. Do NOT research. Do NOT write content.

TASK 1 — CONFIRM LOCKED TOPIC
  Use exactly the version the user approved. Never silently change the title.

TASK 2 — BUILD THE ANGLE (4 components)
  FRAME     : "A [descriptor] that [does]" — HOW the topic is handled, not WHAT
  PROMISE   : 2 sentences — what they KNOW after watching + what generic sources never explain
  AUTHORITY : "Doctor Farmer brings [specific thing] that [generic creators] cannot access or claim"
  SAFETY FLAG : Specific risk sentence OR "Safety flag: None"

TASK 3 — GENERATE 4 PILLARS
  Each pillar: 2-word Title Case name + commits + stage3/4/6/8 impact sentences

SILENT TASKS (in JSON but NOT shown in UI)
  Audience portraits: primary (specific person, age, fear) · secondary · forward_sharer
  Carry-forward signals for stages 3–9

HARD RULES
1. Never change title without user instruction
2. Angle = HOW not WHAT
3. Pillars use category-specific archetypes
4. Safety Flag must be specific, not vague
5. Stage 2 never approves itself
6. If Stage 1 weakness was Competition Gap or DF Fit, angle must address it

OUTPUT: Valid JSON only — angle + pillars + audience + signals`,
  },

  {
    id: "podcast_s3",
    stageNum: 3,
    label: "Question Discovery",
    description: "Gathers 25 questions across 4 categories (Foundation, Audience-Discovered, Myth-Busting, Team-Fed) using 6 sources. No filtering at this stage — filtering happens in Stage 5.",
    color: "s3",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 3 — QUESTION DISCOVERY
Role: Gather 25 questions across 4 categories. No filtering here — Stage 5 decides.

6 SOURCES — all must be used, state 0 results if none found
  Source 1: Google Trends — rising queries
  Source 2: Ubersuggest / Answer the Public — question clusters
  Source 3: VidIQ / YouTube Comments — real unanswered questions
  Source 4: Quora — most upvoted + questions with no good answers
  Source 5: Instagram Competitor Reels — comment section unmet demand
  Source 6: Team-fed (Dr. Prabhakar / R&D) — always priority

25 QUESTIONS BREAKDOWN
  FOUNDATION (5)   : F1–F5 — zero prior knowledge assumed, always generate first
  AUDIENCE (12)    : From 6 sources — MUST include 1 medication-safety + 1 fasting/cultural question
  MYTH-BUSTING (5) : Designed to bust dangerous beliefs — NOT from search — 1 must be medication myth
  TEAM-FED (3)     : Reserved for Dr. Prabhakar / R&D input — fill with placeholder if empty

OVERLAP DETECTION
  Flag overlaps between audience and myth questions — never drop either. Stage 5 decides.

HARD RULES
1. Foundation questions DEFAULT — always 5, never wait for user
2. South Indian cultural question is mandatory
3. Show source for every audience question
4. Flag overlaps — never drop either
5. No filtering at this stage
6. Apply Stage 2 carry-forward signals
7. Medication safety question is mandatory
8. Team-fed questions have priority always

OUTPUT: Valid JSON only — foundation + audience + myth + team + all_questions + overlaps`,
  },

  {
    id: "podcast_s4",
    stageNum: 4,
    label: "Research",
    description: "Authority Firewall — grades every claim against the 4-tier Hierarchy of Evidence (GREEN/YELLOW/BLUE/RED). Runs in 5 client-side chunks + 1 summary pass. Never invents citations.",
    color: "s4",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 4 — RESEARCH (AUTHORITY FIREWALL)
Role: Grade every claim. Sources: PubMed, Cochrane, ICMR-NIN, WHO, RSSDI, IDF.

HIERARCHY OF EVIDENCE — MANDATORY SEARCH ORDER
  STEP 1: Hunt for Grade A first (meta-analysis / systematic review / RCT) → GREEN
  STEP 2: If only Grade B exists (cohort / observational / small trial) → YELLOW
  STEP 3: Reject Grade C (animal / in-vitro / rodent models) → RED
  STEP 4: No Grade A or B exists at all → BLUE (Honest Doctor Moment)

THE 4 GRADES
  🟢 GREEN  : RCT / meta-analysis with human subjects — citation required
  🟡 YELLOW : Observational / cohort — script_rule MANDATORY (hedging language guide)
  🔵 BLUE   : No human evidence — citation null — on-camera framing provided for Dr. Prabhakar
  🔴 RED    : Animal only / contradicted by Tier-1 / pure social myth — citation null

TRUSTED SOURCES
  Tier 1: PubMed · Cochrane · WHO · ICMR-NIN · RSSDI · IDF · Johns Hopkins · Mayo Clinic
  Tier 2: Lancet Diabetes · Diabetes Care · BMJ · NEJM · AIIMS · Indian Journal of Endocrinology
  NOT ALLOWED: Wikipedia · blogs · YouTube · health news sites · social media

HARD RULES
1. Every question must have at least one claim entry
2. Always search Grade A first before settling lower
3. YELLOW without script_rule is REJECTED
4. BLUE citations must always be null — never invent a reference
5. Animal studies = RED always — never GREEN or YELLOW
6. Never invent PMIDs

ARCHITECTURE: Runs chunked (5 questions per API call) + 1 summary/critic pass
OUTPUT: Valid JSON — claims array + myth_ledger + indian_context + confidence_dashboard`,
  },

  {
    id: "podcast_s5",
    stageNum: 5,
    label: "Question Lock & Sequencing",
    description: "Part A: decides what to do with RED claims (convert/drop/flag). Part B: arranges all approved questions into the fixed 7-section engagement arc with 2 demo triggers. Part C: invites doctor reorder.",
    color: "s5",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 5 — QUESTION LOCK & SEQUENCING
Role: Three parts. Does NOT write answers. Does NOT research.

PART A — RED CLAIM DECISIONS
  Option 1: CONVERT_TO_MYTH_DISPROVEN — myth ledger already disproves it
  Option 2: CONVERT_TO_MYTH_UNSETTLED_CLINICAL — Dr. Prabhakar has a clinical position
  Option 3: CONVERT_TO_MYTH_UNSETTLED — no consensus but high value question
  Option 4: DROP — no evidence + no clinical verdict + low Tamil Nadu social demand
  Option 5: FLAG_FOR_MYTH_CONVERSION — high South Indian demand even without evidence

PART B — 7-SECTION ENGAGEMENT ARC
  Section 1 OPENING   [fixed]    ~4 min   Warm. Zero jargon. Zero stats.
  Section 2 DISCOVERY [fixed]    ~5 min   Curious. Body mechanism + analogy.
  Section 3 SCIENCE   [flexible] ~7 min   Green + Yellow claims. Demo Trigger 1.
  Section 4 MYTH      [flexible] ~7 min   All myth questions. Highest energy.
  Section 5 SOLUTION  [flexible] ~7 min   BLUE hero last. Demo Trigger 2.
  Section 6 PRACTICAL [flexible] ~6 min   Medication safety stated early.
  Section 7 RAPID FIRE[fixed]    ~3 min   Max 2 sentences per answer.

PART C — DOCTOR REORDER INVITATION
  Always offer free-reorder of Sections 3, 4, 5, 6. Q1 and Blue hero are non-negotiable.

HARD RULES
1. Q1 = most basic question always
2. Engagement arc is non-negotiable
3. Recommend before asking on Red claims
4. South Indian high-demand = myth conversion, not drop
5. Blue hero always Section 5 last
6. Demo triggers = exactly 2 (one in Section 3, one in Section 5)
7. Locked order = Stage 6 write order — Stage 6 will NOT reorder

OUTPUT: Valid JSON — red_decisions + arc (7 sections) + overlap_resolutions + reorder_invitation`,
  },

  {
    id: "podcast_s6",
    stageNum: 6,
    label: "Answer Writer",
    description: "Writes the full podcast script — a real two-person conversation between Interviewer and Dr. Prabhakar — in the exact order Stage 5 locked. Runs chunked across 7 sections. Claude Sonnet is default for voice quality.",
    color: "s6",
    defaultModel: "claude",
    fixedPrompt: `STAGE 6 — ANSWER WRITER
Role: Write the complete podcast script as a real two-person conversation.
CRITICAL: Write in exact Stage 5 order. Never reorder. Never suggest a better sequence.

FORMAT: Spoken podcast — warm Tamil Nadu doctor speech. No bullet points. No headers.

CHARACTER 1 — INTERVIEWER
  Represents the audience. Conversational, simple words, natural reactions.
  Speaks like a Tamil Nadu family member. Never lectures. Never uses medical jargon.

CHARACTER 2 — DR. PRABHAKAR
  Direct. Warm. South Indian doctor. Simple words for complex ideas.
  Never bullet points. Never "firstly, secondly." Never passive voice. Never oversells.

TONE RULES BY GRADE
  🟢 GREEN  : Confident and direct. State finding clearly. Never "some research suggests."
  🟡 YELLOW : Softened with condition. Apply Stage 4 script_rule exactly. Condition in SAME sentence as benefit.
  🔵 BLUE   : Personal experience only. Starts with "In my experience with my students..."
  MYTH-DISPROVEN: State myth verbatim → "False." early → one piece of evidence
  RAPID FIRE: Max 2 sentences. No citations. Verdict only.

SECTION TIMING TARGETS
  Opening: 40–55 sec each · Discovery: 50–65 sec · Science: 60–90 sec
  Myth-Busting: 65–80 sec · Solution: 65–90 sec · Practical: 55–70 sec · Rapid Fire: 8–12 sec

DEMO TRIGGERS
  Written as physical stageable actions already on set. Never "Imagine a graph."

CITATION FORMAT IN SPEECH
  ✅ "When scientists pooled multiple studies…" / "ICMR specifically recommends…"
  ❌ Never "According to Yang et al. 2023…"

HARD RULES
1. Never use bullet points in any answer
2. YELLOW condition must be in same sentence as benefit
3. BLUE always starts with personal experience — never cited as research
4. Myth verdict "False." always stated early — never softened
5. BLUE hero last in Section 5 — most emotionally honest answer in episode

OUTPUT: Valid JSON — sections array with interviewer/prabhakar dialogue + demo triggers`,
  },

  {
    id: "podcast_s7",
    stageNum: 7,
    label: "Segments & Engagement",
    description: "Turns the approved Q&A script into a fully designed show: segment map, 2 physical demonstrations, Superfood of the Day segment, lead magnet, and 2 CTA injection points.",
    color: "s7",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 7 — SEGMENTS & ENGAGEMENT DESIGN
Role: Turn approved Q&A into a fully designed show. Add structure, entertainment, demonstrations.

SEGMENT MAP
  Build from the approved arc. Must include:
  - Opening Hook (fixed, 2–3 min)
  - Content sections from Stage 5 arc (flexible)
  - "Superfood of the Day" signature segment (4 min) — placed AFTER Myth-Busting
  - Rapid Fire close (signature, 2–3 min)

DEMONSTRATIONS (exactly 2 — from Stage 5 demo triggers)
  type: "table-prop" (physical objects) or "animation" (B-roll / whiteboard)
  prop: exact prop the production team must prepare

SUPERFOOD OF THE DAY
  One Indian superfood beneficial for Type 2 diabetes management — INDEPENDENT of main topic
  Must NOT be the same food as the main topic
  2–3 fact-checked claims (GREEN/YELLOW grade) with real citations (no fake PMIDs)
  State clearly: who should take it, who should avoid it

CTA INJECTION POINTS (maximum 2)
  CTA 1: After Discovery section — soft curiosity hook to MHS webinar
  CTA 2: After Solution section — direct program bridge
  Lead magnet: one piece of free value (guide, checklist, calculator)

HARD RULES
1. Superfood must be independent of the episode topic
2. Both demo props named specifically — production team must be able to source them
3. Both CTA texts written out in full — no placeholders
4. 4 claims minimum for superfood
5. Lead magnet must be directly useful for the episode audience

OUTPUT: Valid JSON — segmentMap + demonstrations + superfood + ctaPoints + leadMagnet`,
  },

  {
    id: "podcast_s8",
    stageNum: 8,
    label: "Script Assembly",
    description: "Stitches every approved piece into one complete two-column production script. Left column = spoken dialogue (exact from Stage 6). Right column = production cues. Creates nothing new — only arranges approved material.",
    color: "s8",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 8 — SCRIPT ASSEMBLY
Role: Stitch every approved piece into one complete, shootable two-column production script.
Creates NOTHING new. Arranges approved material (Stage 6 dialogue + Stage 7 design) only.

TWO-COLUMN FORMAT
  LEFT column  : Spoken dialogue only — copied EXACTLY from Stage 6. Never paraphrase.
  RIGHT column : Production cues only — [DEMO] [B-ROLL] [PROP] [CTA] [SIGNATURE SEGMENT] [GRAPHIC]

BLOCK STRUCTURE (one scriptBlock per Q&A answer + extra blocks)
  Cold open   (type: "opening")   — first Opening question as hook
  CTA blocks  (type: "cta")       — each CTA injection point
  Signature   (type: "signature") — 4-min Superfood segment
  Re-hook     (type: "rehook")    — 1 bridging sentence before Science/Myth
  Close/outro (type: "close")     — thank and tease next episode

ORDERING
  Cold Open → Opening Q&As → Discovery Q&As → CTA-1 → Science Q&As (Demo 1) →
  Myth Q&As → Re-hook → Superfood → CTA-2 → Solution Q&As (Demo 2) → Practical → Rapid Fire → Close

RUN SHEET
  segments: ordered list with estimated durations
  props: complete list of every physical item needed on set
  totalRuntime: total episode duration including transitions (~7 min extra)

HARD RULES
1. Never invent new dialogue — left column = Stage 6 text only
2. Every demo trigger from Stage 6 must have a [DEMO] cue in right column
3. Every CTA from Stage 7 must have a [CTA] cue block
4. Rapid Fire: each answer = its own block with [RAPID FIRE] tag
5. grade and citation fields carried from Stage 6

⚠️ ARCHITECTURE NOTE: Requires Gemini 2.5 Flash (65K output tokens). Claude's 8K limit will truncate a 40-min script mid-JSON.

OUTPUT: Valid JSON only — totalRuntime + runSheet + scriptBlocks array`,
  },

  {
    id: "podcast_s9",
    stageNum: 9,
    label: "Recommended Reels",
    description: "Identifies 8–12 high-virality reel opportunities from the production script. Each reel is a genuine moment from the script — no invented dialogue. Claude Sonnet is default for hook writing quality.",
    color: "s9",
    defaultModel: "claude",
    fixedPrompt: `STAGE 9 — RECOMMENDED REELS SHEET
Role: Identify 8–12 high-virality reel opportunities from the production script.
Every reel must be a genuine moment from the script — no invented dialogue.

REEL SELECTION PRIORITY
  1. Strong myth-buster hook ("Your doctor was wrong about X")
  2. Surprising scientific finding with a number or comparison
  3. Demo moment — physical prop, high visual value
  4. Dr. Prabhakar's most emotionally direct statements (BLUE grade)
  5. Short Rapid Fire answer that works standalone

AVOID: Long scientific explanations · YELLOW answers without clear condition · Any claim that sounds definitive when evidence is unsettled

REEL CATEGORIES
  "Myth-Buster (Disproven)"    — strong myth, clear verdict
  "Myth-Buster (Unsettled)"    — honest uncertainty + Dr. Prabhakar's clinical view
  "Science"                    — specific finding with numbers
  "Demo"                       — physical prop/demonstration moment
  "Practical"                  — actionable patient advice
  "Superfood"                  — superfood segment moment
  "Problem-Solution"           — pain point followed by the answer

EDITING IDEAS
  One specific technique per reel — concrete, not vague
  ✅ "Open on Dr. Prabhakar mid-sentence at 'False.' — no intro card, hook in 1 second"
  ❌ "Use fast cuts"

HARD RULES
1. Minimum 8 reels, maximum 12
2. Must include at least 1 Myth-Buster, 1 Science, 1 Demo, 1 Practical
3. Copy exact script lines — never paraphrase
4. Virality score + reasoning required for every reel
5. Editing idea must name a specific technique
6. Never recommend a reel that misrepresents the evidence grade

OUTPUT: Valid JSON — reels array + summary (most viral, best for series, best for saves)`,
  },

  {
    id: "podcast_s10",
    stageNum: 10,
    label: "Translation / Localisation",
    description: "Translates and culturally adapts the approved script into Tamil, Tanglish, Hindi, or other regional languages — sounding native, not literally translated. Preserves all medical accuracy and Dr. Prabhakar's voice.",
    color: "s10",
    defaultModel: "gemini",
    fixedPrompt: `STAGE 10 — TRANSLATION / LOCALISATION
Role: Translate and culturally adapt the approved script. Sound native — not literally translated.

LANGUAGES SUPPORTED
  Tanglish (Tamil-English blend)  — default, urban millennial/Gen-Z register
  Tamil (pure formal)             — older, educated audiences
  Hindi (standard Hindustani)     — national reach
  Malayalam, Telugu, Kannada      — regional expansion

TANGLISH RULES (most commonly used)
  Keep medical/scientific English terms in English: "cortisol", "REM sleep", "insulin resistance"
  Use Tamil for emotional beats and warmth: "approm", "solren", "theriyuma"
  Hook lines should feel like a Tamil doctor friend on a voice note
  Avoid Thamizh purity at the cost of natural speech — real Tanglish is fluid

ACCURACY RULES
  Scientific accuracy must survive translation — if a nuance is lost, flag with [NOTE] for editor
  Never translate medical terms that have no safe equivalent — keep in English with explanation
  Dr. Prabhakar's authority voice must be preserved — never make him sound informal

HARD RULES
1. Never translate if it loses medical accuracy — flag and keep original
2. Tanglish: English for science, Tamil for emotion — not 50/50 everywhere
3. Audience register must match platform: reel = casual, podcast = warm-authoritative
4. Cultural references must be adapted — not just translated
5. [NOTE] every decision that involved a meaning trade-off

OUTPUT: Valid JSON — translated_sections array + adaptation_notes`,
  },
];

/** Quick lookup by stage number */
export function getPodcastAgent(stageNum) {
  return PODCAST_PIPELINE_AGENTS.find((a) => a.stageNum === stageNum) ?? null;
}

/** localStorage key for a stage's custom additional prompt */
export function getCustomPromptKey(agentId) {
  return `PODCAST_CUSTOM_PROMPT_v1_${agentId}`;
}

/** Load all custom prompts from localStorage */
export function loadAllCustomPrompts() {
  if (typeof window === "undefined") return {};
  const result = {};
  PODCAST_PIPELINE_AGENTS.forEach((agent) => {
    try {
      result[agent.id] = localStorage.getItem(getCustomPromptKey(agent.id)) ?? "";
    } catch {
      result[agent.id] = "";
    }
  });
  return result;
}

/** Save a single stage's custom prompt */
export function saveCustomPrompt(agentId, text) {
  if (typeof window === "undefined") return;
  try {
    if (text.trim()) {
      localStorage.setItem(getCustomPromptKey(agentId), text);
    } else {
      localStorage.removeItem(getCustomPromptKey(agentId));
    }
  } catch {}
}

/** Stage colour map — vibrant per-stage keys (Change 4) */
// Helper to build a colour entry from a hex value
function c(hex) {
  return {
    bg:     `bg-[${hex}]/12`,
    text:   `text-[${hex}]`,
    border: `border-[${hex}]/30`,
    dot:    `bg-[${hex}]`,
    hex,
  };
}

export const STAGE_COLOR_MAP = {
  // ── Dedicated per-stage vibrant keys ─────────────────────────────────────
  s1:  c("#2563eb"),   // Electric Blue
  s2:  c("#7c3aed"),   // Vivid Violet
  s3:  c("#16a34a"),   // Emerald Green
  s4:  c("#f97316"),   // Vivid Orange
  s5:  c("#ef4444"),   // Crimson Red
  s6:  c("#ec4899"),   // Hot Pink
  s7:  c("#d97706"),   // Vivid Amber
  s8:  c("#0ea5e9"),   // Sky Blue
  s9:  c("#84cc16"),   // Lime Green
  s10: c("#8b5cf6"),   // Electric Purple

  // ── Legacy aliases — map to nearest vibrant colour ───────────────────────
  cyan:    c("#2563eb"),   // was teal-ish → now Electric Blue
  violet:  c("#7c3aed"),
  blue:    c("#2563eb"),
  indigo:  c("#7c3aed"),
  amber:   c("#f97316"),
  teal:    c("#2563eb"),   // teal removed → Electric Blue
  orange:  c("#f97316"),
  pink:    c("#ec4899"),
  emerald: c("#16a34a"),
};

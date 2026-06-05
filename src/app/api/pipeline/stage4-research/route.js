import { NextResponse } from "next/server";
import { generateMockStage4Research } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, modeLabel } from "@/lib/podcast/key-resolver";
import { getEvidenceReport, extractMedicalQuery } from "@/lib/pubmed";

// ── Extend Vercel/Next timeout to 5 min — large research jobs need it ─────────
export const maxDuration = 300;

// ── Doctor Farmer Pipeline Stage 4 — Research / Authority Firewall ────────────
//
// This route supports THREE modes (sent in the POST body as `mode`):
//   "chunk"   — Grade only the provided questions slice (5 questions).
//               Returns { claims: [...] }
//   "summary" — Given all pre-graded claims, build myth_ledger,
//               indian_context, critic_pass, confidence_dashboard.
//               Returns { myth_ledger, indian_context, critic_pass,
//                         confidence_dashboard }
//   (default) — Old single-call path (used for demo mode only).
//
// The component handles chunking client-side so the UI can show real
// per-batch progress between each fetch.
// ─────────────────────────────────────────────────────────────────────────────

const RESEARCH_PREAMBLE = `You are a medical research grader with deep knowledge of PubMed, Cochrane Library, ICMR-NIN guidelines, WHO, RSSDI, and IDF publications up to 2025. You reason from evidence, not from popular claims.\n\n`;

// ── CHUNK system prompt ──────────────────────────────────────────────────────
const CHUNK_SYSTEM = RESEARCH_PREAMBLE + `You are Stage 4 — Research (Authority Firewall) — Claim Grader for the Doctor Farmer MagicScript Pipeline.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIERARCHY OF EVIDENCE — MANDATORY SEARCH ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For every claim you grade, mentally search in this exact order and stop at the highest level found:

STEP 1 — HUNT FOR GRADE A FIRST (meta-analysis / systematic review / RCT)
  Search within: PubMed (nih.gov), Cochrane, WHO, ICMR-NIN, RSSDI, IDF, Lancet, NEJM, BMJ, Diabetes Care
  If Grade A evidence EXISTS → grade GREEN
  Include: study type, approx. year, sample size, key finding, journal or PMID when known

STEP 2 — IF ONLY GRADE B EXISTS (cohort studies / observational / small controlled trials)
  Grade → YELLOW
  note MUST state: "Evidence is Grade B only — no RCT or meta-analysis confirmed this in humans."
  script_rule MUST tell the writer how to hedge: e.g. "Never say 'proven'. Say 'studies suggest' instead."

STEP 3 — REJECT GRADE C (animal studies / in-vitro / test-tube / rodent models)
  Grade → RED
  note MUST state: "Only animal or in-vitro evidence exists — this cannot be presented as a human fact."
  NEVER allow a claim to be GREEN or YELLOW based on animal studies alone.

STEP 4 — WHEN NO GRADE A OR B EXISTS
  Do NOT invent citations. Do NOT force a GREEN or YELLOW.
  Grade → BLUE (Dr. Prabhakar's Clinical Experience)
  This is the most POWERFUL outcome — it means the claim is genuinely unsettled by science,
  and Dr. Prabhakar can speak with complete honesty on camera.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE FOUR GRADES — EXACT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 GREEN
  Condition: Meta-analysis, Systematic Review, or RCT with human subjects in Tier-1 source
  citation: required — Author et al. (Year). Title. Journal. PMID if known.
  note: state study type, year, sample size, key finding
  script_rule: null (no hedging needed)

🟡 YELLOW
  Condition: Observational / cohort / small controlled trial in humans — no RCT or meta-analysis
  citation: include the best available study
  note: MUST explicitly state "Grade B evidence only" and what the limitation is
  script_rule: MANDATORY — exact phrasing guide (e.g. "Say 'research suggests' not 'research proves'")
  A YELLOW claim with no script_rule will be REJECTED.

🔵 BLUE — "The Honest Doctor Moment"
  Condition: No human Grade A or B evidence exists OR the claim is Dr. Prabhakar's personal clinical observation
  citation: null — always null. Never invent a citation.
  note: state clearly "No Grade A or B human evidence found."
  script_rule: Provide the exact on-camera framing Dr. Prabhakar should use:
    "The internet tells you [CLAIM] is a proven fact. I checked the research — there is actually
     zero Grade A proof for this yet. It is mostly hype. But in my clinical experience with
     [NUMBER] patients, here is what I actually see..."
  This grade is a BRAND ASSET — influencers fake Grade A. Dr. Prabhakar admits when science
  doesn't know yet. That honesty builds massive trust and sells the reversal programs.

🔴 RED
  Condition: Evidence is animal/in-vitro only, OR contradicts Tier-1 sources, OR is pure social myth
  citation: null
  note: state exactly why this fails the hierarchy (animal-only, contradicted by RCT, etc.)
  social_demand: how widely this is believed in Tamil Nadu and why it still needs addressing on-screen
  myth_type: assign if it is a myth-type question

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRUSTED SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tier 1: PubMed (nih.gov) · Cochrane · WHO (who.int) · ICMR-NIN (icmr.nic.in) · RSSDI · IDF · Johns Hopkins · Mayo Clinic · Cleveland Clinic
Tier 2: Lancet Diabetes · Diabetes Care · BMJ · NEJM · AIIMS · Indian Journal of Endocrinology & Metabolism
NOT ALLOWED: Wikipedia · fitness blogs · YouTube · health news sites · social media · press releases

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Every question must have at least one claim entry.
2. Always search for Grade A first before settling on a lower grade.
3. YELLOW without script_rule is incomplete and will be REJECTED.
4. BLUE citations must be null — never invent a reference for clinical experience.
5. Animal studies = RED. Never GREEN or YELLOW based on animal data alone.
6. Never invent PMIDs. If unsure of the exact PMID, describe the study without an ID.

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "claims": [
    {
      "id": "c1",
      "question_id": "A1",
      "question_text": "verbatim question text",
      "claim": "the specific factual claim being graded",
      "grade": "GREEN|YELLOW|BLUE|RED",
      "evidence_level": "Grade A — RCT|Grade A — Meta-analysis|Grade B — Cohort|Grade B — Observational|No Human Evidence|Animal Only",
      "source": "PubMed|ICMR|NIN|WHO|Clinical|None",
      "citation": "Author et al. (Year). Title. Journal. PMID: XXXXX — or null",
      "note": "1–2 sentences explaining the grade decision and evidence level",
      "script_rule": "YELLOW: exact language rule. BLUE: exact on-camera framing for Dr. Prabhakar. null for GREEN/RED.",
      "social_demand": "RED only — how widely believed in Tamil Nadu and why it must be addressed",
      "myth_type": "disproven|unsettled|unsettled-clinical — myth questions only, omit for others"
    }
  ]
}`;

// ── SUMMARY system prompt ────────────────────────────────────────────────────
const SUMMARY_SYSTEM = RESEARCH_PREAMBLE + `You are Stage 4 — Research (Authority Firewall) — Summary Builder.

All claims have already been graded by a previous step. Do NOT re-grade them.
Your job: analyse the full claim list and produce four output sections.

MANDATORY OUTPUTS:
1. myth_ledger — one entry per myth-type claim (disproven / unsettled / unsettled-clinical)
2. indian_context — 3–5 angles specific to South Indian / Tamil Nadu diabetic patients (ICMR vs Western guidelines, religious fasting, rice, coconut oil, etc.)
3. critic_pass — second-agent review. Flag ALL of the following violations:
   - Any YELLOW claim missing a script_rule
   - Any YELLOW claim whose note does not mention "Grade B" or evidence limitation
   - Any BLUE claim with a non-null citation (hallucinated reference)
   - Any RED claim missing a social_demand note
   - Any GREEN claim citing only animal or in-vitro studies
   - Any claim where the evidence_level contradicts the grade assigned
4. confidence_dashboard — count claims by colour; approvable = false if any RED claims exist

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "myth_ledger": [
    {
      "question_id": "M1",
      "question_text": "the myth question verbatim",
      "myth_type": "disproven|unsettled|unsettled-clinical",
      "evidence": "1–2 sentences on what the evidence shows",
      "clinical_verdict": "Dr. Prabhakar's clinical verdict — only for unsettled-clinical",
      "claim_id": "c6"
    }
  ],
  "indian_context": [
    {
      "id": "ic1",
      "angle": "short headline for this Indian context point",
      "significance": "why this changes the answer for Tamil Nadu patients",
      "source": "ICMR/NIN/published study name"
    }
  ],
  "critic_pass": {
    "status": "passed|failed",
    "flags": ["specific flag 1", "specific flag 2"]
  },
  "confidence_dashboard": {
    "green": 0,
    "yellow": 0,
    "blue": 0,
    "red": 0,
    "total": 0,
    "approvable": true
  }
}`;

// ── Full system (demo / single-call legacy) ──────────────────────────────────
const FULL_SYSTEM = RESEARCH_PREAMBLE + `You are Stage 4 — Research (The Authority Firewall) — of the Doctor Farmer MagicScript Pipeline.

Your job: research every question from Stage 3, grade every claim using the Hierarchy of Evidence, build the Myth Ledger, add Indian context, and run the Critic Pass.

You do NOT write answers. You do NOT sequence. You ONLY grade claims and build the evidence brief.

HIERARCHY OF EVIDENCE (mandatory search order for every claim):
1. Hunt Grade A first: Meta-analysis / Systematic Review / RCT → GREEN
2. Grade B only (cohort/observational): → YELLOW with script_rule + "Grade B only" note
3. Animal/in-vitro only: → RED — never present as human fact
4. No human evidence at all: → BLUE ("honest doctor moment" — no invented citations)

BLUE claims carry the on-camera framing:
"The internet says this is proven. I checked. There's zero Grade A proof yet.
 But in my clinical experience..."

Return valid JSON only matching this exact schema:
{
  "claims": [{ "id", "question_id", "question_text", "claim", "grade", "evidence_level", "source", "citation", "note", "script_rule", "social_demand", "myth_type" }],
  "myth_ledger": [{ "question_id", "question_text", "myth_type", "evidence", "clinical_verdict", "claim_id" }],
  "indian_context": [{ "id", "angle", "significance", "source" }],
  "critic_pass": { "status": "passed|failed", "flags": [] },
  "confidence_dashboard": { "green": 0, "yellow": 0, "blue": 0, "red": 0, "total": 0, "approvable": true }
}`;

// ── Prompt builders ──────────────────────────────────────────────────────────

function buildChunkPrompt({ locked_topic, category, questions, chunkIndex, totalChunks, pre_verified_facts = [], pubmedArticles = [] }) {
  const qList = questions
    .map((q) => `- [${q.id ?? q.question_id ?? `q${chunkIndex}`}] type:${q.type ?? "general"} "${q.text ?? q.question_text ?? q}"`)
    .join("\n");

  const preVerifiedBlock = pre_verified_facts.length > 0
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-VERIFIED FACTS (from our local database — already graded on a previous episode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have ${pre_verified_facts.length} pre-verified facts from previous research sessions.

WARNING: Some of these facts are broadly related to the topic but may NOT directly answer today's specific questions. Apply strict medical relevance filtering:
- If a pre-verified fact PERFECTLY answers one of today's questions (same claim, same medical context), use it immediately and cite the saved source. Do NOT perform new research for that question.
- If a pre-verified fact is only tangentially related or does not precisely answer today's specific question, IGNORE IT and perform fresh evidence assessment for that question.

PRE-VERIFIED FACTS:
${pre_verified_facts.map((f, i) => `${i + 1}. [${f.grade}] "${f.claimText}"
   Source: ${f.sourceText || "on file"}
   Evidence: ${f.evidenceLevel || "verified"}${f.scriptRule ? `\n   Script rule: ${f.scriptRule}` : ""}`).join("\n\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : "";

  // Real PubMed articles retrieved live from NCBI E-utilities
  const pubmedBlock = pubmedArticles.length > 0
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE PUBMED ARTICLES (retrieved in real-time from NCBI — use these as citation anchors)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pubmedArticles.length} real PubMed articles found for this topic. Use these PMIDs and details when grading — they are real:
${pubmedArticles.map((a, i) =>
  `${i + 1}. PMID: ${a.pmid} | ${a.title} | ${a.journal} (${a.year ?? "n/a"}) | Types: ${(a.articleTypes ?? []).join(", ") || "Not specified"}`
).join("\n")}

When a question's claim is directly supported by one of the above articles, cite it with its real PMID.
If no article above directly answers the question, grade using your medical knowledge hierarchy.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : "";

  return `RESEARCH CHUNK ${chunkIndex + 1} of ${totalChunks}
Topic: ${locked_topic ?? "Health Topic"}
Category: ${category ?? "General"}
${preVerifiedBlock}${pubmedBlock}
QUESTIONS TO GRADE (${questions.length}):
${qList}

Grade each question above using the Hierarchy of Evidence. Check PRE-VERIFIED FACTS and LIVE PUBMED ARTICLES first.
Return ONLY valid JSON: { "claims": [...] }
No markdown. No explanation. No text before or after the JSON.`;
}

function buildSummaryPrompt({ locked_topic, claims }) {
  const counts = { GREEN: 0, YELLOW: 0, BLUE: 0, RED: 0 };
  claims.forEach((c) => { if (c.grade) counts[c.grade] = (counts[c.grade] ?? 0) + 1; });
  const mythClaims = claims.filter((c) => c.myth_type);

  return `SUMMARY BUILD — Topic: "${locked_topic ?? "Health Topic"}"
${claims.length} claims graded: GREEN=${counts.GREEN}, YELLOW=${counts.YELLOW}, BLUE=${counts.BLUE}, RED=${counts.RED}

MYTH-TYPE CLAIMS (${mythClaims.length}):
${mythClaims.map((c) => `- [${c.question_id}] ${c.myth_type}: "${c.question_text}"`).join("\n") || "  None"}

ALL CLAIMS (abbreviated for context):
${claims.map((c) => `- [${c.id}] ${c.grade} | "${c.claim}"`).join("\n")}

Build: myth_ledger, indian_context (3–5 Tamil Nadu angles), critic_pass, confidence_dashboard.
Return ONLY valid JSON. No markdown. No explanation.`;
}

function buildFullPrompt({ locked_topic, category, questions, signals }) {
  const qList = questions
    .map((q) => `- [${q.id ?? q.question_id}] type:${q.type} "${q.text}"`)
    .join("\n");

  return `RESEARCH REQUEST:
Topic: ${locked_topic ?? "Health Topic"}
Category: ${category ?? "Myth"}
Stage 4 signals: ${signals ? JSON.stringify(signals) : "Not provided"}

QUESTIONS TO RESEARCH (${questions.length} total):
${qList || "(No questions — generate representative research for the topic)"}

Return ONLY valid JSON. No markdown.`;
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    mode                = "full",
    locked_topic        = "Health Topic",
    category            = "Myth",
    questions           = [],
    claims              = [],   // used in summary mode
    signals             = null,
    stage3_data         = null,
    chunkIndex          = 0,
    totalChunks         = 1,
    pre_verified_facts  = [],   // from Verified Fact Library — injected by the component
  } = body;

  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);

  // ── Fetch real PubMed articles for this topic (always, regardless of mode) ─
  // Clean the topic title into a proper medical query before searching.
  const pubmedQuery  = extractMedicalQuery(locked_topic);
  let pubmedArticles = [];
  let pubmedEvidence = null;
  try {
    const report = await getEvidenceReport(pubmedQuery, { maxResults: 10, minYear: 2015 });
    pubmedArticles = report.allArticles ?? report.topArticles ?? [];
    pubmedEvidence = report.evidence;
    console.log(`[stage4-research] PubMed: "${pubmedQuery}" → ${pubmedEvidence?.totalCount} papers, score=${pubmedEvidence?.score}`);
  } catch (e) {
    console.warn("[stage4-research] PubMed fetch failed (non-fatal):", e.message);
  }

  // ── Demo mode (no keys) ──────────────────────────────────────────────────
  if (!geminiKey && !anthropicKey) {
    await new Promise((r) => setTimeout(r, 1400));
    const mock = generateMockStage4Research(stage3_data ?? { all_questions: questions });
    return NextResponse.json({
      ...mock,
      mode: "demo",
      pubmed_articles: pubmedArticles,
      pubmed_evidence: pubmedEvidence,
    });
  }

  const preferred = req.headers.get("x-preferred-model") ?? "gemini";

  try {
    // ── CHUNK mode ──────────────────────────────────────────────────────────
    if (mode === "chunk") {
      const promptText = buildChunkPrompt({ locked_topic, category, questions, chunkIndex, totalChunks, pre_verified_facts, pubmedArticles });

      // Attach pubmed data to every chunk response
      const pubmedMeta = { pubmed_articles: pubmedArticles, pubmed_evidence: pubmedEvidence };

      if (preferred === "claude") {
        if (anthropicKey) {
          const parsed = await callClaude(anthropicKey, CHUNK_SYSTEM, promptText, true, 4096);
          return NextResponse.json({ claims: parsed.claims ?? [], mode: modeLabel(req), ...pubmedMeta });
        }
        if (geminiKey) {
          const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, CHUNK_SYSTEM, promptText, 0.3, 8192, 0);
          return NextResponse.json({ claims: parsed.claims ?? [], mode: "gemini", ...pubmedMeta });
        }
      } else {
        if (geminiKey) {
          const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, CHUNK_SYSTEM, promptText, 0.3, 8192, 0);
          return NextResponse.json({ claims: parsed.claims ?? [], mode: "gemini", ...pubmedMeta });
        }
        if (anthropicKey) {
          const parsed = await callClaude(anthropicKey, CHUNK_SYSTEM, promptText, true, 4096);
          return NextResponse.json({ claims: parsed.claims ?? [], mode: modeLabel(req), ...pubmedMeta });
        }
      }
    }

    // ── SUMMARY mode ────────────────────────────────────────────────────────
    if (mode === "summary") {
      const promptText = buildSummaryPrompt({ locked_topic, claims });
      const pubmedMeta = { pubmed_articles: pubmedArticles, pubmed_evidence: pubmedEvidence };

      if (preferred === "claude") {
        if (anthropicKey) {
          const parsed = await callClaude(anthropicKey, SUMMARY_SYSTEM, promptText, true, 4096);
          return NextResponse.json({ ...parsed, mode: modeLabel(req), ...pubmedMeta });
        }
        if (geminiKey) {
          const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SUMMARY_SYSTEM, promptText, 0.3, 4096, 0);
          return NextResponse.json({ ...parsed, mode: "gemini", ...pubmedMeta });
        }
      } else {
        if (geminiKey) {
          const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SUMMARY_SYSTEM, promptText, 0.3, 4096, 0);
          return NextResponse.json({ ...parsed, mode: "gemini", ...pubmedMeta });
        }
        if (anthropicKey) {
          const parsed = await callClaude(anthropicKey, SUMMARY_SYSTEM, promptText, true, 4096);
          return NextResponse.json({ ...parsed, mode: modeLabel(req), ...pubmedMeta });
        }
      }
    }

    // ── FULL / legacy mode ──────────────────────────────────────────────────
    const allQuestions = stage3_data?.all_questions ?? questions;
    const promptText   = buildFullPrompt({ locked_topic, category, questions: allQuestions, signals });
    const pubmedMeta   = { pubmed_articles: pubmedArticles, pubmed_evidence: pubmedEvidence };

    if (preferred === "claude") {
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, FULL_SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req), ...pubmedMeta });
      }
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, FULL_SYSTEM, promptText, 0.4, 8192, 0);
        return NextResponse.json({ ...parsed, mode: "gemini", ...pubmedMeta });
      }
    } else {
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, FULL_SYSTEM, promptText, 0.4, 8192, 0);
        return NextResponse.json({ ...parsed, mode: "gemini", ...pubmedMeta });
      }
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, FULL_SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req), ...pubmedMeta });
      }
    }

  } catch (e) {
    console.error("[stage4-research] error:", e.message);
    return NextResponse.json({ error: e.message, mode: "error", pubmed_articles: pubmedArticles, pubmed_evidence: pubmedEvidence }, { status: 500 });
  }

  // ── True fallback ────────────────────────────────────────────────────────
  const mock = generateMockStage4Research(stage3_data ?? { all_questions: questions });
  return NextResponse.json({ ...mock, mode: "demo", pubmed_articles: pubmedArticles, pubmed_evidence: pubmedEvidence });
}

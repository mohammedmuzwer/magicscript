// All LLM prompts for the Reels Agent — templated functions

export const SYSTEM_PROMPT = `You are the Reels Content Agent for Magic Script — a medical content studio for Dr. Prabhakar Raj, a credible health creator targeting Indian and South Indian audiences.

Your job is to generate shoot-ready 60-second Instagram Reel scripts that are:
1. Scientifically accurate (cite PubMed, WHO, or NIH when possible)
2. Emotionally engineered for maximum watch-through rate
3. Written in natural human voice — NOT robotic, NOT listicle-style unless the format demands it
4. Culturally resonant for Tamil/South Indian viewers
5. Safe — never claim to diagnose, prescribe, or cure. Reframe all absolutes as tendencies.

You must always produce scripts in the EXACT format requested. Do not add preamble, explanations, or commentary outside the script structure.`;

// ── Stage 1: One-Word Expansion ──────────────────────────────────────────────

export function buildExpandPrompt(word) {
  return `USER INPUT: ${word}

Expand this single health-related word into 3 distinct content angles for a 60-second Instagram Reel.

Return ONLY a JSON array with this structure:
[
  {
    "angle": "Short angle title (max 8 words)",
    "hook_preview": "The opening line this angle would use (max 15 words)",
    "type": "myth | problem | education | faq | contrarian",
    "virality_score": 1-10
  }
]

No markdown, no explanation. JSON only.`;
}

// ── Stage 3: Medical Quick-Check ─────────────────────────────────────────────

/**
 * @param {string} topic
 * @param {string} contentType
 * @param {object|null} pubmedEvidence - real PubMed evidence report from getEvidenceReport()
 */
export function buildMedCheckPrompt(topic, contentType, pubmedEvidence = null) {
  // Build a block of real PubMed articles if available
  const evidenceBlock = pubmedEvidence
    ? `
REAL PUBMED EVIDENCE (already retrieved — use ONLY these citations, do NOT invent PMIDs):
Research Density: ${pubmedEvidence.evidence.totalCount} PubMed articles found (since 2015)
Evidence Label: ${pubmedEvidence.evidence.label} (score ${pubmedEvidence.evidence.score}/100)
Top Articles:
${pubmedEvidence.topArticles.map((a, i) =>
  `${i + 1}. ${a.title} (${a.year ?? "n/a"}) — ${a.journal} — PMID: ${a.pmid} — ${a.url}`
).join("\n")}

Use the evidence_score (${pubmedEvidence.evidence.score}) as the primary basis for your scoring.
If the PubMed score is 70+, lean toward "safe". 40-69 = "caution". Below 40 = "blocked".
Your pubmed_references MUST use the real titles and PMIDs above — do NOT fabricate new ones.
`
    : `
(No real PubMed data available — use your medical knowledge to estimate the evidence_score.)
`;

  return `TOPIC: ${topic}
CONTENT TYPE: ${contentType}
${evidenceBlock}
You are the Medical Safety Agent. Analyze this health topic for a 60-second Reel script.

Return ONLY this JSON:
{
  "evidence_score": 0-100,
  "safety_status": "safe" | "caution" | "blocked",
  "flagged_claims": ["claim 1", "claim 2"],
  "suggested_rephrases": { "original claim": "safer version" },
  "pubmed_references": ["Title (Year) - Journal — PMID: XXXXX"],
  "safety_note": "One sentence for the creator about what to be careful about"
}

Rules:
- Score 70+ = safe to publish as-is
- Score 40-69 = publish with caution disclaimer
- Score below 40 = block and require rephrase
- Never flag factual scientific statements. Only flag absolute cure/treatment claims.
- pubmed_references: use the real articles provided above (max 3 entries); if none provided use your knowledge
- flagged_claims: empty array if none

No markdown, no explanation. JSON only.`;
}

// ── Content-type structure overrides ────────────────────────────────────────
// Each content type customises the script structure. Scripts MUST follow the
// structure for their contentType — not the generic default.

function getContentTypeInstructions(contentType) {
  switch (contentType) {
    case "problem-reveal":
      return {
        cinemaBeat: `[0-3s] HOOK — A shocking "you might have this right now" opener that creates urgency
[4-12s] THE HIDDEN PROBLEM — Reveal the silent issue most patients miss, with a relatable South Indian scenario
[13-32s] WHY IT'S IGNORED — The reason doctors and patients overlook this (cultural, dietary, or medical reason)
[33-50s] THE FIX — Concrete, actionable solution Dr. Raj's patients use. Include at least 1 specific step.
[51-60s] CTA — "Share this with someone who has [condition]" — drives family-forward sharing`,
        educationStructure: `HOOK (0-3s): Alarming stat or "you might have this" opener
PROBLEM (4-20s): What the hidden issue is and how it silently harms — with South Indian context
WHY IGNORED (21-38s): Why patients and doctors miss this — the key insight
THE FIX (39-54s): The solution — what Doctor Farmer's patients do differently (specific, actionable)
CTA (55-60s): Family-share prompt — "send this to your [family member] with [condition]"`,
        rebelStructure: `CHALLENGE (0-5s): "Everyone is focused on [wrong thing] and missing the real [problem]"
EXPOSE (6-25s): Reveal what mainstream advice gets wrong about this problem
THE REAL CAUSE (26-42s): The actual root cause with science (1 strong source)
THE FIX (43-55s): What actually works — Doctor Farmer's protocol in 2–3 steps
DARE CTA (56-60s): Provocative — "Ask your doctor about this. Most won't know the answer."`,
        cinemaNotes: `- The FIX section is MANDATORY — every problem reel must end with a solution, not just a problem
- Include at least 1 specific food, habit, or protocol that helps
- "What to do" must feel accessible, not overwhelming`,
        educationNotes: `- THE FIX section must include at least 2 specific, actionable steps
- Do NOT end on the problem alone — solution is required
- TEXT OVERLAY required for the solution steps`,
        rebelNotes: `- Must include THE FIX — contrarian reels that only expose the problem without a solution are incomplete
- Solution must be counter to mainstream advice but scientifically defensible`,
      };

    case "myth-buster":
      return {
        cinemaBeat: `[0-3s] HOOK — State the myth confidently (as if you believed it) then PAUSE
[4-12s] THE MYTH — How widespread this belief is and where it came from
[13-35s] THE SCIENCE — Why the myth is wrong, with PubMed/WHO citation
[36-50s] THE TRUTH — The correct understanding patients should have
[51-60s] CTA — "Share this before one more person believes this myth"`,
        educationStructure: `HOOK (0-3s): State the myth as a shocking claim
THE MYTH (4-18s): How common it is and why people believe it
THE SCIENCE (19-38s): Evidence that debunks it — cite one study
THE TRUTH (39-54s): The correct understanding + what to do instead
CTA (55-60s): "Tag someone who still believes this"`,
        rebelStructure: `CHALLENGE (0-5s): Name the myth and the authority figure perpetuating it
EXPOSE (6-25s): Why this myth spread and who benefits from it
PROOF (26-48s): The research that kills the myth (specific citation)
DARE (49-60s): "Ask your doctor to show you ONE study that supports this. They can't."`,
        cinemaNotes: `- The myth must be named explicitly in the first 5 seconds`,
        educationNotes: `- Never present the myth as fact — frame it as "This is what most people think... here's why they're wrong"`,
        rebelNotes: `- The myth must be attributed to a specific source (mainstream media, generic influencers, outdated guidelines)`,
      };

    case "faq-explainer":
      return {
        cinemaBeat: `[0-3s] HOOK — Ask the exact question patients Google, in their own words
[4-10s] THE COMMON WRONG ANSWER — What most people (and some doctors) incorrectly say
[11-35s] THE RIGHT ANSWER — Detailed explanation with South Indian context
[36-50s] THE NUANCE — The "it depends on..." factor that makes this more useful than a generic answer
[51-60s] CTA — "Save this — you'll need it for your next doctor visit"`,
        educationStructure: `HOOK (0-3s): State the question directly
WRONG ANSWER (4-18s): What generic advice says — and why it's incomplete
RIGHT ANSWER (19-38s): What the evidence actually shows
THE NUANCE (39-54s): How to apply this specifically for South Indian patients
CTA (55-60s): "Save this for reference"`,
        rebelStructure: `CHALLENGE (0-5s): The FAQ itself — asked directly
EXPOSE (6-25s): The generic answer most get — and what's wrong with it
PROOF (26-48s): The more complete, nuanced answer with evidence
DARE (49-60s): "Next time a doctor gives you the generic answer, ask them this follow-up question"`,
        cinemaNotes: `- The question must be phrased exactly as a patient would ask it, not in medical language`,
        educationNotes: `- NUANCE section is important — avoid one-size-fits-all answers`,
        rebelNotes: `- Position the FAQ answer as something general practitioners often get wrong`,
      };

    default:
      // education-drop, contrarian — generic structure
      return null;
  }
}

// ── Stage 4: Cinematic Script ────────────────────────────────────────────────

export function buildCinematicPrompt({ topic, contentType, audience, evidenceSummary, language }) {
  const custom = getContentTypeInstructions(contentType);

  const structure = custom?.cinemaBeat ?? `[0-3s] HOOK — Visual + Audio opening that creates an emotional spike or unanswered question
[4-10s] CONTEXT — Minimum info needed to understand the stakes (no filler)
[11-35s] CONFLICT / FACT ESCALATION — Science delivered through tension or narrative
[36-50s] REFRAME / REVELATION — The insight that changes how the viewer sees the topic
[51-60s] EMOTIONAL CTA — Share-worthy ending with an action prompt`;

  const extraRules = custom?.cinemaNotes ? `\nContent-type rules:\n${custom.cinemaNotes}` : "";

  return `TOPIC: ${topic}
CONTENT TYPE: ${contentType}
AUDIENCE: Tamil/South Indian health-conscious adults, 25-45 age group, Instagram users
EVIDENCE: ${evidenceSummary}
LANGUAGE: ${language}

Write a shoot-ready 60-second Instagram Reel script in CINEMATIC STORY style.

Structure:
${structure}

Format STRICTLY as:
[TIMING] BEAT NAME
AUDIO: "what is said or heard"
VISUAL: what the camera shows
SUBTITLE: [TEXT OVERLAY if needed]

Rules:
- Dialogue must sound like a real person talking, not a written essay
- No bullet points inside the script
- Include exactly 1 science fact with source attribution (e.g. "A 2022 meta-analysis in The Lancet found...")
- CTA must be shareable, not generic ("Follow me" is forbidden — give a reason to share)
- If Tanglish: code-switch naturally, never translate line by line${extraRules}`;
}

// ── Stage 4: Punchy Education Script ────────────────────────────────────────

export function buildEducationPrompt({ topic, contentType, audience, evidenceSummary, language }) {
  const custom = getContentTypeInstructions(contentType);

  const structure = custom?.educationStructure ?? `HOOK (0-3s): A stat, surprising claim, or "Did you know" opener
POINT 1 (4-18s): First insight — teach it fast
POINT 2 (19-33s): Second insight — deeper level
POINT 3 (34-48s): The "wait, really?" moment — the counterintuitive fact
CTA (49-60s): Follow/save with a specific reason`;

  const extraRules = custom?.educationNotes ? `\nContent-type rules:\n${custom.educationNotes}` : "";

  return `TOPIC: ${topic}
CONTENT TYPE: ${contentType}
AUDIENCE: Tamil/South Indian health-conscious adults, 25-45 age group, Instagram users
EVIDENCE: ${evidenceSummary}
LANGUAGE: ${language}

Write a shoot-ready 60-second Instagram Reel script in PUNCHY EDUCATION style.

Structure:
${structure}

Format STRICTLY as:
[TIMING]
SCRIPT: "exact words spoken"
[TEXT OVERLAY: "on-screen text"]

Rules:
- Each section must contain exactly ONE key point (not a list)
- TEXT OVERLAY is required for every major claim (shown as bold text on screen)
- No storytelling elements — this is straight-to-camera teaching mode
- Pace: fast. Short sentences. Punchy delivery.${extraRules}`;
}

// ── Stage 4: Rebel / Contrarian Script ──────────────────────────────────────

export function buildRebelPrompt({ topic, contentType, audience, evidenceSummary, language }) {
  const custom = getContentTypeInstructions(contentType);

  const structure = custom?.rebelStructure ?? `CHALLENGE (0-5s): Directly challenge a mainstream belief — be specific, be bold
EXPOSE (6-25s): Reveal why the mainstream advice is incomplete, misleading, or wrong
PROOF (26-48s): The science that backs up your contrarian position (1 strong source)
DARE (49-60s): A provocative CTA that creates debate — make them want to comment`;

  const extraRules = custom?.rebelNotes ? `\nContent-type rules:\n${custom.rebelNotes}` : "";

  return `TOPIC: ${topic}
CONTENT TYPE: ${contentType}
AUDIENCE: Tamil/South Indian health-conscious adults, 25-45 age group, Instagram users
EVIDENCE: ${evidenceSummary}
LANGUAGE: ${language}

Write a shoot-ready 60-second Instagram Reel script in REBEL REACH / CONTRARIAN style.

Structure:
${structure}

Format STRICTLY as:
[TIMING] BEAT
SCRIPT: "exact words"
[TEXT OVERLAY: optional]
TONE NOTE: [delivery style for this beat]

Rules:
- Opening must name the specific wrong belief (not "many people think..." — be direct)
- Never be reckless — the contrarian position must be scientifically defensible
- Tanglish is recommended for the final section to maximize Tamil audience connection
- The closing CTA must create debate — avoid "follow me for more" endings
- One statement in the script must be genuinely surprising or go against standard advice${extraRules}`;
}

// ── Localization Prompt ──────────────────────────────────────────────────────

export function buildLocalizePrompt(scriptText, targetLanguage) {
  return `ORIGINAL SCRIPT:
${scriptText}

TARGET LANGUAGE: ${targetLanguage}

Convert this health Reel script into ${targetLanguage}.

Rules:
- Do NOT translate line-by-line
- Code-switch naturally the way urban Tamil speakers actually talk (if Tanglish)
- Medical terms stay in English (e.g., "insulin resistance", "cortisol")
- Emotional beats should use the target language naturally
- Sentence structure should feel like natural speech rhythm, not English grammar with words inserted
- CTAs can be fully in target language or mixed — whichever sounds more natural
- Do not change the script structure — only convert the language
- Return the COMPLETE converted script in the same timing/format structure as the input

No preamble, no explanation. Return only the converted script.`;
}

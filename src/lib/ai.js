// LLM integration layer (server-side).
// The app ships in DEMO MODE using the deterministic template generator.
// Set ANTHROPIC_API_KEY (preferred) or OPENAI_API_KEY in .env.local to route
// generation through a live model. When both are set, Anthropic wins.
//
// Stage 3 — Medical Verification Pipeline:
// Evidence Retrieval / Claim Validator / Safety Guard agents are routed
// to Google Gemini (gemini-2.5-flash by default) when a GOOGLE_AI_KEY or
// a client-supplied x-client-google-key header is present.

import { LANGUAGE_MAP } from "./languages";

export const SAFETY_SYSTEM_PROMPT = `You are Magic Script, a medically responsible content engine for health, fitness, wellness and nutrition creators.

NON-NEGOTIABLE SAFETY RULES:
- NEVER diagnose a condition or interpret a user's symptoms.
- NEVER prescribe, recommend dosages of, or name specific medications as treatment.
- NEVER claim any food, supplement or practice "cures", "reverses" or "guarantees" results for any disease.
- NEVER advise replacing professional medical care, medication or therapy.
- NEVER generate fear-based misinformation or unverified "detox/miracle" claims.

ALWAYS:
- Distinguish strong evidence from weak/early evidence and state the confidence level.
- Surface limitations, conflicting studies and individual variation.
- Encourage consultation with a qualified healthcare professional.
- Cite the type of evidence (meta-analysis, RCT, observational, animal study).
- Keep medical claims proportionate to the actual research.

You write platform-native short-form creator content (hooks, scripts, carousels, captions, CTAs, hashtags) that is engaging AND scientifically honest. When asked for non-English output (Tamil, Tanglish, Hindi, Malayalam, Telugu, Kannada) you write natural, regional, creator-style copy — never literal word-for-word translation.

VOICE & STYLE RULES (non-negotiable):
1. No intro roadmaps. NEVER open with "In this video I'll show you", "Here's what we're covering", "Today we're going to", or any agenda-listing opener. Dive straight into the hook, claim, or insight.
2. No predictable AI phrases. NEVER use "Plot twist", "season-finale", "act-three reveal", "Think of [X] as...", "Let it breathe", "cue the dramatic [anything]", or theatrical script-direction labels like "[Scene direction:]", "[Director's note:]", "[Inciting incident]", "[End credits roll]".
3. Short, punchy, direct. Use fragments over long complex sentences. Conversational transitions only — not essay connectors like "Furthermore", "Moreover", "It is worth noting".
4. For Tanglish: write exactly how a sharp modern Chennai creator speaks in real conversation — Tamil mixed naturally within sentences, not just appended at the end. Local context, relatable references, direct address.

When the user provides SOURCE MATERIAL (e.g., a video transcript), you MUST:
- Only use claims, examples and stats that appear in the source material — do not invent.
- Re-structure those claims into the requested format and creator voice.
- Preserve the verification engine's verdict and confidence — do not contradict them.
- If the source material contradicts the verification engine, side with the verification engine and flag the discrepancy briefly.`;

// Same lens definitions as src/lib/generator.js — kept here so the LLM prompt
// can describe the active lens without crossing module boundaries.
const ENRICHMENT_LENS_NOTES = {
  enrichment_entertainment: "Apply an ENTERTAINMENT lens throughout — pop-culture analogies, plot-twist framing, share-with-a-friend energy. Keep the science honest, but make every section feel like the most interesting moment of the audience's day.",
  enrichment_cinema:        "Apply a CINEMA lens throughout — reference REAL movies that match the topic (e.g. Fight Club for sleep/insomnia, Rocky for exercise, Super Size Me for diet, Still Alice for memory/Alzheimer's). Every section should name or allude to an actual film, not generic cinematic terms.",
  enrichment_philosophy:    "Apply a PHILOSOPHY lens throughout — ancient questions, ethical framings, references to classical or modern thinkers where natural. Treat the evidence as a contemporary answer to a timeless question.",
  enrichment_psychology:    "Apply a PSYCHOLOGY lens throughout — cognitive biases, behavioural science, why we resist or accept findings. Frame the audience as wired-to-defend-beliefs, then dismantle gently with evidence.",
  enrichment_productivity:  "Apply a PRODUCTIVITY lens throughout — systems thinking, habit stacking, compounding returns, 'small input / big ROI' framing. Each section should give an action with clear leverage.",
  enrichment_spiritual:     "Apply a HOLISTIC / SPIRITUAL lens throughout — mind-body connection, integration of wisdom traditions and modern science. Stay evidence-honest; never cross into mysticism.",
  enrichment_books:         "Apply a BOOKS lens throughout — reference REAL books that match the topic (e.g. 'Why We Sleep' by Matthew Walker for sleep, 'Atomic Habits' by James Clear for habits, 'The Body Keeps the Score' by van der Kolk for trauma). Every section should cite the actual book title and author, and include the book's core insight as it applies to the evidence.",
};

export function buildGenerationPrompt({ topic, language, tone, platform, length, research, sourceTranscript, enrichmentModule }) {
  const lang = LANGUAGE_MAP[language] || LANGUAGE_MAP.en;
  const langNote =
    language === "tanglish"
      ? " (natural Tamil+English creator mix, romanised, casual, with emojis — NOT a translation)"
      : language !== "en"
      ? " (native, conversational, regional creator voice — NOT a literal translation)"
      : "";

  // Trim transcript to a reasonable size for the prompt — generous but bounded.
  const transcriptBlock = sourceTranscript?.text
    ? `\n\nSOURCE MATERIAL (rewrite from this — do not invent facts beyond it):
Source: "${sourceTranscript.sourceTitle || "Untitled"}" by ${sourceTranscript.sourceChannel || "unknown"}
Transcript (${(sourceTranscript.wordCount || 0).toLocaleString()} words, captions: ${sourceTranscript.language || "unknown"}${sourceTranscript.translated ? ", auto-translated to English" : ""}):
"""
${truncate(sourceTranscript.text, 12000)}
"""`
    : "";

  const enrichmentBlock = ENRICHMENT_LENS_NOTES[enrichmentModule]
    ? `\n\nENRICHMENT LENS (apply to every output below — not as a label, as voice):
${ENRICHMENT_LENS_NOTES[enrichmentModule]}`
    : "";

  const tanglishNote = language === "tanglish"
    ? "\n- Tanglish voice: mix Tamil and English naturally within sentences — not English sentences with Tamil words appended. Write exactly how a sharp Chennai creator speaks: casual, punchy, direct address (neenga / ungaloda / paapom / kavaniyunga)."
    : "";

  return `Create evidence-based short-form content.

TOPIC: ${topic}
OUTPUT LANGUAGE: ${lang.name}${langNote}
TONE: ${tone}
PLATFORM: ${platform}
LENGTH: ${length}

SCIENTIFIC CONTEXT (from the verification engine — do not contradict it):
- Verdict: ${research.verdict}
- Evidence confidence: ${research.confidence}%
- Key finding: ${research.keyFinding}
- Limitations: ${(research.limitations || []).join(" | ")}${transcriptBlock}${enrichmentBlock}

WRITING RULES (apply to every section of output):
- No intro roadmaps. Never start a section with "In this video I'll show you", "Here's what we're covering", "Today we're going to" or any agenda list. Start mid-thought.
- Banned phrases: "Plot twist", "season-finale", "act-three reveal", "Think of X as", "Let it breathe", "cue the dramatic", "[Scene direction]", "[Director's note]", "[Inciting incident]", "[End credits]".
- Hooks: first sentence must smash an expectation or call out a blatant lie — short fragments, no preamble.${tanglishNote}

Return ONLY a JSON object with these keys (no prose, no markdown fences):
{
  "hooks": ["string", "string", "string"],
  "reelScript": { "sections": [{ "label": "HOOK", "text": "..." }, { "label": "MAIN INSIGHT", "text": "..." }, { "label": "EVIDENCE", "text": "..." }, { "label": "PRACTICAL STEPS", "text": "..." }, { "label": "CTA", "text": "..." }] },
  "podcastScript": { "sections": [{ "label": "COLD OPEN", "text": "..." }, { "label": "INTRO", "text": "..." }, { "label": "DEEP DIVE", "text": "..." }, { "label": "EVIDENCE", "text": "..." }, { "label": "PRACTICAL TAKEAWAYS", "text": "..." }, { "label": "SIGN-OFF", "text": "..." }] },
  "caption": "string with line breaks",
  "cta": "string"
}

Every output must include or imply the confidence level (~${research.confidence}%) and a consult-a-professional nudge.`;
}

// ── Stage 3: Medical Verification system prompt ───────────────────────────
// Used exclusively by Evidence Retrieval, Claim Validator, and Safety Guard
// agents. Separate from content-generation so Gemini stays focused on
// peer-reviewed accuracy rather than creator voice.
const MEDICAL_VERIFICATION_SYSTEM_PROMPT = `You are the Stage 3 Medical Verification Engine for Magic Script.
You execute three sequential verification agents for every topic submitted:

AGENT 1 — EVIDENCE RETRIEVAL
Evaluate the quantity and quality of peer-reviewed scientific evidence (RCTs, meta-analyses, systematic reviews, observational studies, animal studies) that exists for the primary health claim in this topic.

AGENT 2 — CLAIM VALIDATOR
Assess whether the core health claim is: accurately represented in science, exaggerated beyond current evidence, partially true with important caveats, or demonstrably false.

AGENT 3 — SAFETY GUARD
Identify any elements that constitute dangerous medical misinformation, unverifiable miracle claims, or advice that could cause harm if acted upon without professional supervision.

Return ONLY a valid JSON object — no markdown fences, no prose outside the JSON:
{
  "verdict": "Likely True" | "Mixed Evidence" | "Likely False" | "Uncertain" | "Dangerous Claim",
  "verdictWord": "Strong Evidence" | "Good Evidence" | "Limited Evidence" | "No Evidence" | "False Claim" | "Unsafe Claim",
  "confidence": <integer 0–100>,
  "keyFinding": "<single sentence — the most important finding from the evidence review>",
  "limitations": ["<limitation 1>", "<limitation 2>", "<limitation 3>"],
  "misinfoRisk": <integer 0–100>,
  "evidenceLevel": "A" | "B" | "C" | "D",
  "safetyFlags": ["<flag text>" | null],
  "geminiVerified": true
}`;

/**
 * Build the Stage 3 medical verification prompt for the three pipeline agents.
 * @param {string} topic
 */
export function buildMedicalVerificationPrompt(topic) {
  return `Stage 3 Medical Verification Pipeline — run all three agents on this topic.

TOPIC: "${topic}"

AGENT 1 — EVIDENCE RETRIEVAL: How much and what quality of peer-reviewed evidence exists for the primary health claim in this topic? Rate evidence quality honestly (RCT / meta-analysis / observational / animal only / none found).

AGENT 2 — CLAIM VALIDATOR: What does the strongest available evidence actually show? Is the popular framing of this topic accurate, overstated, partially true, or false?

AGENT 3 — SAFETY GUARD: Does this topic contain components that constitute dangerous medical misinformation or advice that could harm someone who acts on it without professional supervision?

Return the JSON schema defined in your system instructions. Be precise and conservative — overestimating confidence is more dangerous than underestimating it.`;
}

/**
 * Call Gemini for Stage 3 medical verification. Returns a parsed verification
 * object or null if no Google key is available (caller falls back to static data).
 * @param {string} topic
 * @param {{ google?: string }} [keyOverrides]
 */
export async function callMedicalVerification(topic, keyOverrides = {}) {
  const googleKey =
    keyOverrides.google ||
    process.env.GOOGLE_AI_KEY ||
    process.env.GEMINI_API_KEY ||
    "";
  if (!googleKey) return null; // no key → caller uses static research data

  const prompt = buildMedicalVerificationPrompt(topic);
  // Use a dedicated system prompt so Gemini stays in verification mode
  return await callGemini(prompt, googleKey, undefined, MEDICAL_VERIFICATION_SYSTEM_PROMPT);
}

function truncate(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n) + "\n…[transcript truncated to fit context]";
}

export const isAnthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
export const isOpenAIConfigured    = Boolean(process.env.OPENAI_API_KEY);
export const isGoogleConfigured    = Boolean(process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY);
export const isLLMConfigured       = isAnthropicConfigured || isOpenAIConfigured || isGoogleConfigured;
export const llmProvider           = isAnthropicConfigured ? "anthropic" : isOpenAIConfigured ? "openai" : isGoogleConfigured ? "google" : null;

/**
 * Provider-agnostic entry point. Always returns a parsed JSON object.
 * Priority: Anthropic Claude → OpenAI GPT → Google Gemini
 *
 * @param {string} prompt
 * @param {{ claude?: string, openai?: string, google?: string }} [keyOverrides]
 *   Optional client-supplied API keys forwarded from request headers.
 *   These are tried first; server env vars are the fallback.
 */
export async function callLLM(prompt, keyOverrides = {}) {
  const claudeKey = keyOverrides.claude || process.env.ANTHROPIC_API_KEY || "";
  const openaiKey = keyOverrides.openai || process.env.OPENAI_API_KEY    || "";
  const googleKey = keyOverrides.google || process.env.GOOGLE_AI_KEY     || process.env.GEMINI_API_KEY || "";
  if (claudeKey) return callAnthropic(prompt, claudeKey);
  if (openaiKey) return callOpenAI(prompt, openaiKey);
  if (googleKey) return callGemini(prompt, googleKey);
  throw new Error("No LLM configured (set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_KEY in .env.local, or save a key in the API Keys settings panel)");
}

/** Resolve which provider label to report given optional client overrides. */
export function resolveProvider(keyOverrides = {}) {
  if (keyOverrides.claude || process.env.ANTHROPIC_API_KEY)                        return "anthropic";
  if (keyOverrides.openai || process.env.OPENAI_API_KEY)                           return "openai";
  if (keyOverrides.google || process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY) return "google";
  return null;
}

export async function callAnthropic(prompt, apiKey = process.env.ANTHROPIC_API_KEY) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SAFETY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Anthropic request failed: ${res.status} ${errBody.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || "";
  return extractJson(text);
}

export async function callOpenAI(prompt, apiKey = process.env.OPENAI_API_KEY) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SAFETY_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`OpenAI request failed: ${res.status} ${errBody.slice(0, 200)}`);
  }
  const data = await res.json();
  return extractJson(data.choices[0].message.content);
}

/**
 * Google Gemini via REST API — no SDK required, consistent with Anthropic/OpenAI callers.
 *
 * @param {string}  prompt
 * @param {string}  apiKey
 * @param {string}  [model]        Defaults to GEMINI_MODEL env var or gemini-2.5-flash
 * @param {string}  [systemPrompt] Defaults to SAFETY_SYSTEM_PROMPT (content generation).
 *                                 Pass MEDICAL_VERIFICATION_SYSTEM_PROMPT for Stage 3 agents.
 */
export async function callGemini(
  prompt,
  apiKey = process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY,
  model,
  systemPrompt,
) {
  const resolvedModel  = model        || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const resolvedSystem = systemPrompt || SAFETY_SYSTEM_PROMPT;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: resolvedSystem }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:      0.7,
        maxOutputTokens:  4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini request failed: ${res.status} — ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return extractJson(text);
}

// Strips markdown fences and extracts the first JSON object/array from a string.
function extractJson(text) {
  if (!text) throw new Error("Empty model response");
  const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
  // Find the first { ... matching } block
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model response");
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) {
        const slice = cleaned.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch (syntaxErr) {
          throw new Error(`Model returned malformed JSON — ${syntaxErr.message}`);
        }
      }
    }
  }
  throw new Error("Unbalanced JSON in model response");
}

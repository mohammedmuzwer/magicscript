import { NextResponse } from "next/server";
import { generateMockIdeaMatrix } from "@/lib/reels/mockIdeaMatrix";
import { reelsLlmCall } from "@/lib/reels/llm";

const SYSTEM_PROMPT = `You are the Idea Matrix Generator for a medical Reels Content Agent targeting a South Indian audience. Your objective is to expand a single keyword or topic into 25 high-converting, medically grounded video concepts.`;

function buildPrompt(keyword) {
  return `USER INPUT: ${keyword}

TASK:
Generate exactly 25 short, engaging Reel topics based on the user input. You must divide them strictly into 5 categories:
1. Myth Buster
2. Problem Reveal
3. Education Drop
4. FAQ Explainer
5. Contrarian

For EVERY idea, you must generate a \`medical_evidence_score\` (0-100). This score represents how strongly established medical science (PubMed, WHO, standard clinical practice) supports the core premise of the video.
- 90-100: Undisputed scientific consensus.
- 70-89: Strong evidence, generally accepted.
- 50-69: Emerging science or mixed consensus.
- < 50: Fringe theory (Avoid unless debunking).

Also include a \`score_rationale\` (max 5 words) explaining the source of the score (e.g., "Meta-analysis confirmed", "Emerging clinical trials", "Basic endocrinology").

OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not include markdown formatting, preamble, or postscript. Use the exact structure below:

{
  "myth_buster": [
    {
      "topic": "Short idea text (max 8 words)",
      "medical_evidence_score": 85,
      "score_rationale": "Established clinical consensus"
    }
  ],
  "problem_reveal": [ ...5 items... ],
  "education_drop": [ ...5 items... ],
  "faq_explainer": [ ...5 items... ],
  "contrarian": [ ...5 items... ]
}`;
}

async function callOpenAI(prompt, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return text ? JSON.parse(text) : null;
}

async function callAnthropic(prompt, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();
  if (!text) return null;
  // Strip any markdown code fences if present
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean);
}

export async function POST(req) {
  try {
    const { keyword } = await req.json();
    if (!keyword?.trim()) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const prompt = buildPrompt(keyword.trim());
    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        prompt,
      temperature: 0.85,
      maxTokens:   2000,
      isJson:      true,
    });

    return NextResponse.json({
      matrix: parsed ?? generateMockIdeaMatrix(keyword.trim()),
      mode:   parsed ? source : "demo",
      ...(fallback_from ? { fallback_from, fallback_reason } : {}),
    });
  } catch (err) {
    console.error("[reels/idea-matrix]", err);
    return NextResponse.json({ error: "Idea matrix generation failed." }, { status: 500 });
  }
}

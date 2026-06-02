import { NextResponse } from "next/server";
import { generateMockScripts } from "@/lib/reels/mockScripts";
import {
  SYSTEM_PROMPT,
  buildCinematicPrompt,
  buildEducationPrompt,
  buildRebelPrompt,
} from "@/lib/reels/prompts";
import { reelsLlmCall } from "@/lib/reels/llm";

export async function POST(req) {
  try {
    const { topic, contentType, bucketId, language, evidenceSummary, medCheck } = await req.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const params = {
      topic:           topic.trim(),
      contentType:     contentType || "education-drop",
      audience:        "Tamil/South Indian health-conscious adults, 25-45 age group",
      evidenceSummary: evidenceSummary || `Evidence score: ${medCheck?.evidence_score ?? 75}/100`,
      language:        language || "english",
    };

    // Run all 3 scripts in parallel — each through the shared LLM helper
    // (current Claude Sonnet 4.6 or Gemini 2.5 Flash, with auto-fallback)
    const runOne = (prompt) =>
      reelsLlmCall(req, {
        system:      SYSTEM_PROMPT,
        user:        prompt,
        temperature: 0.85,
        maxTokens:   1500,
        isJson:      false,   // script output is prose
      }).catch(() => ({ parsed: null, source: "demo" }));

    const [cinematic, education, rebel] = await Promise.all([
      runOne(buildCinematicPrompt(params)),
      runOne(buildEducationPrompt(params)),
      runOne(buildRebelPrompt(params)),
    ]);

    const mock = generateMockScripts(topic, contentType, bucketId);
    const allLive = cinematic.parsed && education.parsed && rebel.parsed;

    // First non-demo source wins as the response mode (gemini or anthropic)
    const liveSource = [cinematic, education, rebel].find((r) => r.parsed)?.source ?? null;

    return NextResponse.json({
      scripts: {
        cinematic: cinematic.parsed ?? mock.cinematic,
        education: education.parsed ?? mock.education,
        rebel:     rebel.parsed     ?? mock.rebel,
      },
      mode: allLive ? liveSource : (liveSource ? "partial" : "demo"),
      ...(cinematic.fallback_from || education.fallback_from || rebel.fallback_from
        ? { fallback_from: "gemini-overloaded" }
        : {}),
    });
  } catch (err) {
    console.error("[reels/generate]", err.message);
    return NextResponse.json({ error: "Script generation failed." }, { status: 500 });
  }
}

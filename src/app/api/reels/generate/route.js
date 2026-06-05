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

    // Generate Education script only — clean straight-to-camera format.
    // All Doctor Farmer content is education-purpose; single script = faster + cheaper.
    const education = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        buildEducationPrompt(params),
      temperature: 0.85,
      maxTokens:   1500,
      isJson:      false,
    }).catch(() => ({ parsed: null, source: "demo" }));

    const mock = generateMockScripts(topic, contentType, bucketId);

    return NextResponse.json({
      scripts: {
        education: education.parsed ?? mock.education,
        // Keep keys for backward compatibility with saved history
        cinematic: education.parsed ?? mock.education,
        rebel:     education.parsed ?? mock.education,
      },
      mode: education.parsed ? education.source : "demo",
      ...(education.fallback_from ? { fallback_from: "gemini-overloaded" } : {}),
    });
  } catch (err) {
    console.error("[reels/generate]", err.message);
    return NextResponse.json({ error: "Script generation failed." }, { status: 500 });
  }
}

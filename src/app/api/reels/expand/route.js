import { NextResponse } from "next/server";
import { generateMockExpansion } from "@/lib/reels/mockScripts";
import { buildExpandPrompt, SYSTEM_PROMPT } from "@/lib/reels/prompts";
import { reelsLlmCall } from "@/lib/reels/llm";

export async function POST(req) {
  try {
    const { word } = await req.json();
    if (!word?.trim()) {
      return NextResponse.json({ error: "word is required" }, { status: 400 });
    }

    const prompt = buildExpandPrompt(word.trim());
    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        prompt,
      temperature: 0.8,    // creative — different angles
      maxTokens:   800,
      isJson:      true,
    });

    // parsed shape may be { angles: [...] } or just the angles array
    const angles = parsed?.angles ?? parsed ?? generateMockExpansion(word.trim());

    return NextResponse.json({
      angles,
      mode: parsed ? source : "demo",
      ...(fallback_from ? { fallback_from, fallback_reason } : {}),
    });
  } catch (err) {
    console.error("[reels/expand]", err.message);
    try {
      const { word } = await req.json();
      return NextResponse.json({
        angles: generateMockExpansion(word ?? "topic"),
        mode: "demo",
        error: err.message,
      });
    } catch {
      return NextResponse.json({ error: "Expansion failed." }, { status: 500 });
    }
  }
}

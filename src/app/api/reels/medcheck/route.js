import { NextResponse } from "next/server";
import { generateMockMedCheck } from "@/lib/reels/mockScripts";
import { buildMedCheckPrompt, SYSTEM_PROMPT } from "@/lib/reels/prompts";
import { reelsLlmCall } from "@/lib/reels/llm";

export async function POST(req) {
  try {
    const { topic, contentType } = await req.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const prompt = buildMedCheckPrompt(topic.trim(), contentType || "education");
    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        prompt,
      temperature: 0.2,   // factual / evidence work
      maxTokens:   1200,
      isJson:      true,
    });

    return NextResponse.json({
      ...(parsed ?? generateMockMedCheck(topic)),
      mode: parsed ? source : "demo",
      ...(fallback_from ? { fallback_from, fallback_reason } : {}),
    });
  } catch (err) {
    console.error("[reels/medcheck]", err.message);
    // Graceful demo fallback so the pipeline never gets stuck
    try {
      const { topic } = await req.json();
      return NextResponse.json({ ...generateMockMedCheck(topic ?? "topic"), mode: "demo", error: err.message });
    } catch {
      return NextResponse.json({ error: "Medical check failed." }, { status: 500 });
    }
  }
}

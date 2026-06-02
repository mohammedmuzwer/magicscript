import { NextResponse } from "next/server";
import { buildLocalizePrompt, SYSTEM_PROMPT } from "@/lib/reels/prompts";
import { reelsLlmCall } from "@/lib/reels/llm";

export async function POST(req) {
  try {
    const { script, targetLanguage } = await req.json();
    if (!script?.trim() || !targetLanguage?.trim()) {
      return NextResponse.json({ error: "script and targetLanguage are required" }, { status: 400 });
    }

    const prompt = buildLocalizePrompt(script.trim(), targetLanguage.trim());
    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        prompt,
      temperature: 0.7,
      maxTokens:   1400,
      isJson:      false,  // localized script is prose, not JSON
    });

    if (parsed && typeof parsed === "string") {
      return NextResponse.json({
        localized: parsed,
        mode:      source,
        ...(fallback_from ? { fallback_from, fallback_reason } : {}),
      });
    }

    // Demo / fallback
    const localized = `[Localized to ${targetLanguage} — Demo Mode]\n\n` + script
      .replace(/AUDIO:/g, `AUDIO [${targetLanguage}]:`)
      .replace(/SCRIPT:/g, `SCRIPT [${targetLanguage}]:`);
    return NextResponse.json({ localized, mode: "demo" });
  } catch (err) {
    console.error("[reels/localize]", err.message);
    return NextResponse.json({ error: "Localization failed." }, { status: 500 });
  }
}

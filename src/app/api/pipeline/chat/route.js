import { NextResponse } from "next/server";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline — Stage Chat ──────────────────────────────────────
// Answers questions, explains reasoning, and suggests tweaks for any stage.

function buildChatSystem(currentStage, stageName, topic) {
  return `You are the Doctor Farmer MagicScript Pipeline assistant embedded in Stage ${currentStage} (${stageName}).

CONTEXT:
- Podcast topic locked: "${topic ?? "Not yet selected"}"
- Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder
- Audience: 45+ Type 2 diabetics and South Indian families managing diabetes
- Pipeline purpose: Produce evidence-based Tamil Nadu podcast episodes

YOUR ROLE:
- Explain reasoning behind any stage output (why a topic scored high, why a claim is Yellow, etc.)
- Suggest specific tweaks to angle, pillars, questions, research grades, or script sections
- Answer follow-up research questions grounded in the stage data provided
- Keep every answer concise (2–4 sentences max) and actionable
- Never invent facts — acknowledge when something is uncertain

TONE: Warm, direct, doctor-authority voice. No jargon. No bullet-point lists unless asked.`;
}

function buildChatPrompt(currentStage, stageData, userMessage) {
  const stageContext = stageData ? JSON.stringify(stageData, null, 2).slice(0, 4000) : "No stage data available yet.";
  return `CURRENT STAGE DATA (Stage ${currentStage}):
${stageContext}

USER QUESTION / REQUEST:
${userMessage}

Respond in plain text (no JSON, no markdown headers). Be concise and specific to the data above.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    currentStage = 1,
    stageName    = "Topic Discovery",
    stageData    = null,
    userMessage  = "",
    topic        = null,
  } = body;

  if (!userMessage.trim()) {
    return NextResponse.json({ reply: "Please type a message.", mode: "error" });
  }

  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);   // honours "claude-internal"

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (!geminiKey && !anthropicKey) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({
      reply: `[Demo] For Stage ${currentStage}, I would analyse the locked data and respond to: "${userMessage}". In live mode with a Gemini key, I give real answers based on the actual stage output.`,
      mode: "demo",
    });
  }

  const systemPrompt = buildChatSystem(currentStage, stageName, topic);
  const userPrompt   = buildChatPrompt(currentStage, stageData, userMessage);

  // Helper — detects Gemini overload / rate-limit so we can auto-fall back to Claude
  const isGeminiOverload = (err) => {
    const m = (err?.message || "").toLowerCase();
    return (
      m.includes("high demand") ||
      m.includes("overloaded")   ||
      m.includes("503")          ||
      m.includes("429")          ||
      m.includes("rate limit")   ||
      m.includes("quota")        ||
      m.includes("unavailable")
    );
  };

  // Tiny inline Gemini caller so we can isolate Gemini failures from Claude
  const callGeminiChat = async () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS.flash}:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 512,
          thinkingConfig:  { thinkingBudget: 0 },
        },
      }),
    });
    const data  = await res.json();
    if (data.error) throw new Error(data.error.message);
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text  = parts.find((p) => !p.thought && p.text)?.text ?? "";
    return text.trim();
  };

  try {
    if (geminiKey) {
      try {
        const reply = await callGeminiChat();
        return NextResponse.json({ reply, mode: "gemini" });
      } catch (gErr) {
        // ── AUTO-FALLBACK Gemini → Claude when overloaded ──────────────────
        if (isGeminiOverload(gErr) && anthropicKey) {
          console.warn("[chat] Gemini overloaded — falling back to Claude:", gErr.message);
          const reply = await callClaude(anthropicKey, systemPrompt, userPrompt, false, 512);
          return NextResponse.json({
            reply,
            mode: modeLabel(req),
            fallback_from: "gemini-overloaded",
          });
        }
        throw gErr;
      }
    }

    if (anthropicKey) {
      // callClaude with isJson=false returns the raw text string directly
      const reply = await callClaude(anthropicKey, systemPrompt, userPrompt, false, 512);
      return NextResponse.json({ reply, mode: modeLabel(req) });
    }
  } catch (e) {
    console.error("[chat] error:", e.message);
    return NextResponse.json({ reply: `Error: ${e.message}`, mode: "error" });
  }

  return NextResponse.json({ reply: "No API key configured.", mode: "error" });
}

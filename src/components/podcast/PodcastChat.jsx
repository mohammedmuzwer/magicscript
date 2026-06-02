"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageSquare, Bot, User } from "lucide-react";
import { PODCAST_STAGES } from "@/lib/podcast/stages";
import { getModelMeta } from "@/lib/podcast/model-labels";
import { getModelPref } from "@/lib/podcast/model-preference";

// ─── Quick-action suggestion pools ──────────────────────────────────────────
// Each stage has 8–10 distinct questions. The UI shows 2 at a time and rotates
// in fresh ones every time the user clicks one (so the same prompt never
// re-appears). When all are exhausted, the pool resets and rotation restarts.
const STAGE_SUGGESTIONS = {
  1: [
    "Why did this topic score high?",
    "Find a sharper angle",
    "Show the reframe option",
    "What cultural anchor would work better?",
    "Which topic has the highest viral potential?",
    "Suggest a more contrarian angle",
    "What demographic is being missed?",
    "Compare top 2 topics — which is stronger?",
  ],
  2: [
    "Why was this angle chosen?",
    "Make the promise more emotional",
    "Suggest 3 alternative frames",
    "Tighten the authority statement",
    "What's the strongest safety flag here?",
    "Reframe the audience commitment",
    "Make this angle more Tamil Nadu specific",
    "Suggest a sharper one-line hook",
  ],
  3: [
    "Why is this question in Section 3?",
    "Add more myth questions",
    "Focus on questions women ask",
    "Add a medication-safety question",
    "Suggest a question about religious fasting",
    "Which question has the highest social demand?",
    "Add a 'what about my parents' question",
    "Find a Tamil-specific cultural question",
  ],
  4: [
    "Why is this claim graded Yellow?",
    "Find Indian-specific research for this",
    "Check if newer 2024 studies exist",
    "Find a stronger PubMed citation",
    "What ICMR guideline applies here?",
    "Find a Blue clinical observation that fits",
    "Why isn't this Green-graded?",
    "Suggest the strongest myth-buster from this batch",
  ],
  5: [
    "Why is this question placed here?",
    "Move Science before Discovery",
    "Explain the Red claim decision",
    "What's the optimal demo trigger location?",
    "Should this Red claim become a myth instead?",
    "Where should the Blue hero sit?",
    "Suggest a Rapid Fire reorder",
    "Why is this Q1 the warm-up question?",
  ],
  6: [
    "Shorten this answer to 45 seconds",
    "Make the opening more dramatic",
    "Add a relatable patient story",
    "Tighten Dr. Prabhakar's Yellow hedge",
    "Soften the medication warning",
    "Add more Tamil emotional warmth",
    "Make this answer more visual",
    "Cut the bullet-list feel from this answer",
  ],
  7: [
    "Suggest a different superfood",
    "Add a second CTA point",
    "Change the demo to an animation",
    "Suggest a stronger lead magnet",
    "Move the signature segment earlier",
    "Find a more visual demo prop",
    "Suggest a Pongal-themed superfood",
    "What CTA wording would convert higher?",
  ],
  8: [
    "Add re-hook beat after minute 15",
    "Rewrite the cold open",
    "Adjust Rapid Fire pacing",
    "Add a [B-ROLL] cue for the Science section",
    "Move the CTA-1 block 2 minutes earlier",
    "Strengthen the close & teaser",
    "Add a [GRAPHIC] cue for the key stat",
    "Tighten the run-sheet runtime",
  ],
  9: [
    "Which reel has highest virality?",
    "Suggest hook variations for Reel #1",
    "Find myth-buster reel moments",
    "Suggest 2 more Demo-category reels",
    "Which reel is best for the Save metric?",
    "Find a Problem-Solution reel I missed",
    "Tighten editing ideas for Reel #3",
    "Suggest a hook for over-50 diabetics",
  ],
  10: [
    "This line sounds unnatural in Tamil",
    "Keep this medical term in English",
    "Review emotional tone of opening",
    "Make the Rapid Fire warmer in Tanglish",
    "Add a 'Parunga' opener",
    "Suggest a stronger Tanglish hook for Reel #1",
    "Soften the medication caution in Tanglish",
    "Check if the cultural reference lands",
  ],
};

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {!isUser && (
        <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-cyan/20 grid place-items-center">
          <Bot size={12} className="text-cyan" />
        </div>
      )}
      {isUser && (
        <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-[rgb(var(--border))] grid place-items-center">
          <User size={12} className="text-faint" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "bg-cyan/15 text-[rgb(var(--text))]"
            : "bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-soft"
        }`}
      >
        {msg.content}
        {msg.fallback_from === "gemini-overloaded" && (
          <span className="block mt-1 text-[9px] text-amber-400 italic">
            ⚠ Gemini overloaded — answered by Claude
          </span>
        )}
        {msg.mode && msg.mode !== "gemini" && msg.mode !== "openai" && msg.mode !== "anthropic" && msg.mode !== "anthropic-internal" && msg.mode !== "error" && (
          <span className="block mt-1 text-[9px] text-amber-400 opacity-60">demo response</span>
        )}
        {msg.mode === "error" && (
          <span className="block mt-1 text-[9px] text-rose-400">⚠ error</span>
        )}
        {(msg.mode === "gemini" || msg.mode === "anthropic" || msg.mode === "anthropic-internal") && (() => {
          const meta = getModelMeta(msg.mode);
          return (
            <span className={`block mt-1 text-[9px] font-semibold opacity-50`}
              style={{ color: msg.mode === "anthropic-internal" ? "#e879f9" : msg.mode === "anthropic" ? "#a78bfa" : "#22d3ee" }}>
              {meta.label}
            </span>
          );
        })()}
      </div>
    </motion.div>
  );
}

export default function PodcastChat({ currentStage, stageData, demoMode }) {
  const stage    = PODCAST_STAGES.find((s) => s.id === currentStage);
  const fullPool = STAGE_SUGGESTIONS[currentStage] ?? [];

  const topic = stageData?.[1]?.topic?.title ?? null;

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [thinking,    setThinking]    = useState(false);
  const [activePref,  setActivePref]  = useState("gemini"); // tracks per-stage model toggle
  // ── Rotating Quick Actions ───────────────────────────────────────────────
  // Tracks which suggestions have been clicked. When all are exhausted, resets.
  // Keyed by stage id so each stage has its own rotation state.
  const [usedSuggestions, setUsedSuggestions] = useState({}); // { [stageId]: Set<string> }
  const bottomRef = useRef(null);

  // Reset used set when we exhaust the pool
  const usedSet = usedSuggestions[currentStage] ?? new Set();
  const remainingPool = fullPool.filter((s) => !usedSet.has(s));
  // If all used → reset (start fresh rotation)
  const visiblePool = remainingPool.length > 0 ? remainingPool : fullPool;
  const suggestions = visiblePool.slice(0, 2);

  function markSuggestionUsed(text) {
    setUsedSuggestions((prev) => {
      const cur = new Set(prev[currentStage] ?? []);
      cur.add(text);
      // If pool now exhausted, reset
      if (cur.size >= fullPool.length) cur.clear();
      return { ...prev, [currentStage]: cur };
    });
  }

  // Sync badge to stage model preference — on mount, on stage change, and on toggle
  useEffect(() => {
    setActivePref(getModelPref(currentStage));
  }, [currentStage]);

  useEffect(() => {
    function onPrefChange(e) {
      if (e.detail?.stageNum === currentStage) {
        setActivePref(e.detail.model);
      }
    }
    window.addEventListener("modelPrefChange", onPrefChange);
    return () => window.removeEventListener("modelPrefChange", onPrefChange);
  }, [currentStage]);

  // Reset chat when stage changes
  useEffect(() => {
    setMessages([{
      id:      "init-" + currentStage,
      role:    "assistant",
      content: `Stage ${currentStage} — ${stage?.label ?? ""}. Ask me to explain reasoning, tweak output, or regenerate with new instructions. Use the suggestions below to get started.`,
    }]);
    setInput("");
  }, [currentStage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function handleSend(text) {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now() + "u", role: "user", content: msg }]);
    setThinking(true);

    try {
      const gk = demoMode ? null : (typeof window !== "undefined" ? localStorage.getItem("V_KEY_GOOGLE") : null);
      const ak = demoMode ? null : (typeof window !== "undefined" ? localStorage.getItem("V_KEY_CLAUDE") : null);

      const headers = { "Content-Type": "application/json" };
      if (gk) headers["x-client-gemini-key"]    = gk;
      if (ak) headers["x-client-anthropic-key"] = ak;

      // Send only the current stage's data + the topic for context (keep payload small)
      const currentStageOutput = stageData?.[currentStage] ?? null;
      const prevStageOutput    = currentStage > 1 ? stageData?.[currentStage - 1] ?? null : null;

      const res = await fetch("/api/pipeline/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          currentStage,
          stageName:  stage?.label ?? "",
          topic,
          stageData:  { current: currentStageOutput, previous: prevStageOutput },
          userMessage: msg,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, {
        id:            Date.now() + "a",
        role:          "assistant",
        content:       data.reply ?? "Sorry, I didn't get a response. Please try again.",
        mode:          data.mode,
        fallback_from: data.fallback_from ?? null,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id:      Date.now() + "err",
        role:    "assistant",
        content: "Network error — could not reach the chat API. Please try again.",
        mode:    "error",
      }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="hidden w-[272px] shrink-0 flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] xl:flex">

      {/* Header */}
      <div className="border-b border-[rgb(var(--border))] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-cyan" />
          <p className="text-sm font-bold">Stage Chat</p>
          {demoMode === false && (() => {
            // activePref is "gemini" or "claude" — map to the mode keys used by getModelMeta
            const modeKey = activePref === "claude" ? "anthropic" : "gemini";
            const meta = getModelMeta(modeKey);
            return (
              <span className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.badge}`}>
                <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            );
          })()}
        </div>
        <p className="text-[11px] text-faint mt-0.5">Ask · Tweak · Regenerate</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex gap-2">
            <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-cyan/20 grid place-items-center">
              <Loader2 size={12} className="text-cyan animate-spin" />
            </div>
            <div className="rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 text-xs text-faint">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — rotate after each click so the same prompt never repeats */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Quick Actions</p>
          <span className="text-[9px] text-faint/60">
            {fullPool.length - usedSet.size} of {fullPool.length} fresh
          </span>
        </div>
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <motion.button
                key={s}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                onClick={() => {
                  markSuggestionUsed(s);
                  handleSend(s);
                }}
                disabled={thinking}
                className="w-full rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-left text-[11px] text-soft hover:border-cyan/30 hover:bg-cyan/5 transition disabled:opacity-40"
              >
                {s}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[rgb(var(--border))] p-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask, tweak, or regenerate…"
            className="flex-1 resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-xs text-[rgb(var(--text))] placeholder-faint focus:border-cyan/40 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || thinking}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan text-navy-950 transition hover:brightness-110 disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-faint">Answers use the actual stage output as context.</p>
      </div>
    </div>
  );
}

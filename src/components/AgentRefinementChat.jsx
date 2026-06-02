"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

export default function AgentRefinementChat({
  agentName,
  onSendMessage,
  chatHistory = [],
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatHistory.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hasHistory = chatHistory.length > 0;

  return (
    <div className="mt-4 rounded-xl border border-white/[0.05] bg-[#13161A]">
      {hasHistory && (
        <div
          ref={scrollRef}
          className="max-h-[200px] overflow-y-auto p-3 space-y-2"
        >
          {chatHistory.map((m, i) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={i}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-snug ${
                    isUser
                      ? "bg-[#007AFF] text-white"
                      : "bg-white/[0.05] text-white/90"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasHistory && <div className="h-px bg-white/[0.05]" />}

      <div className="flex items-center gap-2.5 px-3 py-2">
        <MessageCircle size={16} className="text-white/40 shrink-0" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Tell ${agentName} to modify or re-search this step...`}
          className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          className="grid h-8 w-8 place-items-center rounded-full text-[#34C759] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send refinement"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}

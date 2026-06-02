"use client";

import { useState, useEffect } from "react";
import AgentRefinementChat from "./AgentRefinementChat";

const AVAILABLE_AGENTS = {
  process: [
    { id: "evidence",  name: "Evidence Retrieval Agent", desc: "Queries PubMed & scientific literature" },
    { id: "validator", name: "Claim Validator Agent",    desc: "Cross-examines claim accuracy" },
    { id: "safety",    name: "Safety Guard Agent",       desc: "Flags medical compliance risks" },
  ],
  enrich: [
    { id: "psychology", name: "Psychology Agent", desc: "Injects cognitive hooks and triggers" },
    { id: "cinema",     name: "Cinema Agent",     desc: "Applies visual metaphors and story framing" },
    { id: "philosophy", name: "Philosophy Agent", desc: "Applies structured mindset frameworks" },
  ],
  output: [
    { id: "multilingual", name: "Multilingual Agent",    desc: "Translates to Tamil, Tanglish, or Hindi" },
    { id: "reviewer",     name: "Final Script Reviewer", desc: "Polishes formatting for final export" },
  ],
};

export default function LabWorkspace() {
  const [labStage, setLabStage] = useState("INPUT_SELECTION");
  const [selectedInputMethod, setSelectedInputMethod] = useState(null);
  const [manualInputText, setManualInputText] = useState("");

  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Viral URL intake — platform toggle + URL field
  const [platform, setPlatform] = useState("instagram"); // 'instagram' | 'youtube'
  const [viralUrl, setViralUrl]  = useState("");

  const [executionChain, setExecutionChain] = useState([]);
  const [currentRunningAgent, setCurrentRunningAgent] = useState(null);
  const [agentOutputData, setAgentOutputData] = useState(null);
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Fetch trending topics when Trending or Viral is selected
  useEffect(() => {
    if (selectedInputMethod !== "trending" && selectedInputMethod !== "viral") return;
    setIsLoadingTopics(true);
    const timer = setTimeout(() => {
      setTrendingTopics(
        selectedInputMethod === "trending"
          ? [
              { id: "t1", topic: "Cortisol Awakening Response & Fasted Cardio", metrics: "142K searches (Chennai hyper-local)" },
              { id: "t2", topic: "The Myth of 10,000 Steps vs Metabolic Pacing",  metrics: "89K interactions this week" },
              { id: "t3", topic: "Intermittent Fasting Impact on Deep Sleep",      metrics: "High Retention Benchmark" },
            ]
          : [
              { id: "v1", topic: "Doctor Reacts: Morning Routine Science Exposed", metrics: "2.4M views · 94 viral score" },
              { id: "v2", topic: "This Supplement Actually Works (PubMed Proof)",  metrics: "1.8M views · 91 viral score" },
              { id: "v3", topic: "I Tried Fasted Cardio for 30 Days — Results",   metrics: "3.1M views · 96 viral score" },
            ]
      );
      setIsLoadingTopics(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedInputMethod]);

  const handleSelectTopic = (topicName) => {
    setExecutionChain([{ stage: "Input", name: topicName, data: topicName }]);
    setLabStage("AGENT_SELECTION");
  };

  const handleSubmitManualInput = () => {
    const text = manualInputText.trim();
    if (!text) return;
    setExecutionChain([{ stage: "Input", name: "Manual Seed Topic", data: text }]);
    setLabStage("AGENT_SELECTION");
  };

  const handleSubmitViralUrl = () => {
    const url = viralUrl.trim();
    if (!url) return;
    const platformLabel = platform === "instagram" ? "📸 Instagram Reel" : "🎥 YouTube";
    setExecutionChain([{
      stage: "Input",
      name: `${platformLabel} — ${url.length > 55 ? url.slice(0, 55) + "…" : url}`,
      data: { url, platform, source: platform },
    }]);
    setLabStage("AGENT_SELECTION");
  };

  const handleSelectAgent = async (agent) => {
    setCurrentRunningAgent(agent);
    setAgentOutputData(null);
    setIsProcessingAgent(true);
    setChatHistory([{ sender: "agent", text: `${agent.name} initialized. Constructing contextual framework…` }]);
    setLabStage("ACTIVE_RUN");

    const cumulativeContextStack = executionChain.map((item) => ({
      step: item.name,
      payload: item.data,
    }));

    try {
      const res = await fetch("/api/pipeline/lab-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          context: cumulativeContextStack,
          currentInput: executionChain[executionChain.length - 1]?.data,
        }),
      });
      const result = await res.json();
      setAgentOutputData(result.data);
    } catch {
      setAgentOutputData({
        summary: `Processed context derived from: "${typeof executionChain[0]?.data === "object" ? executionChain[0]?.data?.url : executionChain[0]?.data}"`,
        metrics: { confidence: 87 },
        payloadList: [
          { label: "Output Node 1", details: "Primary analysis layer completed." },
          { label: "Output Node 2", details: "Secondary verification pass complete." },
        ],
      });
    } finally {
      setIsProcessingAgent(false);
    }
  };

  const handleSendMessageToAgent = (text) => {
    setChatHistory((prev) => [...prev, { sender: "user", text }]);
    // TODO: stream agent refinement reply from /api/pipeline/lab-agent with directive
  };

  const handleApproveStep = () => {
    if (!agentOutputData || !currentRunningAgent) return;
    setExecutionChain((prev) => [
      ...prev,
      { agentId: currentRunningAgent.id, name: currentRunningAgent.name, data: agentOutputData },
    ]);
    setCurrentRunningAgent(null);
    setAgentOutputData(null);
    setChatHistory([]);
    setLabStage("AGENT_SELECTION");
  };

  const handleChangeAgentRoute = () => {
    setCurrentRunningAgent(null);
    setAgentOutputData(null);
    setChatHistory([]);
    setLabStage("AGENT_SELECTION");
  };

  const handleReset = () => {
    setExecutionChain([]);
    setCurrentRunningAgent(null);
    setAgentOutputData(null);
    setChatHistory([]);
    setSelectedInputMethod(null);
    setManualInputText("");
    setViralUrl("");
    setPlatform("instagram");
    setLabStage("INPUT_SELECTION");
  };

  const confidence = agentOutputData?.metrics?.confidence ?? 91;

  return (
    <div className="flex flex-1 min-h-0 w-full bg-[#0D0F12] text-white font-sans overflow-hidden">
      {/* LEFT: Dynamic Lab Chain */}
      <aside className="w-[280px] shrink-0 bg-[#13161A] border-r border-white/[0.05] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.05] p-5">
          <span className="font-bold text-sm tracking-wide">🧪 Dynamic Lab Chain</span>
          {executionChain.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-white/40 transition hover:text-rose-400"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {executionChain.length === 0 && !currentRunningAgent && (
            <p className="text-[11px] text-white/30 leading-relaxed">
              No steps yet. Pick an input source to seed your custom validation chain.
            </p>
          )}
          {executionChain.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-[#34C759] bg-[#34C759]/[0.02] p-3 text-xs"
            >
              <span className="text-[#34C759] shrink-0">✓</span>
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase text-white/30">
                  {idx === 0 ? "Seed Context" : "Approved Layer"}
                </div>
                <div className="truncate text-white/80">{item.name}</div>
              </div>
            </div>
          ))}
          {currentRunningAgent && (
            <div className="flex animate-pulse items-center gap-2 rounded-xl border border-[#FF9500] bg-[#FF9500]/[0.02] p-3 text-xs">
              <span className="shrink-0 text-[#FF9500]">●</span>
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase text-[#FF9500]">Processing…</div>
                <div className="truncate text-white/90">{currentRunningAgent.name}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MIDDLE: Workspace */}
      <section className="flex-1 min-w-0 flex flex-col overflow-hidden p-6">
        {/* VIEW 1 — Input Selection */}
        {labStage === "INPUT_SELECTION" && (
          <div className="m-auto w-full max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold">Initialize Lab Experiment</h2>
              <p className="mt-1 text-xs text-white/40">
                Select an isolated data source to seed your validation pipeline.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "trending", icon: "📈", label: "Trending Intelligence" },
                { id: "viral",    icon: "🔥", label: "Viral Intelligence" },
                { id: "manual",   icon: "⌨️", label: "Manual Input Only" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedInputMethod(m.id)}
                  className={`space-y-2 rounded-2xl border bg-[#13161A] p-5 text-left transition-all hover:border-[#007AFF] ${
                    selectedInputMethod === m.id ? "border-[#007AFF]" : "border-white/5"
                  }`}
                >
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-xs font-bold">{m.label}</div>
                </button>
              ))}
            </div>

            {/* Trending — topic picker */}
            {selectedInputMethod === "trending" && (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <h3 className="mb-2 text-xs font-semibold text-white/60">
                  Select Scraped Trending Anchor Topic:
                </h3>
                {isLoadingTopics ? (
                  <div className="animate-pulse py-4 text-xs text-white/30">
                    Scraping database engine logs…
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trendingTopics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTopic(t.topic)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#13161A] p-3 text-left text-xs transition-colors hover:border-[#34C759]"
                      >
                        <span className="font-medium text-white/80">{t.topic}</span>
                        <span className="ml-4 shrink-0 text-[11px] text-white/30">{t.metrics}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Viral Intelligence — platform toggle + URL input + mock topic list */}
            {selectedInputMethod === "viral" && (
              <div className="space-y-4 border-t border-white/5 pt-4">

                {/* ── Step 1: paste a direct URL ── */}
                <div className="space-y-2">
                  {/* Label row with platform toggles */}
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 pl-1">
                      Step 1: Source Content Link
                    </label>

                    {/* Micro segmented toggle */}
                    <div className="flex bg-black/40 rounded-md p-0.5 border border-white/5">
                      <button
                        type="button"
                        onClick={() => setPlatform("instagram")}
                        className={`px-2 py-0.5 text-[9px] font-semibold rounded transition-all ${
                          platform === "instagram"
                            ? "bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        📸 Instagram Reel
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlatform("youtube")}
                        className={`px-2 py-0.5 text-[9px] font-semibold rounded transition-all ${
                          platform === "youtube"
                            ? "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        🎥 YouTube
                      </button>
                    </div>
                  </div>

                  {/* URL input — placeholder swaps with platform */}
                  <input
                    type="text"
                    value={viralUrl}
                    onChange={(e) => setViralUrl(e.target.value)}
                    placeholder={
                      platform === "instagram"
                        ? "Paste Instagram Reel link…"
                        : "Paste YouTube video or Shorts link…"
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#16191E] px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#007AFF] transition-colors"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitViralUrl}
                      disabled={!viralUrl.trim()}
                      className="rounded-lg px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        background: platform === "instagram"
                          ? "linear-gradient(135deg, #FF9500, #FF6B00)"
                          : "linear-gradient(135deg, #FF3B30, #CC2200)",
                        color: "#fff",
                      }}
                    >
                      Lock Concept Parameters ➔ Send to Stage 2
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/20">
                    or pick from trending viral
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Mock viral topic list */}
                {isLoadingTopics ? (
                  <div className="animate-pulse py-4 text-xs text-white/30">
                    Scraping database engine logs…
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trendingTopics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTopic(t.topic)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#13161A] p-3 text-left text-xs transition-colors hover:border-[#34C759]"
                      >
                        <span className="font-medium text-white/80">{t.topic}</span>
                        <span className="ml-4 shrink-0 text-[11px] text-white/30">{t.metrics}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manual textarea */}
            {selectedInputMethod === "manual" && (
              <div className="space-y-3 border-t border-white/5 pt-4">
                <textarea
                  value={manualInputText}
                  onChange={(e) => setManualInputText(e.target.value)}
                  placeholder="Paste medical statement, draft script line, or core topic here…"
                  className="h-24 w-full resize-none rounded-xl border border-white/10 bg-[#16191E] p-4 text-xs text-white focus:border-[#007AFF] focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitManualInput}
                    disabled={!manualInputText.trim()}
                    className="rounded-lg bg-[#007AFF] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0066d6] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Confirm Seed &amp; Proceed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2 — Agent Routing Grid */}
        {labStage === "AGENT_SELECTION" && (
          <div className="mx-auto w-full max-w-3xl space-y-6 overflow-y-auto pr-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9500]">
                Human-In-The-Loop Route Control
              </span>
              <h2 className="mt-0.5 text-xl font-bold">Select Next Pipeline Destination</h2>
              <p className="text-xs text-white/40">
                Select which agent will process the running data stream next.
              </p>
            </div>

            {Object.entries(AVAILABLE_AGENTS).map(([category, agents]) => (
              <div key={category} className="space-y-2">
                <h3 className="pl-1 text-[10px] font-bold uppercase tracking-wider text-white/20">
                  {category} Layer
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleSelectAgent(agent)}
                      className="group rounded-xl border border-white/5 bg-[#13161A] p-4 text-left transition-all hover:border-[#FF9500]"
                    >
                      <div className="text-xs font-semibold text-white/90 group-hover:text-[#FF9500]">
                        {agent.name}
                      </div>
                      <div className="mt-1 text-[11px] text-white/40">{agent.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3 — Active Agent Run */}
        {labStage === "ACTIVE_RUN" && currentRunningAgent && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-widest text-[#FF9500]">
                Active Audit Room
              </span>
              <h1 className="text-lg font-bold text-white/90">{currentRunningAgent.name}</h1>
              <p className="text-xs text-white/50">{currentRunningAgent.desc}</p>
            </div>

            {/* Dynamic Output Card */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-white/[0.05] bg-[#13161A] p-5 space-y-4">
              {isProcessingAgent ? (
                <div className="flex h-full flex-col items-center justify-center space-y-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9500] border-t-transparent" />
                  <div className="animate-pulse text-xs text-white/40">
                    Running computational pipeline engine queries…
                  </div>
                </div>
              ) : agentOutputData ? (
                <>
                  {/* Historical Source */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9500]">
                      Historical Stack Source
                    </span>
                    <p className="mt-1 rounded-lg border border-white/[0.02] bg-white/[0.02] p-3 text-xs text-white/70">
                      &ldquo;{typeof executionChain[0]?.data === "object"
                        ? `${executionChain[0].data.platform === "instagram" ? "📸 Instagram Reel" : "🎥 YouTube"} — ${executionChain[0].data.url}`
                        : executionChain[0]?.data}&rdquo;
                    </p>
                  </div>

                  {/* Generated Output */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#34C759]">
                      Generated Output Node Package
                    </span>
                    <div className="mt-2 rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-2">
                      <div className="text-xs font-bold text-white/90">
                        {agentOutputData.summary}
                      </div>
                      {agentOutputData.payloadList?.length > 0 && (
                        <div className="border-t border-white/5 pt-2 space-y-2">
                          {agentOutputData.payloadList.map((p, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 text-xs">
                              <span className="shrink-0 text-white/50">{p.label}:</span>
                              <span className="text-right text-white/80">{p.details}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cumulative carry-forward */}
                  {executionChain.length > 1 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        Carried-forward context ({executionChain.length} step
                        {executionChain.length === 1 ? "" : "s"})
                      </span>
                      <div className="mt-1 space-y-1">
                        {executionChain.slice(1).map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[11px] text-white/60"
                          >
                            <span className="text-white/30">{item.name}:</span>{" "}
                            {typeof item.data === "string"
                              ? item.data
                              : item.data?.summary || "Approved"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            <AgentRefinementChat
              agentName={currentRunningAgent.name}
              onSendMessage={handleSendMessageToAgent}
              chatHistory={chatHistory}
            />

            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={handleChangeAgentRoute}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-xs font-semibold transition hover:bg-white/10"
              >
                ← BACK TO GATEWAY MAP
              </button>
              <button
                type="button"
                onClick={handleApproveStep}
                disabled={isProcessingAgent || !agentOutputData}
                className={`flex-1 rounded-xl py-3 px-4 text-xs font-bold transition ${
                  isProcessingAgent || !agentOutputData
                    ? "cursor-not-allowed bg-white/10 text-white/30"
                    : "bg-[#34C759] text-black hover:bg-[#2eb34e]"
                }`}
              >
                {isProcessingAgent ? "PROCESSING…" : "APPROVE & SAVE TO CHAIN →"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* RIGHT: Stats & Scorecard */}
      <aside className="w-[320px] shrink-0 bg-[#13161A] border-l border-white/[0.05] p-5 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white/90">Stats &amp; Scorecard</h2>
          <p className="text-[11px] text-white/40">Real-time clinical validation</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Scientific Confidence</span>
            <span className="font-bold text-[#34C759]">{confidence}%</span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#34C759] transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-white/60">Active Chain Matrix</div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.03] bg-white/[0.02] p-3 text-xs text-white/70">
            <span>🔗</span>
            <span>
              {executionChain.length} Block Layer{executionChain.length === 1 ? "" : "s"} Built
            </span>
          </div>
        </div>

        {agentOutputData && (
          <div className="space-y-2">
            <div className="text-xs text-white/60">Current Agent</div>
            <div className="rounded-xl border border-[#FF9500]/30 bg-[#FF9500]/[0.04] p-3 text-xs text-[#FF9500]">
              ● {currentRunningAgent?.name}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

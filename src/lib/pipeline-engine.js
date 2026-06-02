// Pipeline Execution Engine — three-stage (INPUT → PROCESS → OUTPUT)
// Clean alternative to the React-Flow-based workflow-engine.js.
// onProgress(agentId, status, result, creditsUsed)

import { getPipelineAgent } from "@/lib/pipeline-registry";

// ── Mock output per agent ──────────────────────────────────────────────────
function mockOutput(agentId, topic) {
  const t = topic || "health topic";
  const OUTPUTS = {
    topic_intelligence: {
      variations: [`Does ${t} actually work?`, `${t}: What science says`, `The truth about ${t}`],
      hooks: [`🚨 Nobody tells you this about ${t}`, `I tested ${t} for 30 days`, `Doctor reacts to ${t} claims`],
      engagement_score: 72 + Math.floor(Math.random() * 22),
    },
    viral_intelligence: {
      viral_hooks: [`Stop believing these ${t} myths 🔥`, `This is why your ${t} isn't working`, `The ${t} science will surprise you`],
      trend_score: 74 + Math.floor(Math.random() * 22),
      top_formats: ["reels", "shorts"],
    },
    manual_input: {
      topic: t,
      passed_directly: true,
    },
    research_agent: {
      citations: [
        { source: "PubMed", title: `Clinical evidence for ${t}`, year: 2023, strength: "A" },
        { source: "NIH",    title: `National review of ${t}`,    year: 2022, strength: "B+" },
      ],
      evidence_summary: `Current evidence on ${t} is moderately strong with multiple RCTs.`,
      confidence_score: 65 + Math.floor(Math.random() * 28),
    },
    medical_validation: {
      validated_claims: [`${t} shows measurable benefits in peer-reviewed studies`],
      confidence: 68 + Math.floor(Math.random() * 25),
      evidence_strength: "moderate",
    },
    safety: {
      risk_score: 10 + Math.floor(Math.random() * 25),
      safe_claims: [`${t} may support health when used appropriately`],
      disclaimer: "Consult a healthcare provider before starting any supplement.",
    },
    context_enrichment: {
      analogies: [`Like upgrading your body's firmware, ${t} works best consistently`],
      expert_quote: `"The evidence for ${t} is genuinely compelling" — Dr. Research, MD`,
      storytelling_beats: ["Hook with paradox", "Evidence drop", "Personal story", "Call to action"],
    },
    format_intelligence: {
      formatted_structure: `[0:00] Hook\n[0:05] Claim\n[0:20] Evidence\n[0:40] Nuance\n[0:55] CTA`,
      speaking_cues: ["Pause after hook", "Slow down on stats", "Energy spike at CTA"],
    },
    multilingual: {
      tanglish: `${t} pathi science enna sollutu iruku theriyuma? 🔥 Ivlo studies padichathu theriyuma?`,
      tamil:    `${t} பற்றி அறிவியல் என்ன சொல்கிறது என்று தெரியுமா?`,
      hindi:    `${t} के बारे में विज्ञान क्या कहता है?`,
    },
    review: {
      quality_score:     82 + Math.floor(Math.random() * 15),
      hallucination_risk: "low",
      compliance:        "passed",
      notes:             ["Strong hook", "Evidence well-cited", "CTA clear"],
    },
    instagram_reel: {
      hook:   `🔬 Science just confirmed something big about ${t}.`,
      script: `Hook: Science confirmed something big about ${t}.\nEvidence: Studies show real, measurable benefits — no hype.\nNuance: Results vary — here's what actually works.\nCTA: Save this before it disappears.`,
      caption: `The truth about ${t} — backed by science. No hype, just evidence. 🧪\n\nSave this!`,
      hashtags: [`#${t.replace(/\s+/g, "")}`, "#HealthScience", "#EvidenceBased"],
    },
    youtube_script: {
      title:       `The Truth About ${t}: What 50 Studies Actually Say`,
      description: `A deep dive into the science of ${t}. We reviewed 50+ studies so you don't have to.`,
      script:      `[INTRO] Today we're breaking down the science behind ${t}.\n[CHAPTER 1] What is ${t}?\n[CHAPTER 2] The evidence\n[CHAPTER 3] Practical takeaways\n[OUTRO] Subscribe for evidence-based content`,
      timestamps:  ["0:00 - Intro", "1:30 - What is it?", "4:00 - The science", "8:30 - Practical tips"],
    },
    podcast_script: {
      title:    `Episode: The Real Science of ${t}`,
      outline:  `INTRO (2min): Hook with surprising statistic\nSEGMENT 1 (8min): What the research shows\nSEGMENT 2 (8min): Common myths\nCLOSING (2min): Key takeaways + CTA`,
      host_notes: ["Keep energy high", "Pause after key stats", "Invite listener to DM questions"],
    },
    blog_article: {
      title:    `Does ${t} Work? An Evidence-Based Review`,
      intro:    `${t} has been making headlines. We reviewed the peer-reviewed research to give you an honest assessment.`,
      sections: ["What is it?", "What does the research say?", "Practical guidance", "Bottom line"],
      meta:     `Evidence-based review of ${t}: what peer-reviewed research says, practical applications, and what to avoid.`,
    },
    twitter_thread: {
      tweet_1: `🧵 The science of ${t} — a thread.\n\nI read 30+ studies. Here's what actually matters:`,
      tweet_2: `1/ The evidence is real.\n\nMultiple RCTs show ${t} has measurable effects — but only under specific conditions.`,
      tweet_3: `2/ What people get wrong:\n\n❌ Thinking it works for everyone\n✅ Individual variation is huge`,
      cta:     `Follow for more evidence-based health content →`,
    },
    linkedin_post: {
      hook:    `Most people misunderstand ${t}. Here's what 50 studies actually show:`,
      body:    `The science is clear — ${t} works, but not in the way most people think.\n\nKey findings:\n→ Effect is real but modest\n→ Dosage matters\n→ Individual variation is significant`,
      cta:     `What's your take? Drop a comment below.`,
    },
    stage_speech: {
      opening:  `[Pause — let silence land] How many of you have heard that ${t} is a miracle cure? [Raise hands prompt] [Beat] That's what the internet wants you to believe.`,
      body:     `[EVIDENCE DROP] The science says something more nuanced — and more interesting.\n[APPLAUSE MOMENT] Because here's what the research ACTUALLY shows...`,
      closing:  `[Eye contact — pause] The truth about ${t} isn't sexy. But it's powerful. And that's what we're here for.`,
    },
  };
  return OUTPUTS[agentId] || { result: `${agentId} output ready`, status: "ok" };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randFactor() {
  return 0.5 + Math.random() * 0.7;
}

// ── Main pipeline executor ─────────────────────────────────────────────────
export async function executePipeline(
  { inputAgent, processAgents = [], outputFormats = [], topic },
  onProgress
) {
  let creditsUsed = 0;
  const results   = {};

  // ── Stage 1: INPUT ────────────────────────────────────────────────────────
  {
    const agent = getPipelineAgent(inputAgent);
    onProgress(inputAgent, "running", null, creditsUsed);
    await delay((agent?.estimatedMs || 1000) * randFactor());
    const output = mockOutput(inputAgent, topic);
    creditsUsed += agent?.credits || 0;
    results[inputAgent] = { agentId: inputAgent, agentName: agent?.name || inputAgent, output };
    onProgress(inputAgent, "done", results[inputAgent], creditsUsed);
  }

  // ── Stage 2: PROCESS (sequential) ────────────────────────────────────────
  for (const agentId of processAgents) {
    const agent = getPipelineAgent(agentId);
    onProgress(agentId, "running", null, creditsUsed);
    await delay((agent?.estimatedMs || 1200) * randFactor());
    const output = mockOutput(agentId, topic);
    creditsUsed += agent?.credits || 0;
    results[agentId] = { agentId, agentName: agent?.name || agentId, output };
    onProgress(agentId, "done", results[agentId], creditsUsed);
  }

  // ── Stage 3: OUTPUT (sequential; could be parallelised) ──────────────────
  for (const formatId of outputFormats) {
    const agent = getPipelineAgent(formatId);
    onProgress(formatId, "running", null, creditsUsed);
    await delay((agent?.estimatedMs || 1800) * randFactor());
    const output = mockOutput(formatId, topic);
    creditsUsed += agent?.credits || 0;
    results[formatId] = { agentId: formatId, agentName: agent?.name || formatId, output };
    onProgress(formatId, "done", results[formatId], creditsUsed);
  }

  return { results, creditsUsed };
}

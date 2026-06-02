// Workflow Execution Engine
// Runs a DAG of agents in topological order, broadcasting progress via callbacks.

import { AGENT_REGISTRY } from "@/lib/agents/registry";

// ─── Topological Sort (Kahn's algorithm) ─────────────────────────────────────
function topologicalSort(nodes, edges) {
  const nodeIds = nodes.map((n) => n.id);
  const inDegree = Object.fromEntries(nodeIds.map((id) => [id, 0]));
  const adj = Object.fromEntries(nodeIds.map((id) => [id, []]));

  for (const edge of edges) {
    if (inDegree[edge.target] !== undefined) {
      inDegree[edge.target]++;
    }
    if (adj[edge.source]) {
      adj[edge.source].push(edge.target);
    }
  }

  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const order = [];

  while (queue.length > 0) {
    const current = queue.shift();
    order.push(current);
    for (const neighbor of adj[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return order;
}

// ─── Gather inputs for a node from previous results ───────────────────────────
function gatherInputs(node, edges, results, userInput) {
  const parentEdges = edges.filter((e) => e.target === node.id);
  const parentOutputs = parentEdges.flatMap((e) => results[e.source] || []);
  return { ...userInput, parentOutputs };
}

// ─── Mock output generators per agent type ────────────────────────────────────
function simulateOutput(agentId, inputs) {
  const topic = inputs.topic || "health topic";
  const lang  = inputs.language || "English";

  const MOCK = {
    topic_intelligence: {
      topic_variations: [
        `Does ${topic} actually work?`,
        `${topic}: What science says`,
        `The truth about ${topic}`,
        `${topic} myths debunked`,
        `${topic} — doctor's perspective`,
      ],
      hooks: [
        `🚨 Nobody is telling you this about ${topic}...`,
        `I tested ${topic} for 30 days. Here's what happened.`,
        `Doctor reacts to ${topic} claims on social media`,
      ],
      engagement_score: Math.round(68 + Math.random() * 25),
    },

    viral_intelligence: {
      viral_hooks: [
        `Stop believing these ${topic} myths 🔥`,
        `This is why your ${topic} results aren't working`,
        `The science behind ${topic} will surprise you`,
      ],
      trend_score: Math.round(72 + Math.random() * 22),
      best_platform: "reels",
    },

    research_agent: {
      citations: [
        { source: "PubMed", title: `Clinical evidence for ${topic}`, year: 2023, strength: "A" },
        { source: "NIH",    title: `National review of ${topic} research`, year: 2022, strength: "B+" },
        { source: "WHO",    title: `WHO guidelines on ${topic}`, year: 2023, strength: "A" },
      ],
      evidence_summary: `Current evidence on ${topic} is moderately strong with multiple RCTs supporting efficacy under specific conditions.`,
      confidence_score: Math.round(65 + Math.random() * 28),
      consensus_pct:    Math.round(60 + Math.random() * 30),
    },

    validation: {
      validated_claims: [`${topic} shows measurable benefits in peer-reviewed studies`, `Effects are dose-dependent and individual-specific`],
      flagged_claims:   [],
      evidence_strength: "moderate",
    },

    safety: {
      safe_claims: [`${topic} may support health when used appropriately`, `Consult a healthcare provider before starting`],
      risk_score: Math.round(10 + Math.random() * 25),
      rewritten_claims: [],
      blocked_claims:   [],
    },

    fact_check: {
      verified_stats:    [`Up to 40% improvement in outcomes (95% CI: 28–52%)`],
      source_footnotes:  [`[1] PubMed 2023`, `[2] NIH Review 2022`],
      accuracy_score:    Math.round(80 + Math.random() * 18),
    },

    enrichment: {
      enriched_content: `${topic} works through a well-understood mechanism — think of it like upgrading your body's baseline settings. Studies from leading institutions back this with real numbers.`,
      expert_quotes:    [`"The evidence clearly supports targeted use of ${topic}" — Dr. Research, MD`],
      analogies:        [`Like charging a phone, ${topic} works best consistently over time`],
    },

    format_agent: {
      formatted_content: `[0:00] Hook\n[0:05] Claim\n[0:15] Evidence beat\n[0:30] Nuance\n[0:45] CTA`,
      timing_map:        { hook: "0–5s", claim: "5–15s", evidence: "15–35s", cta: "45–60s" },
      slide_structure:   ["Title", "The claim", "The science", "What to do", "Disclaimer"],
    },

    composition: {
      hooks: [`🔬 Science just confirmed this about ${topic}`, `Nobody talks about the real ${topic} research`, `I read 50 studies on ${topic} so you don't have to`],
      reel_script: `Hook: Science just confirmed something big about ${topic}.\nEvidence: Studies show real, measurable benefits.\nNuance: Results vary — here's what works.\nCTA: Save this before it disappears.`,
      caption: `The truth about ${topic} — backed by real science. No hype, just evidence. 🧪\n\nSave this for later!`,
      cta: ["Save this post!", "Follow for more evidence-based content", "Share with someone who needs to see this"],
      hashtags: [`#${topic.replace(/\s+/g, "")}`, "#HealthScience", "#EvidenceBased", "#WellnessTips", "#HealthCreator"],
      thumbnail_titles: [`The ${topic} Truth`, `Does ${topic} WORK?`, `${topic}: Myth vs Reality`],
    },

    multi_platform: {
      platform_variants: { reels: "60s script ready", shorts: "45s script ready", carousel: "8 slides ready" },
      adapted_hooks:     [`[Reels] 🔥 ${topic} facts`, `[Shorts] The ${topic} truth`],
      adapted_captions:  [`[Instagram] ${topic} — see what science says 🧬`, `[LinkedIn] Evidence-based ${topic} review`],
    },

    multilingual: {
      translated_content: {
        tanglish: `${topic} pathi science enna sollutu iruku theriyuma? 🔥 Neenga think panrathu correct ah? Ivlo studies padichathu theriyuma?`,
        tamil:    `${topic} பற்றி அறிவியல் என்ன சொல்கிறது என்று தெரியுமா?`,
        hindi:    `${topic} के बारे में विज्ञान क्या कहता है?`,
      },
      language_variants: [lang],
    },

    review: {
      quality_score:     Math.round(82 + Math.random() * 15),
      review_notes:      ["Strong hook", "Evidence well-cited", "CTA is clear"],
      compliance_status: "passed",
      final_content:     "Approved — ready to publish.",
    },
  };

  return MOCK[agentId] || { result: `${agentId} completed`, status: "ok" };
}

// ─── Main execution function ───────────────────────────────────────────────────
export async function executeWorkflow(nodes, edges, userInput, onProgress) {
  const order = topologicalSort(nodes, edges);
  const results = {};
  let creditsUsed = 0;

  for (const nodeId of order) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const agentKey = node.data?.agentType;
    const agent    = AGENT_REGISTRY[agentKey];
    if (!agent) continue;

    // Signal running
    onProgress(nodeId, "running", null, creditsUsed);

    // Simulate async execution time
    await delay(agent.estimatedMs * (0.6 + Math.random() * 0.8));

    // Gather inputs from parent nodes
    const inputs = gatherInputs(node, edges, results, userInput);

    // Generate mock output
    const output = simulateOutput(agentKey, inputs);
    results[nodeId] = { agentId: agentKey, agentName: agent.name, output };

    creditsUsed += agent.credits;
    onProgress(nodeId, "done", results[nodeId], creditsUsed);
  }

  return { results, creditsUsed };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function estimateWorkflowCredits(nodes) {
  return nodes.reduce((total, node) => {
    const agent = AGENT_REGISTRY[node.data?.agentType];
    return total + (agent?.credits || 0);
  }, 0);
}

export function estimateWorkflowTime(nodes) {
  const totalMs = nodes.reduce((sum, node) => {
    const agent = AGENT_REGISTRY[node.data?.agentType];
    return sum + (agent?.estimatedMs || 1000);
  }, 0);
  return Math.round(totalMs / 1000);
}

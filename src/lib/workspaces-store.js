// Client-side localStorage persistence for workspaces and workflows.
// Seeded with demo data on first access.
// In production, replace with Supabase queries.

const WS_KEY = "vc_workspaces";
const WF_KEY = "vc_workflows";

const DEMO_WORKSPACES = [
  {
    id: "ws_diabetes",
    name: "Diabetes Content Series",
    description: "Evidence-based diabetes management content",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ws_sleep",
    name: "Sleep Health",
    description: "Sleep science and optimization content",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const DEMO_WORKFLOWS = [
  {
    id: "wf_001",
    workspaceId: "ws_diabetes",
    topic: "Does turmeric cure diabetes?",
    presetId: "instagram_reel",
    inputAgent: "viral_intelligence",
    processAgents: ["safety"],
    enrichmentModules: [],
    outputFormats: ["instagram_reel"],
    status: "completed",
    creditsUsed: 7,
    confidenceScore: 82,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
    results: { summary: "Turmeric has mild anti-inflammatory benefits but does NOT cure diabetes. Confidence: 82%." },
  },
  {
    id: "wf_002",
    workspaceId: "ws_diabetes",
    topic: "Intermittent fasting for type 2 diabetes",
    presetId: "youtube_long",
    inputAgent: "topic_intelligence",
    processAgents: ["research_agent", "medical_validation", "context_enrichment"],
    enrichmentModules: [],
    outputFormats: ["youtube_script"],
    status: "completed",
    creditsUsed: 12,
    confidenceScore: 78,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 62000).toISOString(),
    results: { summary: "IF shows moderate benefits for T2D management. Evidence quality: moderate. Confidence: 78%." },
  },
  {
    id: "wf_003",
    workspaceId: "ws_sleep",
    topic: "Magnesium glycinate for better sleep",
    presetId: "instagram_reel",
    inputAgent: "viral_intelligence",
    processAgents: ["safety"],
    enrichmentModules: [],
    outputFormats: ["instagram_reel"],
    status: "completed",
    creditsUsed: 7,
    confidenceScore: 87,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 38000).toISOString(),
    results: { summary: "Magnesium glycinate shows good evidence for improving sleep quality. Confidence: 87%." },
  },
];

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(WS_KEY)) {
    localStorage.setItem(WS_KEY, JSON.stringify(DEMO_WORKSPACES));
    localStorage.setItem(WF_KEY, JSON.stringify(DEMO_WORKFLOWS));
  }
}

export function getWorkspaces() {
  ensureSeeded();
  try {
    const workspaces = JSON.parse(localStorage.getItem(WS_KEY) || "[]");
    const workflows  = JSON.parse(localStorage.getItem(WF_KEY) || "[]");
    return workspaces
      .map((ws) => ({
        ...ws,
        workflowCount: workflows.filter((wf) => wf.workspaceId === ws.id).length,
        totalCredits:  workflows
          .filter((wf) => wf.workspaceId === ws.id)
          .reduce((s, wf) => s + (wf.creditsUsed || 0), 0),
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch { return []; }
}

export function getWorkspace(id) {
  ensureSeeded();
  try {
    return JSON.parse(localStorage.getItem(WS_KEY) || "[]").find((ws) => ws.id === id) || null;
  } catch { return null; }
}

export function createWorkspace({ name, description = "" }) {
  ensureSeeded();
  const ws = {
    id:          `ws_${Date.now()}`,
    name:        name.trim(),
    description,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };
  const data = JSON.parse(localStorage.getItem(WS_KEY) || "[]");
  localStorage.setItem(WS_KEY, JSON.stringify([ws, ...data]));
  return ws;
}

export function updateWorkspace(id, updates) {
  const data    = JSON.parse(localStorage.getItem(WS_KEY) || "[]");
  const updated = data.map((ws) =>
    ws.id === id ? { ...ws, ...updates, updatedAt: new Date().toISOString() } : ws
  );
  localStorage.setItem(WS_KEY, JSON.stringify(updated));
}

export function getWorkflows(workspaceId) {
  ensureSeeded();
  try {
    return JSON.parse(localStorage.getItem(WF_KEY) || "[]")
      .filter((wf) => wf.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch { return []; }
}

export function getWorkflow(workflowId) {
  ensureSeeded();
  try {
    return JSON.parse(localStorage.getItem(WF_KEY) || "[]").find((wf) => wf.id === workflowId) || null;
  } catch { return null; }
}

// Create a workflow from a PRESET.
// Caller passes the three-stage fields (looked up from pipeline-presets on the call site).
export function createWorkflow({ workspaceId, topic, presetId, inputAgent, processAgents, enrichmentModules, outputFormats }) {
  ensureSeeded();
  const wf = {
    id:                `wf_${Date.now()}`,
    workspaceId,
    topic:             topic.trim(),
    presetId:          presetId || null,
    inputAgent:        inputAgent || "topic_intelligence",
    processAgents:     processAgents || [],
    enrichmentModules: enrichmentModules || [],
    outputFormats:     outputFormats || ["instagram_reel"],
    status:            "running",
    creditsUsed:       0,
    confidenceScore:   null,
    createdAt:         new Date().toISOString(),
    startedAt:         new Date().toISOString(),
    completedAt:       null,
    results:           null,
  };
  const data = JSON.parse(localStorage.getItem(WF_KEY) || "[]");
  localStorage.setItem(WF_KEY, JSON.stringify([wf, ...data]));
  updateWorkspace(workspaceId, {});
  return wf;
}

// Create a workflow from a CUSTOM pipeline (user-built in the Pipeline Builder)
export function createPipelineWorkflow({ workspaceId, topic, inputAgent, processAgents, enrichmentModules, outputFormats }) {
  ensureSeeded();
  const wf = {
    id:                `wf_${Date.now()}`,
    workspaceId,
    topic:             topic.trim(),
    presetId:          null,
    inputAgent,
    processAgents:     processAgents || [],
    enrichmentModules: enrichmentModules || [],
    outputFormats:     outputFormats || [],
    status:            "running",
    creditsUsed:       0,
    confidenceScore:   null,
    createdAt:         new Date().toISOString(),
    startedAt:         new Date().toISOString(),
    completedAt:       null,
    results:           null,
  };
  const data = JSON.parse(localStorage.getItem(WF_KEY) || "[]");
  localStorage.setItem(WF_KEY, JSON.stringify([wf, ...data]));
  updateWorkspace(workspaceId, {});
  return wf;
}

export function updateWorkflow(workflowId, updates) {
  const data    = JSON.parse(localStorage.getItem(WF_KEY) || "[]");
  const updated = data.map((wf) => (wf.id === workflowId ? { ...wf, ...updates } : wf));
  localStorage.setItem(WF_KEY, JSON.stringify(updated));
}

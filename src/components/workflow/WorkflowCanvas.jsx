"use client";

import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import AgentNode from "./AgentNode";
import ConnectionLine from "./ConnectionLine";
import { AGENT_REGISTRY, CATEGORY_COLORS } from "@/lib/agents/registry";

const nodeTypes = { agentNode: AgentNode };
const edgeTypes = { connectionLine: ConnectionLine };

const DEFAULT_EDGE_OPTS = {
  type: "smoothstep",
  style: { stroke: "rgba(91,140,255,0.55)", strokeWidth: 2 },
  animated: false,
};

export default function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddNode,
  nodeStatuses,
}) {
  const wrapperRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  // Enrich nodes with live execution status
  const enrichedNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      status: nodeStatuses?.[n.id] || n.data?.status || "idle",
    },
  }));

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const agentType = event.dataTransfer.getData("application/reactflow");
      if (!agentType || !rfInstance || !AGENT_REGISTRY[agentType]) return;

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      onAddNode(agentType, position);
    },
    [rfInstance, onAddNode]
  );

  // Pass raw params up — the page's onConnect calls addEdge with the current edges
  const handleConnect = useCallback(
    (params) => onConnect(params),
    [onConnect]
  );

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 overflow-hidden"
      style={{ background: "rgb(var(--bg))" }}
    >
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onNodeClick(node)}
        onPaneClick={() => onNodeClick(null)}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={DEFAULT_EDGE_OPTS}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        selectionKeyCode="Shift"
      >
        {/* Dot-grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="rgba(91,140,255,0.14)"
        />

        {/* Minimap */}
        <MiniMap
          nodeColor={(n) => {
            const agent = AGENT_REGISTRY[n.data?.agentType];
            if (!agent) return "rgba(91,140,255,0.3)";
            return CATEGORY_COLORS[agent.color]?.dot || "rgba(91,140,255,0.3)";
          }}
          maskColor="rgba(5,7,15,0.6)"
          style={{
            background: "rgba(11,17,36,0.9)",
            border: "1px solid rgba(30,44,82,1)",
            borderRadius: "10px",
          }}
        />

        {/* Zoom/pan controls */}
        <Controls
          style={{
            background: "rgba(11,17,36,0.9)",
            border: "1px solid rgba(30,44,82,1)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3 text-5xl opacity-20">⬡</div>
            <p className="text-sm font-semibold text-faint">Canvas is empty</p>
            <p className="mt-1 text-xs text-faint">
              Drag agents from the left panel · or use a preset template
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

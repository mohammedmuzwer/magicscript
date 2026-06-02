"use client";

import { getBezierPath, BaseEdge, EdgeLabelRenderer } from "reactflow";

// Custom animated edge with Magic Script brand styling
export default function ConnectionLine({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "rgba(34,211,238,0.85)" : "rgba(91,140,255,0.55)",
          strokeWidth: selected ? 2.5 : 2,
          filter: selected ? "drop-shadow(0 0 6px rgba(34,211,238,0.6))" : "none",
          transition: "all 0.2s ease",
        }}
      />
    </>
  );
}

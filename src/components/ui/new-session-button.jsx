"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

/**
 * NewSessionButton — top-nav "+ New" control + confirmation modal.
 * Shown only when a pipeline is past stage 1 (caller guards with currentStage > 1).
 * `onConfirm` performs the pipeline-specific reset (each pipeline resets ONLY its
 * own state). The modal closes on Cancel, on backdrop click, and after confirm.
 */
export default function NewSessionButton({ onConfirm, label = "New Content" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const confirm = () => { onConfirm?.(); setOpen(false); };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg text-white transition-colors"
        style={{ background: "#2563eb", fontSize: 13, fontWeight: 600, padding: "7px 14px" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
      >
        <Plus size={14} strokeWidth={2.5} /> {label}
      </button>

      {open && (
        <>
          {/* Backdrop — click cancels */}
          <div
            onClick={close}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", zIndex: 199 }}
          />
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              zIndex: 200, maxWidth: 320, width: "calc(100% - 32px)", padding: 24,
              background: "rgb(var(--panel))", border: "0.5px solid rgb(var(--border))",
              borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 700, color: "rgb(var(--text))" }}>
              🔄 Start a new session?
            </p>
            <p style={{ fontSize: 13, marginTop: 8, color: "rgb(var(--text-faint))" }}>
              Your current progress will be cleared. This cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={close}
                className="transition-colors"
                style={{ background: "rgb(var(--bg-soft))", color: "rgb(var(--text))", border: "0.5px solid rgb(var(--border))", fontWeight: 600, fontSize: 13, padding: "8px 16px", borderRadius: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--panel-soft))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--bg-soft))")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                className="transition-colors"
                style={{ background: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: 13, padding: "8px 18px", borderRadius: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
              >
                Yes, Start New →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

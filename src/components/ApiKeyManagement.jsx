"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, Trash2, ShieldCheck, ExternalLink } from "lucide-react";

// ─── localStorage key names (preserved) ──────────────────────────────────────
export const LS_KEY_CLAUDE  = "V_KEY_CLAUDE";
export const LS_KEY_GPT     = "V_KEY_GPT";
export const LS_KEY_GOOGLE  = "V_KEY_GOOGLE";
export const LS_KEY_YOUTUBE = "V_KEY_YOUTUBE";
export const LS_KEY_PUBMED  = "V_KEY_PUBMED";
const TS_SUFFIX      = "_SAVED_AT";
export const ENABLED_SUFFIX = "_ENABLED";

// Helper — read whether an API is enabled (call from anywhere in the app)
export function isApiEnabled(lsKey) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(lsKey + ENABLED_SUFFIX) !== "false";
}

const LS_MAP = {
  claude:  LS_KEY_CLAUDE,
  google:  LS_KEY_GOOGLE,
  gpt:     LS_KEY_GPT,
  youtube: LS_KEY_YOUTUBE,
  pubmed:  LS_KEY_PUBMED,
};

const ALL_IDS      = ["claude", "google", "gpt", "youtube", "pubmed"];
const REQUIRED_IDS = ["claude", "google", "youtube", "pubmed"];
const OPTIONAL_IDS = ["gpt"];

function timeAgo(ts) {
  if (!ts) return null;
  const m = Math.floor((Date.now() - Number(ts)) / 60000);
  const h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function StageTag({ label }) {
  return (
    <span style={{
      fontSize: 10, padding: "1px 7px", borderRadius: 20,
      border: "0.5px solid rgb(var(--border))",
      color: "rgb(var(--text-faint))",
      background: "rgb(var(--panel-soft))",
      display: "inline-flex", margin: "2px 2px 0 0",
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ emoji, label, desc }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      paddingBottom: 4, minHeight: 32,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: "rgb(var(--panel-soft))",
        border: "0.5px solid rgb(var(--border))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13,
      }}>
        {emoji}
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "rgb(var(--text))",
      }}>
        {label}
      </span>
      {desc && (
        <span style={{ fontSize: 11, color: "rgb(var(--text-faint))", marginLeft: "auto" }}>
          {desc}
        </span>
      )}
    </div>
  );
}

// ─── Full API card — flex-column so input anchors to bottom ──────────────────

function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      title={disabled ? "Connect a key first" : enabled ? "Click to disable" : "Click to enable"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        padding: 0, opacity: disabled ? 0.4 : 1,
      }}
    >
      {/* Track */}
      <div style={{
        width: 32, height: 18, borderRadius: 999,
        background: enabled ? "#16a34a" : "rgba(107,114,128,0.30)",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: "absolute", top: 2,
          left: enabled ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: enabled ? "#16a34a" : "rgba(107,114,128,0.7)" }}>
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function ApiCard({
  name, model,
  mainBadge, mainBadgeStyle,
  showRequiredBadge, requiredLabel,
  description, tags, placeholder, docsUrl,
  pipelineNote, extraNote,
  isConnected, isSaved, savedAtTs, keyValue, showKey,
  isEnabled, onToggleEnabled,
  onChange, onToggle, onSave, onClear,
}) {
  const leftBorderColor = isConnected && isEnabled
    ? "#16a34a"
    : isConnected && !isEnabled
    ? "#d97706"
    : (requiredLabel && requiredLabel.startsWith("Required")) ? "#dc2626"
    : "rgb(var(--border))";

  return (
    <div style={{
      background: "rgb(var(--panel))",
      border: "0.5px solid rgb(var(--border))",
      borderLeft: `3px solid ${leftBorderColor}`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Top section: grows to fill cell height ── */}
      <div style={{ flex: 1 }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 6px", marginBottom: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: isConnected ? "#16a34a" : "rgba(107,114,128,0.25)",
            display: "inline-block",
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(var(--text))" }}>{name}</span>
          <span className="font-mono" style={{ fontSize: 9, color: "rgb(var(--text-faint))" }}>{model}</span>

          <span style={{
            ...mainBadgeStyle,
            fontSize: 8, fontWeight: 700, borderRadius: 999,
            border: "1px solid", padding: "1px 6px",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            {mainBadge}
          </span>

          {isConnected && (
            <span style={{
              fontSize: 8, fontWeight: 700, borderRadius: 999, padding: "1px 6px",
              textTransform: "uppercase", letterSpacing: "0.04em",
              background: "rgba(22,163,74,0.10)", color: "#16a34a",
              border: "1px solid rgba(22,163,74,0.20)",
            }}>
              Connected
            </span>
          )}

          {showRequiredBadge && requiredLabel && (
            <span style={{
              fontSize: 8, fontWeight: 600, borderRadius: 999, padding: "1px 6px",
              border: `1px solid ${requiredLabel.startsWith("Required") ? "rgba(220,38,38,0.20)" : "rgb(var(--border))"}`,
              background: requiredLabel.startsWith("Required") ? "rgba(220,38,38,0.08)" : "rgb(var(--panel-soft))",
              color: requiredLabel.startsWith("Required") ? "#dc2626" : "rgb(var(--text-faint))",
            }}>
              {requiredLabel}
            </span>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* ON/OFF toggle — only show when a key is stored */}
            {isConnected && (
              <ToggleSwitch enabled={isEnabled} onChange={onToggleEnabled} />
            )}
            {isConnected && !isEnabled && (
              <span style={{
                fontSize: 8, fontWeight: 700, borderRadius: 999, padding: "1px 6px",
                textTransform: "uppercase", letterSpacing: "0.04em",
                background: "rgba(217,119,6,0.10)", color: "#d97706",
                border: "1px solid rgba(217,119,6,0.20)",
              }}>
                Paused
              </span>
            )}
            {savedAtTs && (
              <span className="text-faint" style={{ fontSize: 9 }}>
                Saved {timeAgo(savedAtTs)}
              </span>
            )}
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "rgb(var(--text-faint))", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgb(var(--accent))"}
              onMouseLeave={e => e.currentTarget.style.color = "rgb(var(--text-faint))"}>
              Get key <ExternalLink size={8} />
            </a>
          </div>
        </div>

        {/* Description */}
        <p className="text-faint" style={{ fontSize: 11, marginBottom: 5 }}>{description}</p>

        {/* Stage tags */}
        <div style={{ marginBottom: pipelineNote ? 4 : 0 }}>
          {tags.map(t => <StageTag key={t} label={t} />)}
        </div>

        {/* Pipeline note */}
        {pipelineNote && (
          <p className="text-faint" style={{ fontSize: 10, marginTop: 4, fontStyle: "italic" }}>
            {pipelineNote}
          </p>
        )}
      </div>

      {/* ── Bottom section: input + button, always at bottom ── */}
      <div style={{ marginTop: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <input
              type={showKey ? "text" : "password"}
              value={keyValue}
              onChange={onChange}
              onKeyDown={e => e.key === "Enter" && onSave()}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%", boxSizing: "border-box",
                borderRadius: 8, border: "1px solid rgb(var(--border))",
                background: "rgb(var(--bg))",
                padding: "6px 28px 6px 10px",
                fontSize: 11, fontFamily: "monospace",
                color: "rgb(var(--text))",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={onToggle}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "rgb(var(--text-faint))", display: "flex", alignItems: "center",
              }}>
              {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          </div>

          {isConnected && (
            <button
              type="button"
              onClick={onClear}
              title="Disconnect"
              style={{
                borderRadius: 8, border: "1px solid rgb(var(--border))",
                background: "none", padding: "0 8px", cursor: "pointer",
                color: "rgb(var(--text-faint))", display: "flex", alignItems: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.30)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgb(var(--text-faint))"; e.currentTarget.style.borderColor = "rgb(var(--border))"; }}>
              <Trash2 size={11} />
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            style={{
              borderRadius: 8, padding: "6px 12px",
              fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
              border: "none", cursor: "pointer",
              background: isSaved ? "#16a34a" : "rgb(var(--accent))",
              color: "#ffffff",
            }}>
            {isSaved
              ? <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Check size={10} />Saved</span>
              : isConnected ? "Update" : "Connect"}
          </button>
        </div>

        {extraNote && (
          <p className="text-faint" style={{ fontSize: 10, marginTop: 5 }}>{extraNote}</p>
        )}
      </div>
    </div>
  );
}

// ─── Compact auto-active card (Cochrane, DOAJ) — stacked in col 3 ─────────────

function CompactAutoCard({ name, model, description, tags, activeNote, style: extraStyle }) {
  return (
    <div style={{
      background: "rgb(var(--panel))",
      border: "0.5px solid rgb(var(--border))",
      borderLeft: "3px solid #16a34a",
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      ...extraStyle,
    }}>
      {/* Name + badges */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "3px 5px", marginBottom: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgb(var(--text))" }}>{name}</span>
        <span className="font-mono" style={{ fontSize: 9, color: "rgb(var(--text-faint))" }}>{model}</span>
        <span style={{
          fontSize: 8, fontWeight: 700, borderRadius: 999, padding: "1px 6px",
          textTransform: "uppercase", letterSpacing: "0.04em",
          border: "1px solid rgba(22,163,74,0.20)", background: "rgba(22,163,74,0.08)", color: "#16a34a",
        }}>
          No Key Needed
        </span>
        <span style={{
          fontSize: 8, fontWeight: 600, borderRadius: 999, padding: "1px 6px",
          border: "0.5px solid rgb(var(--border))",
          background: "rgb(var(--panel-soft))", color: "rgb(var(--text-faint))",
          marginLeft: "auto",
        }}>
          Free · Auto-active
        </span>
      </div>

      {/* Description — grows to fill */}
      <p className="text-faint" style={{ fontSize: 11, marginBottom: 5, flex: 1 }}>{description}</p>

      {/* Stage tags */}
      <div style={{ marginBottom: 6 }}>
        {tags.map(t => <StageTag key={t} label={t} />)}
      </div>

      {/* Active status */}
      <div style={{
        background: "rgba(22,163,74,0.06)",
        borderRadius: 6,
        padding: "4px 8px",
        flexShrink: 0,
      }}>
        <p style={{ fontSize: 11, color: "#16a34a" }}>{activeNote}</p>
      </div>
    </div>
  );
}

// ─── Reddit compact strip (full-width single row) ─────────────────────────────

function RedditStrip() {
  return (
    <div style={{
      background: "rgb(var(--panel-soft))",
      border: "0.5px solid rgb(var(--border))",
      borderRadius: 10,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: 0.65,
      flexWrap: "wrap",
    }}>
      {/* Left: identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(107,114,128,0.30)", display: "inline-block" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(var(--text))" }}>Reddit API</span>
        <span className="font-mono" style={{ fontSize: 9, color: "rgb(var(--text-faint))" }}>OAuth 2.0</span>
        <span style={{
          fontSize: 8, fontWeight: 700, borderRadius: 999, padding: "1px 6px",
          textTransform: "uppercase", letterSpacing: "0.04em",
          border: "0.5px solid rgb(var(--border))", background: "rgb(var(--panel))", color: "rgb(var(--text-faint))",
        }}>
          Optional · Planned
        </span>
      </div>

      {/* Middle: note */}
      <p style={{ fontSize: 12, color: "rgb(var(--text-faint))", flex: 1, minWidth: 200 }}>
        Reddit OAuth key will be added after core pipeline is complete. Currently using YouTube signals for social demand.
      </p>

      {/* Right */}
      <span style={{ fontSize: 11, fontWeight: 600, color: "rgb(var(--text-faint))", flexShrink: 0, cursor: "default" }}>
        Add Later →
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ApiKeyManagementDesk() {
  const [keys,    setKeys]    = useState({ claude: "", google: "", gpt: "", youtube: "", pubmed: "" });
  const [visible, setVisible] = useState({ claude: false, google: false, gpt: false, youtube: false, pubmed: false });
  const [saved,   setSaved]   = useState({ claude: false, google: false, gpt: false, youtube: false, pubmed: false });
  const [stored,  setStored]  = useState({ claude: false, google: false, gpt: false, youtube: false, pubmed: false });
  const [savedAt, setSavedAt] = useState({ claude: null,  google: null,  gpt: null,  youtube: null,  pubmed: null });
  const [enabled, setEnabled] = useState({ claude: true,  google: true,  gpt: true,  youtube: true,  pubmed: true });

  useEffect(() => {
    const g = k => localStorage.getItem(k) || "";
    const getBool = k => localStorage.getItem(k) !== "false"; // default ON
    const loaded = {
      claude:  g(LS_KEY_CLAUDE),
      google:  g(LS_KEY_GOOGLE),
      gpt:     g(LS_KEY_GPT),
      youtube: g(LS_KEY_YOUTUBE),
      pubmed:  g(LS_KEY_PUBMED),
    };
    setKeys(loaded);
    setStored({
      claude:  !!loaded.claude,
      google:  !!loaded.google,
      gpt:     !!loaded.gpt,
      youtube: !!loaded.youtube,
      pubmed:  !!loaded.pubmed,
    });
    setSavedAt({
      claude:  localStorage.getItem(LS_KEY_CLAUDE  + TS_SUFFIX),
      google:  localStorage.getItem(LS_KEY_GOOGLE  + TS_SUFFIX),
      gpt:     localStorage.getItem(LS_KEY_GPT     + TS_SUFFIX),
      youtube: localStorage.getItem(LS_KEY_YOUTUBE + TS_SUFFIX),
      pubmed:  localStorage.getItem(LS_KEY_PUBMED  + TS_SUFFIX),
    });
    setEnabled({
      claude:  getBool(LS_KEY_CLAUDE  + ENABLED_SUFFIX),
      google:  getBool(LS_KEY_GOOGLE  + ENABLED_SUFFIX),
      gpt:     getBool(LS_KEY_GPT     + ENABLED_SUFFIX),
      youtube: getBool(LS_KEY_YOUTUBE + ENABLED_SUFFIX),
      pubmed:  getBool(LS_KEY_PUBMED  + ENABLED_SUFFIX),
    });
  }, []);

  function toggleEnabled(id, lsKey) {
    const next = !enabled[id];
    localStorage.setItem(lsKey + ENABLED_SUFFIX, String(next));
    setEnabled(p => ({ ...p, [id]: next }));
    // Notify other panels (ReelsLeftPanel, YoutubeLeftPanel) to re-check
    window.dispatchEvent(new CustomEvent("apiEnabledChange", { detail: { id, enabled: next } }));
  }

  function save(id, lsKey) {
    const v = keys[id].trim();
    if (v) {
      localStorage.setItem(lsKey, v);
      const ts = String(Date.now());
      localStorage.setItem(lsKey + TS_SUFFIX, ts);
      setSavedAt(p => ({ ...p, [id]: ts }));
    } else {
      localStorage.removeItem(lsKey);
      localStorage.removeItem(lsKey + TS_SUFFIX);
      setSavedAt(p => ({ ...p, [id]: null }));
    }
    setStored(p => ({ ...p, [id]: !!v }));
    setSaved(p  => ({ ...p, [id]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [id]: false })), 2500);
  }

  function clear(id, lsKey) {
    localStorage.removeItem(lsKey);
    localStorage.removeItem(lsKey + TS_SUFFIX);
    setKeys(p    => ({ ...p, [id]: "" }));
    setStored(p  => ({ ...p, [id]: false }));
    setSavedAt(p => ({ ...p, [id]: null }));
  }

  const connectedCount       = ALL_IDS.filter(id => stored[id]).length;
  const requiredMissingCount = REQUIRED_IDS.filter(id => !stored[id]).length;
  const optionalMissingCount = OPTIONAL_IDS.filter(id => !stored[id]).length;

  const cp = (id, lsKey) => ({
    isConnected:      stored[id],
    isSaved:          saved[id],
    savedAtTs:        savedAt[id],
    keyValue:         keys[id],
    showKey:          visible[id],
    isEnabled:        enabled[id],
    onChange:         e  => setKeys(p    => ({ ...p, [id]: e.target.value })),
    onToggle:         () => setVisible(p => ({ ...p, [id]: !p[id] })),
    onSave:           () => save(id, lsKey),
    onClear:          () => clear(id, lsKey),
    onToggleEnabled:  () => toggleEnabled(id, lsKey),
  });

  return (
    <div style={{ padding: "24px", width: "100%" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "rgb(var(--text))", margin: 0 }}>API Connections</h1>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 4 }}>
            Keys stored in your browser only — never sent to any server
          </p>
          <p className="text-faint" style={{ fontSize: 10, marginTop: 3 }}>
            Priority: Claude → Gemini → OpenAI → Demo
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {connectedCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "2px 10px",
              border: "1px solid rgba(22,163,74,0.20)", background: "rgba(22,163,74,0.08)", color: "#16a34a",
            }}>
              {connectedCount} connected
            </span>
          )}
          {optionalMissingCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "2px 10px",
              border: "1px solid rgba(217,119,6,0.20)", background: "rgba(217,119,6,0.08)", color: "#d97706",
            }}>
              {optionalMissingCount} optional missing
            </span>
          )}
          {requiredMissingCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "2px 10px",
              border: "1px solid rgba(220,38,38,0.20)", background: "rgba(220,38,38,0.08)", color: "#dc2626",
            }}>
              {requiredMissingCount} required missing
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          AI MODELS
      ══════════════════════════════════════════════════ */}
      <SectionLabel emoji="🤖" label="AI Models" desc="Script generation · topic validation · research" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginTop: 8, marginBottom: 20 }}>
        <ApiCard
          {...cp("claude", LS_KEY_CLAUDE)}
          name="Anthropic Claude" model="claude-sonnet-4-6"
          mainBadge="Recommended"
          mainBadgeStyle={{ background: "rgba(217,119,6,0.10)", borderColor: "rgba(217,119,6,0.20)", color: "#d97706" }}
          showRequiredBadge requiredLabel="Required"
          description="Micro Content · Long Content · Podcast — primary script writer"
          tags={["Micro S4", "Long S6", "Podcast S8"]}
          placeholder="sk-ant-api03-••••••••••••••••"
          docsUrl="https://console.anthropic.com"
        />

        <ApiCard
          {...cp("google", LS_KEY_GOOGLE)}
          name="Google Gemini" model="gemini-2.5-flash"
          mainBadge="Research Engine"
          mainBadgeStyle={{ background: "rgba(37,99,235,0.10)", borderColor: "rgba(37,99,235,0.20)", color: "rgb(var(--accent))" }}
          showRequiredBadge requiredLabel="Required"
          description="Topic discovery · validation · med check — fast research engine"
          tags={["All S1", "All S2", "All S3/S5"]}
          placeholder="AIza••••••••••••••••••••••••"
          docsUrl="https://aistudio.google.com"
        />

        <ApiCard
          {...cp("gpt", LS_KEY_GPT)}
          name="OpenAI GPT-4" model="gpt-4o-mini"
          mainBadge="Fallback Only"
          mainBadgeStyle={{ background: "rgb(var(--panel-soft))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-faint))" }}
          showRequiredBadge requiredLabel="Optional"
          description="All pipelines — fallback when Claude is unavailable"
          tags={["All pipelines fallback"]}
          placeholder="sk-proj-••••••••••••••••"
          docsUrl="https://platform.openai.com"
        />
      </div>

      {/* ══════════════════════════════════════════════════
          RESEARCH DATA + MEDICAL VERIFICATION — labels row
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 8 }}>
        <SectionLabel emoji="📊" label="Research Data" desc="Topic discovery · competitor analysis" />
        <div className="col-span-1 lg:col-span-2">
          <SectionLabel emoji="🏥" label="Medical Verification" desc="Evidence scoring · PubMed research" />
        </div>
      </div>

      {/* ── Data cards row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginBottom: 20 }}>

        {/* YouTube — col 1 */}
        <ApiCard
          {...cp("youtube", LS_KEY_YOUTUBE)}
          name="YouTube Data API v3" model="Google Cloud"
          mainBadge={stored.youtube ? "Connected" : "Required"}
          mainBadgeStyle={stored.youtube
            ? { background: "rgba(22,163,74,0.10)", borderColor: "rgba(22,163,74,0.20)", color: "#16a34a" }
            : { background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.20)", color: "#dc2626" }}
          showRequiredBadge={false}
          requiredLabel="Required"
          description="Competitor video analysis · CTR signals · trending topics"
          tags={["Micro S1 S2", "Long S1 S2 S3", "Podcast S1 S2"]}
          pipelineNote="Replaces Google Trends — more reliable trending data"
          placeholder="AIza••••••••••••••••••••••••"
          docsUrl="https://console.cloud.google.com"
        />

        {/* PubMed — col 2 */}
        <ApiCard
          {...cp("pubmed", LS_KEY_PUBMED)}
          name="PubMed / NCBI" model="E-utilities API"
          mainBadge={stored.pubmed ? "Connected" : "Required · Free"}
          mainBadgeStyle={stored.pubmed
            ? { background: "rgba(22,163,74,0.10)", borderColor: "rgba(22,163,74,0.20)", color: "#16a34a" }
            : { background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.20)", color: "#dc2626" }}
          showRequiredBadge={false}
          requiredLabel="Required · Free"
          description="Evidence gate — minimum 3 studies required per topic. Zero studies = topic blocked."
          tags={["Micro S2 S3", "Long S2 S5", "Podcast S2 S5"]}
          placeholder="ncbi-api-key-••••••••••••••••"
          extraNote="Free from NCBI. Without key: 3 req/s. With key: 10 req/s."
          docsUrl="https://www.ncbi.nlm.nih.gov/account/"
        />

        {/* Cochrane + DOAJ — col 3 stacked; flex-row on md; flex-col on lg */}
        <div className="col-span-full lg:col-span-1 flex flex-col md:flex-row lg:flex-col gap-2">
          <CompactAutoCard
            name="Cochrane Library" model="REST API"
            description="Gold standard systematic reviews. One Cochrane review = Grade A evidence boost."
            tags={["Micro S3", "Long S5", "Podcast S5"]}
            activeNote="✓ Active — no API key required. Cochrane searches run automatically."
            style={{ flex: 1 }}
          />
          <CompactAutoCard
            name="DOAJ Validator" model="Open Access Journals"
            description="Predatory journal filter — rejects papers from non-indexed journals before they reach your scripts."
            tags={["Micro S3", "Long S5"]}
            activeNote="✓ Active — filters predatory journals automatically. No key needed."
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          REDDIT STRIP (full width, compact)
      ══════════════════════════════════════════════════ */}
      <RedditStrip />

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        marginTop: 12,
        borderRadius: 12, border: "0.5px solid rgb(var(--border))",
        background: "rgb(var(--panel))",
        padding: "12px 16px",
      }}>
        <ShieldCheck size={13} className="text-green-600" style={{ flexShrink: 0, marginTop: 1 }} />
        <p className="text-faint" style={{ fontSize: 11, lineHeight: 1.6 }}>
          Keys saved in{" "}
          <span className="font-mono" style={{ color: "rgb(var(--text-soft))" }}>localStorage</span>
          {" "}on this device.
          Lost if you clear browser data or switch profiles.
          Priority order:{" "}
          <span style={{ color: "rgb(var(--text-soft))" }}>Claude → Gemini → OpenAI → Demo mode.</span>
        </p>
      </div>

    </div>
  );
}

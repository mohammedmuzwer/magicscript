"use client";

import { Languages, Mic, Monitor, Ruler } from "lucide-react";
import { LANGUAGES, TONES, PLATFORMS, LENGTHS } from "@/lib/languages";

function Group({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-faint">
        <Icon size={13} className="text-cyan" /> {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-cyan/45 bg-cyan/12 text-cyan ring-1 ring-cyan/25"
          : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] text-soft hover:border-electric/40 hover:text-[rgb(var(--text))]"
      }`}
    >
      {children}
    </button>
  );
}

export default function SettingsPanel({ settings, onChange }) {
  const set = (k) => (v) => onChange({ ...settings, [k]: v });

  return (
    <div className="space-y-4">
      <Group icon={Languages} label="Output language">
        {LANGUAGES.map((l) => (
          <Pill
            key={l.code}
            active={settings.language === l.code}
            onClick={() => set("language")(l.code)}
            title={l.blurb}
          >
            {l.flag} {l.name}
          </Pill>
        ))}
      </Group>

      <Group icon={Mic} label="Content tone">
        {TONES.map((t) => (
          <Pill
            key={t.id}
            active={settings.tone === t.id}
            onClick={() => set("tone")(t.id)}
            title={t.desc}
          >
            {t.emoji} {t.label}
          </Pill>
        ))}
      </Group>

      <Group icon={Monitor} label="Platform">
        {PLATFORMS.map((p) => (
          <Pill
            key={p.id}
            active={settings.platform === p.id}
            onClick={() => set("platform")(p.id)}
            title={p.ratio}
          >
            {p.emoji} {p.label}
          </Pill>
        ))}
      </Group>

      <Group icon={Ruler} label="Content length">
        {LENGTHS.map((l) => (
          <Pill
            key={l.id}
            active={settings.length === l.id}
            onClick={() => set("length")(l.id)}
            title={l.desc}
          >
            {l.label}
          </Pill>
        ))}
      </Group>
    </div>
  );
}

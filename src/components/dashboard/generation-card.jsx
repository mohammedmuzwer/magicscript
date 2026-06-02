import Link from "next/link";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { VerdictBadge } from "@/components/ui/badges";
import { getLanguage, getPlatform } from "@/lib/languages";
import { timeAgo, verdictStyle } from "@/lib/utils";

export default function GenerationCard({ gen }) {
  const lang = getLanguage(gen.language);
  const platform = getPlatform(gen.platform);
  const s = verdictStyle(gen.verdict);
  const href = `/dashboard/generate?topic=${encodeURIComponent(gen.topic)}&lang=${gen.language}&tone=${gen.tone}&platform=${gen.platform}`;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-faint">
          <span>{lang.flag} {lang.name}</span>
          <span className="text-faint/50">·</span>
          <span>{platform.emoji} {platform.label}</span>
        </div>
        {gen.saved && <Bookmark size={14} className="fill-cyan text-cyan" />}
      </div>

      <h3 className="font-display text-sm font-bold leading-snug line-clamp-2">
        {gen.topic}
      </h3>

      <div className="mt-auto flex items-center justify-between gap-2">
        <VerdictBadge verdict={gen.verdict} size="sm" />
        <span className={`font-display text-xs font-bold ${s.text}`}>
          {gen.confidence}%
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-2.5">
        <span className="text-[11px] text-faint">{timeAgo(gen.createdAt)}</span>
        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-cyan opacity-0 transition group-hover:opacity-100">
          Open <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  );
}

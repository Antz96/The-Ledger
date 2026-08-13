"use client";

import { useMemo } from "react";
import { BookOpen, ExternalLink } from "lucide-react";

const FOCUS_LABELS = {
  credit: "credit",
  saving: "saving",
  debt: "paying off debt",
  investing: "investing",
};

export default function RecommendedForYou({ tags, articles }) {
  const matches = useMemo(() => {
    const tagSet = new Set(tags || []);
    if (tagSet.size === 0 || !articles?.length) return [];

    const overlaps = articles.filter((a) => (a.tags || []).some((t) => tagSet.has(t)));

    const wantsSimple = tagSet.has("content-simple");
    const wantsDeep = tagSet.has("content-deep");
    let filtered = overlaps;
    if (wantsSimple && !wantsDeep) filtered = overlaps.filter((a) => a.content_level !== "deep");
    else if (wantsDeep && !wantsSimple) filtered = overlaps.filter((a) => a.content_level !== "simple");
    if (filtered.length === 0) filtered = overlaps;

    return filtered
      .slice()
      .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
      .slice(0, 6);
  }, [tags, articles]);

  if (matches.length === 0) return null;

  const focusTag = (tags || []).find((t) => FOCUS_LABELS[t]);
  const heading = focusTag ? `Because you're focused on ${FOCUS_LABELS[focusTag]}` : "Recommended reading";

  return (
    <div className="ledger-card p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={16} style={{ color: "var(--ledger-green-soft)" }} />
        <p className="serif text-sm tracking-wide opacity-80">{heading}</p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matches.map((a) => (
          <li key={a.id}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full p-3 rounded border hover:bg-[#EAE4D2] transition-colors"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium leading-snug">{a.title}</p>
                <ExternalLink size={12} className="opacity-40 mt-1 shrink-0" />
              </div>
              <p className="text-xs opacity-60 leading-snug mb-2">{a.summary}</p>
              <p className="text-[10px] mono opacity-40">{a.source_name}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

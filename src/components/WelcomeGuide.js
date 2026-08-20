"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ExternalLink, LifeBuoy } from "lucide-react";
import { SECTIONS } from "@/lib/navSections";
import { getNextStepSuggestions, EXTERNAL_DEBT_RESOURCES } from "@/lib/nextStepSuggestions";

export default function WelcomeGuide({ displayName, tags }) {
  const router = useRouter();
  const { needsExternalSupport, items: suggestions } = getNextStepSuggestions(tags);

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <p className="serif text-2xl sm:text-3xl font-semibold text-[var(--text)] mb-2">
          You&apos;re all set{displayName ? `, ${displayName}` : ""}.
        </p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Here&apos;s what each part of The Ledger does. Jump into whichever one you&apos;re curious about, or head
          straight to your Dashboard.
        </p>
      </div>

      {needsExternalSupport && (
        <div className="ledger-card p-4 sm:p-5 max-w-xl mx-auto" style={{ borderColor: "rgba(34,211,238,0.3)" }}>
          <div className="flex items-start gap-2 mb-3">
            <LifeBuoy size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--cyan)" }} />
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              You mentioned you might need more support with debt than a calculator can give. These are free,
              independent, and not affiliated with Ledger — worth a look alongside anything in here.
            </p>
          </div>
          <ul className="space-y-1.5 pl-6">
            {EXTERNAL_DEBT_RESOURCES.map((r) => (
              <li key={r.name} className="text-sm">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium"
                  style={{ color: "var(--ledger-green-soft)" }}
                >
                  {r.name} <ExternalLink size={11} />
                </a>
                <span className="text-[var(--faint)]"> — {r.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] mono opacity-50 mb-2 text-center">BASED ON WHAT YOU TOLD US</p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="ledger-card p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-[var(--panel-hi)] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{s.label}</p>
                  <p className="text-xs text-[var(--faint)]">{s.reason}</p>
                </div>
                <ArrowRight size={15} className="flex-shrink-0 opacity-40" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="ledger-card p-4 sm:p-5 flex items-start gap-3 hover:bg-[var(--panel-hi)] transition-colors"
          >
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", color: "var(--obsidian)" }}
            >
              <s.Icon size={16} />
            </span>
            <div>
              <p className="serif text-sm font-medium text-[var(--text)] mb-0.5">{s.label}</p>
              <p className="text-xs text-[var(--faint)] leading-relaxed">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => router.replace("/dashboard")}
          className="flex items-center justify-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-lg text-[var(--obsidian)]"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
        >
          Go to Dashboard <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

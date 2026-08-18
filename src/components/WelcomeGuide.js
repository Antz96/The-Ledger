"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SECTIONS } from "@/lib/navSections";

export default function WelcomeGuide({ displayName }) {
  const router = useRouter();

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

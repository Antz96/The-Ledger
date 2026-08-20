"use client";

import Link from "next/link";
import { ArrowLeft, FileWarning } from "lucide-react";

export default function LegalPage({ title, lastUpdated, children }) {
  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100dvh" }}>
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] mb-8">
          <ArrowLeft size={13} /> Back to The Ledger
        </Link>

        <div className="ledger-card p-4 sm:p-5 mb-8" style={{ borderColor: "rgba(242,99,122,0.35)" }}>
          <div className="flex items-start gap-2.5">
            <FileWarning size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              <span className="text-[var(--text)] font-medium">Draft — not yet reviewed by a lawyer.</span> This is a
              working draft prepared for legal review before public launch, not a final legal document you should
              rely on. Sections marked <span className="mono">[PLACEHOLDER]</span> need founder- or
              counsel-supplied details filled in first.
            </p>
          </div>
        </div>

        <h1 className="serif text-2xl sm:text-3xl font-semibold text-[var(--text)] mb-1">{title}</h1>
        <p className="text-xs mono text-[var(--faint)] mb-8">Last updated: {lastUpdated} · Draft v0.1</p>

        <div className="space-y-8 text-sm text-[var(--muted)] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="serif text-base text-[var(--text)] mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function Placeholder({ children }) {
  return (
    <span
      className="mono text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: "rgba(242,99,122,0.12)", color: "var(--rust)" }}
    >
      [PLACEHOLDER: {children}]
    </span>
  );
}

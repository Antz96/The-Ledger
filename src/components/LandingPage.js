"use client";

import { Wallet, PieChart, Compass, Target, ShieldAlert, ArrowDown } from "lucide-react";
import { EXPLORER_CATEGORIES, RISK_COLOR } from "@/lib/explorerCategories";
import AuthForm from "@/components/AuthForm";

// The blueprint's own worked example (§7's Wealth Map figures) — illustrative,
// not live data, since a visitor hasn't signed up yet.
const WEALTH_MAP_EXAMPLE = [
  { name: "Safety", pct: 35, color: "var(--emerald)" },
  { name: "Growth", pct: 30, color: "var(--gold)" },
  { name: "Income", pct: 15, color: "var(--cyan)" },
  { name: "Speculation", pct: 20, color: "var(--rust)" },
];

const FEATURES = [
  {
    Icon: Wallet,
    title: "See everything in one place",
    desc: "Every account, asset, and debt — pulled together into one net worth figure you can actually see.",
  },
  {
    Icon: PieChart,
    title: "Understand what your money is doing",
    desc: "Not just where it sits, but what job it's doing: protecting you, growing, generating income, or higher-risk.",
  },
  {
    Icon: Compass,
    title: "Explore your options",
    desc: "Browse categories by risk, liquidity, and time horizon — compare before you commit to anything.",
  },
  {
    Icon: Target,
    title: "Track real progress",
    desc: "Set a goal, and see whether you're actually on track — not just where you started.",
  },
];

// Three representative categories from the real Explorer dataset, so this
// preview can never drift out of sync with what's actually in the product.
const PREVIEW_CATEGORY_IDS = ["cash-protection", "long-term-investing", "higher-risk"];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100dvh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <span
              className="w-[22px] h-[22px] rounded-[7px] flex-shrink-0"
              style={{
                background: "linear-gradient(140deg, var(--emerald), var(--cyan))",
                boxShadow: "0 0 14px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            />
            <p className="serif text-lg font-semibold text-[var(--text)]">The Ledger</p>
          </div>
          <h1 className="serif text-3xl sm:text-5xl font-semibold text-[var(--text)] mb-6 leading-tight" style={{ textWrap: "balance" }}>
            Know what you have.<br />Know your options.<br />Build what comes next.
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-md mx-auto mb-8 leading-relaxed">
            A clear, calm picture of your money — what you own, what it&apos;s for, and what&apos;s actually out
            there. No sales pitch, no advice, just your numbers and your options.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 20px rgba(34,211,238,0.25)" }}
          >
            Get started <ArrowDown size={14} />
          </a>
        </section>

        {/* How Ledger works */}
        <section className="mb-20">
          <p className="serif text-sm tracking-wide text-[var(--muted)] text-center mb-6">How Ledger works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="ledger-card p-5">
                <Icon size={18} style={{ color: "var(--emerald)" }} className="mb-3" />
                <p className="text-sm font-medium text-[var(--text)] mb-1.5">{title}</p>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Wealth Map preview */}
        <section className="mb-20">
          <div className="ledger-card p-5 sm:p-6">
            <p className="serif text-sm tracking-wide text-[var(--text)] mb-1">See your wealth by purpose, not just by account</p>
            <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
              Cash in the bank and cash in an index fund aren&apos;t doing the same job. Ledger groups everything by
              what it&apos;s actually for.
            </p>
            <div className="h-3 w-full rounded-full overflow-hidden flex mb-3" style={{ background: "var(--panel-hi)" }}>
              {WEALTH_MAP_EXAMPLE.map((seg) => (
                <div key={seg.name} style={{ width: `${seg.pct}%`, background: seg.color }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {WEALTH_MAP_EXAMPLE.map((seg) => (
                <span key={seg.name} className="text-xs mono text-[var(--muted)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: seg.color }} />
                  {seg.name} {seg.pct}%
                </span>
              ))}
            </div>
            <p className="text-[10px] mono opacity-40 mt-4">EXAMPLE — NOT YOUR DATA</p>
          </div>
        </section>

        {/* Explorer preview */}
        <section className="mb-20">
          <p className="serif text-sm tracking-wide text-[var(--text)] mb-1 text-center">Compare your options before you commit to anything</p>
          <p className="text-xs text-[var(--muted)] mb-6 text-center max-w-md mx-auto leading-relaxed">
            Filter by risk, liquidity, purpose, and time horizon — see what&apos;s out there before deciding
            anything.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PREVIEW_CATEGORY_IDS.map((id) => {
              const cat = EXPLORER_CATEGORIES.find((c) => c.id === id);
              return (
                <div key={id} className="ledger-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--text)]">{cat.title}</p>
                    <div className="flex gap-1">
                      {cat.risk.map((r) => (
                        <span
                          key={r}
                          className="text-[10px] mono px-1.5 py-0.5 rounded"
                          style={{ background: `${RISK_COLOR[r]}1A`, color: RISK_COLOR[r] }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{cat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Educational positioning */}
        <section className="mb-20">
          <div className="ledger-card p-5 sm:p-6" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                Ledger is built around one question: <span className="text-[var(--text)]">&ldquo;I have £X — what are my options?&rdquo;</span> Not
                &ldquo;what should I invest in?&rdquo; We explain, organise, and compare. We don&apos;t tell you what
                to buy, and nothing here is personalised financial advice.
              </p>
            </div>
          </div>
        </section>

        {/* CTA / auth */}
        <section id="get-started" className="text-center">
          <p className="serif text-sm tracking-wide text-[var(--muted)] mb-6">Ready to see your own numbers?</p>
        </section>
      </div>

      <AuthForm />
    </div>
  );
}

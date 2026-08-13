"use client";

import { ShieldAlert } from "lucide-react";
import { fmt, currencySymbol } from "@/lib/ledgerConstants";

const ROWS = [
  { key: "low", label: "Low risk", desc: "Savings accounts, CDs, money market", color: "var(--ledger-green-soft)" },
  { key: "medium", label: "Medium risk", desc: "Index funds (e.g. S&P 500), diversified ETFs", color: "var(--gold)" },
  { key: "high", label: "High risk", desc: "Individual stocks, crypto", color: "var(--rust)" },
];

export default function AllocateTab({ alloc, onUpdate }) {
  const allocSum = alloc.low + alloc.medium + alloc.high;
  const allocDollars = {
    low: (alloc.monthly * alloc.low) / 100,
    medium: (alloc.monthly * alloc.medium) / 100,
    high: (alloc.monthly * alloc.high) / 100,
  };

  return (
    <div className="space-y-6">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Monthly savings to allocate</p>
        <p className="text-xs mono opacity-50 mb-3">How much do you set aside each month, and how should it split across risk tiers?</p>
        <div className="flex items-center gap-2 mb-5">
          <label htmlFor="allocate-monthly" className="mono text-sm">{currencySymbol()}</label>
          <input
            id="allocate-monthly"
            aria-label="Monthly amount to allocate"
            type="number" min="0"
            value={alloc.monthly}
            onChange={(e) => onUpdate("monthly", Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-32 border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
          <span className="text-xs opacity-50">/ month</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.key} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span id={`allocate-${row.key}-label`} className="text-sm font-medium">{row.label}</span>
                <span className="text-xs opacity-50 mono ml-2">{row.desc}</span>
              </div>
              <span className="mono text-sm" style={{ color: row.color }}>{alloc[row.key]}% · {fmt(allocDollars[row.key])}</span>
            </div>
            <input
              type="range" min="0" max="100"
              aria-labelledby={`allocate-${row.key}-label`}
              aria-valuetext={`${alloc[row.key]}%, ${fmt(allocDollars[row.key])}`}
              value={alloc[row.key]}
              onChange={(e) => onUpdate(row.key, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
        <div className={`text-xs mono mt-2 ${allocSum === 100 ? "opacity-50" : ""}`} style={{ color: allocSum === 100 ? undefined : "var(--rust)" }}>
          {allocSum === 100 ? `Totals 100% — ${fmt(alloc.monthly)}/month allocated.` : `Totals ${allocSum}% — adjust sliders so they add to 100%.`}
        </div>
      </div>
      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            This planner just does the arithmetic on percentages you choose — it isn&apos;t investment advice, and this
            isn&apos;t a licensed financial advisor. How you split money across risk tiers depends on your age,
            timeline, debt, and risk tolerance. Consider talking to a fee-only fiduciary advisor for guidance
            specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

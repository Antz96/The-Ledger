"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import { EXPLORER_CATEGORIES, RISK_FILTERS } from "@/lib/explorerCategories";

const RISK_COLOR = { Low: "var(--ledger-green-soft)", Medium: "var(--gold)", High: "var(--rust)" };

export default function ExplorerTab() {
  const [amount, setAmount] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const visible = useMemo(
    () => EXPLORER_CATEGORIES.filter((c) => riskFilter === "All" || c.risk.includes(riskFilter)),
    [riskFilter]
  );

  const amountNum = parseFloat(amount);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Explorer</p>
        <p className="text-xs opacity-50 mb-4">How much are you looking to allocate? Explore the categories that might be relevant.</p>

        <div className="flex items-center gap-2 mb-5">
          <span className="mono text-sm">£</span>
          <input
            type="number" min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            className="w-32 border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
          {amountNum > 0 && <span className="text-xs opacity-50">Exploring options for {fmt(amountNum)}</span>}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={
                riskFilter === r
                  ? { background: "var(--ledger-green)", color: "#F7F3E8", borderColor: "var(--ledger-green)" }
                  : { borderColor: "var(--line)", color: "var(--ink)", opacity: 0.7 }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((cat) => (
          <div key={cat.id} className="ledger-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="serif text-sm">{cat.title}</p>
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
            <p className="text-xs opacity-70 leading-relaxed mb-3">{cat.description}</p>
            <ul className="text-xs space-y-1 opacity-80 list-disc pl-4">
              {cat.examples.map((ex) => <li key={ex}>{ex}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            These are educational examples to explore, not a recommendation — nothing here is automatically
            suitable for you. What fits depends on your goals, timeline, and risk tolerance. Consider talking to
            a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

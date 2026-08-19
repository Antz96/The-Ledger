"use client";

import { useMemo, useState } from "react";
import { ScrollText, Pencil, X, Check } from "lucide-react";
import { fmt, todayKey } from "@/lib/ledgerConstants";
import {
  monthlyTotals,
  monthlyFlow,
  liquidCash,
  savingsRatePct,
  evaluateConstitutionRule,
} from "@/lib/financialCalculations";

// Always the real calendar month, independent of whatever month the user
// happens to be browsing in the Ledger tab — the Constitution tracks "now",
// not history.
const RULES = [
  {
    key: "savings_rate_target_pct",
    label: "Savings rate",
    direction: "min",
    metLabel: "Met",
    missLabel: "Below target",
    formatTarget: (v) => `${v}%`,
    formatActual: (v) => `${v.toFixed(0)}%`,
  },
  {
    key: "cash_buffer_target",
    label: "Cash buffer",
    direction: "min",
    metLabel: "Met",
    missLabel: "Below target",
    formatTarget: fmt,
    formatActual: fmt,
  },
  {
    key: "discretionary_monthly_target",
    label: "Discretionary spend cap",
    direction: "max",
    metLabel: "Within target",
    missLabel: "Above target",
    formatTarget: fmt,
    formatActual: fmt,
  },
];

export default function ConstitutionTab({ constitution, transactions, assets, onSave }) {
  const currentMonth = todayKey();
  const [editing, setEditing] = useState(!constitution);
  const [draft, setDraft] = useState({
    savings_rate_target_pct: constitution?.savings_rate_target_pct ?? "",
    cash_buffer_target: constitution?.cash_buffer_target ?? "",
    discretionary_monthly_target: constitution?.discretionary_monthly_target ?? "",
    priorities: constitution?.priorities ?? "",
  });

  const actuals = useMemo(() => {
    const monthly = monthlyTotals(transactions, currentMonth);
    const flow = monthlyFlow(transactions, currentMonth);
    return {
      savings_rate_target_pct: savingsRatePct(monthly.income, monthly.savings),
      cash_buffer_target: liquidCash(assets),
      discretionary_monthly_target: flow.discretionary,
    };
  }, [transactions, assets, currentMonth]);

  const evaluations = useMemo(
    () =>
      RULES.map((rule) => {
        const target = constitution?.[rule.key] != null ? Number(constitution[rule.key]) : null;
        const actual = actuals[rule.key];
        return { ...rule, actual, target, result: evaluateConstitutionRule(actual, target, rule.direction) };
      }),
    [constitution, actuals]
  );

  const activeRules = evaluations.filter((e) => e.target !== null);
  const hasAnyRule = activeRules.length > 0 || (constitution?.priorities || "").trim().length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      savings_rate_target_pct: draft.savings_rate_target_pct === "" ? null : parseFloat(draft.savings_rate_target_pct),
      cash_buffer_target: draft.cash_buffer_target === "" ? null : parseFloat(draft.cash_buffer_target),
      discretionary_monthly_target:
        draft.discretionary_monthly_target === "" ? null : parseFloat(draft.discretionary_monthly_target),
      priorities: draft.priorities.trim(),
    });
    setEditing(false);
  }

  function startEditing() {
    setDraft({
      savings_rate_target_pct: constitution?.savings_rate_target_pct ?? "",
      cash_buffer_target: constitution?.cash_buffer_target ?? "",
      discretionary_monthly_target: constitution?.discretionary_monthly_target ?? "",
      priorities: constitution?.priorities ?? "",
    });
    setEditing(true);
  }

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1 flex items-center gap-1.5">
          <ScrollText size={15} /> Your financial constitution
        </p>
        <p className="text-xs text-[var(--faint)]">
          Rules you set for yourself — Ledger tracks you against them. It&apos;s not advice, just a mirror: your plan,
          your numbers, side by side.
        </p>
      </div>

      {!editing && hasAnyRule && (
        <>
          {activeRules.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeRules.map((e) => (
                <div key={e.key} className="ledger-card p-4 sm:p-5">
                  <p className="text-xs text-[var(--muted)] mb-2">{e.label}</p>
                  <p className="text-[10px] mono opacity-50 mb-1">YOU SET</p>
                  <p className="text-sm mono text-[var(--text)] mb-2">{e.formatTarget(e.target)}</p>
                  <p className="text-[10px] mono opacity-50 mb-1">THIS MONTH</p>
                  <p className="text-sm mono text-[var(--text)] mb-2">
                    {e.actual === null ? "—" : e.formatActual(e.actual)}
                  </p>
                  {e.result && (
                    <span
                      className="text-[10px] mono px-2 py-0.5 rounded-full inline-block"
                      style={{
                        color: e.result.met ? "var(--emerald)" : "var(--rust)",
                        background: e.result.met ? "rgba(15,185,129,0.1)" : "rgba(242,99,122,0.1)",
                      }}
                    >
                      {e.result.met ? e.metLabel : e.missLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {constitution?.priorities && (
            <div className="ledger-card p-4 sm:p-5">
              <p className="text-[10px] mono opacity-50 mb-1.5">YOUR PRIORITIES</p>
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{constitution.priorities}</p>
            </div>
          )}

          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-[var(--faint)] hover:text-[var(--text)] border border-[var(--line)]"
          >
            <Pencil size={12} /> Edit your rules
          </button>
        </>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="ledger-card p-4 sm:p-5 space-y-3">
          <p className="serif text-sm tracking-wide opacity-80">Set your rules</p>
          <p className="text-xs text-[var(--faint)] mb-1">Leave any of these blank to skip tracking it.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="cons-savings-rate" className="block text-[10px] mono opacity-60 mb-1">
                SAVINGS RATE TARGET (% of income)
              </label>
              <input
                id="cons-savings-rate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={draft.savings_rate_target_pct}
                onChange={(e) => setDraft((d) => ({ ...d, savings_rate_target_pct: e.target.value }))}
                placeholder="e.g. 20"
                className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
            </div>
            <div>
              <label htmlFor="cons-cash-buffer" className="block text-[10px] mono opacity-60 mb-1">
                CASH BUFFER TARGET
              </label>
              <input
                id="cons-cash-buffer"
                type="number"
                min="0"
                step="1"
                value={draft.cash_buffer_target}
                onChange={(e) => setDraft((d) => ({ ...d, cash_buffer_target: e.target.value }))}
                placeholder="e.g. 6000"
                className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
            </div>
            <div>
              <label htmlFor="cons-discretionary" className="block text-[10px] mono opacity-60 mb-1">
                DISCRETIONARY SPEND CAP / MONTH
              </label>
              <input
                id="cons-discretionary"
                type="number"
                min="0"
                step="1"
                value={draft.discretionary_monthly_target}
                onChange={(e) => setDraft((d) => ({ ...d, discretionary_monthly_target: e.target.value }))}
                placeholder="e.g. 600"
                className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cons-priorities" className="block text-[10px] mono opacity-60 mb-1">
              YOUR PRIORITIES (in your own words)
            </label>
            <textarea
              id="cons-priorities"
              rows={3}
              value={draft.priorities}
              onChange={(e) => setDraft((d) => ({ ...d, priorities: e.target.value }))}
              placeholder="e.g. Emergency fund first, then house deposit, then long-term investing."
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)] resize-none"
            />
          </div>

          <div className="flex gap-1.5 pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
              style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
            >
              <Check size={14} /> Save
            </button>
            {hasAnyRule && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Cancel editing"
                className="text-xs px-2 py-1.5 text-[var(--faint)] hover:text-[var(--text)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

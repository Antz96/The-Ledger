"use client";

import { useMemo } from "react";
import { ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { fmt, todayKey, lastNMonthKeys } from "@/lib/ledgerConstants";
import { netWorthChange, monthlyTotals, monthlyFlow, projectGoal } from "@/lib/financialCalculations";

// Purely directional — up/down reflects whether the number grew or shrank,
// not a judgment call. Net worth gets emerald/rust (it already carries that
// convention everywhere else in the app); income/spending stay neutral cyan
// so a bigger spending number doesn't visually read as "bad".
function ChangeRow({ label, change, tone = "neutral" }) {
  if (!change) return null;
  const up = change > 0;
  const arrowColor = tone === "networth" ? (up ? "var(--emerald)" : "var(--rust)") : "var(--cyan)";
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="flex items-center gap-1 text-sm mono text-[var(--text)]">
        <Arrow size={13} style={{ color: arrowColor }} />
        {fmt(Math.abs(change))}
      </span>
    </div>
  );
}

export default function KeyChanges({ transactions, financialGoals, netWorthSnapshots }) {
  const currentMonth = todayKey();
  const [previousMonth] = lastNMonthKeys(2, currentMonth);

  const nwChange = useMemo(() => netWorthChange(netWorthSnapshots, 30), [netWorthSnapshots]);

  const incomeChange = useMemo(() => {
    const current = monthlyTotals(transactions, currentMonth).income;
    const previous = monthlyTotals(transactions, previousMonth).income;
    return current - previous;
  }, [transactions, currentMonth, previousMonth]);

  const spendingChange = useMemo(() => {
    const current = monthlyFlow(transactions, currentMonth);
    const previous = monthlyFlow(transactions, previousMonth);
    return (current.essential + current.discretionary) - (previous.essential + previous.discretionary);
  }, [transactions, currentMonth, previousMonth]);

  const offTrackGoals = useMemo(
    () => (financialGoals || []).filter((g) => projectGoal(g).onTrack === false),
    [financialGoals]
  );

  const hasNetWorthChange = nwChange !== null && nwChange.change !== 0;
  const hasAnything = hasNetWorthChange || incomeChange !== 0 || spendingChange !== 0 || offTrackGoals.length > 0;

  return (
    <div className="ledger-card p-4 sm:p-5 mb-6">
      <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1 flex items-center gap-1.5">
        <Sparkles size={15} /> Key changes
      </p>
      <p className="text-xs text-[var(--faint)] mb-3">What&apos;s moved recently, based on what you&apos;ve logged.</p>

      {!hasAnything ? (
        <p className="text-xs text-[var(--faint)] mono py-4 text-center">
          Nothing notable to report yet — check back as more data comes in.
        </p>
      ) : (
        <div>
          {hasNetWorthChange && (
            <ChangeRow label={`Net worth, last ${nwChange.days} days`} change={nwChange.change} tone="networth" />
          )}
          <ChangeRow label="Income vs. last month" change={incomeChange} />
          <ChangeRow label="Spending vs. last month" change={spendingChange} />

          {offTrackGoals.length > 0 && (
            <div className="pt-2 mt-2 border-t" style={{ borderColor: "var(--line)" }}>
              <p className="text-[10px] mono opacity-50 mb-1.5">WORTH REVIEWING</p>
              <ul className="space-y-1">
                {offTrackGoals.map((g) => (
                  <li key={g.id} className="text-xs text-[var(--muted)]">
                    <span className="text-[var(--text)]">{g.name}</span> is behind its contribution schedule.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { fmt, currencySymbol } from "@/lib/ledgerConstants";
import { cashProjection, goalAccelerationEffect, investmentGrowthProjection } from "@/lib/scenarioLab";
import { simulateDebtPayoffStrategy, formatPayoffDate } from "@/lib/debtPayoff";
import NumberField from "@/components/ui/NumberField";

const HORIZONS = [
  { label: "1 year", months: 12 },
  { label: "3 years", months: 36 },
  { label: "5 years", months: 60 },
  { label: "10 years", months: 120 },
];

function ScenarioCard({ title, children }) {
  return (
    <div className="ledger-card p-3 sm:p-4" style={{ background: "var(--panel-hi)" }}>
      <p className="text-xs font-medium text-[var(--text)] mb-2">{title}</p>
      <div className="space-y-1 text-xs text-[var(--muted)]">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="opacity-70">{label}</span>
      <span className="mono text-[var(--text)]">{value}</span>
    </div>
  );
}

function formatProjected(date) {
  if (date === "reached") return "already there";
  if (!date) return "no monthly amount set";
  return formatPayoffDate(date);
}

// Wealth OS blueprint §8.2 — a sandbox for modeling what different paths
// would do to money that isn't committed anywhere yet: keep it as cash,
// put it toward a goal, model a debt strategy, or a long-term investment
// illustration. Every path is a calculation of the consequences of a
// choice the user is trying on, not Ledger picking a winner — no path is
// highlighted, ranked, or labeled "best".
export default function ScenarioLab({ alloc, financialGoals = [], liabilities = [] }) {
  const [amount, setAmount] = useState(alloc?.monthly || 0);
  const [horizonMonths, setHorizonMonths] = useState(60);
  const [goalId, setGoalId] = useState(financialGoals[0]?.id || "");
  const [growthRate, setGrowthRate] = useState(5);

  const horizonLabel = HORIZONS.find((h) => h.months === horizonMonths)?.label || `${horizonMonths} months`;
  const selectedGoal = financialGoals.find((g) => g.id === goalId);
  const trackedDebts = useMemo(() => liabilities.filter((l) => Number(l.balance) > 0), [liabilities]);

  const cashTotal = useMemo(() => cashProjection(amount, horizonMonths), [amount, horizonMonths]);
  const goalEffect = useMemo(
    () => (selectedGoal ? goalAccelerationEffect(selectedGoal, amount) : null),
    [selectedGoal, amount]
  );
  const debtBaseline = useMemo(
    () => (trackedDebts.length ? simulateDebtPayoffStrategy(trackedDebts, 0, "avalanche") : null),
    [trackedDebts]
  );
  const debtWithExtra = useMemo(
    () => (trackedDebts.length ? simulateDebtPayoffStrategy(trackedDebts, amount, "avalanche") : null),
    [trackedDebts, amount]
  );
  const growthTotal = useMemo(
    () => investmentGrowthProjection(amount, horizonMonths, growthRate),
    [amount, horizonMonths, growthRate]
  );

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-1 flex items-center gap-1.5">
        <FlaskConical size={15} /> Scenario lab
      </p>
      <p className="text-xs opacity-50 mb-4">
        Try different paths for money you haven&apos;t committed yet, and see what each would calculate to. This
        doesn&apos;t pick one for you — it just runs the numbers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="scenario-amount" className="block text-[10px] mono opacity-60 mb-1">MONTHLY AMOUNT TO MODEL</label>
          <div className="flex items-center gap-2">
            <span className="mono text-sm text-[var(--text)]">{currencySymbol()}</span>
            <NumberField
              id="scenario-amount"
              value={amount}
              onChange={setAmount}
              className="w-28 border border-[var(--line)] rounded-lg px-2 py-1.5 text-sm mono bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            />
            <span className="text-xs text-[var(--muted)]">/ month</span>
          </div>
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">OVER</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {HORIZONS.map((h) => (
              <button
                key={h.months}
                onClick={() => setHorizonMonths(h.months)}
                aria-pressed={horizonMonths === h.months}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={
                  horizonMonths === h.months
                    ? { background: "linear-gradient(140deg, var(--emerald), var(--cyan))", color: "var(--obsidian)", borderColor: "transparent" }
                    : { borderColor: "var(--line)", color: "var(--muted)" }
                }
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ScenarioCard title="Keep as cash">
          <Stat label={`${fmt(amount)}/mo × ${horizonLabel}`} value={fmt(cashTotal)} />
          <p className="opacity-60 pt-1">Stays fully accessible the whole time.</p>
        </ScenarioCard>

        <ScenarioCard title="Illustrative growth">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="opacity-70">Assumed annual rate</span>
            <div className="flex items-center gap-1">
              <NumberField
                value={growthRate}
                onChange={setGrowthRate}
                step="0.5"
                className="w-14 text-xs mono border rounded px-1.5 py-0.5 bg-[var(--panel-hi)] text-[var(--text)] text-right"
                style={{ borderColor: "var(--line)" }}
              />
              <span className="mono">%</span>
            </div>
          </div>
          <Stat label={`Over ${horizonLabel}`} value={`≈ ${fmt(growthTotal)}`} />
          <p className="opacity-60 pt-1">
            A hypothetical illustration at a rate you choose — not a forecast. Historical returns vary widely and
            nothing here is guaranteed.
          </p>
        </ScenarioCard>

        {financialGoals.length === 0 ? (
          <ScenarioCard title="Toward a goal">
            <p className="opacity-60">
              <Link href="/goals" className="underline hover:opacity-100">Add a goal</Link> to model putting this toward it.
            </p>
          </ScenarioCard>
        ) : (
          <ScenarioCard title="Toward a goal">
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              aria-label="Choose a goal to model"
              className="w-full text-xs border rounded px-1.5 py-1 mb-2 bg-[var(--panel-hi)] text-[var(--text)]"
              style={{ borderColor: "var(--line)" }}
            >
              {financialGoals.map((g) => <option key={g.id} value={g.id} style={{ color: "var(--obsidian-2)" }}>{g.name}</option>)}
            </select>
            {goalEffect && (
              <>
                <Stat label="Without this" value={formatProjected(goalEffect.baseline.projectedDate)} />
                <Stat label={`With +${fmt(amount)}/mo`} value={formatProjected(goalEffect.accelerated.projectedDate)} />
              </>
            )}
          </ScenarioCard>
        )}

        {trackedDebts.length === 0 ? (
          <ScenarioCard title="Toward debt (avalanche)">
            <p className="opacity-60">No tracked debts to model against.</p>
          </ScenarioCard>
        ) : (
          <ScenarioCard title="Toward debt (avalanche)">
            <Stat
              label="Without this"
              value={debtBaseline.monthsToDebtFree === null ? "50+ years" : `${debtBaseline.monthsToDebtFree} mo, ${fmt(debtBaseline.totalInterestPaid)} interest`}
            />
            <Stat
              label={`With +${fmt(amount)}/mo`}
              value={debtWithExtra.monthsToDebtFree === null ? "50+ years" : `${debtWithExtra.monthsToDebtFree} mo, ${fmt(debtWithExtra.totalInterestPaid)} interest`}
            />
          </ScenarioCard>
        )}
      </div>
    </div>
  );
}

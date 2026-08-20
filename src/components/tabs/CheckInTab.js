"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import { netWorth, netWorthChange, liquidCash } from "@/lib/financialCalculations";

// Deliberately the plain, low-detail counterpart to the Dashboard — no
// charts, no category breakdowns, no percentages. Aimed at the "I check
// occasionally" / "I don't really track it" crowd from the onboarding
// assessment (q_sustain_performance_tracking): three numbers and one
// plain-English sentence, nothing to interpret.
export default function CheckInTab({ assets, liabilities, netWorthSnapshots }) {
  const { totalAssets, totalLiabilities, netWorth: nw } = useMemo(
    () => netWorth(assets, liabilities),
    [assets, liabilities]
  );
  const cash = useMemo(() => liquidCash(assets), [assets]);
  const invested = totalAssets - cash;
  const change = useMemo(() => netWorthChange(netWorthSnapshots, 30), [netWorthSnapshots]);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-6 sm:p-8 text-center">
        <p className="text-xs mono opacity-50 mb-2">WHAT YOU&apos;RE WORTH, RIGHT NOW</p>
        <p className="serif text-4xl sm:text-5xl mb-3" style={{ color: nw >= 0 ? "var(--text)" : "var(--rust)" }}>
          {fmt(nw)}
        </p>
        <Trend change={change} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SimpleStat label="In the bank" value={cash} />
        <SimpleStat label="Invested" value={invested} />
        <SimpleStat label="Owed" value={totalLiabilities} negative />
      </div>

      <div className="ledger-card p-4 sm:p-5 text-center">
        <p className="text-xs opacity-60 mb-2">Want the full picture — spending, goals, allocation?</p>
        <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--ledger-green-soft)" }}>
          Go to the full Dashboard →
        </Link>
      </div>

      <p className="text-[11px] mono opacity-40 text-center">
        Just the numbers from what you&apos;ve logged — nothing here is advice.
      </p>
    </div>
  );
}

function Trend({ change }) {
  if (!change) {
    return <p className="text-sm opacity-50">Check back in a few weeks to see how things are trending.</p>;
  }
  const { change: delta, days } = change;
  const period = days === 30 ? "the last month" : `the last ${days} days`;

  if (Math.abs(delta) < 1) {
    return (
      <p className="text-sm opacity-60 flex items-center justify-center gap-1.5">
        <Minus size={14} /> About the same as {period} ago.
      </p>
    );
  }

  const up = delta > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: up ? "var(--emerald)" : "var(--rust)" }}>
      <Icon size={14} /> {up ? "Up" : "Down"} {fmt(Math.abs(delta))} over {period}.
    </p>
  );
}

function SimpleStat({ label, value, negative }) {
  return (
    <div className="ledger-card p-4 sm:p-5 text-center">
      <p className="text-[10px] mono opacity-50 mb-1">{label.toUpperCase()}</p>
      <p className="text-xl font-semibold" style={{ color: negative && value > 0 ? "var(--rust)" : "var(--text)" }}>
        {fmt(value)}
      </p>
    </div>
  );
}

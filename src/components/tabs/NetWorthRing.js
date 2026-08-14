"use client";

import { useMemo } from "react";
import { fmt, PIE_COLORS } from "@/lib/ledgerConstants";

const RADIUS = 84;
const INNER_RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const INNER_CIRCUMFERENCE = 2 * Math.PI * INNER_RADIUS;

function segmentsFor(byCategory, total) {
  let cumulative = 0;
  return byCategory.map((c, i) => {
    const fraction = total > 0 ? c.value / total : 0;
    const length = fraction * CIRCUMFERENCE;
    const rotation = (cumulative / CIRCUMFERENCE) * 360;
    cumulative += length;
    return { ...c, length, rotation, color: PIE_COLORS[i % PIE_COLORS.length] };
  });
}

export default function NetWorthRing({ assetsByCategory, totalAssets, netWorth, goalPct }) {
  const segments = useMemo(() => segmentsFor(assetsByCategory, totalAssets), [assetsByCategory, totalAssets]);
  const clampedGoalPct = Math.max(0, Math.min(100, goalPct || 0));
  const goalLength = (clampedGoalPct / 100) * INNER_CIRCUMFERENCE;

  return (
    <div className="ledger-card p-4 sm:p-6 mb-6">
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <svg width="220" height="220" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }} role="img" aria-label={`Net worth ${fmt(netWorth)}`}>
            <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--panel-hi)" strokeWidth="11" />
            {segments.map((s) => (
              <circle
                key={s.name}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth="11"
                strokeDasharray={`${s.length} ${CIRCUMFERENCE}`}
                strokeDashoffset="0"
                transform={`rotate(${s.rotation} 100 100)`}
              />
            ))}
            <circle cx="100" cy="100" r={INNER_RADIUS} fill="none" stroke="var(--panel-hi)" strokeWidth="4" />
            <circle
              cx="100"
              cy="100"
              r={INNER_RADIUS}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${goalLength} ${INNER_CIRCUMFERENCE}`}
              strokeDashoffset="0"
              style={{ filter: "drop-shadow(0 0 5px rgba(217,180,74,0.55))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] mono text-[var(--muted)] uppercase tracking-widest mb-1.5">Net Worth</p>
            <p className="mono font-semibold text-[28px] text-[var(--text)] leading-none">{fmt(netWorth)}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-[10.5px] mono text-[var(--muted)]">
          {segments.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-sm" style={{ background: "var(--gold)" }} />
            Savings goal
          </span>
        </div>
      </div>
    </div>
  );
}

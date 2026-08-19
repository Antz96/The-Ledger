"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { fmt, currencySymbol, todayKey } from "@/lib/ledgerConstants";
import { monthlyTotals, allocationSplit } from "@/lib/financialCalculations";
import StatementUpload from "@/components/ui/StatementUpload";

const RISK_ROWS = [
  { key: "low", label: "Low risk", desc: "Savings accounts, CDs, money market", color: "var(--ledger-green-soft)" },
  { key: "medium", label: "Medium risk", desc: "Index funds (e.g. S&P 500), diversified ETFs", color: "var(--gold)" },
  { key: "high", label: "High risk", desc: "Individual stocks, crypto", color: "var(--rust)" },
];

// Multiplier to turn a pay-period amount into a monthly-equivalent figure.
const MONTHLY_MULTIPLIER = {
  weekly: 52 / 12,
  fortnightly: 26 / 12,
  "four-weekly": 13 / 12,
  monthly: 1,
  annual: 1 / 12,
  other: 1,
};

export default function AllocateTab({ alloc, onUpdateAlloc, transactions = [] }) {
  const [payslip, setPayslip] = useState(null);

  const thisMonthExpenses = useMemo(() => monthlyTotals(transactions, todayKey()).expense, [transactions]);

  const allocSum = alloc.low + alloc.medium + alloc.high;
  const allocDollars = allocationSplit(alloc);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1">Monthly savings to allocate</p>
        <p className="text-xs mono text-[var(--faint)] mb-3">How much do you set aside each month, and how should it split across risk tiers?</p>
        <div className="flex items-center gap-2 mb-5">
          <label htmlFor="allocate-monthly" className="mono text-sm text-[var(--text)]">{currencySymbol()}</label>
          <input
            id="allocate-monthly"
            aria-label="Monthly amount to allocate"
            type="number" min="0"
            value={alloc.monthly}
            onChange={(e) => onUpdateAlloc("monthly", Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-32 border border-[var(--line)] rounded-lg px-2 py-1.5 text-sm mono bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
          <span className="text-xs text-[var(--muted)]">/ month</span>
        </div>
        {RISK_ROWS.map((row) => (
          <div key={row.key} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span id={`allocate-${row.key}-label`} className="text-sm font-medium text-[var(--text)]">{row.label}</span>
                <span className="text-xs text-[var(--faint)] mono ml-2">{row.desc}</span>
              </div>
              <span className="mono text-sm" style={{ color: row.color }}>{alloc[row.key]}% · {fmt(allocDollars[row.key])}</span>
            </div>
            <input
              type="range" min="0" max="100"
              aria-labelledby={`allocate-${row.key}-label`}
              aria-valuetext={`${alloc[row.key]}%, ${fmt(allocDollars[row.key])}`}
              value={alloc[row.key]}
              onChange={(e) => onUpdateAlloc(row.key, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
        <div className="text-xs mono mt-2" style={{ color: allocSum === 100 ? "var(--muted)" : "var(--rust)" }}>
          {allocSum === 100 ? `Totals 100% — ${fmt(alloc.monthly)}/month allocated.` : `Totals ${allocSum}% — adjust sliders so they add to 100%.`}
        </div>
      </div>

      <div className="ledger-card overflow-hidden">
        {payslip ? (
          <PayslipBreakdown
            payslip={payslip}
            thisMonthExpenses={thisMonthExpenses}
            onUseAsMonthly={(amount) => onUpdateAlloc("monthly", Math.max(0, Math.round(amount)))}
            onDismiss={() => setPayslip(null)}
          />
        ) : (
          <StatementUpload
            kind="payslip"
            label="Not sure what's left over? Upload a payslip and I'll work it out"
            className="px-4 sm:px-5 py-3"
            onResult={setPayslip}
          />
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--faint)] px-1">
        This is just arithmetic on the percentages you choose — not a recommendation on how to split your money.
        Want to see what each risk tier could actually hold? <Link href="/explorer" className="underline hover:text-[var(--muted)]">Browse the Explorer.</Link>
      </p>
    </div>
  );
}

function PayslipBreakdown({ payslip, thisMonthExpenses, onUseAsMonthly, onDismiss }) {
  const period = payslip.payPeriod || "other";
  const multiplier = MONTHLY_MULTIPLIER[period] ?? 1;
  const monthlyNet = (Number(payslip.netPay) || 0) * multiplier;
  const leftover = monthlyNet - thisMonthExpenses;
  const deductions = payslip.deductions || [];

  return (
    <div className="px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--muted)]">Payslip breakdown ({period})</p>
        <button onClick={onDismiss} aria-label="Dismiss payslip breakdown" className="text-[var(--faint)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1.5 text-xs mb-3">
        {payslip.grossPay != null && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--faint)]">Gross pay</span>
            <span className="mono text-[var(--text)]">{fmt(payslip.grossPay)}</span>
          </div>
        )}
        {deductions.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[var(--faint)]">{d.label}</span>
            <span className="mono text-[var(--rust)]">−{fmt(d.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="text-[var(--muted)]">Net pay (as stated)</span>
          <span className="mono text-[var(--text)]">{fmt(payslip.netPay)}</span>
        </div>
        {multiplier !== 1 && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--faint)]">Monthly equivalent</span>
            <span className="mono text-[var(--text)]">{fmt(monthlyNet)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[var(--faint)]">Expenses logged this month</span>
          <span className="mono text-[var(--rust)]">−{fmt(thisMonthExpenses)}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="font-medium text-[var(--text)]">Left over to allocate</span>
          <span className="mono font-semibold" style={{ color: leftover >= 0 ? "var(--ledger-green-soft)" : "var(--rust)" }}>{fmt(leftover)}</span>
        </div>
      </div>

      <p className="text-[11px] text-[var(--faint)] leading-relaxed mb-3">
        This is arithmetic on what your payslip and logged expenses show — not advice on where this
        money should go. That choice is entirely yours.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUseAsMonthly(leftover)}
          disabled={leftover <= 0}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-50"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
        >
          Use {fmt(Math.max(0, leftover))} as my monthly amount
        </button>
        <button onClick={onDismiss} className="text-xs text-[var(--faint)] hover:text-[var(--text)] px-2">Dismiss</button>
      </div>
    </div>
  );
}

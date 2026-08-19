"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Wallet } from "lucide-react";
import { fmt, currencySymbol, monthLabel, PIE_COLORS } from "@/lib/ledgerConstants";
import { useMonthNav } from "@/lib/useMonthNav";
import { monthlyTotals, expensesByCategory, monthlyTrend, monthlyFlow } from "@/lib/financialCalculations";
import SummaryCard from "@/components/ui/SummaryCard";

const FLOW_SEGMENTS = [
  { key: "essential", label: "Essential", color: "var(--rust)" },
  { key: "discretionary", label: "Discretionary", color: "var(--gold)" },
  { key: "wealthBuilding", label: "Wealth-building", color: "var(--emerald)" },
  { key: "unallocated", label: "Unallocated", color: "var(--cyan)" },
];

export default function DashboardTab({ transactions, goal, onGoalSave, activeMonth, setActiveMonth }) {
  const { months, monthIndex, shiftMonth } = useMonthNav(transactions, activeMonth, setActiveMonth);
  const [goalDraft, setGoalDraft] = useState(String(goal));

  useEffect(() => setGoalDraft(String(goal)), [goal]);

  const totals = useMemo(() => monthlyTotals(transactions, activeMonth), [transactions, activeMonth]);
  const net = totals.net;

  const totalSaved = useMemo(() => monthlyTotals(transactions).savings, [transactions]);
  const goalPct = goal > 0 ? Math.min(100, (totalSaved / goal) * 100) : 0;

  const expenseByCategory = useMemo(() => expensesByCategory(transactions, activeMonth), [transactions, activeMonth]);

  const trend = useMemo(() => monthlyTrend(transactions, months.slice(-6)), [months, transactions]);

  const flow = useMemo(() => monthlyFlow(transactions, activeMonth), [transactions, activeMonth]);
  const overspent = flow.unallocated < 0;

  function handleGoalSave() {
    const g = parseFloat(goalDraft);
    if (!g || g <= 0) return;
    onGoalSave(g);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-hi)]"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="serif text-xl sm:text-2xl font-semibold text-[var(--text)]">{monthLabel(activeMonth)}</p>
          <p className="text-[11px] mono text-[var(--faint)]">page {monthIndex + 1} of {months.length}</p>
        </div>
        <button onClick={() => shiftMonth(1)} aria-label="Next month" className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-hi)]"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={<TrendingUp size={16} />} label="Income" value={fmt(totals.income)} color="var(--emerald)" />
        <SummaryCard icon={<TrendingDown size={16} />} label="Expenses" value={fmt(totals.expense)} color="var(--rust)" />
        <SummaryCard icon={<PiggyBank size={16} />} label="Saved" value={fmt(totals.savings)} color="var(--gold)" />
        <SummaryCard icon={<Wallet size={16} />} label="Left over" value={fmt(net)} color={net >= 0 ? "var(--emerald)" : "var(--rust)"} />
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1">Monthly flow</p>
        <p className="text-xs text-[var(--faint)] mb-3">How this month&apos;s income splits across essential spend, discretionary spend, and wealth-building.</p>
        {flow.income <= 0 ? (
          <p className="text-xs text-[var(--faint)] mono py-4 text-center">No income logged this month yet.</p>
        ) : overspent ? (
          <p className="text-xs" style={{ color: "var(--rust)" }}>
            Spent and saved {fmt(flow.essential + flow.discretionary + flow.wealthBuilding)} against {fmt(flow.income)} of income this month — {fmt(Math.abs(flow.unallocated))} more than came in.
          </p>
        ) : (
          <>
            <div className="h-3 w-full rounded-full overflow-hidden flex" style={{ background: "var(--panel-hi)" }}>
              {FLOW_SEGMENTS.map((s) => {
                const pct = (flow[s.key] / flow.income) * 100;
                return pct > 0 ? <div key={s.key} style={{ width: `${pct}%`, background: s.color }} title={`${s.label}: ${fmt(flow[s.key])}`} /> : null;
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {FLOW_SEGMENTS.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[var(--muted)]">{s.label}</span>
                  <span className="mono text-[var(--text)] ml-auto">{fmt(flow[s.key])}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="serif text-sm tracking-wide text-[var(--muted)]">Savings goal — all-time</p>
          <div className="flex items-center gap-2 text-xs mono text-[var(--muted)]">
            <label htmlFor="dashboard-goal-target" className="opacity-70">target</label><span>{currencySymbol()}</span>
            <input
              id="dashboard-goal-target"
              aria-label="Savings goal target amount"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={handleGoalSave}
              onKeyDown={(e) => e.key === "Enter" && handleGoalSave()}
              className="w-20 bg-transparent border-b border-[var(--line)] focus:outline-none focus:border-[var(--gold)] px-1 text-[var(--text)]"
            />
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--panel-hi)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${goalPct}%`, background: "linear-gradient(90deg, var(--gold), #f0d68a)", boxShadow: "0 0 10px rgba(217,180,74,0.5)" }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs mono text-[var(--muted)]">
          <span>{fmt(totalSaved)} saved</span><span>{goalPct.toFixed(0)}% of {fmt(goal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Spending by category — this month</p>
          {expenseByCategory.length === 0 ? (
            <p className="text-xs text-[var(--faint)] mono py-10 text-center">No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                  {expenseByCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    borderRadius: 8,
                    background: "var(--obsidian-2)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--muted)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Trend — last {trend.length} months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "var(--muted)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  borderRadius: 8,
                  background: "var(--obsidian-2)",
                  border: "1px solid var(--line)",
                  color: "var(--text)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--muted)" }} />
              <Bar dataKey="Income" fill="var(--emerald)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--rust)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Saved" fill="var(--gold)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

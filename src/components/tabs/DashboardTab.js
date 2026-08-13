"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Wallet } from "lucide-react";
import { fmt, currencySymbol, monthLabel, PIE_COLORS } from "@/lib/ledgerConstants";
import { useMonthNav } from "@/lib/useMonthNav";
import SummaryCard from "@/components/ui/SummaryCard";

export default function DashboardTab({ transactions, goal, onGoalSave, activeMonth, setActiveMonth }) {
  const { months, monthIndex, monthTx, shiftMonth } = useMonthNav(transactions, activeMonth, setActiveMonth);
  const [goalDraft, setGoalDraft] = useState(String(goal));

  useEffect(() => setGoalDraft(String(goal)), [goal]);

  const totals = useMemo(() => {
    const t = { income: 0, expense: 0, savings: 0 };
    monthTx.forEach((tx) => { t[tx.type] += Number(tx.amount) || 0; });
    return t;
  }, [monthTx]);
  const net = totals.income - totals.expense - totals.savings;

  const totalSaved = useMemo(
    () => transactions.filter((t) => t.type === "savings").reduce((s, t) => s + (Number(t.amount) || 0), 0),
    [transactions]
  );
  const goalPct = goal > 0 ? Math.min(100, (totalSaved / goal) * 100) : 0;

  const expenseByCategory = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] || 0) + (Number(t.amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const trend = useMemo(() => {
    const last6 = months.slice(-6);
    return last6.map((mk) => {
      const t = { income: 0, expense: 0, savings: 0 };
      transactions.filter((tx) => tx.date.slice(0, 7) === mk).forEach((tx) => { t[tx.type] += Number(tx.amount) || 0; });
      return { month: new Date(mk + "-01").toLocaleDateString("en-US", { month: "short" }), Income: t.income, Expense: t.expense, Saved: t.savings };
    });
  }, [months, transactions]);

  function handleGoalSave() {
    const g = parseFloat(goalDraft);
    if (!g || g <= 0) return;
    onGoalSave(g);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="serif text-xl sm:text-2xl">{monthLabel(activeMonth)}</p>
          <p className="text-[11px] mono opacity-50">page {monthIndex + 1} of {months.length}</p>
        </div>
        <button onClick={() => shiftMonth(1)} aria-label="Next month" className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={<TrendingUp size={16} />} label="Income" value={fmt(totals.income)} color="var(--ledger-green-soft)" />
        <SummaryCard icon={<TrendingDown size={16} />} label="Expenses" value={fmt(totals.expense)} color="var(--rust)" />
        <SummaryCard icon={<PiggyBank size={16} />} label="Saved" value={fmt(totals.savings)} color="var(--gold)" />
        <SummaryCard icon={<Wallet size={16} />} label="Left over" value={fmt(net)} color={net >= 0 ? "var(--ledger-green-soft)" : "var(--rust)"} />
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="serif text-sm tracking-wide opacity-80">Savings goal — all-time</p>
          <div className="flex items-center gap-2 text-xs mono">
            <label htmlFor="dashboard-goal-target" className="opacity-60">target</label><span>{currencySymbol()}</span>
            <input
              id="dashboard-goal-target"
              aria-label="Savings goal target amount"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={handleGoalSave}
              onKeyDown={(e) => e.key === "Enter" && handleGoalSave()}
              className="w-20 bg-transparent border-b border-[var(--line)] focus:outline-none focus:border-[var(--gold)] px-1"
            />
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-[#EDE7D6] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${goalPct}%`, background: "var(--gold)" }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs mono opacity-70">
          <span>{fmt(totalSaved)} saved</span><span>{goalPct.toFixed(0)}% of {fmt(goal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-3">Spending by category — this month</p>
          {expenseByCategory.length === 0 ? (
            <p className="text-xs opacity-50 mono py-10 text-center">No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {expenseByCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-3">Trend — last {trend.length} months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
              <Bar dataKey="Income" fill="var(--ledger-green-soft)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--rust)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Saved" fill="var(--gold)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

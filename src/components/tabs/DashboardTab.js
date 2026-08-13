"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Sector, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Wallet, Repeat, Check, Clock,
} from "lucide-react";
import { fmt, currencySymbol, monthKey, monthLabel, todayKey, PIE_COLORS } from "@/lib/ledgerConstants";
import { useMonthNav } from "@/lib/useMonthNav";
import { useMonthlySummary } from "@/lib/useMonthlySummary";
import { dueDateFor, ordinalDay } from "@/lib/recurringMaterializer";
import SummaryCard from "@/components/ui/SummaryCard";
import CountUp from "@/components/ui/CountUp";

const COMMITTED_COLORS = { Committed: "var(--ledger-green-soft)", Flexible: "var(--rust)" };

function ActiveSlice(props) {
  return <Sector {...props} outerRadius={props.outerRadius + 6} />;
}

export default function DashboardTab({ transactions, recurringItems = [], goal, onGoalSave, activeMonth, setActiveMonth, onGoToOutgoings }) {
  const { months, monthIndex, monthTx, shiftMonth } = useMonthNav(transactions, activeMonth, setActiveMonth);
  const [goalDraft, setGoalDraft] = useState(String(goal));
  const [donutMode, setDonutMode] = useState("category"); // "category" | "committed"
  const [activeSlice, setActiveSlice] = useState(null);
  const [pinnedSlice, setPinnedSlice] = useState(null);
  const [barMounted, setBarMounted] = useState(false);

  useEffect(() => setGoalDraft(String(goal)), [goal]);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const summary = useMonthlySummary(transactions, activeMonth);
  const net = summary.leftOver;

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

  const committedSplit = useMemo(() => {
    const rows = [
      { name: "Committed", value: summary.committedExpense },
      { name: "Flexible", value: summary.flexibleSpend },
    ].filter((r) => r.value > 0);
    return rows;
  }, [summary]);

  const donutData = donutMode === "category" ? expenseByCategory : committedSplit;
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);
  const shownSlice = pinnedSlice ?? activeSlice;

  const trend = useMemo(() => {
    const last6 = months.slice(-6);
    return last6.map((mk) => {
      const t = { income: 0, expense: 0, savings: 0 };
      transactions.filter((tx) => tx.date.slice(0, 7) === mk).forEach((tx) => {
        if (t[tx.type] !== undefined) t[tx.type] += Number(tx.amount) || 0;
      });
      return { month: new Date(mk + "-01").toLocaleDateString("en-US", { month: "short" }), Income: t.income, Expense: t.expense, Saved: t.savings };
    });
  }, [months, transactions]);

  // Flow band: how this month's income was used, as % of income.
  const flow = useMemo(() => {
    const income = summary.income;
    if (income <= 0) return null;
    const spentPct = Math.min(100, ((summary.expense + summary.savings) / income) * 100);
    const seg = (v) => Math.max(0, (v / income) * 100);
    return {
      overspent: net < 0,
      segments: [
        { key: "committed", label: "Committed", value: summary.committedExpense, pct: seg(summary.committedExpense), color: "var(--ledger-green-soft)" },
        { key: "flexible", label: "Flexible spend", value: summary.flexibleSpend, pct: seg(summary.flexibleSpend), color: "var(--rust)" },
        { key: "savings", label: "Saved", value: summary.savings, pct: seg(summary.savings), color: "var(--gold)" },
        { key: "left", label: "Left over", value: Math.max(0, net), pct: Math.max(0, 100 - spentPct), color: "transparent" },
      ].filter((s) => s.pct > 0.5),
    };
  }, [summary, net]);

  // Upcoming strip: each active recurring item's state for the viewed month.
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = useMemo(() => {
    return recurringItems
      .filter((i) => i.active && monthKey(i.created_at) <= activeMonth)
      .map((item) => {
        const due = dueDateFor(activeMonth, item.due_day);
        const tx = monthTx.find((t) => t.recurring_id === item.id);
        return { item, due, paid: Boolean(tx) && tx.date <= today };
      })
      .sort((a, b) => a.item.due_day - b.item.due_day);
  }, [recurringItems, activeMonth, monthTx, today]);

  function handleGoalSave() {
    const g = parseFloat(goalDraft);
    if (!g || g <= 0) return;
    onGoalSave(g);
  }

  const rise = (i) => ({ animationDelay: `${i * 70}ms` });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => shiftMonth(-1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="serif text-xl sm:text-2xl">{monthLabel(activeMonth)}</p>
          <p className="text-[11px] mono opacity-50">page {monthIndex + 1} of {months.length}</p>
        </div>
        <button onClick={() => shiftMonth(1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rise-in" style={rise(0)}>
          <SummaryCard icon={<TrendingUp size={16} />} label="Income" value={<CountUp value={summary.income} />}
            color="var(--ledger-green-soft)"
            sub={summary.committedIncome > 0 ? `${fmt(summary.committedIncome)} recurring` : null} />
        </div>
        <div className="rise-in" style={rise(1)}>
          <SummaryCard icon={<TrendingDown size={16} />} label="Expenses" value={<CountUp value={summary.expense} />}
            color="var(--rust)"
            sub={summary.committedExpense > 0 ? `${fmt(summary.committedExpense)} committed · ${fmt(summary.flexibleSpend)} flexible` : null} />
        </div>
        <div className="rise-in" style={rise(2)}>
          <SummaryCard icon={<PiggyBank size={16} />} label="Saved" value={<CountUp value={summary.savings} />} color="var(--gold)" />
        </div>
        <div className="rise-in" style={rise(3)}>
          <SummaryCard icon={<Wallet size={16} />} label="Left over" value={<CountUp value={net} />}
            color={net >= 0 ? "var(--ledger-green-soft)" : "var(--rust)"} />
        </div>
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6 rise-in" style={rise(4)}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <p className="serif text-sm tracking-wide opacity-80">Where the month went</p>
          {flow?.overspent && (
            <span className="text-[11px] mono px-2 py-0.5 rounded" style={{ background: "#FBEAEA", color: "var(--rust)" }}>
              overspent by {fmt(Math.abs(net))}
            </span>
          )}
        </div>
        {!flow ? (
          <p className="text-xs opacity-50 mono py-4 text-center">Log income to see this month&apos;s flow.</p>
        ) : (
          <>
            <div className="flex h-9 w-full rounded overflow-hidden gap-[2px]">
              {flow.segments.map((s) => (
                <div
                  key={s.key}
                  className="flow-seg group relative h-full flex items-center justify-center"
                  style={{
                    width: barMounted ? `${s.pct}%` : "0%",
                    background: s.color,
                    ...(s.key === "left" ? { border: "1.5px dashed var(--line)", borderRadius: 3 } : {}),
                  }}
                  title={`${s.label}: ${fmt(s.value)}`}
                >
                  <span
                    className={`text-[10px] mono whitespace-nowrap px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      s.key === "left" ? "" : "text-white"
                    }`}
                    style={s.key === "left" ? { color: "var(--ink)" } : {}}
                  >
                    {s.pct > 12 ? `${s.label} · ${fmt(s.value)}` : fmt(s.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] mono opacity-70">
              {flow.segments.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={s.key === "left" ? { border: "1.5px dashed var(--line)" } : { background: s.color }}
                  />
                  {s.label} {fmt(s.value)}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6 rise-in" style={rise(5)}>
        <p className="serif text-sm tracking-wide opacity-80 mb-3">
          {activeMonth === todayKey() ? "Upcoming this month" : `Recurring — ${monthLabel(activeMonth)}`}
        </p>
        {upcoming.length === 0 ? (
          <div className="flex items-center justify-between flex-wrap gap-3 py-1">
            <p className="text-xs opacity-50 mono">No recurring items set up — rent, salary, subscriptions can log themselves.</p>
            {onGoToOutgoings && (
              <button
                onClick={onGoToOutgoings}
                className="text-xs px-3 py-1.5 rounded text-[#F7F3E8] flex items-center gap-1.5"
                style={{ background: "#2F6B4F" }}
              >
                <Repeat size={12} /> Set up outgoings
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcoming.map(({ item, paid }) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 rounded border whitespace-nowrap flex-shrink-0"
                style={{ borderColor: "var(--line)", background: paid ? "#F2F6F0" : "var(--card)" }}
              >
                {paid
                  ? <Check size={13} style={{ color: "var(--ledger-green-soft)" }} />
                  : <Clock size={13} style={{ color: "var(--gold)" }} />}
                <span className="text-xs">{item.name}</span>
                <span className="text-xs mono" style={{ color: item.type === "income" ? "var(--ledger-green-soft)" : "var(--ink)" }}>
                  {fmt(item.amount)}
                </span>
                <span className="text-[10px] mono opacity-50">{ordinalDay(item.due_day)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6 rise-in" style={rise(6)}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="serif text-sm tracking-wide opacity-80">Savings goal — all-time</p>
          <div className="flex items-center gap-2 text-xs mono">
            <span className="opacity-60">target</span><span>{currencySymbol()}</span>
            <input
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={handleGoalSave}
              onKeyDown={(e) => e.key === "Enter" && handleGoalSave()}
              className="w-20 bg-transparent border-b border-[var(--line)] focus:outline-none focus:border-[var(--gold)] px-1"
            />
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-[#EDE7D6] overflow-hidden">
          <div className="h-full rounded-full flow-seg" style={{ width: barMounted ? `${goalPct}%` : "0%", background: "var(--gold)" }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs mono opacity-70">
          <span><CountUp value={totalSaved} /> saved</span><span>{goalPct.toFixed(0)}% of {fmt(goal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ledger-card p-4 sm:p-5 rise-in" style={rise(7)}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="serif text-sm tracking-wide opacity-80">Spending — this month</p>
            <div className="flex gap-1">
              {[["category", "by category"], ["committed", "committed vs flexible"]].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => { setDonutMode(mode); setActiveSlice(null); setPinnedSlice(null); }}
                  className="text-[10px] mono px-2 py-1 rounded"
                  style={donutMode === mode
                    ? { background: "var(--ledger-green)", color: "#E8E2CE" }
                    : { background: "#EDE7D6", color: "var(--ink)", opacity: 0.7 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {donutData.length === 0 ? (
            <p className="text-xs opacity-50 mono py-10 text-center">No expenses logged yet.</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={2}
                    activeIndex={shownSlice ?? undefined}
                    activeShape={ActiveSlice}
                    onMouseEnter={(_, i) => setActiveSlice(i)}
                    onMouseLeave={() => setActiveSlice(null)}
                    onClick={(_, i) => setPinnedSlice((p) => (p === i ? null : i))}
                    style={{ cursor: "pointer" }}
                  >
                    {donutData.map((e, i) => (
                      <Cell
                        key={e.name}
                        fill={donutMode === "committed" ? COMMITTED_COLORS[e.name] : PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 24 }}>
                {shownSlice != null && donutData[shownSlice] ? (
                  <>
                    <p className="serif text-lg leading-tight">{fmt(donutData[shownSlice].value)}</p>
                    <p className="text-[10px] mono opacity-60">
                      {donutData[shownSlice].name} · {donutTotal > 0 ? ((donutData[shownSlice].value / donutTotal) * 100).toFixed(0) : 0}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="serif text-lg leading-tight">{fmt(donutTotal)}</p>
                    <p className="text-[10px] mono opacity-60">total spend</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ledger-card p-4 sm:p-5 rise-in" style={rise(8)}>
          <p className="serif text-sm tracking-wide opacity-80 mb-3">Trend — last {trend.length} months</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
              <Bar dataKey="Income" fill="var(--ledger-green-soft)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--rust)" radius={[2, 2, 0, 0]} />
              <Line dataKey="Saved" stroke="var(--gold)" strokeWidth={2} dot={{ r: 3, fill: "var(--gold)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

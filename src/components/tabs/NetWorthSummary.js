"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { PiggyBank, TrendingDown, Wallet, Landmark, Clock, ArrowRight } from "lucide-react";
import { fmt, PIE_COLORS, lastNMonthKeys } from "@/lib/ledgerConstants";
import {
  netWorth as calcNetWorth,
  groupByCategory,
  liquidCash,
  averageEssentialExpenditure,
  financialRunway,
} from "@/lib/financialCalculations";
import SummaryCard from "@/components/ui/SummaryCard";
import NetWorthRing from "@/components/tabs/NetWorthRing";

// Same convention OpportunityDetailTab uses for these four purposes, so the
// color means the same thing everywhere it appears in the app.
const PURPOSE_COLOR = { Safety: "var(--emerald)", Growth: "var(--gold)", Income: "var(--cyan)", Speculation: "var(--rust)" };

export default function NetWorthSummary({ assets, liabilities, transactions = [], netWorthSnapshots = [], goalPct }) {
  const { totalAssets, totalLiabilities, netWorth } = useMemo(() => calcNetWorth(assets, liabilities), [assets, liabilities]);

  const assetsByCategory = useMemo(() => groupByCategory(assets, "value"), [assets]);
  const liabilitiesByCategory = useMemo(() => groupByCategory(liabilities, "balance"), [liabilities]);
  const assetsByPurpose = useMemo(() => groupByCategory(assets, "value", "purpose"), [assets]);

  const cashPosition = useMemo(() => liquidCash(assets), [assets]);
  const runwayMonths = useMemo(() => {
    const avgEssential = averageEssentialExpenditure(transactions, lastNMonthKeys(6));
    return financialRunway(cashPosition, avgEssential);
  }, [transactions, cashPosition]);

  const historyData = useMemo(
    () => netWorthSnapshots.map((s) => ({ date: s.snapshot_date, "Net worth": Number(s.net_worth) })),
    [netWorthSnapshots]
  );

  if (assets.length === 0 && liabilities.length === 0) {
    return (
      <div className="ledger-card p-4 sm:p-5 mb-6">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-2">Net worth</p>
        <p className="text-xs text-[var(--muted)] mb-3">
          Add what you own and owe on the Assets page to see your net worth here.
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--emerald)" }}
        >
          Go to Assets <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Net worth</p>

      {totalAssets > 0 && (
        <NetWorthRing assetsByCategory={assetsByCategory} totalAssets={totalAssets} netWorth={netWorth} goalPct={goalPct} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <SummaryCard icon={<PiggyBank size={16} />} label="Total assets" value={fmt(totalAssets)} color="var(--emerald)" />
        <SummaryCard icon={<TrendingDown size={16} />} label="Total liabilities" value={fmt(totalLiabilities)} color="var(--rust)" />
        <SummaryCard
          icon={<Wallet size={16} />}
          label="Net worth"
          value={fmt(netWorth)}
          color={netWorth >= 0 ? "var(--emerald)" : "var(--rust)"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <SummaryCard icon={<Landmark size={16} />} label="Cash position" value={fmt(cashPosition)} color="var(--cyan)" />
        <SummaryCard
          icon={<Clock size={16} />}
          label="Financial runway"
          value={runwayMonths === null ? "—" : `${runwayMonths.toFixed(1)} mo`}
          color="var(--cyan)"
          caption="cash ÷ avg. essential spend, last 6 mo"
        />
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-4">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Net worth over time</p>
        {historyData.length < 2 ? (
          <p className="text-xs text-[var(--faint)] mono py-10 text-center">
            Check back after a few more days — history builds up as you go.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v) => fmt(v)}
              />
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
              <Line type="monotone" dataKey="Net worth" stroke="var(--cyan)" strokeWidth={2} dot={{ r: 3, fill: "var(--cyan)" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-4">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1">Money by purpose</p>
        <p className="text-xs text-[var(--faint)] mb-3">Not just where your money sits — what job it&apos;s doing.</p>
        {assetsByPurpose.length === 0 ? (
          <p className="text-xs text-[var(--faint)] mono py-10 text-center">No assets added yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={assetsByPurpose} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                  {assetsByPurpose.map((e) => <Cell key={e.name} fill={PURPOSE_COLOR[e.name] || "var(--muted)"} />)}
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
            <ul className="text-xs mt-2 space-y-1">
              {assetsByPurpose.map((c) => (
                <li key={c.name} className="flex justify-between text-[var(--muted)]">
                  <span>{c.name}</span>
                  <span className="mono">{fmt(c.value)} · {totalAssets > 0 ? Math.round((c.value / totalAssets) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Assets by category</p>
          {assetsByCategory.length === 0 ? (
            <p className="text-xs text-[var(--faint)] mono py-10 text-center">No assets added yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={assetsByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                    {assetsByCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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
              <ul className="text-xs mt-2 space-y-1">
                {assetsByCategory.map((c) => (
                  <li key={c.name} className="flex justify-between text-[var(--muted)]">
                    <span>{c.name}</span>
                    <span className="mono">{fmt(c.value)} · {totalAssets > 0 ? Math.round((c.value / totalAssets) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Liabilities by category</p>
          {liabilitiesByCategory.length === 0 ? (
            <p className="text-xs text-[var(--faint)] mono py-10 text-center">No liabilities added yet.</p>
          ) : (
            <ul className="text-sm mt-2 space-y-2">
              {liabilitiesByCategory.map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span className="text-[var(--text)] opacity-80">{c.name}</span>
                  <span className="mono" style={{ color: "var(--rust)" }}>
                    {fmt(c.value)} · {totalLiabilities > 0 ? Math.round((c.value / totalLiabilities) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PiggyBank, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import { fmt, PIE_COLORS } from "@/lib/ledgerConstants";
import SummaryCard from "@/components/ui/SummaryCard";

function byCategory(items, valueField) {
  const map = {};
  items.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + (Number(item[valueField]) || 0);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default function NetWorthSummary({ assets, liabilities }) {
  const totalAssets = useMemo(() => assets.reduce((s, a) => s + (Number(a.value) || 0), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + (Number(l.balance) || 0), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  const assetsByCategory = useMemo(() => byCategory(assets, "value"), [assets]);
  const liabilitiesByCategory = useMemo(() => byCategory(liabilities, "balance"), [liabilities]);

  if (assets.length === 0 && liabilities.length === 0) {
    return (
      <div className="ledger-card p-4 sm:p-5 mb-6">
        <p className="serif text-sm tracking-wide opacity-80 mb-2">Net worth</p>
        <p className="text-xs opacity-60 mb-3">
          Add what you own and owe on the Assets page to see your net worth here.
        </p>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--ledger-green-soft)" }}
        >
          Go to Assets <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="serif text-sm tracking-wide opacity-80 mb-3">Net worth</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <SummaryCard icon={<PiggyBank size={16} />} label="Total assets" value={fmt(totalAssets)} color="var(--ledger-green-soft)" />
        <SummaryCard icon={<TrendingDown size={16} />} label="Total liabilities" value={fmt(totalLiabilities)} color="var(--rust)" />
        <SummaryCard
          icon={<Wallet size={16} />}
          label="Net worth"
          value={fmt(netWorth)}
          color={netWorth >= 0 ? "var(--ledger-green-soft)" : "var(--rust)"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-3">Assets by category</p>
          {assetsByCategory.length === 0 ? (
            <p className="text-xs opacity-50 mono py-10 text-center">No assets added yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={assetsByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {assetsByCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="text-xs mt-2 space-y-1">
                {assetsByCategory.map((c) => (
                  <li key={c.name} className="flex justify-between opacity-70">
                    <span>{c.name}</span>
                    <span className="mono">{fmt(c.value)} · {totalAssets > 0 ? Math.round((c.value / totalAssets) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-3">Liabilities by category</p>
          {liabilitiesByCategory.length === 0 ? (
            <p className="text-xs opacity-50 mono py-10 text-center">No liabilities added yet.</p>
          ) : (
            <ul className="text-sm mt-2 space-y-2">
              {liabilitiesByCategory.map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span className="opacity-80">{c.name}</span>
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

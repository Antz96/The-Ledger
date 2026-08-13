"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";

const PURPOSE_META = {
  Safety: { color: "var(--ledger-green-soft)", desc: "Protection and easy access — emergency cash, easy-access savings, cash ISAs." },
  Growth: { color: "var(--gold)", desc: "Intended to appreciate over time — index funds, ETFs, equities, pension investments." },
  Income: { color: "#5B7A99", desc: "Generates recurring income — bonds, dividend investments, property-related." },
  Speculation: { color: "var(--rust)", desc: "Higher-risk, capital intentionally at risk — individual stocks, crypto, trading." },
};
const PURPOSE_ORDER = ["Safety", "Growth", "Income", "Speculation"];

export default function WealthMapTab({ assets }) {
  const totalAssets = useMemo(() => assets.reduce((s, a) => s + (Number(a.value) || 0), 0), [assets]);

  const byPurpose = useMemo(() => {
    const map = {};
    assets.forEach((a) => {
      map[a.purpose] = (map[a.purpose] || 0) + (Number(a.value) || 0);
    });
    return PURPOSE_ORDER.filter((p) => map[p] > 0).map((p) => ({ name: p, value: map[p] }));
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-2">Wealth Map</p>
        <p className="text-xs opacity-60 mb-3">
          Add your assets to see what job your money is doing — safety, growth, income, or speculation.
        </p>
        <Link href="/assets" className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ledger-green-soft)" }}>
          Go to Assets <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Wealth Map</p>
        <p className="text-xs opacity-50 mb-4">What job is your money doing? — {fmt(totalAssets)} across {assets.length} asset{assets.length === 1 ? "" : "s"}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byPurpose} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byPurpose.map((p) => <Cell key={p.name} fill={PURPOSE_META[p.name].color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-1">
            {PURPOSE_ORDER.map((p) => {
              const value = byPurpose.find((b) => b.name === p)?.value || 0;
              const pct = totalAssets > 0 ? Math.round((value / totalAssets) * 100) : 0;
              return (
                <div key={p} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                  <span className="text-sm font-medium" style={{ color: PURPOSE_META[p].color }}>{p}</span>
                  <span className="mono text-sm opacity-70">{fmt(value)} · {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {PURPOSE_ORDER.map((p) => (
        <div key={p} className="ledger-card p-4 sm:p-5">
          <p className="text-sm font-medium mb-1" style={{ color: PURPOSE_META[p].color }}>{p}</p>
          <p className="text-xs opacity-60">{PURPOSE_META[p].desc}</p>
        </div>
      ))}

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            This groups money by the purpose you assigned it on the Assets page — it isn&apos;t a recommendation
            about how to split your money, and no split shown here is automatically right for you.
          </p>
        </div>
      </div>
    </div>
  );
}

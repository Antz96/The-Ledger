"use client";

import { ExternalLink } from "lucide-react";
import { RATE_DATA } from "@/lib/ledgerConstants";

export default function RatesTab() {
  return (
    <div className="ledger-card overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-2">
        <p className="serif text-sm tracking-wide opacity-80">High-yield savings rates</p>
        <p className="text-[11px] mono opacity-50 mt-1">Rates change often and usually require meeting specific conditions — verify directly with the bank before opening an account.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm mt-1">
          <thead>
            <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
              <th className="text-left px-5 py-2 font-normal">BANK</th>
              <th className="text-left px-3 py-2 font-normal">APY</th>
              <th className="text-left px-3 py-2 font-normal">MINIMUM</th>
              <th className="text-left px-3 py-2 font-normal">NOTES</th>
            </tr>
          </thead>
          <tbody>
            {RATE_DATA.map((r) => (
              <tr key={r.bank} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                <td className="px-5 py-2.5 text-sm">{r.bank}</td>
                <td className="px-3 py-2.5 mono" style={{ color: "var(--ledger-green-soft)" }}>{r.apy}</td>
                <td className="px-3 py-2.5 text-xs mono opacity-70">{r.min}</td>
                <td className="px-3 py-2.5 text-xs opacity-60">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 text-[11px] mono opacity-40 flex items-center gap-1">
        <ExternalLink size={11} /> Compiled from NerdWallet, Kiplinger, Yahoo Finance, WalletHub, and YieldFinder.
        Not personalized — sourced, factual data only.
      </div>
    </div>
  );
}

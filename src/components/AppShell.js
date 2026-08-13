"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Wallet, Compass, Telescope, NotebookPen, SlidersHorizontal, GraduationCap, Landmark } from "lucide-react";
import { CURRENCIES } from "@/lib/ledgerConstants";
import { useLedgerData } from "@/lib/LedgerDataContext";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Wallet },
  { href: "/wealth-map", label: "Wealth Map", icon: Compass },
  { href: "/explorer", label: "Explorer", icon: Telescope },
  { href: "/ledger", label: "Ledger", icon: NotebookPen },
  { href: "/allocate", label: "Allocate", icon: SlidersHorizontal },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/rates", label: "Rates", icon: Landmark },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { displayName, saving, error, currency, handleCurrencyChange, handleSignOut } = useLedgerData();

  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100dvh" }} className="flex flex-col flex-1">
      <div style={{ background: "var(--ledger-green)" }} className="px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="serif text-[#E8E2CE] text-xl sm:text-2xl">The Ledger</p>
            <p className="text-[#B9C9BB] text-[11px] mono">signed in as {displayName}</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              aria-label="Currency"
              className="bg-transparent text-[11px] mono text-[#B9C9BB] border border-[#3D5C4A] rounded px-1.5 py-0.5 cursor-pointer hover:text-white focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ color: "var(--ink)" }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <span className="text-[11px] mono text-[#B9C9BB]">{saving ? "saving…" : "synced"}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[#E8E2CE] hover:text-white">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs whitespace-nowrap ${
                  active ? "bg-[var(--paper)] text-[var(--ink)]" : "text-[#B9C9BB] hover:text-white"
                }`}
              >
                <n.icon size={13} /> {n.label}
              </Link>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          className="mx-6 sm:mx-10 mt-4 text-xs px-3 py-2 rounded"
          style={{ background: "#FBEAEA", color: "var(--rust)", border: "1px solid #E8C7C7" }}
        >
          {error}
        </div>
      )}

      <div className="px-4 sm:px-10 py-6 max-w-6xl mx-auto w-full">{children}</div>
    </div>
  );
}

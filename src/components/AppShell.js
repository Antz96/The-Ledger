"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Wallet, Compass, Target, Telescope, NotebookPen, SlidersHorizontal, GraduationCap, Landmark, CreditCard, X } from "lucide-react";
import { CURRENCIES } from "@/lib/ledgerConstants";
import { useLedgerData } from "@/lib/LedgerDataContext";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Wallet },
  { href: "/wealth-map", label: "Wealth Map", icon: Compass },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/explorer", label: "Explorer", icon: Telescope },
  { href: "/ledger", label: "Ledger", icon: NotebookPen },
  { href: "/allocate", label: "Allocate", icon: SlidersHorizontal },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/rates", label: "Rates", icon: Landmark },
  { href: "/credit-health", label: "Credit Health", icon: CreditCard },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { displayName, saving, error, currency, handleCurrencyChange, handleSignOut, clearError } = useLedgerData();

  return (
    <div style={{ background: "var(--obsidian)", color: "var(--text)", minHeight: "100dvh" }} className="flex flex-col flex-1">
      <div
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        className="px-6 py-4 sm:px-10 backdrop-blur-xl relative z-10"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-[22px] h-[22px] rounded-[7px] flex-shrink-0"
              style={{
                background: "linear-gradient(140deg, var(--emerald), var(--cyan))",
                boxShadow: "0 0 14px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            />
            <div>
              <p className="serif font-semibold text-[var(--text)] text-lg sm:text-xl leading-tight">The Ledger</p>
              <p className="text-[var(--muted)] text-[11px] mono">signed in as {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              aria-label="Currency"
              className="bg-transparent text-[11px] mono text-[var(--muted)] border border-[var(--line)] rounded px-1.5 py-0.5 cursor-pointer hover:text-[var(--text)] focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ color: "var(--obsidian-2)" }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <span className="text-[11px] mono text-[var(--muted)]">{saving ? "saving…" : "synced"}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)]">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors"
                style={
                  active
                    ? { background: "rgba(15,185,129,0.12)", color: "var(--text)", boxShadow: "inset 0 0 0 1px rgba(15,185,129,0.25)" }
                    : { color: "var(--muted)" }
                }
              >
                <n.icon size={13} style={active ? { color: "var(--emerald)" } : undefined} /> {n.label}
              </Link>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-6 sm:mx-10 mt-4 text-xs px-3 py-2 rounded-lg flex items-start justify-between gap-3"
          style={{ background: "rgba(242,99,122,0.1)", color: "var(--rust)", border: "1px solid rgba(242,99,122,0.25)" }}
        >
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss error" className="opacity-60 hover:opacity-100 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="px-4 sm:px-10 py-6 max-w-6xl mx-auto w-full relative z-10">{children}</div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, HelpCircle, X } from "lucide-react";
import { CURRENCIES } from "@/lib/ledgerConstants";
import { useLedgerData } from "@/lib/LedgerDataContext";
import { exportAccountData } from "@/lib/accountApi";
import WheelNav from "@/components/WheelNav";
import DeleteAccountModal from "@/components/DeleteAccountModal";

export default function AppShell({ children }) {
  const { displayName, saving, error, currency, handleCurrencyChange, handleSignOut, clearError } = useLedgerData();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  async function handleExport() {
    setExporting(true);
    setExportError("");
    try {
      await exportAccountData();
    } catch (err) {
      setExportError(err.message || "Couldn't export your data.");
    } finally {
      setExporting(false);
    }
  }

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
            <Link href="/welcome" aria-label="Guide to every section" title="Guide" className="text-[var(--muted)] hover:text-[var(--text)]">
              <HelpCircle size={16} />
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)]">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }} className="relative z-10">
        <WheelNav />
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

      <footer className="px-4 sm:px-10 py-4 flex flex-col items-center gap-1.5 text-[11px] text-[var(--faint)] relative z-10">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/terms" className="hover:text-[var(--muted)]">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[var(--muted)]">Privacy Policy</Link>
          <span>·</span>
          <button onClick={handleExport} disabled={exporting} className="hover:text-[var(--muted)] disabled:opacity-50">
            {exporting ? "Preparing download…" : "Download my data"}
          </button>
          <span>·</span>
          <button onClick={() => setShowDeleteModal(true)} className="hover:text-[var(--rust)]">Delete account</button>
        </div>
        {exportError && <p style={{ color: "var(--rust)" }}>{exportError}</p>}
      </footer>

      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}

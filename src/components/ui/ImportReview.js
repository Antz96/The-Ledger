"use client";

import { X } from "lucide-react";
import { ASSET_PURPOSES as PURPOSES } from "@/lib/ledgerConstants";

// Editable review list shown after a PDF statement upload returns extracted
// rows, before anything is actually saved. Shared by AssetsTab (assets +
// liabilities) and DebtPayoffTab (debts) — same shape, different fields.
export default function ImportReview({
  rows, categories, valueField, valueLabel, withPurpose, onUpdateRow, onRemoveRow, onConfirm, onDiscard, adding,
}) {
  const includedCount = rows.filter((r) => r.include).length;

  return (
    <div className="px-4 sm:px-5 py-4 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--muted)]">
          {rows.length === 0
            ? "Nothing found in that PDF."
            : `Found ${rows.length} ${rows.length === 1 ? "entry" : "entries"} — review before adding.`}
        </p>
        <button onClick={onDiscard} aria-label="Discard extracted entries" className="text-[var(--faint)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2 mb-3">
          {rows.map((row) => (
            <div key={row._key} className={`grid grid-cols-[auto_1fr_1fr_${withPurpose ? "1fr_" : ""}1fr_auto] gap-2 items-center`}>
              <input
                type="checkbox"
                checked={row.include}
                onChange={(e) => onUpdateRow(row._key, { include: e.target.checked })}
                aria-label={`Include ${row.name || "this entry"}`}
                className="w-3.5 h-3.5"
              />
              <input
                value={row.name}
                onChange={(e) => onUpdateRow(row._key, { name: e.target.value })}
                aria-label="Name"
                className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
              <select
                value={row.category}
                onChange={(e) => onUpdateRow(row._key, { category: e.target.value })}
                aria-label="Category"
                className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              >
                {categories.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
              </select>
              {withPurpose && (
                <select
                  value={row.purpose}
                  onChange={(e) => onUpdateRow(row._key, { purpose: e.target.value })}
                  aria-label="Purpose"
                  className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
                >
                  {PURPOSES.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
                </select>
              )}
              <input
                type="number" min="0" step="0.01"
                value={row[valueField]}
                onChange={(e) => onUpdateRow(row._key, { [valueField]: e.target.value })}
                aria-label={valueLabel}
                className="w-full text-xs mono text-right border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
              <button onClick={() => onRemoveRow(row._key)} aria-label="Remove this entry" className="text-[var(--faint)] hover:text-[var(--text)]">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {rows.length > 0 && (
          <button
            onClick={onConfirm}
            disabled={includedCount === 0 || adding}
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-50"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            {adding ? "Adding…" : `Add ${includedCount}`}
          </button>
        )}
        <button onClick={onDiscard} className="text-xs text-[var(--faint)] hover:text-[var(--text)] px-2">
          {rows.length === 0 ? "Dismiss" : "Discard"}
        </button>
      </div>
    </div>
  );
}

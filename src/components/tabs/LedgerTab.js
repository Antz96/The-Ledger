"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { fmt, currencySymbol, monthLabel, monthKey, TYPE_META } from "@/lib/ledgerConstants";
import { useMonthNav } from "@/lib/useMonthNav";
import StatementUpload from "@/components/ui/StatementUpload";

export default function LedgerTab({ transactions, activeMonth, setActiveMonth, onAdd, onDelete }) {
  const { monthTx, shiftMonth } = useMonthNav(transactions, activeMonth, setActiveMonth);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "expense",
    category: TYPE_META.expense.cats[0],
    amount: "",
    note: "",
  });
  const [formError, setFormError] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    setFormError("");
    const amt = parseFloat(form.amount);
    if (!form.date) return setFormError("Pick a date.");
    if (!amt || amt <= 0) return setFormError("Enter an amount greater than zero.");
    onAdd({ date: form.date, type: form.type, category: form.category, amount: amt, note: form.note.trim() });
    setActiveMonth(monthKey(form.date));
    setForm((f) => ({ ...f, amount: "", note: "" }));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-hi)]"><ChevronLeft size={18} /></button>
        <p className="serif text-xl font-semibold text-[var(--text)]">{monthLabel(activeMonth)}</p>
        <button onClick={() => shiftMonth(1)} aria-label="Next month" className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel-hi)]"><ChevronRight size={18} /></button>
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3">Add an entry</p>
        <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
          <div>
            <label htmlFor="ledger-date" className="block text-[10px] mono text-[var(--muted)] mb-1">DATE</label>
            <input
              id="ledger-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            />
          </div>
          <div>
            <label htmlFor="ledger-type" className="block text-[10px] mono text-[var(--muted)] mb-1">TYPE</label>
            <select
              id="ledger-type"
              value={form.type}
              onChange={(e) => { const type = e.target.value; setForm((f) => ({ ...f, type, category: TYPE_META[type].cats[0] })); }}
              className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k} style={{ color: "var(--obsidian-2)" }}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ledger-category" className="block text-[10px] mono text-[var(--muted)] mb-1">CATEGORY</label>
            <select
              id="ledger-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {TYPE_META[form.type].cats.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ledger-amount" className="block text-[10px] mono text-[var(--muted)] mb-1">AMOUNT ({currencySymbol()})</label>
            <input
              id="ledger-amount"
              type="number" min="0" step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full text-sm mono border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]"
            />
          </div>
          <div>
            <label htmlFor="ledger-note" className="block text-[10px] mono text-[var(--muted)] mb-1">NOTE</label>
            <input
              id="ledger-note"
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="optional"
              className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
          >
            <Plus size={15} /> Add
          </button>
        </form>
        {formError && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{formError}</p>}
      </div>

      <div className="ledger-card overflow-hidden mb-6">
        <StatementUpload label="Upload a bank or card statement to add entries automatically" className="px-4 sm:px-5 py-3" />
      </div>

      <div className="ledger-card overflow-hidden">
        <p className="serif text-sm tracking-wide text-[var(--muted)] px-4 sm:px-5 pt-4">Entries — {monthLabel(activeMonth)}</p>
        {monthTx.length === 0 ? (
          <p className="text-xs text-[var(--faint)] mono px-5 py-8 text-center">Nothing logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-[10px] mono text-[var(--faint)] border-t border-b" style={{ borderColor: "var(--line)" }}>
                  <th className="text-left px-5 py-2 font-normal">DATE</th>
                  <th className="text-left px-3 py-2 font-normal">TYPE</th>
                  <th className="text-left px-3 py-2 font-normal">CATEGORY</th>
                  <th className="text-left px-3 py-2 font-normal">NOTE</th>
                  <th className="text-right px-3 py-2 font-normal">AMOUNT</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {monthTx.map((t) => (
                  <tr key={t.id} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
                    <td className="px-5 py-2 mono text-xs text-[var(--muted)]">{t.date}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${TYPE_META[t.type].color}1A`, color: TYPE_META[t.type].color }}>
                        {TYPE_META[t.type].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text)]">{t.category}</td>
                    <td className="px-3 py-2 text-xs text-[var(--muted)]">{t.note || "—"}</td>
                    <td className="px-3 py-2 mono text-right" style={{ color: TYPE_META[t.type].color }}>{fmt(t.amount)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => onDelete(t.id)} aria-label={`Delete entry: ${t.category} ${fmt(t.amount)} on ${t.date}`} className="text-[var(--faint)] hover:text-[var(--text)]"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

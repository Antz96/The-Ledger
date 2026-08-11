"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { fmt, monthLabel, monthKey, TYPE_META } from "@/lib/ledgerConstants";
import { useMonthNav } from "@/lib/useMonthNav";

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
        <button onClick={() => shiftMonth(-1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronLeft size={18} /></button>
        <p className="serif text-xl">{monthLabel(activeMonth)}</p>
        <button onClick={() => shiftMonth(1)} className="p-2 rounded hover:bg-[#EAE4D2]"><ChevronRight size={18} /></button>
      </div>

      <div className="ledger-card p-4 sm:p-5 mb-6">
        <p className="serif text-sm tracking-wide opacity-80 mb-3">Add an entry</p>
        <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">DATE</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">TYPE</label>
            <select
              value={form.type}
              onChange={(e) => { const type = e.target.value; setForm((f) => ({ ...f, type, category: TYPE_META[type].cats[0] })); }}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            >
              {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            >
              {TYPE_META[form.type].cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">AMOUNT ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">NOTE</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="optional"
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded text-[#F7F3E8]" style={{ background: "var(--ledger-green)" }}>
            <Plus size={15} /> Add
          </button>
        </form>
        {formError && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{formError}</p>}
      </div>

      <div className="ledger-card overflow-hidden">
        <p className="serif text-sm tracking-wide opacity-80 px-4 sm:px-5 pt-4">Entries — {monthLabel(activeMonth)}</p>
        {monthTx.length === 0 ? (
          <p className="text-xs opacity-50 mono px-5 py-8 text-center">Nothing logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
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
                    <td className="px-5 py-2 mono text-xs opacity-70">{t.date}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${TYPE_META[t.type].color}1A`, color: TYPE_META[t.type].color }}>
                        {TYPE_META[t.type].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{t.category}</td>
                    <td className="px-3 py-2 text-xs opacity-60">{t.note || "—"}</td>
                    <td className="px-3 py-2 mono text-right" style={{ color: TYPE_META[t.type].color }}>{fmt(t.amount)}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => onDelete(t.id)} className="opacity-40 hover:opacity-100"><Trash2 size={14} /></button>
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

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Repeat } from "lucide-react";
import { fmt, currencySymbol, TYPE_META } from "@/lib/ledgerConstants";
import { recurringTotals } from "@/lib/useMonthlySummary";
import { ordinalDay } from "@/lib/recurringMaterializer";

const EMPTY_FORM = { name: "", type: "expense", category: TYPE_META.expense.cats[0], amount: "", due_day: 1 };

export default function OutgoingsTab({ items, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const totals = recurringTotals(items);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ name: item.name, type: item.type, category: item.category, amount: String(item.amount), due_day: item.due_day });
    setFormError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const amt = parseFloat(form.amount);
    const day = parseInt(form.due_day);
    if (!form.name.trim()) return setFormError("Give it a name (e.g. Rent).");
    if (!(amt > 0)) return setFormError("Enter an amount greater than zero.");
    if (!(day >= 1 && day <= 31)) return setFormError("Due day must be between 1 and 31.");

    const entry = { name: form.name.trim(), type: form.type, category: form.category, amount: amt, due_day: day };
    if (editingId) {
      onUpdate(editingId, entry);
      cancelEdit();
    } else {
      onAdd(entry);
      setForm(EMPTY_FORM);
    }
  }

  const typeOptions = Object.entries(TYPE_META).filter(([key]) => key !== "savings");

  return (
    <div className="space-y-6">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Monthly picture</p>
        <p className="text-[11px] mono opacity-50 mb-4">
          Recurring items are logged to your ledger automatically each month on their due day.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] mono opacity-60 mb-1">RECURRING INCOME /MO</p>
            <p className="serif text-xl" style={{ color: "var(--ledger-green-soft)" }}>{fmt(totals.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-[10px] mono opacity-60 mb-1">COMMITTED /MO</p>
            <p className="serif text-xl" style={{ color: "var(--rust)" }}>{fmt(totals.monthlyCommitted)}</p>
          </div>
          <div>
            <p className="text-[10px] mono opacity-60 mb-1">LEFT TO ALLOCATE</p>
            <p className="serif text-xl" style={{ color: totals.leftToAllocate >= 0 ? "var(--ledger-green-soft)" : "var(--rust)" }}>
              {fmt(totals.leftToAllocate)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-3">
          {editingId ? "Edit recurring item" : "Add a recurring item"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] mono opacity-60 mb-1">NAME</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rent"
              className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">TYPE</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, category: TYPE_META[e.target.value].cats[0] })}
              className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-sm bg-white focus:outline-none"
            >
              {typeOptions.map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-sm bg-white focus:outline-none"
            >
              {TYPE_META[form.type].cats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">AMOUNT ({currencySymbol()})</label>
            <input
              type="number" min="0" step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">DUE DAY</label>
            <input
              type="number" min="1" max="31"
              value={form.due_day}
              onChange={(e) => setForm({ ...form, due_day: e.target.value })}
              className="w-full border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 rounded text-sm font-medium text-[#F7F3E8] flex items-center justify-center gap-1"
              style={{ background: "#2F6B4F" }}
            >
              <Plus size={14} /> {editingId ? "Save" : "Add"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs mono opacity-60 hover:opacity-100">
                cancel
              </button>
            )}
          </div>
        </div>
        {formError && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{formError}</p>}
      </form>

      <div className="ledger-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-2">
          <p className="serif text-sm tracking-wide opacity-80">Recurring items</p>
        </div>
        {items.length === 0 ? (
          <p className="px-5 pb-5 pt-1 text-sm opacity-50 mono text-[12px]">
            No recurring items yet. Add rent, salary, subscriptions — anything that repeats monthly.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-1">
              <thead>
                <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                  <th className="text-left px-5 py-2 font-normal">NAME</th>
                  <th className="text-left px-3 py-2 font-normal">TYPE</th>
                  <th className="text-left px-3 py-2 font-normal">CATEGORY</th>
                  <th className="text-right px-3 py-2 font-normal">AMOUNT</th>
                  <th className="text-left px-3 py-2 font-normal">DUE</th>
                  <th className="text-left px-3 py-2 font-normal">STATUS</th>
                  <th className="text-right px-5 py-2 font-normal">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const meta = TYPE_META[item.type] ?? { label: item.type, color: "var(--ink)" };
                  return (
                    <tr key={item.id} className="border-b last:border-0" style={{ borderColor: "var(--line)", opacity: item.active ? 1 : 0.5 }}>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Repeat size={12} className="opacity-40" /> {item.name}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${meta.color}1A`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs opacity-70">{item.category}</td>
                      <td className="px-3 py-2.5 mono text-right" style={{ color: meta.color }}>{fmt(item.amount)}</td>
                      <td className="px-3 py-2.5 text-xs mono opacity-70">{ordinalDay(item.due_day)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => onUpdate(item.id, { active: !item.active })}
                          title={item.active ? "Pause — stops auto-logging" : "Resume auto-logging"}
                          className="text-[10px] mono px-1.5 py-0.5 rounded cursor-pointer"
                          style={item.active
                            ? { background: "#EAF2EC", color: "var(--ledger-green-soft)" }
                            : { background: "#EDE7D6", color: "#8A8265" }}
                        >
                          {item.active ? "active" : "paused"}
                        </button>
                      </td>
                      <td className="px-5 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(item)}
                          title="Edit"
                          className="p-1.5 rounded hover:bg-[#EAE4D2] align-middle"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${item.name}"? Past entries stay in your ledger.`)) {
                              if (editingId === item.id) cancelEdit();
                              onDelete(item.id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 rounded hover:bg-[#F3E0E0] align-middle ml-1"
                          style={{ color: "var(--rust)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

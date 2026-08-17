"use client";

import { useState } from "react";
import { TrendingDown, Plus, Pencil, Trash2 } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import { payoffProjection, buildRepaymentPatch, formatPayoffDate } from "@/lib/debtPayoff";

const LIABILITY_CATEGORIES = ["Credit Card", "Loan", "Mortgage", "Other"];

export default function DebtPayoffTab({ liabilities, onAdd, onUpdate, onDelete }) {
  const totalDebt = liabilities.reduce((s, l) => s + (Number(l.balance) || 0), 0);
  const tracked = liabilities.filter((l) => Number(l.monthly_repayment) > 0);
  const totalRepaymentPerMonth = tracked.reduce((s, l) => s + Number(l.monthly_repayment), 0);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1 flex items-center gap-1.5">
          <TrendingDown size={15} style={{ color: "var(--rust)" }} /> Debt payoff
        </p>
        <p className="text-xs opacity-50 mb-4">
          A simple projection based on what you're putting toward each debt each month — not a real amortization
          schedule, since interest rates aren't tracked here.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] mono opacity-50 mb-1">TOTAL OWED</p>
            <p className="text-xl font-semibold" style={{ color: "var(--rust)" }}>{fmt(totalDebt)}</p>
          </div>
          <div>
            <p className="text-[10px] mono opacity-50 mb-1">GOING TOWARD DEBT / MONTH</p>
            <p className="text-xl font-semibold">{fmt(totalRepaymentPerMonth)}</p>
          </div>
        </div>
      </div>

      {liabilities.length === 0 ? (
        <p className="text-xs opacity-50 mono text-center py-8">No debts added yet — add one below.</p>
      ) : (
        <div className="space-y-3">
          {liabilities.map((item) => (
            <DebtCard key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}

      <AddDebtForm onAdd={onAdd} />
    </div>
  );
}

function DebtCard({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);
  const projection = payoffProjection(item);

  if (editing) {
    return (
      <div className="ledger-card p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">NAME</label>
            <input
              aria-label={`Name for ${item.name}`}
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="w-full text-sm border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
            <select
              aria-label={`Category for ${item.name}`}
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              className="w-full text-sm border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
              style={{ borderColor: "var(--line)" }}
            >
              {LIABILITY_CATEGORIES.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">BALANCE</label>
            <input
              aria-label={`Balance for ${item.name}`}
              type="number" min="0" step="0.01"
              value={draft.balance}
              onChange={(e) => setDraft((d) => ({ ...d, balance: e.target.value }))}
              className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">REPAYMENT/MO</label>
            <input
              aria-label={`Monthly repayment for ${item.name}`}
              type="number" min="0" step="0.01"
              value={draft.monthly_repayment ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, monthly_repayment: e.target.value }))}
              placeholder="e.g. standing order amount"
              className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const patch = { name: draft.name.trim(), category: draft.category, balance: parseFloat(draft.balance) || 0 };
              Object.assign(patch, buildRepaymentPatch(item, parseFloat(draft.monthly_repayment) || 0));
              onUpdate(item.id, patch);
              setEditing(false);
            }}
            className="text-xs px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(item); setEditing(false); }} className="text-xs px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-[10px] mono opacity-50">{item.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(true)} aria-label={`Edit ${item.name}`} className="opacity-40 hover:opacity-100"><Pencil size={13} /></button>
          <button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`} className="opacity-40 hover:opacity-100"><Trash2 size={13} /></button>
        </div>
      </div>

      <p className="text-2xl font-semibold mono mb-1" style={{ color: "var(--rust)" }}>{fmt(item.balance)}</p>

      {Number(item.monthly_repayment) > 0 ? (
        projection ? (
          <>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--panel-hi)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${projection.progressPct ?? 0}%`, background: "linear-gradient(90deg, var(--emerald), var(--cyan))" }}
              />
            </div>
            <p className="text-xs opacity-70">
              {fmt(item.monthly_repayment)}/mo · debt-free in {projection.monthsRemaining} month{projection.monthsRemaining === 1 ? "" : "s"} · by {formatPayoffDate(projection.payoffDate)}
              {projection.progressPct !== null && ` · ${Math.round(projection.progressPct)}% paid off`}
            </p>
          </>
        ) : (
          <p className="text-xs font-medium" style={{ color: "var(--emerald)" }}>Paid off!</p>
        )
      ) : (
        <p className="text-xs opacity-50">No repayment amount set — click edit to add one and see a payoff projection.</p>
      )}
    </div>
  );
}

function AddDebtForm({ onAdd }) {
  const empty = { name: "", category: LIABILITY_CATEGORIES[0], balance: "", monthly_repayment: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Enter a name.");
    const bal = parseFloat(form.balance);
    if (Number.isNaN(bal) || bal < 0) return setError("Enter a valid balance.");
    const entry = { name: form.name.trim(), category: form.category, balance: bal };
    if (form.monthly_repayment) {
      const repay = parseFloat(form.monthly_repayment) || 0;
      entry.monthly_repayment = repay;
      if (repay > 0) entry.repayment_start_balance = bal;
    }
    onAdd(entry);
    setForm(empty);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a debt</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="debt-name" className="block text-[10px] mono opacity-60 mb-1">NAME</label>
          <input
            id="debt-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Visa card"
            className="w-full text-sm border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label htmlFor="debt-category" className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
          <select
            id="debt-category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full text-sm border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
            style={{ borderColor: "var(--line)" }}
          >
            {LIABILITY_CATEGORIES.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="debt-balance" className="block text-[10px] mono opacity-60 mb-1">BALANCE</label>
          <input
            id="debt-balance"
            type="number" min="0" step="0.01"
            value={form.balance}
            onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
            placeholder="0.00"
            className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div>
          <label htmlFor="debt-repayment" className="block text-[10px] mono opacity-60 mb-1">REPAYMENT/MO</label>
          <input
            id="debt-repayment"
            type="number" min="0" step="0.01"
            value={form.monthly_repayment}
            onChange={(e) => setForm((f) => ({ ...f, monthly_repayment: e.target.value }))}
            placeholder="optional"
            className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div className="col-span-2 sm:col-span-4">
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
          >
            <Plus size={15} /> Add debt
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

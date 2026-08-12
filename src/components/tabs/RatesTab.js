"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";

const EMPTY_FORM = { bank: "", apy_pct: "", minimum_note: "", note: "", source_url: "", last_updated: new Date().toISOString().slice(0, 10) };

export default function RatesTab({ rates, isAdmin, onAdd, onUpdate, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="ledger-card overflow-hidden">
        <div className="px-4 sm:px-5 pt-4 pb-2">
          <p className="serif text-sm tracking-wide opacity-80">High-yield savings rates</p>
          <p className="text-[11px] mono opacity-50 mt-1">
            Rates and terms are shown for informational purposes, sourced from public bank data, and may change.
            This is not financial advice — verify directly with the bank before opening an account.
          </p>
        </div>

        {rates.length === 0 ? (
          <p className="text-xs opacity-50 mono px-5 py-8 text-center">
            {isAdmin ? "No rates added yet — use the form below to add the first one." : "No rates added yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-1">
              <thead>
                <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                  <th className="text-left px-5 py-2 font-normal">BANK</th>
                  <th className="text-left px-3 py-2 font-normal">APY</th>
                  <th className="text-left px-3 py-2 font-normal">MINIMUM</th>
                  <th className="text-left px-3 py-2 font-normal">NOTES</th>
                  <th className="text-left px-3 py-2 font-normal">UPDATED</th>
                  {isAdmin && <th className="px-3 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <RateRow key={r.id} rate={r} isAdmin={isAdmin} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && <AddRateForm onAdd={onAdd} />}
    </div>
  );
}

function RateRow({ rate, isAdmin, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rate);

  if (editing) {
    return (
      <tr className="border-b" style={{ borderColor: "var(--line)" }}>
        <td className="px-5 py-2"><Field value={draft.bank} onChange={(v) => setDraft((d) => ({ ...d, bank: v }))} /></td>
        <td className="px-3 py-2"><Field type="number" step="0.01" value={draft.apy_pct} onChange={(v) => setDraft((d) => ({ ...d, apy_pct: v }))} /></td>
        <td className="px-3 py-2"><Field value={draft.minimum_note} onChange={(v) => setDraft((d) => ({ ...d, minimum_note: v }))} /></td>
        <td className="px-3 py-2"><Field value={draft.note} onChange={(v) => setDraft((d) => ({ ...d, note: v }))} /></td>
        <td className="px-3 py-2"><Field type="date" value={draft.last_updated} onChange={(v) => setDraft((d) => ({ ...d, last_updated: v }))} /></td>
        <td className="px-3 py-2 whitespace-nowrap">
          <button
            onClick={() => {
              onUpdate(rate.id, {
                bank: draft.bank.trim(),
                apy_pct: parseFloat(draft.apy_pct) || 0,
                minimum_note: draft.minimum_note.trim(),
                note: draft.note.trim(),
                source_url: draft.source_url?.trim() || null,
                last_updated: draft.last_updated,
              });
              setEditing(false);
            }}
            className="text-xs px-2 py-1 rounded mr-1"
            style={{ background: "var(--ledger-green)", color: "#F7F3E8" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(rate); setEditing(false); }} className="opacity-50 hover:opacity-100 align-middle">
            <X size={14} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
      <td className="px-5 py-2.5 text-sm">{rate.bank}</td>
      <td className="px-3 py-2.5 mono" style={{ color: "var(--ledger-green-soft)" }}>{Number(rate.apy_pct).toFixed(2)}%</td>
      <td className="px-3 py-2.5 text-xs mono opacity-70">{rate.minimum_note || "—"}</td>
      <td className="px-3 py-2.5 text-xs opacity-60">
        {rate.note}
        {rate.source_url && (
          <a href={rate.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 ml-1.5 opacity-70 hover:opacity-100" style={{ color: "var(--ledger-green-soft)" }}>
            <ExternalLink size={10} /> source
          </a>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs mono opacity-50 whitespace-nowrap">{rate.last_updated}</td>
      {isAdmin && (
        <td className="px-3 py-2.5 text-right whitespace-nowrap">
          <button onClick={() => setEditing(true)} className="opacity-40 hover:opacity-100 mr-2"><Pencil size={13} /></button>
          <button onClick={() => onDelete(rate.id)} className="opacity-40 hover:opacity-100"><Trash2 size={13} /></button>
        </td>
      )}
    </tr>
  );
}

function Field({ value, onChange, type = "text", step }) {
  return (
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
    />
  );
}

function AddRateForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.bank.trim()) return setError("Enter a bank name.");
    const apy = parseFloat(form.apy_pct);
    if (Number.isNaN(apy) || apy < 0) return setError("Enter a valid APY.");
    onAdd({
      bank: form.bank.trim(),
      apy_pct: apy,
      minimum_note: form.minimum_note.trim(),
      note: form.note.trim(),
      source_url: form.source_url.trim() || null,
      last_updated: form.last_updated,
    });
    setForm(EMPTY_FORM);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a rate</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">BANK</label>
          <input value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))} className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">APY (%)</label>
          <input type="number" step="0.01" min="0" value={form.apy_pct} onChange={(e) => setForm((f) => ({ ...f, apy_pct: e.target.value }))} className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">MINIMUM</label>
          <input value={form.minimum_note} onChange={(e) => setForm((f) => ({ ...f, minimum_note: e.target.value }))} placeholder="e.g. $0, Varies" className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] mono opacity-60 mb-1">NOTE</label>
          <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="optional" className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">LAST UPDATED</label>
          <input type="date" value={form.last_updated} onChange={(e) => setForm((f) => ({ ...f, last_updated: e.target.value }))} className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] mono opacity-60 mb-1">SOURCE URL</label>
          <input value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://…" className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded text-[#F7F3E8]" style={{ background: "var(--ledger-green)" }}>
            <Plus size={15} /> Add rate
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";

const ACCOUNT_TYPES = ["Easy Access", "Regular Saver", "Notice", "Fixed-Rate Bond", "Cash ISA", "Lifetime ISA", "Premium Bonds", "Other"];

const ACCOUNT_TYPE_INFO = {
  "Easy Access": "Withdraw your money anytime, no notice needed.",
  "Regular Saver": "Deposit a fixed amount each month — often the highest rates, but usually capped at a few hundred pounds a month.",
  "Notice": "Better rates than easy access, but you must give advance notice (weeks to months) before withdrawing.",
  "Fixed-Rate Bond": "Lock your money away for a set term (e.g. 1–5 years) in exchange for a guaranteed rate.",
  "Cash ISA": "Tax-free up to your annual ISA allowance — can be easy access, notice, or fixed depending on the provider.",
  "Lifetime ISA": "The government adds a 25% bonus on what you pay in (up to £1,000/year) — for a first home deposit or retirement from age 60. Only available if you're 18–39 when you open one.",
  "Premium Bonds": "NS&I's prize draw — instead of guaranteed interest, each £1 bond is entered into a monthly draw. The rate shown is the average annual prize fund rate, not a guaranteed return.",
  "Other": "Doesn't fit the categories above — check the notes for details.",
};

const ACCOUNT_TYPE_APY_LABEL = {
  "Premium Bonds": "Prize fund rate (avg)",
};

const EMPTY_FORM = {
  bank: "",
  account_type: ACCOUNT_TYPES[0],
  apy_pct: "",
  access_note: "",
  minimum_note: "",
  note: "",
  source_url: "",
  last_updated: new Date().toISOString().slice(0, 10),
};

export default function RatesTab({ rates, isAdmin, onAdd, onUpdate, onDelete }) {
  const groups = ACCOUNT_TYPES.map((type) => ({
    type,
    items: rates.filter((r) => (r.account_type || "Easy Access") === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {rates.length === 0 ? (
        <div className="ledger-card overflow-hidden">
          <div className="px-4 sm:px-5 pt-4 pb-2">
            <p className="serif text-sm tracking-wide text-[var(--muted)]">High-yield savings rates</p>
          </div>
          <p className="text-xs text-[var(--faint)] mono px-5 py-8 text-center">
            {isAdmin ? "No rates added yet — use the form below to add the first one." : "No rates added yet."}
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <RateGroup key={group.type} type={group.type} items={group.items} isAdmin={isAdmin} onUpdate={onUpdate} onDelete={onDelete} />
        ))
      )}

      {isAdmin && <AddRateForm onAdd={onAdd} />}
    </div>
  );
}

function RateGroup({ type, items, isAdmin, onUpdate, onDelete }) {
  return (
    <div className="ledger-card overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-2">
        <p className="serif text-sm tracking-wide text-[var(--muted)]">{type}</p>
        <p className="text-[11px] mono text-[var(--faint)] mt-1">{ACCOUNT_TYPE_INFO[type]}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm mt-1">
          <thead>
            <tr className="text-[10px] mono text-[var(--faint)] border-t border-b" style={{ borderColor: "var(--line)" }}>
              <th className="text-left px-5 py-2 font-normal">BANK</th>
              <th className="text-left px-3 py-2 font-normal">{ACCOUNT_TYPE_APY_LABEL[type] || "APY"}</th>
              <th className="text-left px-3 py-2 font-normal">ACCESS / TERM</th>
              <th className="text-left px-3 py-2 font-normal">MINIMUM</th>
              <th className="text-left px-3 py-2 font-normal">NOTES</th>
              <th className="text-left px-3 py-2 font-normal">LINK</th>
              <th className="text-left px-3 py-2 font-normal">UPDATED</th>
              {isAdmin && <th className="px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <RateRow key={r.id} rate={r} isAdmin={isAdmin} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] mono text-[var(--faint)] px-5 py-2.5 border-t" style={{ borderColor: "var(--line)" }}>
        Rates and terms are shown for informational purposes, sourced from public bank data, and may change. This is
        not financial advice — verify directly with the bank before opening an account.
      </p>
    </div>
  );
}

function RateRow({ rate, isAdmin, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rate);

  if (editing) {
    return (
      <tr className="border-b" style={{ borderColor: "var(--line)" }}>
        <td className="px-5 py-2"><Field ariaLabel={`Bank name for ${rate.bank}`} value={draft.bank} onChange={(v) => setDraft((d) => ({ ...d, bank: v }))} /></td>
        <td className="px-3 py-2">
          <select
            aria-label={`Account type for ${rate.bank}`}
            value={draft.account_type || "Easy Access"}
            onChange={(e) => setDraft((d) => ({ ...d, account_type: e.target.value }))}
            className="w-full text-xs border border-[var(--line)] rounded-lg px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t} style={{ color: "var(--obsidian-2)" }}>{t}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2"><Field ariaLabel={`APY for ${rate.bank}`} type="number" step="0.01" value={draft.apy_pct} onChange={(v) => setDraft((d) => ({ ...d, apy_pct: v }))} /></td>
        <td className="px-3 py-2"><Field ariaLabel={`Access or term note for ${rate.bank}`} value={draft.access_note} onChange={(v) => setDraft((d) => ({ ...d, access_note: v }))} /></td>
        <td className="px-3 py-2"><Field ariaLabel={`Minimum for ${rate.bank}`} value={draft.minimum_note} onChange={(v) => setDraft((d) => ({ ...d, minimum_note: v }))} /></td>
        <td className="px-3 py-2"><Field ariaLabel={`Note for ${rate.bank}`} value={draft.note} onChange={(v) => setDraft((d) => ({ ...d, note: v }))} /></td>
        <td className="px-3 py-2"><Field ariaLabel={`Provider link for ${rate.bank}`} value={draft.source_url} onChange={(v) => setDraft((d) => ({ ...d, source_url: v }))} /></td>
        <td className="px-3 py-2"><Field ariaLabel={`Last updated date for ${rate.bank}`} type="date" value={draft.last_updated} onChange={(v) => setDraft((d) => ({ ...d, last_updated: v }))} /></td>
        <td className="px-3 py-2 whitespace-nowrap">
          <button
            onClick={() => {
              onUpdate(rate.id, {
                bank: draft.bank.trim(),
                account_type: draft.account_type,
                apy_pct: parseFloat(draft.apy_pct) || 0,
                access_note: draft.access_note?.trim() || "",
                minimum_note: draft.minimum_note.trim(),
                note: draft.note.trim(),
                source_url: draft.source_url?.trim() || null,
                last_updated: draft.last_updated,
              });
              setEditing(false);
            }}
            aria-label={`Save changes to ${rate.bank}`}
            className="text-xs px-2 py-1 rounded-lg mr-1 text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(rate); setEditing(false); }} aria-label="Cancel editing" className="text-[var(--faint)] hover:text-[var(--text)] align-middle">
            <X size={14} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
      <td className="px-5 py-2.5 text-sm text-[var(--text)]">{rate.bank}</td>
      <td className="px-3 py-2.5 mono" style={{ color: "var(--emerald)" }}>{Number(rate.apy_pct).toFixed(2)}%</td>
      <td className="px-3 py-2.5 text-xs mono text-[var(--muted)]">{rate.access_note || "—"}</td>
      <td className="px-3 py-2.5 text-xs mono text-[var(--muted)]">{rate.minimum_note || "—"}</td>
      <td className="px-3 py-2.5 text-xs text-[var(--muted)]">{rate.note || "—"}</td>
      <td className="px-3 py-2.5 text-xs whitespace-nowrap">
        {rate.source_url ? (
          <a
            href={rate.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium hover:opacity-80"
            style={{ color: "var(--obsidian)", background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            Open <ExternalLink size={10} />
          </a>
        ) : (
          <span className="text-[var(--faint)]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs mono text-[var(--faint)] whitespace-nowrap">{rate.last_updated}</td>
      {isAdmin && (
        <td className="px-3 py-2.5 text-right whitespace-nowrap">
          <button onClick={() => setEditing(true)} aria-label={`Edit ${rate.bank}`} className="text-[var(--faint)] hover:text-[var(--text)] mr-2"><Pencil size={13} /></button>
          <button onClick={() => onDelete(rate.id)} aria-label={`Delete ${rate.bank}`} className="text-[var(--faint)] hover:text-[var(--text)]"><Trash2 size={13} /></button>
        </td>
      )}
    </tr>
  );
}

function Field({ value, onChange, type = "text", step, ariaLabel }) {
  return (
    <input
      type={type}
      step={step}
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs border border-[var(--line)] rounded-lg px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
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
      account_type: form.account_type,
      apy_pct: apy,
      access_note: form.access_note.trim(),
      minimum_note: form.minimum_note.trim(),
      note: form.note.trim(),
      source_url: form.source_url.trim() || null,
      last_updated: form.last_updated,
    });
    setForm(EMPTY_FORM);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a rate</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="new-rate-bank" className="block text-[10px] mono text-[var(--muted)] mb-1">BANK</label>
          <input id="new-rate-bank" value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))} className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div>
          <label htmlFor="new-rate-type" className="block text-[10px] mono text-[var(--muted)] mb-1">ACCOUNT TYPE</label>
          <select
            id="new-rate-type"
            value={form.account_type}
            onChange={(e) => setForm((f) => ({ ...f, account_type: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t} style={{ color: "var(--obsidian-2)" }}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="new-rate-apy" className="block text-[10px] mono text-[var(--muted)] mb-1">APY (%)</label>
          <input id="new-rate-apy" type="number" step="0.01" min="0" value={form.apy_pct} onChange={(e) => setForm((f) => ({ ...f, apy_pct: e.target.value }))} className="w-full text-sm mono border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div>
          <label htmlFor="new-rate-access" className="block text-[10px] mono text-[var(--muted)] mb-1">ACCESS / TERM</label>
          <input id="new-rate-access" value={form.access_note} onChange={(e) => setForm((f) => ({ ...f, access_note: e.target.value }))} placeholder="e.g. 95 days notice, 1yr fixed" className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div>
          <label htmlFor="new-rate-minimum" className="block text-[10px] mono text-[var(--muted)] mb-1">MINIMUM</label>
          <input id="new-rate-minimum" value={form.minimum_note} onChange={(e) => setForm((f) => ({ ...f, minimum_note: e.target.value }))} placeholder="e.g. £0, Varies" className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div className="col-span-2">
          <label htmlFor="new-rate-note" className="block text-[10px] mono text-[var(--muted)] mb-1">NOTE</label>
          <input id="new-rate-note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="optional" className="w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div>
          <label htmlFor="new-rate-updated" className="block text-[10px] mono text-[var(--muted)] mb-1">LAST UPDATED</label>
          <input id="new-rate-updated" type="date" value={form.last_updated} onChange={(e) => setForm((f) => ({ ...f, last_updated: e.target.value }))} className="w-full text-sm mono border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="new-rate-source" className="block text-[10px] mono text-[var(--muted)] mb-1">PROVIDER LINK (sign-up page)</label>
          <input id="new-rate-source" value={form.source_url} onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))} placeholder="https://…" className="w-full text-sm mono border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none focus:border-[var(--emerald)]" />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
          >
            <Plus size={15} /> Add rate
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

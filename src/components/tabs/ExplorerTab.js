"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import { EXPLORER_CATEGORIES, RISK_FILTERS } from "@/lib/explorerCategories";

const RISK_COLOR = { Low: "var(--ledger-green-soft)", Medium: "var(--gold)", High: "var(--rust)" };

export default function ExplorerTab({ opportunities, isAdmin, onAddOpportunity, onUpdateOpportunity, onDeleteOpportunity }) {
  const [amount, setAmount] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const visible = useMemo(
    () => EXPLORER_CATEGORIES.filter((c) => riskFilter === "All" || c.risk.includes(riskFilter)),
    [riskFilter]
  );

  const amountNum = parseFloat(amount);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Explorer</p>
        <p className="text-xs opacity-50 mb-4">How much are you looking to allocate? Explore the categories that might be relevant.</p>

        <div className="flex items-center gap-2 mb-5">
          <span className="mono text-sm">£</span>
          <input
            type="number" min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            className="w-32 border border-[var(--line)] rounded px-2 py-1.5 text-sm mono bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
          {amountNum > 0 && <span className="text-xs opacity-50">Exploring options for {fmt(amountNum)}</span>}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={
                riskFilter === r
                  ? { background: "var(--ledger-green)", color: "#F7F3E8", borderColor: "var(--ledger-green)" }
                  : { borderColor: "var(--line)", color: "var(--ink)", opacity: 0.7 }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((cat) => (
          <div key={cat.id} className="ledger-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="serif text-sm">{cat.title}</p>
              <div className="flex gap-1">
                {cat.risk.map((r) => (
                  <span
                    key={r}
                    className="text-[10px] mono px-1.5 py-0.5 rounded"
                    style={{ background: `${RISK_COLOR[r]}1A`, color: RISK_COLOR[r] }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs opacity-70 leading-relaxed mb-3">{cat.description}</p>

            <p className="text-[10px] mono opacity-50 mb-1">EXAMPLES</p>
            <ul className="text-xs space-y-1 opacity-80 list-disc pl-4 mb-3">
              {cat.examples.map((ex) => <li key={ex}>{ex}</li>)}
            </ul>

            <CuratedOpportunities
              categoryId={cat.id}
              opportunities={opportunities.filter((o) => o.category_id === cat.id)}
              isAdmin={isAdmin}
              onUpdate={onUpdateOpportunity}
              onDelete={onDeleteOpportunity}
            />
          </div>
        ))}
      </div>

      {isAdmin && (
        <AddOpportunityForm onAdd={onAddOpportunity} />
      )}

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            These are educational examples to explore, not a recommendation — nothing here is automatically
            suitable for you. What fits depends on your goals, timeline, and risk tolerance. Consider talking to
            a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

function CuratedOpportunities({ opportunities, isAdmin, onUpdate, onDelete }) {
  if (opportunities.length === 0 && !isAdmin) return null;

  return (
    <div className="pt-2 border-t" style={{ borderColor: "var(--line)" }}>
      <p className="text-[10px] mono opacity-50 mb-1.5 mt-2">CURATED</p>
      {opportunities.length === 0 ? (
        <p className="text-xs opacity-40 mono">None added yet.</p>
      ) : (
        <ul className="space-y-2">
          {opportunities.map((o) => (
            <OpportunityRow key={o.id} opportunity={o} isAdmin={isAdmin} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OpportunityRow({ opportunity, isAdmin, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(opportunity);

  if (editing) {
    return (
      <li className="text-xs border rounded p-2 space-y-1.5" style={{ borderColor: "var(--line)" }}>
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
        />
        <input
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="One-line description"
          className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
        />
        <div className="flex gap-1.5">
          <select
            value={draft.risk_level}
            onChange={(e) => setDraft((d) => ({ ...d, risk_level: e.target.value }))}
            className="text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          >
            {["Low", "Medium", "High"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            value={draft.source_url || ""}
            onChange={(e) => setDraft((d) => ({ ...d, source_url: e.target.value }))}
            placeholder="Source URL (optional)"
            className="flex-1 text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              onUpdate(opportunity.id, {
                name: draft.name.trim(),
                description: draft.description.trim(),
                risk_level: draft.risk_level,
                source_url: draft.source_url?.trim() || null,
              });
              setEditing(false);
            }}
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--ledger-green)", color: "#F7F3E8" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(opportunity); setEditing(false); }} className="opacity-50 hover:opacity-100 px-1">
            <X size={14} />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="text-xs flex items-start justify-between gap-2">
      <div>
        <Link href={`/explorer/${opportunity.id}`} className="font-medium hover:underline" style={{ color: "var(--ink)" }}>
          {opportunity.name}
        </Link>
        <span
          className="text-[10px] mono ml-1.5 px-1 py-0.5 rounded"
          style={{ background: `${RISK_COLOR[opportunity.risk_level]}1A`, color: RISK_COLOR[opportunity.risk_level] }}
        >
          {opportunity.risk_level}
        </span>
        {opportunity.description && <p className="opacity-60 mt-0.5">{opportunity.description}</p>}
        {opportunity.source_url && (
          <a
            href={opportunity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 mt-0.5 opacity-70 hover:opacity-100"
            style={{ color: "var(--ledger-green-soft)" }}
          >
            <ExternalLink size={9} /> source
          </a>
        )}
      </div>
      {isAdmin && (
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => setEditing(true)} className="opacity-40 hover:opacity-100"><Pencil size={12} /></button>
          <button onClick={() => onDelete(opportunity.id)} className="opacity-40 hover:opacity-100"><Trash2 size={12} /></button>
        </div>
      )}
    </li>
  );
}

function AddOpportunityForm({ onAdd }) {
  const empty = { category_id: EXPLORER_CATEGORIES[0].id, name: "", description: "", risk_level: "Low", source_url: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Enter a name.");
    onAdd({
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim(),
      risk_level: form.risk_level,
      source_url: form.source_url.trim() || null,
    });
    setForm(empty);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a curated opportunity</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          >
            {EXPLORER_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">NAME</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">RISK</label>
          <select
            value={form.risk_level}
            onChange={(e) => setForm((f) => ({ ...f, risk_level: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          >
            {["Low", "Medium", "High"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] mono opacity-60 mb-1">DESCRIPTION</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="One-line, plain English"
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] mono opacity-60 mb-1">SOURCE URL</label>
          <input
            value={form.source_url}
            onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
            placeholder="https://…"
            className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded text-[#F7F3E8]" style={{ background: "var(--ledger-green)" }}>
            <Plus size={15} /> Add
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

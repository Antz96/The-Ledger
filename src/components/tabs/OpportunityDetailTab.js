"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, ShieldAlert, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { EXPLORER_CATEGORIES } from "@/lib/explorerCategories";

const RISK_COLOR = { Low: "var(--emerald)", Medium: "var(--gold)", High: "var(--rust)" };
const PURPOSE_COLOR = { Safety: "var(--emerald)", Growth: "var(--gold)", Income: "var(--cyan)", Speculation: "var(--rust)" };
const LIQUIDITY_OPTIONS = ["Immediate", "Months", "Years", "10+ Years"];
const HORIZON_OPTIONS = ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const PURPOSE_OPTIONS = ["Safety", "Growth", "Income", "Speculation"];
const RISK_OPTIONS = ["Low", "Medium", "High"];

function bullets(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] mono opacity-50">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export default function OpportunityDetailTab({ opportunity, isAdmin, onUpdate, onDelete }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (!opportunity) {
    return (
      <div className="ledger-card p-4 sm:p-5 text-center">
        <p className="text-sm opacity-70 mb-3">That opportunity couldn&apos;t be found — it may have been removed.</p>
        <Link href="/explorer" className="text-xs font-medium" style={{ color: "var(--ledger-green-soft)" }}>
          ← Back to Explorer
        </Link>
      </div>
    );
  }

  const category = EXPLORER_CATEGORIES.find((c) => c.id === opportunity.category_id);

  function handleDelete() {
    onDelete(opportunity.id);
    router.push("/explorer");
  }

  if (editing) {
    return (
      <EditForm
        opportunity={opportunity}
        onCancel={() => setEditing(false)}
        onSave={(patch) => {
          onUpdate(opportunity.id, patch);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/explorer" className="inline-flex items-center gap-1 text-xs opacity-60 hover:opacity-100">
        <ArrowLeft size={13} /> Back to Explorer
      </Link>

      <div className="ledger-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="serif text-xl">{opportunity.name}</p>
            <p className="text-xs opacity-50 mt-0.5">{category?.title}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(true)} aria-label={`Edit ${opportunity.name}`} className="opacity-50 hover:opacity-100"><Pencil size={15} /></button>
              <button onClick={handleDelete} aria-label={`Delete ${opportunity.name}`} className="opacity-50 hover:opacity-100"><Trash2 size={15} /></button>
            </div>
          )}
        </div>

        <div className="flex gap-1.5 mb-4">
          <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${RISK_COLOR[opportunity.risk_level]}1A`, color: RISK_COLOR[opportunity.risk_level] }}>
            {opportunity.risk_level} risk
          </span>
          {opportunity.typical_purpose && (
            <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${PURPOSE_COLOR[opportunity.typical_purpose]}1A`, color: PURPOSE_COLOR[opportunity.typical_purpose] }}>
              {opportunity.typical_purpose}
            </span>
          )}
        </div>

        {opportunity.description && <p className="text-sm opacity-80 leading-relaxed">{opportunity.description}</p>}
      </div>

      {(opportunity.liquidity || opportunity.time_horizon || opportunity.fees || opportunity.tax_considerations || opportunity.common_access_routes) && (
        <div className="ledger-card p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="LIQUIDITY" value={opportunity.liquidity} />
          <Field label="TIME HORIZON" value={opportunity.time_horizon} />
          <Field label="FEES" value={opportunity.fees} />
          <Field label="TAX CONSIDERATIONS" value={opportunity.tax_considerations} />
          <Field label="COMMON ACCESS ROUTES" value={opportunity.common_access_routes} />
        </div>
      )}

      {opportunity.how_it_works && (
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-2">How it works</p>
          <p className="text-sm opacity-80 leading-relaxed">{opportunity.how_it_works}</p>
        </div>
      )}

      {(opportunity.pros || opportunity.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opportunity.pros && (
            <div className="ledger-card p-4 sm:p-5">
              <p className="serif text-sm tracking-wide opacity-80 mb-2">Pros</p>
              <ul className="text-sm space-y-1.5">
                {bullets(opportunity.pros).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--ledger-green-soft)" }} />
                    <span className="opacity-80">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {opportunity.cons && (
            <div className="ledger-card p-4 sm:p-5">
              <p className="serif text-sm tracking-wide opacity-80 mb-2">Cons</p>
              <ul className="text-sm space-y-1.5">
                {bullets(opportunity.cons).map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <XCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
                    <span className="opacity-80">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {opportunity.key_risks && (
        <div className="ledger-card p-4 sm:p-5">
          <p className="serif text-sm tracking-wide opacity-80 mb-2 flex items-center gap-1.5">
            <ShieldAlert size={14} style={{ color: "var(--rust)" }} /> Key risks
          </p>
          <ul className="text-sm space-y-1 opacity-80 list-disc pl-4">
            {bullets(opportunity.key_risks).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {opportunity.source_url && (
        <a
          href={opportunity.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--ledger-green-soft)" }}
        >
          <ExternalLink size={12} /> Source
        </a>
      )}

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            Educational information only, not a recommendation — nothing here is automatically suitable for you.
            Consider talking to a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

function EditForm({ opportunity, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: opportunity.name,
    description: opportunity.description || "",
    risk_level: opportunity.risk_level,
    typical_purpose: opportunity.typical_purpose || "",
    liquidity: opportunity.liquidity || "",
    time_horizon: opportunity.time_horizon || "",
    how_it_works: opportunity.how_it_works || "",
    fees: opportunity.fees || "",
    tax_considerations: opportunity.tax_considerations || "",
    pros: opportunity.pros || "",
    cons: opportunity.cons || "",
    key_risks: opportunity.key_risks || "",
    common_access_routes: opportunity.common_access_routes || "",
    source_url: opportunity.source_url || "",
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      name: form.name.trim(),
      typical_purpose: form.typical_purpose || null,
      liquidity: form.liquidity || null,
      time_horizon: form.time_horizon || null,
      source_url: form.source_url.trim() || null,
    });
  }

  const inputClass = "w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]";
  const labelClass = "block text-[10px] mono text-[var(--muted)] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="ledger-card p-4 sm:p-5 space-y-3">
        <p className="serif text-sm tracking-wide opacity-80">Edit opportunity</p>
        <div>
          <label htmlFor="opp-name" className={labelClass}>NAME</label>
          <input id="opp-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="opp-description" className={labelClass}>DESCRIPTION</label>
          <input id="opp-description" value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="opp-risk" className={labelClass}>RISK</label>
            <select id="opp-risk" value={form.risk_level} onChange={(e) => set("risk_level", e.target.value)} className={inputClass}>
              {RISK_OPTIONS.map((r) => <option key={r} value={r} style={{ color: "var(--obsidian-2)" }}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="opp-purpose" className={labelClass}>TYPICAL PURPOSE</label>
            <select id="opp-purpose" value={form.typical_purpose} onChange={(e) => set("typical_purpose", e.target.value)} className={inputClass}>
              <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
              {PURPOSE_OPTIONS.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="opp-liquidity" className={labelClass}>LIQUIDITY</label>
            <select id="opp-liquidity" value={form.liquidity} onChange={(e) => set("liquidity", e.target.value)} className={inputClass}>
              <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
              {LIQUIDITY_OPTIONS.map((l) => <option key={l} value={l} style={{ color: "var(--obsidian-2)" }}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="opp-horizon" className={labelClass}>TIME HORIZON</label>
            <select id="opp-horizon" value={form.time_horizon} onChange={(e) => set("time_horizon", e.target.value)} className={inputClass}>
              <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
              {HORIZON_OPTIONS.map((h) => <option key={h} value={h} style={{ color: "var(--obsidian-2)" }}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="opp-fees" className={labelClass}>FEES</label>
            <input id="opp-fees" value={form.fees} onChange={(e) => set("fees", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="opp-tax" className={labelClass}>TAX CONSIDERATIONS</label>
            <input id="opp-tax" value={form.tax_considerations} onChange={(e) => set("tax_considerations", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="opp-access" className={labelClass}>COMMON ACCESS ROUTES</label>
          <input id="opp-access" value={form.common_access_routes} onChange={(e) => set("common_access_routes", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="opp-how" className={labelClass}>HOW IT WORKS</label>
          <textarea id="opp-how" value={form.how_it_works} onChange={(e) => set("how_it_works", e.target.value)} rows={3} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="opp-pros" className={labelClass}>PROS (one per line)</label>
            <textarea id="opp-pros" value={form.pros} onChange={(e) => set("pros", e.target.value)} rows={4} className={inputClass} />
          </div>
          <div>
            <label htmlFor="opp-cons" className={labelClass}>CONS (one per line)</label>
            <textarea id="opp-cons" value={form.cons} onChange={(e) => set("cons", e.target.value)} rows={4} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="opp-risks" className={labelClass}>KEY RISKS (one per line)</label>
          <textarea id="opp-risks" value={form.key_risks} onChange={(e) => set("key_risks", e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label htmlFor="opp-source" className={labelClass}>SOURCE URL</label>
          <input id="opp-source" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://…" className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-sm font-medium px-4 py-2 rounded-lg text-[var(--obsidian)]"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border text-[var(--muted)]" style={{ borderColor: "var(--line)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

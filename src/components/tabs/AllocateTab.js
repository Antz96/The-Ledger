"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import { fmt, currencySymbol, monthKey, todayKey } from "@/lib/ledgerConstants";
import { EXPLORER_CATEGORIES, RISK_FILTERS } from "@/lib/explorerCategories";
import StatementUpload from "@/components/ui/StatementUpload";

const RISK_COLOR = { Low: "var(--ledger-green-soft)", Medium: "var(--gold)", High: "var(--rust)" };

const RISK_ROWS = [
  { key: "low", label: "Low risk", desc: "Savings accounts, CDs, money market", color: "var(--ledger-green-soft)" },
  { key: "medium", label: "Medium risk", desc: "Index funds (e.g. S&P 500), diversified ETFs", color: "var(--gold)" },
  { key: "high", label: "High risk", desc: "Individual stocks, crypto", color: "var(--rust)" },
];

// Multiplier to turn a pay-period amount into a monthly-equivalent figure.
const MONTHLY_MULTIPLIER = {
  weekly: 52 / 12,
  fortnightly: 26 / 12,
  "four-weekly": 13 / 12,
  monthly: 1,
  annual: 1 / 12,
  other: 1,
};

export default function AllocateTab({ alloc, onUpdateAlloc, opportunities, isAdmin, onAddOpportunity, onUpdateOpportunity, onDeleteOpportunity, transactions = [] }) {
  const [riskFilter, setRiskFilter] = useState("All");
  const [payslip, setPayslip] = useState(null);

  const thisMonthExpenses = useMemo(
    () => transactions.filter((t) => t.type === "expense" && monthKey(t.date) === todayKey()).reduce((s, t) => s + (Number(t.amount) || 0), 0),
    [transactions]
  );

  const allocSum = alloc.low + alloc.medium + alloc.high;
  const allocDollars = {
    low: (alloc.monthly * alloc.low) / 100,
    medium: (alloc.monthly * alloc.medium) / 100,
    high: (alloc.monthly * alloc.high) / 100,
  };

  const visible = useMemo(
    () => EXPLORER_CATEGORIES.filter((c) => riskFilter === "All" || c.risk.includes(riskFilter)),
    [riskFilter]
  );

  const activeAllocated = riskFilter !== "All" ? allocDollars[riskFilter.toLowerCase()] : null;

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1">Monthly savings to allocate</p>
        <p className="text-xs mono text-[var(--faint)] mb-3">How much do you set aside each month, and how should it split across risk tiers?</p>
        <div className="flex items-center gap-2 mb-5">
          <label htmlFor="allocate-monthly" className="mono text-sm text-[var(--text)]">{currencySymbol()}</label>
          <input
            id="allocate-monthly"
            aria-label="Monthly amount to allocate"
            type="number" min="0"
            value={alloc.monthly}
            onChange={(e) => onUpdateAlloc("monthly", Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-32 border border-[var(--line)] rounded-lg px-2 py-1.5 text-sm mono bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
          <span className="text-xs text-[var(--muted)]">/ month</span>
        </div>
        {RISK_ROWS.map((row) => (
          <div key={row.key} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span id={`allocate-${row.key}-label`} className="text-sm font-medium text-[var(--text)]">{row.label}</span>
                <span className="text-xs text-[var(--faint)] mono ml-2">{row.desc}</span>
              </div>
              <span className="mono text-sm" style={{ color: row.color }}>{alloc[row.key]}% · {fmt(allocDollars[row.key])}</span>
            </div>
            <input
              type="range" min="0" max="100"
              aria-labelledby={`allocate-${row.key}-label`}
              aria-valuetext={`${alloc[row.key]}%, ${fmt(allocDollars[row.key])}`}
              value={alloc[row.key]}
              onChange={(e) => onUpdateAlloc(row.key, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
        <div className="text-xs mono mt-2" style={{ color: allocSum === 100 ? "var(--muted)" : "var(--rust)" }}>
          {allocSum === 100 ? `Totals 100% — ${fmt(alloc.monthly)}/month allocated.` : `Totals ${allocSum}% — adjust sliders so they add to 100%.`}
        </div>
      </div>

      <div className="ledger-card overflow-hidden">
        {payslip ? (
          <PayslipBreakdown
            payslip={payslip}
            thisMonthExpenses={thisMonthExpenses}
            onUseAsMonthly={(amount) => onUpdateAlloc("monthly", Math.max(0, Math.round(amount)))}
            onDismiss={() => setPayslip(null)}
          />
        ) : (
          <StatementUpload
            kind="payslip"
            label="Not sure what's left over? Upload a payslip and I'll work it out"
            className="px-4 sm:px-5 py-3"
            onResult={setPayslip}
          />
        )}
      </div>

      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Where it could go</p>
        <p className="text-xs opacity-50 mb-4">Browse the categories that fit each risk tier, and what&apos;s actually in them.</p>

        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by risk">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              aria-pressed={riskFilter === r}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={
                riskFilter === r
                  ? { background: "linear-gradient(140deg, var(--emerald), var(--cyan))", color: "var(--obsidian)", borderColor: "transparent" }
                  : { borderColor: "var(--line)", color: "var(--muted)" }
              }
            >
              {r}
            </button>
          ))}
          {activeAllocated !== null && (
            <span className="text-xs mono opacity-60">{fmt(activeAllocated)}/month allocated to {riskFilter.toLowerCase()} risk</span>
          )}
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

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            The allocation split above just does the arithmetic on percentages you choose, and the categories below
            are educational examples to explore — neither is a recommendation, and this isn&apos;t a licensed
            financial advisor. What fits depends on your age, timeline, debt, and risk tolerance. Consider talking
            to a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

function PayslipBreakdown({ payslip, thisMonthExpenses, onUseAsMonthly, onDismiss }) {
  const period = payslip.payPeriod || "other";
  const multiplier = MONTHLY_MULTIPLIER[period] ?? 1;
  const monthlyNet = (Number(payslip.netPay) || 0) * multiplier;
  const leftover = monthlyNet - thisMonthExpenses;
  const deductions = payslip.deductions || [];

  return (
    <div className="px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--muted)]">Payslip breakdown ({period})</p>
        <button onClick={onDismiss} aria-label="Dismiss payslip breakdown" className="text-[var(--faint)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1.5 text-xs mb-3">
        {payslip.grossPay != null && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--faint)]">Gross pay</span>
            <span className="mono text-[var(--text)]">{fmt(payslip.grossPay)}</span>
          </div>
        )}
        {deductions.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[var(--faint)]">{d.label}</span>
            <span className="mono text-[var(--rust)]">−{fmt(d.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="text-[var(--muted)]">Net pay (as stated)</span>
          <span className="mono text-[var(--text)]">{fmt(payslip.netPay)}</span>
        </div>
        {multiplier !== 1 && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--faint)]">Monthly equivalent</span>
            <span className="mono text-[var(--text)]">{fmt(monthlyNet)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[var(--faint)]">Expenses logged this month</span>
          <span className="mono text-[var(--rust)]">−{fmt(thisMonthExpenses)}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="font-medium text-[var(--text)]">Left over to allocate</span>
          <span className="mono font-semibold" style={{ color: leftover >= 0 ? "var(--ledger-green-soft)" : "var(--rust)" }}>{fmt(leftover)}</span>
        </div>
      </div>

      <p className="text-[11px] text-[var(--faint)] leading-relaxed mb-3">
        This is arithmetic on what your payslip and logged expenses show — not advice on where this
        money should go. That choice is entirely yours.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUseAsMonthly(leftover)}
          disabled={leftover <= 0}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-50"
          style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
        >
          Use {fmt(Math.max(0, leftover))} as my monthly amount
        </button>
        <button onClick={onDismiss} className="text-xs text-[var(--faint)] hover:text-[var(--text)] px-2">Dismiss</button>
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
          aria-label={`Name for ${opportunity.name}`}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
        />
        <input
          aria-label={`Description for ${opportunity.name}`}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="One-line description"
          className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
        />
        <div className="flex gap-1.5">
          <select
            aria-label={`Risk level for ${opportunity.name}`}
            value={draft.risk_level}
            onChange={(e) => setDraft((d) => ({ ...d, risk_level: e.target.value }))}
            className="text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {["Low", "Medium", "High"].map((r) => <option key={r} value={r} style={{ color: "var(--obsidian-2)" }}>{r}</option>)}
          </select>
          <input
            aria-label={`Source URL for ${opportunity.name}`}
            value={draft.source_url || ""}
            onChange={(e) => setDraft((d) => ({ ...d, source_url: e.target.value }))}
            placeholder="Source URL (optional)"
            className="flex-1 text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
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
            aria-label={`Save changes to ${opportunity.name}`}
            className="text-xs px-2 py-1 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(opportunity); setEditing(false); }} aria-label="Cancel editing" className="text-[var(--faint)] hover:text-[var(--text)] px-1">
            <X size={14} />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="text-xs flex items-start justify-between gap-2">
      <div>
        <Link href={`/allocate/${opportunity.id}`} className="font-medium hover:underline" style={{ color: "var(--text)" }}>
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
          <button onClick={() => setEditing(true)} aria-label={`Edit ${opportunity.name}`} className="opacity-40 hover:opacity-100"><Pencil size={12} /></button>
          <button onClick={() => onDelete(opportunity.id)} aria-label={`Delete ${opportunity.name}`} className="opacity-40 hover:opacity-100"><Trash2 size={12} /></button>
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
          <label htmlFor="new-opp-category" className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
          <select
            id="new-opp-category"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {EXPLORER_CATEGORIES.map((c) => <option key={c.id} value={c.id} style={{ color: "var(--obsidian-2)" }}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="new-opp-name" className="block text-[10px] mono opacity-60 mb-1">NAME</label>
          <input
            id="new-opp-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
        </div>
        <div>
          <label htmlFor="new-opp-risk" className="block text-[10px] mono opacity-60 mb-1">RISK</label>
          <select
            id="new-opp-risk"
            value={form.risk_level}
            onChange={(e) => setForm((f) => ({ ...f, risk_level: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {["Low", "Medium", "High"].map((r) => <option key={r} value={r} style={{ color: "var(--obsidian-2)" }}>{r}</option>)}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="new-opp-description" className="block text-[10px] mono opacity-60 mb-1">DESCRIPTION</label>
          <input
            id="new-opp-description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="One-line, plain English"
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="new-opp-source" className="block text-[10px] mono opacity-60 mb-1">SOURCE URL</label>
          <input
            id="new-opp-source"
            value={form.source_url}
            onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
            placeholder="https://…"
            className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

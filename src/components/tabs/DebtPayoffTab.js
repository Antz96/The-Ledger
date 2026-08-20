"use client";

import { useMemo, useState } from "react";
import { TrendingDown, Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { fmt, LIABILITY_CATEGORIES } from "@/lib/ledgerConstants";
import { payoffProjection, buildRepaymentPatch, formatPayoffDate, simulateDebtPayoffStrategy } from "@/lib/debtPayoff";
import StatementUpload from "@/components/ui/StatementUpload";
import ImportReview from "@/components/ui/ImportReview";

export default function DebtPayoffTab({ liabilities, onAdd, onUpdate, onDelete }) {
  const [pending, setPending] = useState(null);
  const [adding, setAdding] = useState(false);
  const totalDebt = liabilities.reduce((s, l) => s + (Number(l.balance) || 0), 0);
  const tracked = liabilities.filter((l) => Number(l.monthly_repayment) > 0);
  const totalRepaymentPerMonth = tracked.reduce((s, l) => s + Number(l.monthly_repayment), 0);

  function handleExtracted(result) {
    const rows = (result.items || []).map((item, i) => ({
      _key: `${Date.now()}-${i}`,
      include: true,
      name: item.name || "",
      category: LIABILITY_CATEGORIES.includes(item.category) ? item.category : LIABILITY_CATEGORIES[0],
      balance: Number(item.balance) || 0,
    }));
    setPending(rows);
  }

  function updateRow(key, patch) {
    setPending((rows) => rows.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key) {
    setPending((rows) => rows.filter((r) => r._key !== key));
  }

  async function confirmImport() {
    setAdding(true);
    for (const row of pending.filter((r) => r.include)) {
      await onAdd({ name: row.name.trim() || "Untitled", category: row.category, balance: Number(row.balance) || 0 });
    }
    setAdding(false);
    setPending(null);
  }

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1 flex items-center gap-1.5">
          <TrendingDown size={15} style={{ color: "var(--rust)" }} /> Debt payoff
        </p>
        <p className="text-xs opacity-50 mb-4">
          A simple projection based on what you&apos;re putting toward each debt each month. Add an interest rate to
          a debt to also compare payoff strategies below.
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

      <PayoffStrategy liabilities={liabilities} />

      <div className="ledger-card overflow-hidden">
        {pending ? (
          <ImportReview
            rows={pending}
            categories={LIABILITY_CATEGORIES}
            valueField="balance"
            valueLabel="BALANCE"
            withPurpose={false}
            onUpdateRow={updateRow}
            onRemoveRow={removeRow}
            onConfirm={confirmImport}
            onDiscard={() => setPending(null)}
            adding={adding}
          />
        ) : (
          <StatementUpload kind="liabilities" label="Upload a statement to add debts automatically" onResult={handleExtracted} />
        )}
      </div>

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
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">INTEREST RATE (% APR)</label>
            <input
              aria-label={`Interest rate for ${item.name}`}
              type="number" min="0" step="0.01"
              value={draft.apr_pct ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, apr_pct: e.target.value }))}
              placeholder="optional"
              className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const patch = {
                name: draft.name.trim(),
                category: draft.category,
                balance: parseFloat(draft.balance) || 0,
                apr_pct: draft.apr_pct === "" || draft.apr_pct == null ? null : parseFloat(draft.apr_pct) || 0,
              };
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
          <p className="text-[10px] mono opacity-50">
            {item.category}{Number(item.apr_pct) > 0 ? ` · ${Number(item.apr_pct)}% APR` : ""}
          </p>
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

// The user picks the strategy; this only calculates what following their
// choice would look like (blueprint checklist §7: "does allowing a user to
// choose avalanche/snowball create debt-counselling risk?" — by construction
// here, Ledger never picks one, so there's nothing being recommended).
// Neither option is pre-selected as a default "best" pick, and both are
// styled identically except for which one is currently chosen.
function PayoffStrategy({ liabilities }) {
  const [strategy, setStrategy] = useState("avalanche");
  const [extra, setExtra] = useState(0);

  const trackedDebts = useMemo(() => liabilities.filter((l) => Number(l.balance) > 0), [liabilities]);
  const result = useMemo(
    () => simulateDebtPayoffStrategy(trackedDebts, extra, strategy),
    [trackedDebts, extra, strategy]
  );

  if (trackedDebts.length === 0) return null;

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-1">Payoff strategy</p>
      <p className="text-xs opacity-50 mb-4">
        Pick an order to pay these off in, and see what following it would look like. This calculates the
        consequences of your choice — it isn&apos;t a recommendation of one over the other.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <StrategyOption
          selected={strategy === "avalanche"}
          onSelect={() => setStrategy("avalanche")}
          title="Avalanche"
          desc="Minimums on everything, extra toward whichever debt has the highest interest rate. Mathematically minimizes total interest paid."
        />
        <StrategyOption
          selected={strategy === "snowball"}
          onSelect={() => setStrategy("snowball")}
          title="Snowball"
          desc="Minimums on everything, extra toward whichever debt has the smallest balance. Clears individual debts faster."
        />
      </div>

      <div className="mb-4">
        <label htmlFor="strategy-extra" className="block text-[10px] mono opacity-60 mb-1">EXTRA PER MONTH, BEYOND MINIMUMS</label>
        <input
          id="strategy-extra"
          type="number" min="0" step="0.01"
          value={extra}
          onChange={(e) => setExtra(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-40 text-sm mono border rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)]"
          style={{ borderColor: "var(--line)" }}
        />
      </div>

      {result.monthsToDebtFree === null ? (
        <p className="text-xs mb-3" style={{ color: "var(--rust)" }}>
          At this rate, these debts wouldn&apos;t clear within 50 years — try a higher extra payment.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] mono opacity-50 mb-1">DEBT-FREE IN</p>
            <p className="text-lg font-semibold">{result.monthsToDebtFree} mo</p>
          </div>
          <div>
            <p className="text-[10px] mono opacity-50 mb-1">TOTAL INTEREST</p>
            <p className="text-lg font-semibold" style={{ color: "var(--rust)" }}>{fmt(result.totalInterestPaid)}</p>
          </div>
        </div>
      )}

      <p className="text-[10px] mono opacity-50 mb-1.5">ORDER</p>
      <ol className="text-xs space-y-1 mb-3">
        {result.order.map((d, i) => (
          <li key={d.id} className="flex justify-between text-[var(--muted)]">
            <span>{i + 1}. {d.name}</span>
            <span className="mono">{d.monthsToPayoff === null ? "—" : `paid off month ${d.monthsToPayoff}`}</span>
          </li>
        ))}
      </ol>

      <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
        <ShieldAlert size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
        <p className="text-[11px] leading-relaxed text-[var(--faint)]">
          Real repayments depend on your actual lender terms, which can differ from a flat interest-rate
          assumption. Debts without a rate set are treated as 0%.
        </p>
      </div>
    </div>
  );
}

function StrategyOption({ selected, onSelect, title, desc }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="text-left p-3 rounded-lg border"
      style={selected ? { borderColor: "var(--emerald)", background: "rgba(15,185,129,0.06)" } : { borderColor: "var(--line)" }}
    >
      <p className="text-sm font-medium text-[var(--text)] mb-1">{title}</p>
      <p className="text-[11px] text-[var(--muted)] leading-relaxed">{desc}</p>
    </button>
  );
}

function AddDebtForm({ onAdd }) {
  const empty = { name: "", category: LIABILITY_CATEGORIES[0], balance: "", monthly_repayment: "", apr_pct: "" };
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
    if (form.apr_pct !== "") entry.apr_pct = parseFloat(form.apr_pct) || 0;
    onAdd(entry);
    setForm(empty);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a debt</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
        <div>
          <label htmlFor="debt-apr" className="block text-[10px] mono opacity-60 mb-1">INTEREST RATE (% APR)</label>
          <input
            id="debt-apr"
            type="number" min="0" step="0.01"
            value={form.apr_pct}
            onChange={(e) => setForm((f) => ({ ...f, apr_pct: e.target.value }))}
            placeholder="optional"
            className="w-full text-sm mono border rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] placeholder:text-[var(--faint)]"
            style={{ borderColor: "var(--line)" }}
          />
        </div>
        <div className="col-span-2 sm:col-span-5">
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

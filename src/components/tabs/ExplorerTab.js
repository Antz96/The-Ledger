"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, Pencil, Trash2, X, ExternalLink, GitCompare } from "lucide-react";
import { ASSET_PURPOSES } from "@/lib/ledgerConstants";
import {
  EXPLORER_CATEGORIES,
  RISK_LEVELS,
  RISK_FILTERS,
  RISK_COLOR,
  LIQUIDITY_FILTERS,
  HORIZON_FILTERS,
  KNOWLEDGE_FILTERS,
  PRODUCT_TYPE_FILTERS,
  horizonBucketForMonthsAway,
} from "@/lib/explorerCategories";
import ScenarioLab from "@/components/tabs/ScenarioLab";

const PURPOSE_FILTERS = ["All", ...ASSET_PURPOSES];

function monthsUntil(dateString) {
  const target = new Date(dateString);
  const now = new Date();
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
}

export default function ExplorerTab({
  alloc, opportunities, financialGoals = [], liabilities = [], isAdmin,
  onAddOpportunity, onUpdateOpportunity, onDeleteOpportunity,
}) {
  const router = useRouter();
  const [riskFilter, setRiskFilter] = useState("All");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [liquidityFilter, setLiquidityFilter] = useState("All");
  const [horizonFilter, setHorizonFilter] = useState("All");
  const [knowledgeFilter, setKnowledgeFilter] = useState("All");
  const [productTypeFilter, setProductTypeFilter] = useState("All");
  const [goalFilterId, setGoalFilterId] = useState("");
  const [compareIds, setCompareIds] = useState([]);

  const goalsWithDates = useMemo(() => financialGoals.filter((g) => g.target_date), [financialGoals]);

  // Selecting a goal translates its own target_date into a starting Time
  // Horizon filter — a calculation ("this goal is ~14 months out, so
  // that's the 1-3 years bucket"), not Ledger judging what's right for
  // that goal. The user can still change the horizon filter afterward.
  function handleGoalFilterChange(id) {
    setGoalFilterId(id);
    if (!id) return;
    const goal = goalsWithDates.find((g) => g.id === id);
    if (goal) setHorizonFilter(horizonBucketForMonthsAway(monthsUntil(goal.target_date)));
  }

  function toggleCompare(id) {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const visible = useMemo(
    () => EXPLORER_CATEGORIES.filter((c) => riskFilter === "All" || c.risk.includes(riskFilter)),
    [riskFilter]
  );

  const filtersActive =
    purposeFilter !== "All" || liquidityFilter !== "All" || horizonFilter !== "All" ||
    knowledgeFilter !== "All" || productTypeFilter !== "All";
  const filteredOpportunities = useMemo(
    () =>
      opportunities.filter(
        (o) =>
          (purposeFilter === "All" || o.typical_purpose === purposeFilter) &&
          (liquidityFilter === "All" || o.liquidity === liquidityFilter) &&
          (horizonFilter === "All" || o.time_horizon === horizonFilter) &&
          (knowledgeFilter === "All" || o.knowledge_level === knowledgeFilter) &&
          (productTypeFilter === "All" || o.product_type === productTypeFilter)
      ),
    [opportunities, purposeFilter, liquidityFilter, horizonFilter, knowledgeFilter, productTypeFilter]
  );

  return (
    <div className="space-y-4">
      <ScenarioLab alloc={alloc} financialGoals={financialGoals} liabilities={liabilities} />

      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Where it could go</p>
        <p className="text-xs opacity-50 mb-4">Browse the categories that fit each risk tier, and what&apos;s actually in them.</p>

        <div className="flex items-center gap-2 flex-wrap mb-4" role="group" aria-label="Filter by risk">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label htmlFor="explore-purpose" className="block text-[10px] mono opacity-60 mb-1">PURPOSE</label>
            <select
              id="explore-purpose"
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {PURPOSE_FILTERS.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="explore-liquidity" className="block text-[10px] mono opacity-60 mb-1">LIQUIDITY</label>
            <select
              id="explore-liquidity"
              value={liquidityFilter}
              onChange={(e) => setLiquidityFilter(e.target.value)}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {LIQUIDITY_FILTERS.map((l) => <option key={l} value={l} style={{ color: "var(--obsidian-2)" }}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="explore-horizon" className="block text-[10px] mono opacity-60 mb-1">TIME HORIZON</label>
            <select
              id="explore-horizon"
              value={horizonFilter}
              onChange={(e) => setHorizonFilter(e.target.value)}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {HORIZON_FILTERS.map((h) => <option key={h} value={h} style={{ color: "var(--obsidian-2)" }}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="explore-knowledge" className="block text-[10px] mono opacity-60 mb-1">KNOWLEDGE NEEDED</label>
            <select
              id="explore-knowledge"
              value={knowledgeFilter}
              onChange={(e) => setKnowledgeFilter(e.target.value)}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {KNOWLEDGE_FILTERS.map((k) => <option key={k} value={k} style={{ color: "var(--obsidian-2)" }}>{k}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="explore-product-type" className="block text-[10px] mono opacity-60 mb-1">PRODUCT TYPE</label>
            <select
              id="explore-product-type"
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {PRODUCT_TYPE_FILTERS.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
            </select>
          </div>
          {goalsWithDates.length > 0 && (
            <div>
              <label htmlFor="explore-goal" className="block text-[10px] mono opacity-60 mb-1">EXPLORING FOR A GOAL?</label>
              <select
                id="explore-goal"
                value={goalFilterId}
                onChange={(e) => handleGoalFilterChange(e.target.value)}
                className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              >
                <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
                {goalsWithDates.map((g) => <option key={g.id} value={g.id} style={{ color: "var(--obsidian-2)" }}>{g.name}</option>)}
              </select>
            </div>
          )}
        </div>
        {goalFilterId && (
          <p className="text-xs mono opacity-50 mt-2">
            Set the time horizon filter to match this goal&apos;s target date — feel free to change it.
          </p>
        )}
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
              opportunities={filteredOpportunities.filter((o) => o.category_id === cat.id)}
              filtersActive={filtersActive}
              isAdmin={isAdmin}
              onUpdate={onUpdateOpportunity}
              onDelete={onDeleteOpportunity}
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
            />
          </div>
        ))}
      </div>

      {compareIds.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full ledger-card shadow-lg">
          <span className="text-xs mono opacity-70">{compareIds.length} selected</span>
          <button
            onClick={() => router.push(`/explorer/compare?ids=${compareIds.join(",")}`)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            <GitCompare size={13} /> Compare
          </button>
          <button onClick={() => setCompareIds([])} aria-label="Clear comparison selection" className="text-[var(--faint)] hover:text-[var(--text)] px-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {isAdmin && <AddOpportunityForm onAdd={onAddOpportunity} />}

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            These categories are educational examples to explore, not a recommendation — this isn&apos;t a licensed
            financial advisor. What fits depends on your age, timeline, debt, and risk tolerance. Consider talking
            to a fee-only fiduciary advisor for guidance specific to your situation.
          </p>
        </div>
      </div>
    </div>
  );
}

function CuratedOpportunities({ opportunities, filtersActive, isAdmin, onUpdate, onDelete, compareIds, onToggleCompare }) {
  if (opportunities.length === 0 && !isAdmin && !filtersActive) return null;

  return (
    <div className="pt-2 border-t" style={{ borderColor: "var(--line)" }}>
      <p className="text-[10px] mono opacity-50 mb-1.5 mt-2">CURATED</p>
      {opportunities.length === 0 ? (
        <p className="text-xs opacity-40 mono">{filtersActive ? "None match your filters." : "None added yet."}</p>
      ) : (
        <ul className="space-y-2">
          {opportunities.map((o) => (
            <OpportunityRow
              key={o.id}
              opportunity={o}
              isAdmin={isAdmin}
              onUpdate={onUpdate}
              onDelete={onDelete}
              checked={compareIds.includes(o.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function OpportunityRow({ opportunity, isAdmin, onUpdate, onDelete, checked, onToggleCompare }) {
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
            {RISK_LEVELS.map((r) => <option key={r} value={r} style={{ color: "var(--obsidian-2)" }}>{r}</option>)}
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
      <div className="flex items-start gap-1.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggleCompare(opportunity.id)}
          aria-label={`Select ${opportunity.name} to compare`}
          className="mt-1 flex-shrink-0"
        />
        <div>
          <Link href={`/explorer/${opportunity.id}`} className="font-medium hover:underline" style={{ color: "var(--text)" }}>
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
            {RISK_LEVELS.map((r) => <option key={r} value={r} style={{ color: "var(--obsidian-2)" }}>{r}</option>)}
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

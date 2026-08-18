"use client";

import { useMemo, useState } from "react";
import { Landmark, PiggyBank, Plus, Pencil, Trash2, TrendingDown, Wallet, X } from "lucide-react";
import {
  fmt,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
  ASSET_PURPOSES as PURPOSES,
  CATEGORY_PURPOSE_DEFAULT,
} from "@/lib/ledgerConstants";
import SummaryCard from "@/components/ui/SummaryCard";
import StatementUpload from "@/components/ui/StatementUpload";

export default function AssetsTab({
  assets,
  liabilities,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability,
}) {
  const totalAssets = useMemo(() => assets.reduce((s, a) => s + (Number(a.value) || 0), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + (Number(l.balance) || 0), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <div>
        <p className="serif text-sm tracking-wide opacity-80 mb-3">Net worth — right now</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <SummaryCard icon={<PiggyBank size={16} />} label="Total assets" value={fmt(totalAssets)} color="var(--ledger-green-soft)" />
          <SummaryCard icon={<TrendingDown size={16} />} label="Total liabilities" value={fmt(totalLiabilities)} color="var(--rust)" />
          <SummaryCard
            icon={<Wallet size={16} />}
            label="Net worth"
            value={fmt(netWorth)}
            color={netWorth >= 0 ? "var(--ledger-green-soft)" : "var(--rust)"}
          />
        </div>
      </div>

      <Section
        title="Assets"
        idPrefix="asset"
        icon={<Landmark size={15} style={{ color: "var(--ledger-green-soft)" }} />}
        items={assets}
        categories={ASSET_CATEGORIES}
        valueField="value"
        valueLabel="VALUE"
        onAdd={onAddAsset}
        onUpdate={onUpdateAsset}
        onDelete={onDeleteAsset}
        emptyText="No assets added yet."
        withPurpose
        extractKind="assets"
      />

      <Section
        title="Liabilities"
        idPrefix="liability"
        icon={<TrendingDown size={15} style={{ color: "var(--rust)" }} />}
        items={liabilities}
        categories={LIABILITY_CATEGORIES}
        valueField="balance"
        valueLabel="BALANCE"
        onAdd={onAddLiability}
        onUpdate={onUpdateLiability}
        onDelete={onDeleteLiability}
        emptyText="No liabilities added yet."
        extractKind="liabilities"
      />
    </div>
  );
}

function Section({ title, idPrefix, icon, items, categories, valueField, valueLabel, onAdd, onUpdate, onDelete, emptyText, withPurpose, extractKind }) {
  const [pending, setPending] = useState(null);
  const [adding, setAdding] = useState(false);

  function handleExtracted(result) {
    const rows = (result.items || []).map((item, i) => ({
      _key: `${Date.now()}-${i}`,
      include: true,
      name: item.name || "",
      category: categories.includes(item.category) ? item.category : categories[0],
      purpose: withPurpose
        ? PURPOSES.includes(item.purpose) ? item.purpose : (CATEGORY_PURPOSE_DEFAULT[item.category] || PURPOSES[0])
        : undefined,
      [valueField]: Number(item[valueField]) || 0,
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
      const entry = { name: row.name.trim() || "Untitled", category: row.category, [valueField]: Number(row[valueField]) || 0 };
      if (withPurpose) entry.purpose = row.purpose;
      await onAdd(entry);
    }
    setAdding(false);
    setPending(null);
  }

  return (
    <div className="ledger-card overflow-hidden">
      <p className="serif text-sm tracking-wide opacity-80 px-4 sm:px-5 pt-4 pb-2 flex items-center gap-1.5">
        {icon} {title}
      </p>
      {items.length === 0 ? (
        <p className="text-xs opacity-50 mono px-5 py-6 text-center">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-1">
            <thead>
              <tr className="text-[10px] mono opacity-50 border-t border-b" style={{ borderColor: "var(--line)" }}>
                <th className="text-left px-5 py-2 font-normal">NAME</th>
                <th className="text-left px-3 py-2 font-normal">CATEGORY</th>
                {withPurpose && <th className="text-left px-3 py-2 font-normal">PURPOSE</th>}
                <th className="text-right px-3 py-2 font-normal">{valueLabel}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  categories={categories}
                  valueField={valueField}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  withPurpose={withPurpose}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending ? (
        <ImportReview
          rows={pending}
          categories={categories}
          valueField={valueField}
          valueLabel={valueLabel}
          withPurpose={withPurpose}
          onUpdateRow={updateRow}
          onRemoveRow={removeRow}
          onConfirm={confirmImport}
          onDiscard={() => setPending(null)}
          adding={adding}
        />
      ) : (
        <StatementUpload
          kind={extractKind}
          label={`Upload a statement to add ${title.toLowerCase()} automatically`}
          onResult={handleExtracted}
        />
      )}
      <AddForm idPrefix={idPrefix} categories={categories} valueField={valueField} valueLabel={valueLabel} onAdd={onAdd} withPurpose={withPurpose} />
    </div>
  );
}

function ImportReview({ rows, categories, valueField, valueLabel, withPurpose, onUpdateRow, onRemoveRow, onConfirm, onDiscard, adding }) {
  const includedCount = rows.filter((r) => r.include).length;

  return (
    <div className="px-4 sm:px-5 py-4 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--muted)]">
          {rows.length === 0
            ? "Nothing found in that PDF."
            : `Found ${rows.length} ${rows.length === 1 ? "entry" : "entries"} — review before adding.`}
        </p>
        <button onClick={onDiscard} aria-label="Discard extracted entries" className="text-[var(--faint)] hover:text-[var(--text)]">
          <X size={14} />
        </button>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2 mb-3">
          {rows.map((row) => (
            <div key={row._key} className={`grid grid-cols-[auto_1fr_1fr_${withPurpose ? "1fr_" : ""}1fr_auto] gap-2 items-center`}>
              <input
                type="checkbox"
                checked={row.include}
                onChange={(e) => onUpdateRow(row._key, { include: e.target.checked })}
                aria-label={`Include ${row.name || "this entry"}`}
                className="w-3.5 h-3.5"
              />
              <input
                value={row.name}
                onChange={(e) => onUpdateRow(row._key, { name: e.target.value })}
                aria-label="Name"
                className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
              <select
                value={row.category}
                onChange={(e) => onUpdateRow(row._key, { category: e.target.value })}
                aria-label="Category"
                className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              >
                {categories.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
              </select>
              {withPurpose && (
                <select
                  value={row.purpose}
                  onChange={(e) => onUpdateRow(row._key, { purpose: e.target.value })}
                  aria-label="Purpose"
                  className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
                >
                  {PURPOSES.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
                </select>
              )}
              <input
                type="number" min="0" step="0.01"
                value={row[valueField]}
                onChange={(e) => onUpdateRow(row._key, { [valueField]: e.target.value })}
                aria-label={valueLabel}
                className="w-full text-xs mono text-right border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
              />
              <button onClick={() => onRemoveRow(row._key)} aria-label="Remove this entry" className="text-[var(--faint)] hover:text-[var(--text)]">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {rows.length > 0 && (
          <button
            onClick={onConfirm}
            disabled={includedCount === 0 || adding}
            className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)] disabled:opacity-50"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            {adding ? "Adding…" : `Add ${includedCount}`}
          </button>
        )}
        <button onClick={onDiscard} className="text-xs text-[var(--faint)] hover:text-[var(--text)] px-2">
          {rows.length === 0 ? "Dismiss" : "Discard"}
        </button>
      </div>
    </div>
  );
}

function Row({ item, categories, valueField, onUpdate, onDelete, withPurpose }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  if (editing) {
    return (
      <tr className="border-b" style={{ borderColor: "var(--line)" }}>
        <td className="px-5 py-2">
          <input
            aria-label={`Name for ${item.name}`}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
        </td>
        <td className="px-3 py-2">
          <select
            aria-label={`Category for ${item.name}`}
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {categories.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
          </select>
        </td>
        {withPurpose && (
          <td className="px-3 py-2">
            <select
              aria-label={`Purpose for ${item.name}`}
              value={draft.purpose}
              onChange={(e) => setDraft((d) => ({ ...d, purpose: e.target.value }))}
              className="w-full text-xs border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
            >
              {PURPOSES.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
            </select>
          </td>
        )}
        <td className="px-3 py-2">
          <input
            aria-label={`${valueLabel} for ${item.name}`}
            type="number" min="0" step="0.01"
            value={draft[valueField]}
            onChange={(e) => setDraft((d) => ({ ...d, [valueField]: e.target.value }))}
            className="w-full text-xs mono text-right border border-[var(--line)] rounded px-1.5 py-1 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          />
        </td>
        <td className="px-3 py-2 text-right whitespace-nowrap">
          <button
            onClick={() => {
              const patch = {
                name: draft.name.trim(),
                category: draft.category,
                [valueField]: parseFloat(draft[valueField]) || 0,
              };
              if (withPurpose) patch.purpose = draft.purpose;
              onUpdate(item.id, patch);
              setEditing(false);
            }}
            aria-label={`Save changes to ${item.name}`}
            className="text-xs px-2 py-1 rounded-lg mr-1 text-[var(--obsidian)]"
            style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))" }}
          >
            Save
          </button>
          <button onClick={() => { setDraft(item); setEditing(false); }} aria-label="Cancel editing" className="text-[var(--faint)] hover:text-[var(--text)] align-middle">
            <X size={14} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>
      <td className="px-5 py-2.5 text-sm">{item.name}</td>
      <td className="px-3 py-2.5 text-xs opacity-70">{item.category}</td>
      {withPurpose && <td className="px-3 py-2.5 text-xs opacity-70">{item.purpose}</td>}
      <td className="px-3 py-2.5 mono text-right">{fmt(item[valueField])}</td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap">
        <button onClick={() => setEditing(true)} aria-label={`Edit ${item.name}`} className="opacity-40 hover:opacity-100 mr-2"><Pencil size={13} /></button>
        <button onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`} className="opacity-40 hover:opacity-100"><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}

function AddForm({ idPrefix, categories, valueField, valueLabel, onAdd, withPurpose }) {
  const empty = { name: "", category: categories[0], purpose: CATEGORY_PURPOSE_DEFAULT[categories[0]] || "Growth", [valueField]: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function handleCategoryChange(category) {
    setForm((f) => ({ ...f, category, purpose: CATEGORY_PURPOSE_DEFAULT[category] || f.purpose }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Enter a name.");
    const amt = parseFloat(form[valueField]);
    if (Number.isNaN(amt) || amt < 0) return setError(`Enter a valid ${valueLabel.toLowerCase()}.`);
    const entry = { name: form.name.trim(), category: form.category, [valueField]: amt };
    if (withPurpose) entry.purpose = form.purpose;
    onAdd(entry);
    setForm(empty);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid grid-cols-2 ${withPurpose ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-3 items-end px-4 sm:px-5 py-4 border-t`}
      style={{ borderColor: "var(--line)" }}
    >
      <div>
        <label htmlFor={`${idPrefix}-name`} className="block text-[10px] mono opacity-60 mb-1">NAME</label>
        <input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Everyday savings"
          className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-category`} className="block text-[10px] mono opacity-60 mb-1">CATEGORY</label>
        <select
          id={`${idPrefix}-category`}
          value={form.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
        >
          {categories.map((c) => <option key={c} value={c} style={{ color: "var(--obsidian-2)" }}>{c}</option>)}
        </select>
      </div>
      {withPurpose && (
        <div>
          <label htmlFor={`${idPrefix}-purpose`} className="block text-[10px] mono opacity-60 mb-1">PURPOSE</label>
          <select
            id={`${idPrefix}-purpose`}
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
          >
            {PURPOSES.map((p) => <option key={p} value={p} style={{ color: "var(--obsidian-2)" }}>{p}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor={`${idPrefix}-value`} className="block text-[10px] mono opacity-60 mb-1">{valueLabel}</label>
        <input
          id={`${idPrefix}-value`}
          type="number" min="0" step="0.01"
          value={form[valueField]}
          onChange={(e) => setForm((f) => ({ ...f, [valueField]: e.target.value }))}
          placeholder="0.00"
          className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-[var(--obsidian)]"
        style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
      >
        <Plus size={15} /> Add
      </button>
      {error && <p className="text-xs col-span-2 sm:col-span-5" style={{ color: "var(--rust)" }}>{error}</p>}
    </form>
  );
}

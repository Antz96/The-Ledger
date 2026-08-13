"use client";

import { useState } from "react";
import { Target, Plus, Pencil, Trash2, X } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";

function monthsBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function projectGoal(goal) {
  const monthsElapsed = monthsBetween(goal.created_at, new Date());
  const projectedSaved = Number(goal.starting_amount) + Number(goal.monthly_contribution) * monthsElapsed;
  const target = Number(goal.target_amount);
  const progressPct = target > 0 ? Math.min(100, (projectedSaved / target) * 100) : 0;
  const remaining = Math.max(0, target - projectedSaved);
  const monthlyContribution = Number(goal.monthly_contribution);

  let projectedDate = null;
  if (remaining === 0) {
    projectedDate = "reached";
  } else if (monthlyContribution > 0) {
    const monthsToGo = Math.ceil(remaining / monthlyContribution);
    projectedDate = addMonths(new Date(), monthsToGo);
  }

  let onTrack = null;
  if (goal.target_date && projectedDate && projectedDate !== "reached") {
    onTrack = projectedDate <= new Date(goal.target_date);
  }

  return { projectedSaved, progressPct, remaining, projectedDate, onTrack };
}

export default function GoalsTab({ goals, onAdd, onUpdate, onDelete }) {
  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <div className="ledger-card p-4 sm:p-5 text-center">
          <Target size={20} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs opacity-50 mono">No goals yet — add one below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
      <AddGoalForm onAdd={onAdd} />
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: goal.name,
    target_amount: goal.target_amount,
    starting_amount: goal.starting_amount,
    monthly_contribution: goal.monthly_contribution,
    target_date: goal.target_date || "",
  });

  const { progressPct, projectedSaved, projectedDate, onTrack } = projectGoal(goal);

  if (editing) {
    return (
      <div className="ledger-card p-4 sm:p-5 space-y-2">
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">TARGET</label>
            <input
              type="number" min="0" step="0.01"
              value={draft.target_amount}
              onChange={(e) => setDraft((d) => ({ ...d, target_amount: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">STARTING</label>
            <input
              type="number" min="0" step="0.01"
              value={draft.starting_amount}
              onChange={(e) => setDraft((d) => ({ ...d, starting_amount: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">MONTHLY</label>
            <input
              type="number" min="0" step="0.01"
              value={draft.monthly_contribution}
              onChange={(e) => setDraft((d) => ({ ...d, monthly_contribution: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
          <div>
            <label className="block text-[10px] mono opacity-60 mb-1">TARGET DATE</label>
            <input
              type="date"
              value={draft.target_date}
              onChange={(e) => setDraft((d) => ({ ...d, target_date: e.target.value }))}
              className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
            />
          </div>
        </div>
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => {
              onUpdate(goal.id, {
                name: draft.name.trim(),
                target_amount: parseFloat(draft.target_amount) || 0,
                starting_amount: parseFloat(draft.starting_amount) || 0,
                monthly_contribution: parseFloat(draft.monthly_contribution) || 0,
                target_date: draft.target_date || null,
              });
              setEditing(false);
            }}
            className="text-xs px-3 py-1.5 rounded"
            style={{ background: "var(--ledger-green)", color: "#F7F3E8" }}
          >
            Save
          </button>
          <button onClick={() => setEditing(false)} className="text-xs px-2 py-1.5 opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="serif text-sm">{goal.name}</p>
        <div className="flex gap-1.5">
          <button onClick={() => setEditing(true)} className="opacity-40 hover:opacity-100"><Pencil size={13} /></button>
          <button onClick={() => onDelete(goal.id)} className="opacity-40 hover:opacity-100"><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="h-2.5 w-full rounded-full bg-[#EDE7D6] overflow-hidden mb-1.5">
        <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--gold)" }} />
      </div>
      <div className="flex justify-between text-xs mono opacity-70 mb-3">
        <span>{fmt(projectedSaved)} projected</span>
        <span>{progressPct.toFixed(0)}% of {fmt(goal.target_amount)}</span>
      </div>

      <div className="text-xs opacity-60 space-y-0.5">
        {Number(goal.monthly_contribution) > 0 && <p>{fmt(goal.monthly_contribution)}/month</p>}
        {goal.target_date && <p>Target date: {goal.target_date}</p>}
        {projectedDate === "reached" && <p style={{ color: "var(--ledger-green-soft)" }}>Target reached</p>}
        {projectedDate && projectedDate !== "reached" && (
          <p>
            Estimated: {projectedDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
            {onTrack !== null && (
              <span style={{ color: onTrack ? "var(--ledger-green-soft)" : "var(--rust)" }}>
                {" "}— {onTrack ? "on track" : "behind schedule"}
              </span>
            )}
          </p>
        )}
        {!projectedDate && Number(goal.monthly_contribution) === 0 && (
          <p className="opacity-50">Add a monthly contribution to see an estimated date.</p>
        )}
      </div>
    </div>
  );
}

function AddGoalForm({ onAdd }) {
  const empty = { name: "", target_amount: "", starting_amount: "", monthly_contribution: "", target_date: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Enter a name.");
    const target = parseFloat(form.target_amount);
    if (Number.isNaN(target) || target <= 0) return setError("Enter a valid target amount.");
    onAdd({
      name: form.name.trim(),
      target_amount: target,
      starting_amount: parseFloat(form.starting_amount) || 0,
      monthly_contribution: parseFloat(form.monthly_contribution) || 0,
      target_date: form.target_date || null,
    });
    setForm(empty);
  }

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide opacity-80 mb-3 flex items-center gap-1.5"><Plus size={15} /> Add a goal</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] mono opacity-60 mb-1">NAME</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Emergency fund"
            className="w-full text-sm border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">TARGET</label>
          <input
            type="number" min="0" step="0.01"
            value={form.target_amount}
            onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
            placeholder="0.00"
            className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">STARTING</label>
          <input
            type="number" min="0" step="0.01"
            value={form.starting_amount}
            onChange={(e) => setForm((f) => ({ ...f, starting_amount: e.target.value }))}
            placeholder="0.00"
            className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div>
          <label className="block text-[10px] mono opacity-60 mb-1">MONTHLY</label>
          <input
            type="number" min="0" step="0.01"
            value={form.monthly_contribution}
            onChange={(e) => setForm((f) => ({ ...f, monthly_contribution: e.target.value }))}
            placeholder="0.00"
            className="w-full text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-[10px] mono opacity-60 mb-1">TARGET DATE (optional)</label>
          <input
            type="date"
            value={form.target_date}
            onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
            className="w-full sm:w-48 text-sm mono border border-[var(--line)] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[var(--ledger-green-soft)]"
          />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded text-[#F7F3E8]" style={{ background: "var(--ledger-green)" }}>
            <Plus size={15} /> Add goal
          </button>
        </div>
      </form>
      {error && <p className="text-xs mt-2" style={{ color: "var(--rust)" }}>{error}</p>}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, CheckSquare, Square, BookOpen, Info } from "lucide-react";
import { fmt } from "@/lib/ledgerConstants";
import {
  CREDIT_FACTORS, CREDIT_ACTIONS, CREDIT_GOALS, PAYMENT_HISTORY_OPTIONS, ELECTORAL_ROLL_OPTIONS,
  CREDIT_PROFILE_FIELD_HELP,
} from "@/lib/creditHealthContent";

function InfoTooltip({ text }) {
  return (
    <span className="relative inline-flex group/tip">
      <button
        type="button"
        aria-label="More information"
        className="text-[var(--faint)] hover:text-[var(--emerald)] focus:text-[var(--emerald)] outline-none"
      >
        <Info size={11} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-52 rounded-lg px-2.5 py-2 text-[11px] leading-relaxed normal-case tracking-normal font-normal opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 transition-opacity"
        style={{ background: "var(--obsidian-2)", color: "var(--text)", border: "1px solid var(--line)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
      >
        {text}
      </span>
    </span>
  );
}

const UTIL_COLOR = (pct) => {
  if (pct === null || pct === undefined || pct === "") return "var(--text)";
  const n = Number(pct);
  if (n <= 30) return "var(--emerald)";
  if (n <= 75) return "var(--gold)";
  return "var(--rust)";
};

export default function CreditHealthTab({
  completedActionIds,
  onToggleAction,
  profile,
  onSaveProfile,
  selectedGoalIds,
  onToggleGoal,
}) {
  const completedSet = useMemo(() => new Set(completedActionIds), [completedActionIds]);
  const completedCount = completedSet.size;
  const goalSet = useMemo(() => new Set(selectedGoalIds), [selectedGoalIds]);

  return (
    <div className="space-y-4">
      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-2">Credit Health</p>
        <p className="text-xs opacity-70 leading-relaxed">
          Ways you may be able to strengthen your credit profile — this is general education, not a guarantee that
          any action will increase a score or lead to approval. Lenders use different criteria, and no single step
          works the same way for everyone.
        </p>
      </div>

      <CreditProfileForm profile={profile} onSave={onSaveProfile} />

      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-1">Your credit goals</p>
        <p className="text-xs opacity-50 mb-3">Select the ones you&apos;re currently focused on — this just tracks your own progress, it doesn&apos;t promise an outcome.</p>
        <div className="flex flex-wrap gap-2">
          {CREDIT_GOALS.map((g) => {
            const active = goalSet.has(g.id);
            return (
              <button
                key={g.id}
                role="checkbox"
                aria-checked={active}
                onClick={() => onToggleGoal(g.id)}
                className="text-xs px-3 py-1.5 rounded-full border text-left"
                style={
                  active
                    ? { background: "linear-gradient(140deg, var(--emerald), var(--cyan))", color: "var(--obsidian)", borderColor: "transparent" }
                    : { borderColor: "var(--line)", color: "var(--muted)" }
                }
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ledger-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="serif text-sm tracking-wide opacity-80">Action checklist</p>
          <span className="text-xs mono opacity-50">{completedCount} of {CREDIT_ACTIONS.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--panel-hi)] overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(completedCount / CREDIT_ACTIONS.length) * 100}%`, background: "linear-gradient(90deg, var(--emerald), var(--cyan))" }}
          />
        </div>
        <ul className="space-y-3">
          {CREDIT_ACTIONS.map((action) => {
            const done = completedSet.has(action.id);
            return (
              <li key={action.id}>
                <button
                  onClick={() => onToggleAction(action.id)}
                  role="checkbox"
                  aria-checked={done}
                  aria-label={action.label}
                  className="flex items-start gap-2.5 text-left w-full group"
                >
                  {done ? (
                    <CheckSquare size={17} className="mt-0.5 flex-shrink-0" style={{ color: "var(--ledger-green-soft)" }} />
                  ) : (
                    <Square size={17} className="mt-0.5 flex-shrink-0 opacity-40 group-hover:opacity-70" />
                  )}
                  <span>
                    <span className={`text-sm ${done ? "opacity-50 line-through" : ""}`}>{action.label}</span>
                    <span className="block text-xs opacity-50 mt-0.5">{action.why}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="ledger-card p-4 sm:p-5">
        <p className="serif text-sm tracking-wide opacity-80 mb-2 flex items-center gap-1.5">
          <BookOpen size={14} style={{ color: "var(--ledger-green-soft)" }} /> Credit reports in the UK
        </p>
        <p className="text-xs opacity-70 leading-relaxed">
          The three main UK credit reference agencies — Experian, Equifax, and TransUnion — can each hold
          different information about the same person, since not every lender reports to every agency. A
          consumer-facing score is just one summary; it&apos;s worth looking at the underlying report from each
          agency rather than relying on a single number.
        </p>
      </div>

      <div>
        <p className="serif text-sm tracking-wide opacity-80 mb-3">Understanding the factors</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CREDIT_FACTORS.map((f) => (
            <div key={f.id} className="ledger-card p-4 sm:p-5">
              <p className="serif text-sm mb-2">{f.title}</p>
              <p className="text-xs opacity-70 leading-relaxed mb-2">{f.what}</p>
              {f.example && (
                <p className="text-[11px] mono opacity-50 mb-2">e.g. {f.example}</p>
              )}
              <p className="text-xs opacity-60 leading-relaxed">{f.why}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "rgba(242,99,122,0.25)" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            Credit reference agencies can hold different information, so it&apos;s worth checking your actual credit
            report rather than relying on a single consumer-facing score. This isn&apos;t regulated financial advice —
            for anything specific to your situation, a free debt or credit guidance charity is a good place to start.
          </p>
        </div>
      </div>
    </div>
  );
}

function CreditProfileForm({ profile, onSave }) {
  const [form, setForm] = useState({
    payment_history_status: profile?.payment_history_status || "",
    utilisation_pct: profile?.utilisation_pct ?? "",
    electoral_roll_status: profile?.electoral_roll_status || "",
    recent_hard_searches: profile?.recent_hard_searches ?? "",
    account_age_years: profile?.account_age_years ?? "",
    open_accounts_count: profile?.open_accounts_count ?? "",
    missed_payments_count: profile?.missed_payments_count ?? "",
    outstanding_borrowing: profile?.outstanding_borrowing ?? "",
    credit_limit_total: profile?.credit_limit_total ?? "",
    notes: profile?.notes || "",
  });

  useEffect(() => {
    setForm({
      payment_history_status: profile?.payment_history_status || "",
      utilisation_pct: profile?.utilisation_pct ?? "",
      electoral_roll_status: profile?.electoral_roll_status || "",
      recent_hard_searches: profile?.recent_hard_searches ?? "",
      account_age_years: profile?.account_age_years ?? "",
      open_accounts_count: profile?.open_accounts_count ?? "",
      missed_payments_count: profile?.missed_payments_count ?? "",
      outstanding_borrowing: profile?.outstanding_borrowing ?? "",
      credit_limit_total: profile?.credit_limit_total ?? "",
      notes: profile?.notes || "",
    });
  }, [profile]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      payment_history_status: form.payment_history_status || null,
      utilisation_pct: form.utilisation_pct === "" ? null : parseFloat(form.utilisation_pct),
      electoral_roll_status: form.electoral_roll_status || null,
      recent_hard_searches: form.recent_hard_searches === "" ? null : parseInt(form.recent_hard_searches, 10),
      account_age_years: form.account_age_years === "" ? null : parseFloat(form.account_age_years),
      open_accounts_count: form.open_accounts_count === "" ? null : parseInt(form.open_accounts_count, 10),
      missed_payments_count: form.missed_payments_count === "" ? null : parseInt(form.missed_payments_count, 10),
      outstanding_borrowing: form.outstanding_borrowing === "" ? null : parseFloat(form.outstanding_borrowing),
      credit_limit_total: form.credit_limit_total === "" ? null : parseFloat(form.credit_limit_total),
      notes: form.notes.trim(),
    });
  }

  const inputClass = "w-full text-sm border border-[var(--line)] rounded-lg px-2 py-1.5 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none focus:border-[var(--emerald)]";
  const labelClass = "flex items-center gap-1 text-[10px] mono text-[var(--muted)] mb-1";

  const utilisationDisplay = profile?.utilisation_pct !== null && profile?.utilisation_pct !== undefined
    ? `${profile.utilisation_pct}%` : null;

  return (
    <form onSubmit={handleSubmit} className="ledger-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="serif text-sm tracking-wide opacity-80">Your credit profile</p>
        {utilisationDisplay && (
          <span className="text-xs mono" style={{ color: UTIL_COLOR(profile.utilisation_pct) }}>
            {utilisationDisplay} utilisation
          </span>
        )}
      </div>
      <p className="text-xs opacity-50 mb-4">A manually-entered snapshot — nothing here is pulled automatically from a credit reference agency.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label htmlFor="cp-payment-history" className={labelClass}>PAYMENT HISTORY <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.payment_history_status} /></label>
          <select id="cp-payment-history" value={form.payment_history_status} onChange={(e) => set("payment_history_status", e.target.value)} className={inputClass}>
            <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
            {PAYMENT_HISTORY_OPTIONS.map((o) => <option key={o} value={o} style={{ color: "var(--obsidian-2)" }}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cp-utilisation" className={labelClass}>UTILISATION (%) <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.utilisation_pct} /></label>
          <input id="cp-utilisation" type="number" min="0" max="100" step="1" value={form.utilisation_pct} onChange={(e) => set("utilisation_pct", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-electoral-roll" className={labelClass}>ELECTORAL ROLL <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.electoral_roll_status} /></label>
          <select id="cp-electoral-roll" value={form.electoral_roll_status} onChange={(e) => set("electoral_roll_status", e.target.value)} className={inputClass}>
            <option value="" style={{ color: "var(--obsidian-2)" }}>—</option>
            {ELECTORAL_ROLL_OPTIONS.map((o) => <option key={o} value={o} style={{ color: "var(--obsidian-2)" }}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cp-hard-searches" className={labelClass}>RECENT HARD SEARCHES <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.recent_hard_searches} /></label>
          <input id="cp-hard-searches" type="number" min="0" step="1" value={form.recent_hard_searches} onChange={(e) => set("recent_hard_searches", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-account-age" className={labelClass}>OLDEST ACCOUNT (YEARS)</label>
          <input id="cp-account-age" type="number" min="0" step="0.5" value={form.account_age_years} onChange={(e) => set("account_age_years", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-open-accounts" className={labelClass}>OPEN ACCOUNTS <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.open_accounts_count} /></label>
          <input id="cp-open-accounts" type="number" min="0" step="1" value={form.open_accounts_count} onChange={(e) => set("open_accounts_count", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-missed-payments" className={labelClass}>MISSED PAYMENTS <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.missed_payments_count} /></label>
          <input id="cp-missed-payments" type="number" min="0" step="1" value={form.missed_payments_count} onChange={(e) => set("missed_payments_count", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-outstanding" className={labelClass}>OUTSTANDING BORROWING <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.outstanding_borrowing} /></label>
          <input id="cp-outstanding" type="number" min="0" step="0.01" value={form.outstanding_borrowing} onChange={(e) => set("outstanding_borrowing", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-limit" className={labelClass}>TOTAL CREDIT LIMIT <InfoTooltip text={CREDIT_PROFILE_FIELD_HELP.credit_limit_total} /></label>
          <input id="cp-limit" type="number" min="0" step="0.01" value={form.credit_limit_total} onChange={(e) => set("credit_limit_total", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="cp-notes" className={labelClass}>NOTES — e.g. anything on your report worth investigating</label>
        <textarea id="cp-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputClass} />
      </div>

      <button
        type="submit"
        className="text-sm font-medium px-4 py-2 rounded-lg text-[var(--obsidian)]"
        style={{ background: "linear-gradient(140deg, var(--emerald), var(--cyan))", boxShadow: "0 0 14px rgba(34,211,238,0.25)" }}
      >
        Save profile
      </button>

      {(profile?.outstanding_borrowing || profile?.credit_limit_total) && (
        <p className="text-xs text-[var(--muted)] mt-3">
          {profile.outstanding_borrowing != null && `${fmt(profile.outstanding_borrowing)} owed`}
          {profile.outstanding_borrowing != null && profile.credit_limit_total != null && " of "}
          {profile.credit_limit_total != null && `${fmt(profile.credit_limit_total)} total limit`}
        </p>
      )}
    </form>
  );
}

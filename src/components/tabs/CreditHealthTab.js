"use client";

import { useMemo } from "react";
import { ShieldAlert, CheckSquare, Square } from "lucide-react";
import { CREDIT_FACTORS, CREDIT_ACTIONS } from "@/lib/creditHealthContent";

export default function CreditHealthTab({ completedActionIds, onToggleAction }) {
  const completedSet = useMemo(() => new Set(completedActionIds), [completedActionIds]);
  const completedCount = completedSet.size;

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

      <div className="ledger-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="serif text-sm tracking-wide opacity-80">Action checklist</p>
          <span className="text-xs mono opacity-50">{completedCount} of {CREDIT_ACTIONS.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#EDE7D6] overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(completedCount / CREDIT_ACTIONS.length) * 100}%`, background: "var(--ledger-green-soft)" }}
          />
        </div>
        <ul className="space-y-3">
          {CREDIT_ACTIONS.map((action) => {
            const done = completedSet.has(action.id);
            return (
              <li key={action.id}>
                <button onClick={() => onToggleAction(action.id)} className="flex items-start gap-2.5 text-left w-full group">
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

      <div className="ledger-card p-4 sm:p-5" style={{ borderColor: "#E8C7C7" }}>
        <div className="flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--rust)" }} />
          <p className="text-xs leading-relaxed opacity-80">
            Credit reference agencies can hold different information, so it&apos;s worth checking your actual credit
            report rather than relying on a single consumer-facing score. This isn&apos;t regulated financial advice —
            for anything specific to your situation, a free debt or credit guidance charity is a good place to start.
          </p>
        </div>
      </div>
    </div>
  );
}

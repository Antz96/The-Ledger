"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Same six categories the Compliance Classification Engine assigns
// (src/lib/aiCompliance.js) — cyan for read/informational, emerald for a
// write the user asked for, rust for anything the gate actually blocked.
const CLASSIFICATION_COLOR = {
  FACT: "var(--cyan)",
  CALCULATION: "var(--cyan)",
  EDUCATION: "var(--muted)",
  DECISION_SUPPORT: "var(--emerald)",
  REGULATED_RISK: "var(--rust)",
  EXECUTION: "var(--rust)",
};

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Self-contained rather than routed through LedgerDataContext — this table
// can grow large (a row per chat turn and per statement upload), and no
// other page needs it loaded eagerly on every sign-in. RLS already scopes
// the query to the signed-in user, so no props are needed.
export default function AuditLog() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("ai_interactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled) setRows(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) return null;

  return (
    <div className="ledger-card p-4 sm:p-5">
      <p className="serif text-sm tracking-wide text-[var(--muted)] mb-1 flex items-center gap-1.5">
        <History size={15} /> Recent AI activity
      </p>
      <p className="text-xs text-[var(--faint)] mb-3">
        Every time the Assistant or a statement upload used AI, and how it was classified.
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--faint)] mono py-6 text-center">No activity yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const color = CLASSIFICATION_COLOR[row.classification] || "var(--muted)";
            return (
              <li key={row.id} className="text-xs border-b last:border-0 pb-2.5 last:pb-0" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: `${color}1A`, color }}>
                    {row.classification}{row.blocked ? " · BLOCKED" : ""}
                  </span>
                  <span className="text-[var(--faint)] mono flex-shrink-0">{timeAgo(row.created_at)}</span>
                </div>
                <p className="text-[var(--muted)] truncate">{row.user_message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

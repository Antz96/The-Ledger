"use client";

import { useState } from "react";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { deleteAccount } from "@/lib/accountApi";

const CONFIRM_PHRASE = "DELETE";

export default function DeleteAccountModal({ onClose }) {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canConfirm = typed === CONFIRM_PHRASE && !deleting;

  async function handleConfirm() {
    if (!canConfirm) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAccount();
      await supabase.auth.signOut();
    } catch (err) {
      setError(err.message || "Couldn't delete your account. Try again, or contact support.");
      setDeleting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="ledger-card w-full max-w-md p-5 sm:p-6" style={{ borderColor: "rgba(242,99,122,0.4)" }}>
        <div className="flex items-start justify-between mb-4">
          <p id="delete-account-title" className="serif text-lg text-[var(--text)] flex items-center gap-2">
            <ShieldAlert size={18} style={{ color: "var(--rust)" }} /> Delete your account
          </p>
          <button onClick={onClose} aria-label="Cancel" disabled={deleting} className="text-[var(--faint)] hover:text-[var(--text)] disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
          This permanently deletes your account and everything in it — every transaction, asset, liability, goal,
          your financial constitution, credit profile, connected bank links, and Assistant history. There&apos;s no
          undo and no grace period.
        </p>

        <label htmlFor="delete-confirm-input" className="block text-xs text-[var(--muted)] mb-2">
          Type <span className="mono font-medium text-[var(--text)]">{CONFIRM_PHRASE}</span> to confirm.
        </label>
        <input
          id="delete-confirm-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={deleting}
          autoComplete="off"
          className="w-full text-sm mono border rounded-lg px-3 py-2 mb-4 bg-[var(--panel-hi)] text-[var(--text)] focus:outline-none"
          style={{ borderColor: "var(--line)" }}
        />

        {error && <p className="text-xs mb-4" style={{ color: "var(--rust)" }}>{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-sm px-4 py-2 rounded-lg border text-[var(--muted)] disabled:opacity-40"
            style={{ borderColor: "var(--line)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white disabled:opacity-40"
            style={{ background: "var(--rust)" }}
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? "Deleting…" : "Permanently delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

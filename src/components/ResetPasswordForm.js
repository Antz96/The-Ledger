"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordForm({ onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      onDone();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{ fontFamily: "var(--font-sans), sans-serif", background: "var(--ledger-green)", minHeight: "100dvh" }}
      className="flex items-center justify-center p-6"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#F7F3E8] rounded-lg p-7 shadow-xl">
        <p className="serif text-2xl text-[#1F3D2E] mb-1">The Ledger</p>
        <p className="text-xs mono text-[#5B5541] mb-6">set a new password for your account</p>

        <label className="block text-[10px] mono opacity-60 mb-1">NEW PASSWORD</label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-[#D8CFB8] rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#2F6B4F] bg-white"
        />

        {error && <p className="text-xs mb-3" style={{ color: "var(--rust)" }}>{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded text-sm font-medium text-[#F7F3E8] flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
          style={{ background: "#2F6B4F" }}
        >
          {busy && <Loader2 className="animate-spin" size={15} />}
          Save new password
        </button>
      </form>
    </div>
  );
}

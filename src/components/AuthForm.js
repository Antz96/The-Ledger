"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter an email and password.");
    if (mode === "signup" && !displayName.trim()) return setError("Enter a display name.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setCheckEmail(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
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
        <p className="text-xs mono text-[#5B5541] mb-6">the hub for saving, growing, and allocating your money</p>

        {checkEmail ? (
          <p className="text-sm leading-relaxed mb-2">
            Check <span className="font-medium">{email}</span> for a confirmation link, then sign in below.
          </p>
        ) : (
          <>
            {mode === "signup" && (
              <>
                <label htmlFor="auth-name" className="block text-[10px] mono opacity-60 mb-1">DISPLAY NAME</label>
                <input
                  id="auth-name"
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full border border-[#D8CFB8] rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#2F6B4F] bg-white"
                />
              </>
            )}
            <label htmlFor="auth-email" className="block text-[10px] mono opacity-60 mb-1">EMAIL</label>
            <input
              id="auth-email"
              type="email"
              autoFocus={mode === "signin"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[#D8CFB8] rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#2F6B4F] bg-white"
            />
            <label htmlFor="auth-password" className="block text-[10px] mono opacity-60 mb-1">PASSWORD</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#D8CFB8] rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[#2F6B4F] bg-white"
            />

            {error && <p role="alert" className="text-xs mb-3" style={{ color: "var(--rust)" }}>{error}</p>}

            <p className="text-[11px] mono opacity-50 mb-5 leading-relaxed">
              Real account, stored by Supabase Auth. Nothing here is financial advice — see the Learn tab once
              you&apos;re signed in.
            </p>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded text-sm font-medium text-[#F7F3E8] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#2F6B4F" }}
            >
              {busy && <Loader2 className="animate-spin" size={15} />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
            setCheckEmail(false);
          }}
          className="w-full text-center text-xs mono opacity-60 hover:opacity-100 mt-4"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}

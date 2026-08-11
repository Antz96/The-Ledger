"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, LogOut, LayoutDashboard, NotebookPen, SlidersHorizontal, GraduationCap, Landmark,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { monthKey, todayKey } from "@/lib/ledgerConstants";
import DashboardTab from "@/components/tabs/DashboardTab";
import LedgerTab from "@/components/tabs/LedgerTab";
import AllocateTab from "@/components/tabs/AllocateTab";
import LearnTab from "@/components/tabs/LearnTab";
import RatesTab from "@/components/tabs/RatesTab";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ledger", label: "Ledger", icon: NotebookPen },
  { id: "allocate", label: "Allocate", icon: SlidersHorizontal },
  { id: "learn", label: "Learn", icon: GraduationCap },
  { id: "rates", label: "Rates", icon: Landmark },
];

export default function LedgerApp({ session }) {
  const user = session.user;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(5000);
  const [alloc, setAlloc] = useState({ monthly: 500, low: 60, medium: 30, high: 10 });
  const [activeMonth, setActiveMonth] = useState(todayKey());

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

      if (!profileRow) {
        // Falls back here if the on-signup trigger hasn't landed yet (rare race
        // right after signup when email confirmation is disabled).
        const displayName = user.user_metadata?.display_name || user.email.split("@")[0];
        const { data: inserted } = await supabase
          .from("profiles")
          .insert({ id: user.id, display_name: displayName })
          .select()
          .maybeSingle();
        profileRow = inserted;
        await supabase.from("goals").insert({ user_id: user.id }).select();
        await supabase.from("allocations").insert({ user_id: user.id }).select();
      }
      setProfile(profileRow);

      const [{ data: txRows }, { data: goalRow }, { data: allocRow }] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("allocations").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      setTransactions(txRows || []);
      if (goalRow) setGoal(Number(goalRow.target_amount));
      if (allocRow) {
        setAlloc({
          monthly: Number(allocRow.monthly_amount),
          low: allocRow.low_pct,
          medium: allocRow.medium_pct,
          high: allocRow.high_pct,
        });
      }
    } catch (err) {
      setError(err.message || "Couldn't load your data.");
    } finally {
      setLoading(false);
    }
  }, [user.id, user.email, user.user_metadata]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAddTransaction(entry) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert({ user_id: user.id, ...entry })
        .select()
        .single();
      if (insertError) throw insertError;
      setTransactions((prev) => [data, ...prev]);
      setActiveMonth(monthKey(entry.date));
    } catch (err) {
      setError(err.message || "Couldn't add that entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTransaction(id) {
    setSaving(true);
    setError(null);
    const prev = transactions;
    setTransactions((t) => t.filter((row) => row.id !== id));
    const { error: deleteError } = await supabase.from("transactions").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setTransactions(prev);
    }
    setSaving(false);
  }

  async function handleGoalSave(nextGoal) {
    setGoal(nextGoal);
    setSaving(true);
    const { error: updateError } = await supabase
      .from("goals")
      .update({ target_amount: nextGoal, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (updateError) setError(updateError.message);
    setSaving(false);
  }

  async function handleAllocUpdate(field, value) {
    const next = { ...alloc, [field]: value };
    setAlloc(next);
    setSaving(true);
    const { error: updateError } = await supabase
      .from("allocations")
      .update({
        monthly_amount: next.monthly,
        low_pct: next.low,
        medium_pct: next.medium,
        high_pct: next.high,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    if (updateError) setError(updateError.message);
    setSaving(false);
  }

  function handleSignOut() {
    supabase.auth.signOut();
  }

  const displayName = profile?.display_name || user.email;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-[#5B5541]">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  return (
    <div
      style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100dvh" }}
      className="flex flex-col flex-1"
    >
      <div style={{ background: "var(--ledger-green)" }} className="px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="serif text-[#E8E2CE] text-xl sm:text-2xl">The Ledger</p>
            <p className="text-[#B9C9BB] text-[11px] mono">signed in as {displayName}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] mono text-[#B9C9BB]">{saving ? "saving…" : "synced"}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[#E8E2CE] hover:text-white">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs whitespace-nowrap ${
                tab === n.id ? "bg-[var(--paper)] text-[var(--ink)]" : "text-[#B9C9BB] hover:text-white"
              }`}
            >
              <n.icon size={13} /> {n.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="mx-6 sm:mx-10 mt-4 text-xs px-3 py-2 rounded"
          style={{ background: "#FBEAEA", color: "var(--rust)", border: "1px solid #E8C7C7" }}
        >
          {error}
        </div>
      )}

      <div className="px-4 sm:px-10 py-6 max-w-6xl mx-auto w-full">
        {tab === "dashboard" && (
          <DashboardTab
            transactions={transactions}
            goal={goal}
            onGoalSave={handleGoalSave}
            activeMonth={activeMonth}
            setActiveMonth={setActiveMonth}
          />
        )}
        {tab === "ledger" && (
          <LedgerTab
            transactions={transactions}
            activeMonth={activeMonth}
            setActiveMonth={setActiveMonth}
            onAdd={handleAddTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
        {tab === "allocate" && <AllocateTab alloc={alloc} onUpdate={handleAllocUpdate} />}
        {tab === "learn" && <LearnTab />}
        {tab === "rates" && <RatesTab />}
      </div>
    </div>
  );
}

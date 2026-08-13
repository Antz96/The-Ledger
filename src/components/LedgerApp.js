"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2, LogOut, LayoutDashboard, NotebookPen, SlidersHorizontal, GraduationCap, Landmark, ShieldCheck, Repeat,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { monthKey, todayKey, CURRENCIES, DEFAULT_CURRENCY, setActiveCurrency } from "@/lib/ledgerConstants";
import { materializeRecurring, claimWithoutMaterializing, monthsBetween } from "@/lib/recurringMaterializer";
import { monthlySummary } from "@/lib/useMonthlySummary";
import DashboardTab from "@/components/tabs/DashboardTab";
import LedgerTab from "@/components/tabs/LedgerTab";
import OutgoingsTab from "@/components/tabs/OutgoingsTab";
import AllocateTab from "@/components/tabs/AllocateTab";
import LearnTab from "@/components/tabs/LearnTab";
import RatesTab from "@/components/tabs/RatesTab";
import AdminTab from "@/components/tabs/AdminTab";
import { adminFetch } from "@/lib/adminApi";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ledger", label: "Ledger", icon: NotebookPen },
  { id: "outgoings", label: "Outgoings", icon: Repeat },
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
  const [recurringItems, setRecurringItems] = useState([]);
  const [recurringClaims, setRecurringClaims] = useState([]);
  const [goal, setGoal] = useState(5000);
  const [alloc, setAlloc] = useState({ monthly: 500, low: 60, medium: 30, high: 10 });
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminFetch("/api/admin/me")
      .then(() => { if (!cancelled) setIsAdmin(true); })
      .catch(() => {}); // 401/403 → not an admin, tab stays hidden
    return () => { cancelled = true; };
  }, []);
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
      const savedCurrency = profileRow?.currency || DEFAULT_CURRENCY;
      setActiveCurrency(savedCurrency);
      setCurrency(savedCurrency);

      const [{ data: txRows }, { data: goalRow }, { data: allocRow }, { data: recurringRows }, { data: claimRows }] =
        await Promise.all([
          supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
          supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("allocations").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("recurring_items").select("*").eq("user_id", user.id).order("due_day"),
          supabase.from("recurring_materializations").select("recurring_id, month").eq("user_id", user.id),
        ]);

      let allTx = txRows || [];
      const items = recurringRows || [];
      let claims = claimRows || [];
      setRecurringItems(items);

      // Catch up any recurring entries this month (and months missed while
      // the app was closed). Failure here shouldn't block the app loading.
      try {
        const { txs: newTx, claims: newClaims } = await materializeRecurring(supabase, user.id, items, claims);
        if (newTx.length > 0) {
          allTx = [...newTx, ...allTx].sort((a, b) => (a.date < b.date ? 1 : -1));
        }
        claims = [...claims, ...newClaims];
      } catch (matErr) {
        setError(matErr.message || "Couldn't log recurring entries.");
      }
      setRecurringClaims(claims);

      setTransactions(allTx);
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

  async function handleAddRecurring(entry) {
    setSaving(true);
    setError(null);
    try {
      const { data: item, error: insertError } = await supabase
        .from("recurring_items")
        .insert({ user_id: user.id, ...entry })
        .select()
        .single();
      if (insertError) throw insertError;
      setRecurringItems((prev) => [...prev, item].sort((a, b) => a.due_day - b.due_day));

      // Log it for the current month right away.
      const { txs, claims } = await materializeRecurring(supabase, user.id, [item], recurringClaims);
      if (txs.length > 0) {
        setTransactions((prev) => [...txs, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
      }
      setRecurringClaims((prev) => [...prev, ...claims]);
    } catch (err) {
      setError(err.message || "Couldn't add that recurring item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateRecurring(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const current = recurringItems.find((i) => i.id === id);
      const { data: item, error: updateError } = await supabase
        .from("recurring_items")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      setRecurringItems((prev) => prev.map((i) => (i.id === id ? item : i)).sort((a, b) => a.due_day - b.due_day));

      if (current && !current.active && item.active) {
        // Unpausing: mark the paused months as handled (no entries), then
        // log the current month normally.
        const startMonth = monthKey(item.created_at);
        const pastMonths = monthsBetween(startMonth, todayKey()).slice(0, -1);
        await claimWithoutMaterializing(supabase, user.id, item.id, pastMonths);
        const { data: claimRows } = await supabase
          .from("recurring_materializations")
          .select("recurring_id, month")
          .eq("user_id", user.id);
        const claims = claimRows || [];
        const { txs, claims: newClaims } = await materializeRecurring(supabase, user.id, [item], claims);
        if (txs.length > 0) {
          setTransactions((prev) => [...txs, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
        }
        setRecurringClaims([...claims, ...newClaims]);
      }
    } catch (err) {
      setError(err.message || "Couldn't update that recurring item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecurring(id) {
    setSaving(true);
    setError(null);
    const prevItems = recurringItems;
    setRecurringItems((items) => items.filter((i) => i.id !== id));
    const { error: deleteError } = await supabase.from("recurring_items").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setRecurringItems(prevItems);
    } else {
      // DB nulls recurring_id via ON DELETE SET NULL; mirror it locally.
      setTransactions((prev) => prev.map((t) => (t.recurring_id === id ? { ...t, recurring_id: null } : t)));
      setRecurringClaims((prev) => prev.filter((c) => c.recurring_id !== id));
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

  async function handleCurrencyChange(code) {
    setActiveCurrency(code);
    setCurrency(code);
    setSaving(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ currency: code })
      .eq("id", user.id);
    if (updateError) setError(updateError.message);
    setSaving(false);
  }

  function handleSignOut() {
    supabase.auth.signOut();
  }

  const displayName = profile?.display_name || user.email;
  const currentLeftOver = useMemo(() => monthlySummary(transactions, todayKey()).leftOver, [transactions]);

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
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              aria-label="Currency"
              className="bg-transparent text-[11px] mono text-[#B9C9BB] border border-[#3D5C4A] rounded px-1.5 py-0.5 cursor-pointer hover:text-white focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} style={{ color: "var(--ink)" }}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <span className="text-[11px] mono text-[#B9C9BB]">{saving ? "saving…" : "synced"}</span>
            <button onClick={handleSignOut} className="flex items-center gap-1 text-xs text-[#E8E2CE] hover:text-white">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {(isAdmin ? [...NAV, { id: "admin", label: "Admin", icon: ShieldCheck }] : NAV).map((n) => (
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
            recurringItems={recurringItems}
            goal={goal}
            onGoalSave={handleGoalSave}
            activeMonth={activeMonth}
            setActiveMonth={setActiveMonth}
            onGoToOutgoings={() => setTab("outgoings")}
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
        {tab === "outgoings" && (
          <OutgoingsTab
            items={recurringItems}
            onAdd={handleAddRecurring}
            onUpdate={handleUpdateRecurring}
            onDelete={handleDeleteRecurring}
          />
        )}
        {tab === "allocate" && <AllocateTab alloc={alloc} onUpdate={handleAllocUpdate} suggestedMonthly={currentLeftOver} />}
        {tab === "learn" && <LearnTab />}
        {tab === "rates" && <RatesTab />}
        {tab === "admin" && isAdmin && <AdminTab />}
      </div>
    </div>
  );
}

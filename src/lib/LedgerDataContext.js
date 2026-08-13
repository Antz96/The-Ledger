"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { monthKey, todayKey, DEFAULT_CURRENCY, setActiveCurrency } from "@/lib/ledgerConstants";

const LedgerDataContext = createContext(null);

// Loads everything the app needs once, on sign-in, and exposes it (plus the
// handlers that mutate it) to every page via Context — the same shared state
// LedgerApp.js used to hold directly, just reachable from separate routes now.
export function LedgerDataProvider({ session, children }) {
  const user = session.user;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(5000);
  const [alloc, setAlloc] = useState({ monthly: 500, low: 60, medium: 30, high: 10 });
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [activeMonth, setActiveMonth] = useState(todayKey());
  const [rates, setRates] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

      if (!profileRow) {
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

      const [{ data: txRows }, { data: goalRow }, { data: allocRow }, { data: rateRows }] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("allocations").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("savings_rates").select("*").order("apy_pct", { ascending: false }),
      ]);

      setTransactions(txRows || []);
      setRates(rateRows || []);
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

  async function handleAddRate(rate) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase.from("savings_rates").insert(rate).select().single();
      if (insertError) throw insertError;
      setRates((prev) => [...prev, data].sort((a, b) => b.apy_pct - a.apy_pct));
    } catch (err) {
      setError(err.message || "Couldn't add that rate.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateRate(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("savings_rates")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      setRates((prev) => prev.map((r) => (r.id === id ? data : r)).sort((a, b) => b.apy_pct - a.apy_pct));
    } catch (err) {
      setError(err.message || "Couldn't update that rate.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRate(id) {
    setSaving(true);
    setError(null);
    const prev = rates;
    setRates((r) => r.filter((row) => row.id !== id));
    const { error: deleteError } = await supabase.from("savings_rates").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setRates(prev);
    }
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

  const value = {
    user,
    profile,
    isAdmin: !!profile?.is_admin,
    displayName: profile?.display_name || user.email,
    loading,
    saving,
    error,
    transactions,
    goal,
    alloc,
    currency,
    activeMonth,
    setActiveMonth,
    rates,
    handleAddTransaction,
    handleDeleteTransaction,
    handleGoalSave,
    handleAllocUpdate,
    handleAddRate,
    handleUpdateRate,
    handleDeleteRate,
    handleCurrencyChange,
    handleSignOut,
  };

  return <LedgerDataContext.Provider value={value}>{children}</LedgerDataContext.Provider>;
}

export function useLedgerData() {
  const ctx = useContext(LedgerDataContext);
  if (!ctx) throw new Error("useLedgerData must be used within LedgerDataProvider");
  return ctx;
}

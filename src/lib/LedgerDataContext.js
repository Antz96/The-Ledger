"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { monthKey, todayKey, DEFAULT_CURRENCY, setActiveCurrency } from "@/lib/ledgerConstants";
import { netWorth as calcNetWorth } from "@/lib/financialCalculations";

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
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [netWorthSnapshots, setNetWorthSnapshots] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [financialGoals, setFinancialGoals] = useState([]);
  const [financialConstitution, setFinancialConstitution] = useState(null);
  const [creditActionProgress, setCreditActionProgress] = useState([]);
  const [creditProfile, setCreditProfile] = useState(null);
  const [creditGoalSelections, setCreditGoalSelections] = useState([]);
  const [articles, setArticles] = useState([]);

  // Upserts today's net worth snapshot (one row per user per day). Best-effort:
  // failures are logged, not surfaced as a top-level error — this is background
  // bookkeeping for the history chart, not something the user directly asked for.
  const recordNetWorthSnapshot = useCallback(
    async (nextAssets, nextLiabilities) => {
      const totals = calcNetWorth(nextAssets, nextLiabilities);
      const snapshotDate = new Date().toISOString().slice(0, 10);
      try {
        const { data, error: upsertError } = await supabase
          .from("net_worth_snapshots")
          .upsert(
            {
              user_id: user.id,
              snapshot_date: snapshotDate,
              total_assets: totals.totalAssets,
              total_liabilities: totals.totalLiabilities,
              net_worth: totals.netWorth,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,snapshot_date" }
          )
          .select()
          .single();
        if (upsertError) throw upsertError;
        setNetWorthSnapshots((prev) => [...prev.filter((s) => s.snapshot_date !== data.snapshot_date), data].sort(
          (a, b) => (a.snapshot_date < b.snapshot_date ? -1 : 1)
        ));
      } catch (err) {
        console.error("Couldn't record net worth snapshot:", err.message || err);
      }
    },
    [user.id]
  );

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

      const [
        { data: txRows },
        { data: goalRow },
        { data: allocRow },
        { data: rateRows },
        { data: assetRows },
        { data: liabilityRows },
        { data: opportunityRows },
        { data: financialGoalRows },
        { data: creditActionRows },
        { data: creditProfileRow },
        { data: creditGoalRows },
        { data: articleRows },
        { data: snapshotRows },
        { data: constitutionRow },
      ] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("allocations").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("savings_rates").select("*").order("apy_pct", { ascending: false }),
        supabase.from("assets").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("liabilities").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("opportunities").select("*").order("created_at", { ascending: true }),
        supabase.from("financial_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("credit_action_progress").select("*").eq("user_id", user.id),
        supabase.from("credit_profile").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("credit_goal_selections").select("*").eq("user_id", user.id),
        supabase.from("articles").select("*").order("published_at", { ascending: false }),
        supabase.from("net_worth_snapshots").select("*").eq("user_id", user.id).order("snapshot_date", { ascending: true }),
        supabase.from("financial_constitution").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      setTransactions(txRows || []);
      setRates(rateRows || []);
      setAssets(assetRows || []);
      setLiabilities(liabilityRows || []);
      setOpportunities(opportunityRows || []);
      setFinancialGoals(financialGoalRows || []);
      setCreditActionProgress(creditActionRows || []);
      setCreditProfile(creditProfileRow || null);
      setCreditGoalSelections(creditGoalRows || []);
      setArticles(articleRows || []);
      setNetWorthSnapshots(snapshotRows || []);
      setFinancialConstitution(constitutionRow || null);
      if (goalRow) setGoal(Number(goalRow.target_amount));
      if (allocRow) {
        setAlloc({
          monthly: Number(allocRow.monthly_amount),
          low: allocRow.low_pct,
          medium: allocRow.medium_pct,
          high: allocRow.high_pct,
        });
      }
      // Best-effort — ensures at least one data point per active day even if
      // the user doesn't touch assets/liabilities during this session.
      recordNetWorthSnapshot(assetRows || [], liabilityRows || []);
    } catch (err) {
      setError(err.message || "Couldn't load your data.");
    } finally {
      setLoading(false);
    }
  }, [user.id, user.email, user.user_metadata, recordNetWorthSnapshot]);

  useEffect(() => {
    // One-time fetch-on-mount for the signed-in user's data. loadAll sets many
    // independent pieces of state (profile, transactions, assets, ...) that
    // can't be derived during render or split into a subscription, so this is
    // the accepted exception to the rule rather than a pattern to restructure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function handleAddAsset(asset) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("assets")
        .insert({ user_id: user.id, ...asset })
        .select()
        .single();
      if (insertError) throw insertError;
      const nextAssets = [...assets, data];
      setAssets(nextAssets);
      recordNetWorthSnapshot(nextAssets, liabilities);
    } catch (err) {
      setError(err.message || "Couldn't add that asset.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateAsset(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("assets")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      const nextAssets = assets.map((a) => (a.id === id ? data : a));
      setAssets(nextAssets);
      recordNetWorthSnapshot(nextAssets, liabilities);
    } catch (err) {
      setError(err.message || "Couldn't update that asset.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAsset(id) {
    setSaving(true);
    setError(null);
    const prev = assets;
    const nextAssets = assets.filter((row) => row.id !== id);
    setAssets(nextAssets);
    const { error: deleteError } = await supabase.from("assets").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setAssets(prev);
    } else {
      recordNetWorthSnapshot(nextAssets, liabilities);
    }
    setSaving(false);
  }

  async function handleAddLiability(liability) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("liabilities")
        .insert({ user_id: user.id, ...liability })
        .select()
        .single();
      if (insertError) throw insertError;
      const nextLiabilities = [...liabilities, data];
      setLiabilities(nextLiabilities);
      recordNetWorthSnapshot(assets, nextLiabilities);
    } catch (err) {
      setError(err.message || "Couldn't add that liability.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateLiability(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("liabilities")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      const nextLiabilities = liabilities.map((l) => (l.id === id ? data : l));
      setLiabilities(nextLiabilities);
      recordNetWorthSnapshot(assets, nextLiabilities);
    } catch (err) {
      setError(err.message || "Couldn't update that liability.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLiability(id) {
    setSaving(true);
    setError(null);
    const prev = liabilities;
    const nextLiabilities = liabilities.filter((row) => row.id !== id);
    setLiabilities(nextLiabilities);
    const { error: deleteError } = await supabase.from("liabilities").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setLiabilities(prev);
    } else {
      recordNetWorthSnapshot(assets, nextLiabilities);
    }
    setSaving(false);
  }

  async function handleAddOpportunity(opportunity) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase.from("opportunities").insert(opportunity).select().single();
      if (insertError) throw insertError;
      setOpportunities((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message || "Couldn't add that opportunity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateOpportunity(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("opportunities")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      setOpportunities((prev) => prev.map((o) => (o.id === id ? data : o)));
    } catch (err) {
      setError(err.message || "Couldn't update that opportunity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOpportunity(id) {
    setSaving(true);
    setError(null);
    const prev = opportunities;
    setOpportunities((o) => o.filter((row) => row.id !== id));
    const { error: deleteError } = await supabase.from("opportunities").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setOpportunities(prev);
    }
    setSaving(false);
  }

  async function handleAddFinancialGoal(goal) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("financial_goals")
        .insert({ user_id: user.id, ...goal })
        .select()
        .single();
      if (insertError) throw insertError;
      setFinancialGoals((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message || "Couldn't add that goal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateFinancialGoal(id, patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("financial_goals")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;
      setFinancialGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      setError(err.message || "Couldn't update that goal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFinancialGoal(id) {
    setSaving(true);
    setError(null);
    const prev = financialGoals;
    setFinancialGoals((g) => g.filter((row) => row.id !== id));
    const { error: deleteError } = await supabase.from("financial_goals").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      setFinancialGoals(prev);
    }
    setSaving(false);
  }

  async function handleSaveConstitution(patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: upsertError } = await supabase
        .from("financial_constitution")
        .upsert({ user_id: user.id, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (upsertError) throw upsertError;
      setFinancialConstitution(data);
    } catch (err) {
      setError(err.message || "Couldn't save your rules.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCreditAction(actionId) {
    setSaving(true);
    setError(null);
    const existing = creditActionProgress.find((row) => row.action_id === actionId);
    try {
      if (existing) {
        setCreditActionProgress((prev) => prev.filter((row) => row.action_id !== actionId));
        const { error: deleteError } = await supabase.from("credit_action_progress").delete().eq("id", existing.id);
        if (deleteError) throw deleteError;
      } else {
        const { data, error: insertError } = await supabase
          .from("credit_action_progress")
          .insert({ user_id: user.id, action_id: actionId })
          .select()
          .single();
        if (insertError) throw insertError;
        setCreditActionProgress((prev) => [...prev, data]);
      }
    } catch (err) {
      setError(err.message || "Couldn't update that item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCreditProfile(patch) {
    setSaving(true);
    setError(null);
    try {
      const { data, error: upsertError } = await supabase
        .from("credit_profile")
        .upsert({ user_id: user.id, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (upsertError) throw upsertError;
      setCreditProfile(data);
    } catch (err) {
      setError(err.message || "Couldn't save your credit profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCreditGoal(goalId) {
    setSaving(true);
    setError(null);
    const existing = creditGoalSelections.find((row) => row.goal_id === goalId);
    try {
      if (existing) {
        setCreditGoalSelections((prev) => prev.filter((row) => row.goal_id !== goalId));
        const { error: deleteError } = await supabase.from("credit_goal_selections").delete().eq("id", existing.id);
        if (deleteError) throw deleteError;
      } else {
        const { data, error: insertError } = await supabase
          .from("credit_goal_selections")
          .insert({ user_id: user.id, goal_id: goalId })
          .select()
          .single();
        if (insertError) throw insertError;
        setCreditGoalSelections((prev) => [...prev, data]);
      }
    } catch (err) {
      setError(err.message || "Couldn't update that goal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitAssessment(responses, tags, goalNote) {
    setSaving(true);
    setError(null);
    try {
      await supabase.from("assessment_responses").delete().eq("user_id", user.id);
      const { error: insertError } = await supabase
        .from("assessment_responses")
        .insert(responses.map((r) => ({ user_id: user.id, ...r })));
      if (insertError) throw insertError;

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ tags, goal_note: goalNote, onboarding_complete: true })
        .eq("id", user.id)
        .select()
        .single();
      if (updateError) throw updateError;
      setProfile(data);
    } catch (err) {
      setError(err.message || "Couldn't save your answers.");
    } finally {
      setSaving(false);
    }
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

  function clearError() {
    setError(null);
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
    assets,
    liabilities,
    netWorthSnapshots,
    opportunities,
    financialGoals,
    financialConstitution,
    creditActionProgress,
    creditProfile,
    creditGoalSelections,
    articles,
    handleAddTransaction,
    handleDeleteTransaction,
    handleGoalSave,
    handleAllocUpdate,
    handleAddRate,
    handleUpdateRate,
    handleDeleteRate,
    handleAddAsset,
    handleUpdateAsset,
    handleDeleteAsset,
    handleAddLiability,
    handleUpdateLiability,
    handleDeleteLiability,
    handleAddOpportunity,
    handleUpdateOpportunity,
    handleDeleteOpportunity,
    handleAddFinancialGoal,
    handleUpdateFinancialGoal,
    handleDeleteFinancialGoal,
    handleSaveConstitution,
    handleToggleCreditAction,
    handleSaveCreditProfile,
    handleToggleCreditGoal,
    handleSubmitAssessment,
    handleCurrencyChange,
    handleSignOut,
    clearError,
  };

  return <LedgerDataContext.Provider value={value}>{children}</LedgerDataContext.Provider>;
}

export function useLedgerData() {
  const ctx = useContext(LedgerDataContext);
  if (!ctx) throw new Error("useLedgerData must be used within LedgerDataProvider");
  return ctx;
}

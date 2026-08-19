// Deterministic financial calculations, centralized. Nothing in this file talks
// to Supabase, React, or Claude — every function is a pure function of its
// arguments, so the same inputs always produce the same outputs and every
// formula can be unit tested in isolation. Components and the Assistant's
// tools both call into this file rather than each computing their own copy.

import { EXPENSE_CLASSIFICATION } from "@/lib/ledgerConstants";

export function sumBy(items, field) {
  return (items || []).reduce((s, item) => s + (Number(item[field]) || 0), 0);
}

export function groupByCategory(items, valueField) {
  const map = {};
  (items || []).forEach((item) => {
    map[item.category] = (map[item.category] || 0) + (Number(item[valueField]) || 0);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Total assets, total liabilities, and net worth (assets − liabilities).
export function netWorth(assets, liabilities) {
  const totalAssets = sumBy(assets, "value");
  const totalLiabilities = sumBy(liabilities, "balance");
  return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
}

// Compares the latest net worth snapshot to the closest one on or before
// `daysAgo` days earlier. Returns null when there isn't a snapshot old enough
// to compare against yet — a made-up "0 change" would be misleading for a
// brand-new account with only a few days of history.
export function netWorthChange(snapshots, daysAgo = 30) {
  if (!snapshots || snapshots.length === 0) return null;
  const sorted = [...snapshots].sort((a, b) => (a.snapshot_date < b.snapshot_date ? -1 : 1));
  const latest = sorted[sorted.length - 1];
  const cutoff = new Date(latest.snapshot_date);
  cutoff.setDate(cutoff.getDate() - daysAgo);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const baseline = [...sorted].reverse().find((s) => s.snapshot_date <= cutoffKey);
  if (!baseline) return null;
  return {
    current: Number(latest.net_worth),
    previous: Number(baseline.net_worth),
    change: Number(latest.net_worth) - Number(baseline.net_worth),
    days: daysAgo,
  };
}

// Income/expense/savings totals, and what's left over (income − expense − savings).
// Pass a monthKey ("YYYY-MM") to scope to one month, or omit it for all-time.
export function monthlyTotals(transactions, monthKeyValue) {
  const t = { income: 0, expense: 0, savings: 0 };
  (transactions || [])
    .filter((tx) => !monthKeyValue || tx.date.slice(0, 7) === monthKeyValue)
    .forEach((tx) => {
      t[tx.type] = (t[tx.type] || 0) + (Number(tx.amount) || 0);
    });
  return { ...t, net: t.income - t.expense - t.savings };
}

// Expense transactions grouped by category, sorted highest first. Pass a
// monthKey to scope to one month, or omit it for all-time.
export function expensesByCategory(transactions, monthKeyValue) {
  const expenses = (transactions || []).filter(
    (t) => t.type === "expense" && (!monthKeyValue || t.date.slice(0, 7) === monthKeyValue)
  );
  return groupByCategory(expenses, "amount");
}

// Income/expense/savings totals for each month in monthKeys, shaped for a bar chart.
export function monthlyTrend(transactions, monthKeys) {
  return (monthKeys || []).map((mk) => {
    const t = monthlyTotals(transactions, mk);
    return {
      month: new Date(mk + "-01").toLocaleDateString("en-US", { month: "short" }),
      Income: t.income,
      Expense: t.expense,
      Saved: t.savings,
    };
  });
}

// essential | discretionary for an expense category. Unclassified categories
// default to discretionary — see EXPENSE_CLASSIFICATION for the reasoning.
export function classifyExpenseCategory(category) {
  return EXPENSE_CLASSIFICATION[category] || "discretionary";
}

// Income, essential spend, discretionary spend, wealth-building (money moved
// to savings/goals), and what's left unallocated — the Wealth OS blueprint's
// "Monthly Flow" (§7.2). Pass a monthKey to scope to one month, or omit it
// for all-time.
export function monthlyFlow(transactions, monthKeyValue) {
  const flow = { income: 0, essential: 0, discretionary: 0, wealthBuilding: 0 };
  (transactions || [])
    .filter((tx) => !monthKeyValue || tx.date.slice(0, 7) === monthKeyValue)
    .forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      if (tx.type === "income") flow.income += amount;
      else if (tx.type === "savings") flow.wealthBuilding += amount;
      else if (tx.type === "expense") flow[classifyExpenseCategory(tx.category)] += amount;
    });
  const unallocated = flow.income - flow.essential - flow.discretionary - flow.wealthBuilding;
  return { ...flow, unallocated };
}

// Sum of assets categorized as Cash — the liquid portion of net worth.
export function liquidCash(assets) {
  return sumBy((assets || []).filter((a) => a.category === "Cash"), "value");
}

// Average essential spend across the given months. A month with no logged
// transactions counts as 0 (same convention monthlyTrend uses) — pass a
// window that reflects real history, e.g. lastNMonthKeys(), rather than
// assuming data exists for every month in it.
export function averageEssentialExpenditure(transactions, monthKeys) {
  if (!monthKeys || monthKeys.length === 0) return 0;
  const total = monthKeys.reduce((s, mk) => s + monthlyFlow(transactions, mk).essential, 0);
  return total / monthKeys.length;
}

// Months of essential spending liquidCash would cover, at the given average
// rate. Returns null when there's no essential spend to divide by — an
// "infinite" runway isn't a meaningful number to show.
export function financialRunway(liquidCashAmount, averageEssentialSpend) {
  if (!averageEssentialSpend || averageEssentialSpend <= 0) return null;
  return liquidCashAmount / averageEssentialSpend;
}

// Savings as a percentage of income for the same period. Returns null rather
// than Infinity/NaN when there's no income to divide by.
export function savingsRatePct(income, savings) {
  if (!income || income <= 0) return null;
  return (savings / income) * 100;
}

// Checks an actual figure against a user-chosen Financial Constitution target
// (§7.5) — never the other way round; Ledger measures the plan the user set,
// it doesn't set or suggest one. direction "min" means the actual should meet
// or exceed the target (savings rate, cash buffer); "max" means it should
// stay at or under it (a discretionary spending cap). Returns null when
// either side is unset, since there's nothing to evaluate yet.
export function evaluateConstitutionRule(actual, target, direction = "min") {
  if (actual === null || actual === undefined || target === null || target === undefined) return null;
  const met = direction === "max" ? actual <= target : actual >= target;
  return { actual, target, met };
}

// Dollar amount allocated to each risk tier, from a monthly total + percentage split.
export function allocationSplit(alloc) {
  return {
    low: (alloc.monthly * alloc.low) / 100,
    medium: (alloc.monthly * alloc.medium) / 100,
    high: (alloc.monthly * alloc.high) / 100,
  };
}

function monthsBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Projects a savings goal's trajectory from its starting amount and monthly
// contribution. `today` defaults to the real current date but can be passed
// explicitly for deterministic tests. Returns projectedDate as a Date object
// (or "reached", or null if there's no contribution to project from) —
// callers format or serialize it for their own needs (UI display vs. JSON).
export function projectGoal(goal, today = new Date()) {
  const monthsElapsed = monthsBetween(goal.created_at, today);
  const projectedSaved = Number(goal.starting_amount) + Number(goal.monthly_contribution) * monthsElapsed;
  const target = Number(goal.target_amount);
  const progressPct = target > 0 ? Math.min(100, (projectedSaved / target) * 100) : 0;
  const remaining = Math.max(0, target - projectedSaved);
  const monthlyContribution = Number(goal.monthly_contribution);

  let projectedDate = null;
  if (remaining === 0) {
    projectedDate = "reached";
  } else if (monthlyContribution > 0) {
    const monthsToGo = Math.ceil(remaining / monthlyContribution);
    projectedDate = addMonths(today, monthsToGo);
  }

  let onTrack = null;
  if (goal.target_date && projectedDate && projectedDate !== "reached") {
    onTrack = projectedDate <= new Date(goal.target_date);
  }

  return { projectedSaved, progressPct, remaining, projectedDate, onTrack };
}

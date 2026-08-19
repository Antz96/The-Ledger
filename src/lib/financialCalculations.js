// Deterministic financial calculations, centralized. Nothing in this file talks
// to Supabase, React, or Claude — every function is a pure function of its
// arguments, so the same inputs always produce the same outputs and every
// formula can be unit tested in isolation. Components and the Assistant's
// tools both call into this file rather than each computing their own copy.

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

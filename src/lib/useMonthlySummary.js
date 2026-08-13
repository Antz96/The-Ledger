import { useMemo } from "react";
import { monthKey } from "@/lib/ledgerConstants";

// One month's money picture. "Committed" = auto-logged from a recurring item
// (recurring_id set); "flexible" = everything logged by hand.
export function monthlySummary(transactions, month) {
  const t = { income: 0, expense: 0, savings: 0, committedExpense: 0, committedIncome: 0 };
  for (const tx of transactions) {
    if (monthKey(tx.date) !== month) continue;
    const amt = Number(tx.amount) || 0;
    if (t[tx.type] === undefined) continue;
    t[tx.type] += amt;
    if (tx.recurring_id) {
      if (tx.type === "expense") t.committedExpense += amt;
      if (tx.type === "income") t.committedIncome += amt;
    }
  }
  return {
    ...t,
    flexibleSpend: t.expense - t.committedExpense,
    leftOver: t.income - t.expense - t.savings,
  };
}

// Plan-side view over the recurring items themselves (active only).
export function recurringTotals(items) {
  let monthlyIncome = 0;
  let monthlyCommitted = 0;
  for (const item of items) {
    if (!item.active) continue;
    const amt = Number(item.amount) || 0;
    if (item.type === "income") monthlyIncome += amt;
    else monthlyCommitted += amt;
  }
  return { monthlyIncome, monthlyCommitted, leftToAllocate: monthlyIncome - monthlyCommitted };
}

export function useMonthlySummary(transactions, month) {
  return useMemo(() => monthlySummary(transactions, month), [transactions, month]);
}

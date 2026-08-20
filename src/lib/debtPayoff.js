// Debt payoff projections. Deliberately simple — balance divided by a flat
// monthly repayment, no interest/amortization modeling — since we don't
// track APR on liabilities. Treat the date as a rough estimate, not a
// schedule.

export function payoffProjection({ balance, monthly_repayment, repayment_start_balance }) {
  const bal = Number(balance) || 0;
  const repay = Number(monthly_repayment) || 0;
  if (repay <= 0 || bal <= 0) return null;

  const monthsRemaining = Math.ceil(bal / repay);
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + monthsRemaining);

  const start = Number(repayment_start_balance) || 0;
  const progressPct = start > 0 ? Math.max(0, Math.min(100, ((start - bal) / start) * 100)) : null;

  return { monthsRemaining, payoffDate, progressPct };
}

// When a repayment amount is set for the first time, snapshot the current
// balance so progress has a fixed reference point to measure against.
export function buildRepaymentPatch(item, newMonthlyRepayment) {
  const patch = { monthly_repayment: newMonthlyRepayment };
  const hadRepayment = Number(item.monthly_repayment) > 0;
  if (!hadRepayment && Number(newMonthlyRepayment) > 0) {
    patch.repayment_start_balance = Number(item.balance) || 0;
  }
  return patch;
}

export function formatPayoffDate(date) {
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

// Simulates paying off multiple debts under a strategy the user picks —
// Avalanche (highest APR first) or Snowball (smallest balance first). This
// only calculates the consequences of that choice; it never picks a
// strategy or recommends one — see DebtPayoffTab.js's framing.
//
// Every debt keeps getting its own minimum payment every month; the entire
// extra budget goes to whichever debt is first in the strategy order and
// still has a balance — never split across debts, so the effect of the
// chosen order stays easy to trace. A debt cleared with less than its full
// share of extra that month doesn't roll the remainder into the next debt
// until the following month — a small simplification most simple avalanche/
// snowball calculators make too.
export function simulateDebtPayoffStrategy(liabilities, extraMonthly, strategy = "avalanche") {
  const debts = (liabilities || [])
    .filter((l) => Number(l.balance) > 0)
    .map((l) => ({
      id: l.id,
      name: l.name,
      balance: Number(l.balance),
      minPayment: Number(l.monthly_repayment) || 0,
      aprPct: Number(l.apr_pct) || 0,
    }));

  if (debts.length === 0) {
    return { order: [], monthsToDebtFree: 0, totalInterestPaid: 0 };
  }

  const order = strategy === "snowball"
    ? [...debts].sort((a, b) => a.balance - b.balance)
    : [...debts].sort((a, b) => b.aprPct - a.aprPct);

  const balances = new Map(order.map((d) => [d.id, d.balance]));
  const paidOffMonth = new Map();
  let extraPool = Number(extraMonthly) || 0;
  let totalInterestPaid = 0;
  let month = 0;
  const MAX_MONTHS = 600; // 50 years — a safety cap if minimums can't outpace interest

  while ([...balances.values()].some((b) => b > 0.01) && month < MAX_MONTHS) {
    month += 1;
    const target = order.find((d) => balances.get(d.id) > 0.01);
    let freedThisMonth = 0;

    for (const debt of order) {
      let bal = balances.get(debt.id);
      if (bal <= 0.01) continue;

      const monthlyInterest = bal * (debt.aprPct / 100 / 12);
      totalInterestPaid += monthlyInterest;
      bal += monthlyInterest;

      const payment = Math.min(debt.minPayment + (debt === target ? extraPool : 0), bal);
      bal -= payment;

      if (bal <= 0.01) {
        paidOffMonth.set(debt.id, month);
        freedThisMonth += debt.minPayment;
      }
      balances.set(debt.id, Math.max(0, bal));
    }
    extraPool += freedThisMonth;
  }

  return {
    order: order.map((d) => ({ id: d.id, name: d.name, monthsToPayoff: paidOffMonth.get(d.id) ?? null })),
    monthsToDebtFree: month >= MAX_MONTHS ? null : month,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
  };
}

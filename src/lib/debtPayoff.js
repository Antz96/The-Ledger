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

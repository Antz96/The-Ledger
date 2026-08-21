// Scenario Laboratory (Wealth OS blueprint §8.2, §6 — "Explore: scenarios
// and decision lab"). Takes an amount the user hasn't committed anywhere
// yet and calculates what different paths would do to it — never which
// path is "best". Every function here is a pure calculation reused by or
// alongside the same engines the rest of the app already uses
// (projectGoal for goals, simulateDebtPayoffStrategy for debt), so the
// Scenario Lab can't quietly drift out of sync with the real Goals or
// Debt Payoff numbers.
import { projectGoal } from "./financialCalculations";

// Money kept as plain cash for `months`, earning nothing — the implicit
// baseline every other path is being compared against.
export function cashProjection(monthlyAmount, months) {
  return Math.round(monthlyAmount * months * 100) / 100;
}

// How a goal's own projection changes if `extraMonthly` were added on top
// of its existing contribution, from today. Reuses projectGoal for both
// legs so this can never disagree with what the Goals page itself shows.
export function goalAccelerationEffect(goal, extraMonthly, today = new Date()) {
  const baseline = projectGoal(goal, today);
  const accelerated = projectGoal(
    { ...goal, monthly_contribution: Number(goal.monthly_contribution) + extraMonthly },
    today
  );
  return { baseline, accelerated };
}

// Future value of a level monthly contribution, compounded monthly at the
// given annual rate — the standard future-value-of-an-annuity formula.
// `annualRatePct` is always a rate the user chose to try, never a figure
// Ledger asserts as expected or likely (see ScenarioLab.js).
export function investmentGrowthProjection(monthlyAmount, months, annualRatePct) {
  const monthlyRate = annualRatePct / 100 / 12;
  const futureValue =
    monthlyRate === 0 ? monthlyAmount * months : monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return Math.round(futureValue * 100) / 100;
}

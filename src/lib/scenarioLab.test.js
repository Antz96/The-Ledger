import { describe, expect, test } from "vitest";
import { cashProjection, goalAccelerationEffect, investmentGrowthProjection } from "./scenarioLab";

describe("cashProjection", () => {
  test("is a flat multiplication, no growth", () => {
    expect(cashProjection(200, 12)).toBe(2400);
    expect(cashProjection(0, 12)).toBe(0);
  });
});

describe("goalAccelerationEffect", () => {
  const today = new Date("2026-01-01");
  const goal = {
    created_at: "2025-01-01",
    starting_amount: 0,
    monthly_contribution: 100,
    target_amount: 3600,
    target_date: null,
  };

  test("more monthly contribution reaches the target sooner", () => {
    const { baseline, accelerated } = goalAccelerationEffect(goal, 100, today);
    expect(baseline.projectedDate).toBeInstanceOf(Date);
    expect(accelerated.projectedDate).toBeInstanceOf(Date);
    expect(accelerated.projectedDate.getTime()).toBeLessThan(baseline.projectedDate.getTime());
  });

  test("a goal already reached stays reached regardless of extra", () => {
    const reached = { ...goal, starting_amount: 3600 };
    const { baseline, accelerated } = goalAccelerationEffect(reached, 100, today);
    expect(baseline.projectedDate).toBe("reached");
    expect(accelerated.projectedDate).toBe("reached");
  });

  test("zero extra leaves the projection unchanged", () => {
    const { baseline, accelerated } = goalAccelerationEffect(goal, 0, today);
    expect(accelerated.projectedDate.getTime()).toBe(baseline.projectedDate.getTime());
  });
});

describe("investmentGrowthProjection", () => {
  test("a 0% rate is the same as plain cash accumulation", () => {
    expect(investmentGrowthProjection(200, 12, 0)).toBe(cashProjectionEquivalent(200, 12));
  });

  test("a positive rate grows the total beyond the plain contributions", () => {
    const total = investmentGrowthProjection(200, 120, 5);
    expect(total).toBeGreaterThan(200 * 120);
  });

  test("matches the standard future-value-of-an-annuity formula for a known case", () => {
    // £100/mo for 12 months at 12%/yr (1%/mo) — a textbook check value.
    const total = investmentGrowthProjection(100, 12, 12);
    const expected = 100 * ((Math.pow(1.01, 12) - 1) / 0.01);
    expect(total).toBeCloseTo(Math.round(expected * 100) / 100, 1);
  });
});

function cashProjectionEquivalent(monthlyAmount, months) {
  return Math.round(monthlyAmount * months * 100) / 100;
}

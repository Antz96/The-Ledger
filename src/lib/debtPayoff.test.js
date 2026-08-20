import { describe, expect, test } from "vitest";
import { payoffProjection, buildRepaymentPatch, simulateDebtPayoffStrategy } from "./debtPayoff";

describe("payoffProjection", () => {
  test("months remaining is balance divided by repayment, rounded up", () => {
    const result = payoffProjection({ balance: 1000, monthly_repayment: 300, repayment_start_balance: 1000 });
    expect(result.monthsRemaining).toBe(4);
  });

  test("progress percentage measures against the snapshotted starting balance", () => {
    const result = payoffProjection({ balance: 600, monthly_repayment: 100, repayment_start_balance: 1000 });
    expect(result.progressPct).toBeCloseTo(40);
  });

  test("no repayment amount or already-cleared balance returns null, not a divide-by-zero", () => {
    expect(payoffProjection({ balance: 500, monthly_repayment: 0, repayment_start_balance: 500 })).toBeNull();
    expect(payoffProjection({ balance: 0, monthly_repayment: 100, repayment_start_balance: 500 })).toBeNull();
  });
});

describe("buildRepaymentPatch", () => {
  test("snapshots the current balance the first time a repayment is set", () => {
    const patch = buildRepaymentPatch({ balance: 2000, monthly_repayment: 0 }, 150);
    expect(patch).toEqual({ monthly_repayment: 150, repayment_start_balance: 2000 });
  });

  test("changing an already-set repayment doesn't reset the snapshot", () => {
    const patch = buildRepaymentPatch({ balance: 1500, monthly_repayment: 100 }, 200);
    expect(patch).toEqual({ monthly_repayment: 200 });
  });
});

describe("simulateDebtPayoffStrategy", () => {
  test("no debts returns an empty, zeroed result", () => {
    expect(simulateDebtPayoffStrategy([], 100, "avalanche")).toEqual({
      order: [], monthsToDebtFree: 0, totalInterestPaid: 0,
    });
  });

  test("avalanche and snowball order the same debts differently", () => {
    // "a" has the bigger balance but the higher rate; "b" is the opposite —
    // so the two strategies should pick opposite debts to prioritize first.
    const debts = [
      { id: "a", name: "Big high-rate card", balance: 5000, monthly_repayment: 100, apr_pct: 25 },
      { id: "b", name: "Small low-rate loan", balance: 500, monthly_repayment: 25, apr_pct: 5 },
    ];
    const avalanche = simulateDebtPayoffStrategy(debts, 100, "avalanche");
    const snowball = simulateDebtPayoffStrategy(debts, 100, "snowball");
    expect(avalanche.order.map((d) => d.id)).toEqual(["a", "b"]); // higher APR first
    expect(snowball.order.map((d) => d.id)).toEqual(["b", "a"]); // smaller balance first
  });

  test("with no interest, a single debt pays off in balance / (min + extra) months, rounded up", () => {
    const result = simulateDebtPayoffStrategy(
      [{ id: "a", name: "Card", balance: 1000, monthly_repayment: 50, apr_pct: 0 }],
      50,
      "avalanche"
    );
    expect(result.monthsToDebtFree).toBe(10); // 1000 / (50 + 50)
    expect(result.totalInterestPaid).toBe(0);
    expect(result.order[0].monthsToPayoff).toBe(10);
  });

  test("clearing the first debt in the order rolls its minimum into the extra pool for the next one", () => {
    const debts = [
      { id: "a", name: "Small debt", balance: 100, monthly_repayment: 50, apr_pct: 0 },
      { id: "b", name: "Bigger debt", balance: 1000, monthly_repayment: 20, apr_pct: 0 },
    ];
    // Snowball: "a" (smaller balance) goes first, cleared in month 1 (50 min + 50 extra = 100).
    // From month 2, "a"'s freed £50 minimum joins the extra pool for "b": £20 + £50 + £50 = £120/mo.
    const result = simulateDebtPayoffStrategy(debts, 50, "snowball");
    expect(result.order[0].monthsToPayoff).toBe(1);
    expect(result.monthsToDebtFree).toBeGreaterThan(1);
  });

  test("interest accrues monthly on any debt with a nonzero APR", () => {
    const noInterest = simulateDebtPayoffStrategy(
      [{ id: "a", name: "Card", balance: 1000, monthly_repayment: 100, apr_pct: 0 }], 0, "avalanche"
    );
    const withInterest = simulateDebtPayoffStrategy(
      [{ id: "a", name: "Card", balance: 1000, monthly_repayment: 100, apr_pct: 20 }], 0, "avalanche"
    );
    expect(withInterest.totalInterestPaid).toBeGreaterThan(0);
    expect(withInterest.monthsToDebtFree).toBeGreaterThanOrEqual(noInterest.monthsToDebtFree);
  });

  test("a minimum payment too small to cover accruing interest never finishes, and is capped rather than looping forever", () => {
    const result = simulateDebtPayoffStrategy(
      [{ id: "a", name: "Underwater card", balance: 10000, monthly_repayment: 10, apr_pct: 40 }],
      0,
      "avalanche"
    );
    expect(result.monthsToDebtFree).toBeNull();
  });
});

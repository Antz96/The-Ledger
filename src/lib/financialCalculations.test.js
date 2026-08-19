import { describe, expect, test } from "vitest";
import {
  sumBy,
  groupByCategory,
  netWorth,
  netWorthChange,
  monthlyTotals,
  expensesByCategory,
  monthlyTrend,
  classifyExpenseCategory,
  monthlyFlow,
  liquidCash,
  averageEssentialExpenditure,
  financialRunway,
  savingsRatePct,
  evaluateConstitutionRule,
  allocationSplit,
  projectGoal,
} from "./financialCalculations";

describe("sumBy", () => {
  test("sums a numeric field across items", () => {
    expect(sumBy([{ value: 10 }, { value: 5.5 }], "value")).toBe(15.5);
  });
  test("treats missing/non-numeric fields as 0", () => {
    expect(sumBy([{ value: 10 }, { value: null }, {}], "value")).toBe(10);
  });
  test("returns 0 for empty or missing input", () => {
    expect(sumBy([], "value")).toBe(0);
    expect(sumBy(undefined, "value")).toBe(0);
  });
});

describe("groupByCategory", () => {
  test("sums by category and sorts descending", () => {
    const items = [
      { category: "Housing", value: 900 },
      { category: "Food", value: 200 },
      { category: "Housing", value: 100 },
    ];
    expect(groupByCategory(items, "value")).toEqual([
      { name: "Housing", value: 1000 },
      { name: "Food", value: 200 },
    ]);
  });
  test("empty input yields empty output", () => {
    expect(groupByCategory([], "value")).toEqual([]);
  });
});

describe("netWorth", () => {
  test("assets minus liabilities", () => {
    const assets = [{ value: 4200 }, { value: 6000 }, { value: 225000 }];
    const liabilities = [{ balance: 3000 }, { balance: 175000 }];
    expect(netWorth(assets, liabilities)).toEqual({
      totalAssets: 235200,
      totalLiabilities: 178000,
      netWorth: 57200,
    });
  });
  test("net worth can go negative", () => {
    expect(netWorth([{ value: 100 }], [{ balance: 500 }]).netWorth).toBe(-400);
  });
  test("handles no assets/liabilities at all", () => {
    expect(netWorth([], [])).toEqual({ totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
  });
});

describe("netWorthChange", () => {
  test("compares latest to the closest snapshot ~30 days earlier", () => {
    const snapshots = [
      { snapshot_date: "2026-07-01", net_worth: 50000 },
      { snapshot_date: "2026-07-19", net_worth: 53000 }, // closest to the 30-day cutoff (2026-07-20)
      { snapshot_date: "2026-08-10", net_worth: 55000 },
      { snapshot_date: "2026-08-19", net_worth: 57200 },
    ];
    expect(netWorthChange(snapshots, 30)).toEqual({
      current: 57200,
      previous: 53000,
      change: 4200,
      days: 30,
    });
  });

  test("no history at all returns null", () => {
    expect(netWorthChange([], 30)).toBeNull();
  });

  test("only recent history (nothing old enough to compare) returns null", () => {
    const snapshots = [
      { snapshot_date: "2026-08-15", net_worth: 57000 },
      { snapshot_date: "2026-08-19", net_worth: 57200 },
    ];
    expect(netWorthChange(snapshots, 30)).toBeNull();
  });

  test("a snapshot exactly on the cutoff date counts as the baseline", () => {
    const snapshots = [
      { snapshot_date: "2026-07-20", net_worth: 50000 }, // exactly 30 days before 2026-08-19
      { snapshot_date: "2026-08-19", net_worth: 57200 },
    ];
    expect(netWorthChange(snapshots, 30)).toEqual({ current: 57200, previous: 50000, change: 7200, days: 30 });
  });
});

describe("monthlyTotals", () => {
  const transactions = [
    { date: "2026-08-01", type: "income", amount: 2400 },
    { date: "2026-08-05", type: "expense", amount: 900 },
    { date: "2026-08-10", type: "savings", amount: 200 },
    { date: "2026-07-15", type: "income", amount: 2400 },
    { date: "2026-07-20", type: "expense", amount: 1200 },
  ];

  test("scopes to a single month when monthKey is given", () => {
    expect(monthlyTotals(transactions, "2026-08")).toEqual({
      income: 2400,
      expense: 900,
      savings: 200,
      net: 1300,
    });
  });

  test("covers all-time when monthKey is omitted", () => {
    const result = monthlyTotals(transactions);
    expect(result.income).toBe(4800);
    expect(result.expense).toBe(2100);
    expect(result.savings).toBe(200);
    expect(result.net).toBe(2500);
  });

  test("a month with no transactions returns zeros, not undefined", () => {
    expect(monthlyTotals(transactions, "2026-01")).toEqual({ income: 0, expense: 0, savings: 0, net: 0 });
  });
});

describe("expensesByCategory", () => {
  const transactions = [
    { date: "2026-08-05", type: "expense", category: "Housing", amount: 900 },
    { date: "2026-08-08", type: "expense", category: "Food & Groceries", amount: 220 },
    { date: "2026-08-12", type: "expense", category: "Housing", amount: 46 },
    { date: "2026-08-01", type: "income", category: "Salary", amount: 2400 },
    { date: "2026-07-01", type: "expense", category: "Housing", amount: 900 },
  ];

  test("only counts expenses, grouped and summed by category", () => {
    expect(expensesByCategory(transactions, "2026-08")).toEqual([
      { name: "Housing", value: 946 },
      { name: "Food & Groceries", value: 220 },
    ]);
  });

  test("excludes other months when scoped", () => {
    const result = expensesByCategory(transactions, "2026-08");
    const total = result.reduce((s, c) => s + c.value, 0);
    expect(total).toBe(1166); // not 2066 — July's 900 must not leak in
  });
});

describe("monthlyTrend", () => {
  test("produces one entry per month key, in order given", () => {
    const transactions = [
      { date: "2026-07-01", type: "income", amount: 2000 },
      { date: "2026-08-01", type: "income", amount: 2400 },
      { date: "2026-08-05", type: "expense", amount: 900 },
    ];
    const trend = monthlyTrend(transactions, ["2026-07", "2026-08"]);
    expect(trend).toEqual([
      { month: "Jul", Income: 2000, Expense: 0, Saved: 0 },
      { month: "Aug", Income: 2400, Expense: 900, Saved: 0 },
    ]);
  });
});

describe("classifyExpenseCategory", () => {
  test("known categories map to essential or discretionary", () => {
    expect(classifyExpenseCategory("Housing")).toBe("essential");
    expect(classifyExpenseCategory("Entertainment")).toBe("discretionary");
  });
  test("unknown/uncategorized defaults to discretionary", () => {
    expect(classifyExpenseCategory("Other")).toBe("discretionary");
    expect(classifyExpenseCategory("Something made up")).toBe("discretionary");
  });
});

describe("monthlyFlow", () => {
  test("splits income, essential, discretionary, wealth-building, and what's left", () => {
    const transactions = [
      { date: "2026-08-01", type: "income", category: "Salary", amount: 2400 },
      { date: "2026-08-05", type: "expense", category: "Housing", amount: 900 }, // essential
      { date: "2026-08-06", type: "expense", category: "Utilities", amount: 140 }, // essential
      { date: "2026-08-08", type: "expense", category: "Entertainment", amount: 80 }, // discretionary
      { date: "2026-08-10", type: "savings", category: "Emergency Fund", amount: 200 }, // wealth-building
    ];
    expect(monthlyFlow(transactions, "2026-08")).toEqual({
      income: 2400,
      essential: 1040,
      discretionary: 80,
      wealthBuilding: 200,
      unallocated: 1080, // 2400 - 1040 - 80 - 200
    });
  });

  test("a month with nothing logged is all zeros", () => {
    expect(monthlyFlow([], "2026-08")).toEqual({
      income: 0, essential: 0, discretionary: 0, wealthBuilding: 0, unallocated: 0,
    });
  });
});

describe("liquidCash", () => {
  test("sums only Cash-category assets", () => {
    const assets = [
      { category: "Cash", value: 4200 },
      { category: "Investments", value: 6000 },
      { category: "Cash", value: 800 },
    ];
    expect(liquidCash(assets)).toBe(5000);
  });
  test("no cash assets is 0, not an error", () => {
    expect(liquidCash([{ category: "Property", value: 225000 }])).toBe(0);
  });
});

describe("averageEssentialExpenditure", () => {
  test("averages essential spend across the given months, zero-filling gaps", () => {
    const transactions = [
      { date: "2026-07-05", type: "expense", category: "Housing", amount: 900 },
      { date: "2026-08-05", type: "expense", category: "Housing", amount: 900 },
      { date: "2026-08-08", type: "expense", category: "Entertainment", amount: 500 }, // discretionary, excluded
      // 2026-06 has nothing logged at all
    ];
    // (0 + 900 + 900) / 3 = 600
    expect(averageEssentialExpenditure(transactions, ["2026-06", "2026-07", "2026-08"])).toBe(600);
  });
  test("no months given returns 0", () => {
    expect(averageEssentialExpenditure([], [])).toBe(0);
  });
});

describe("financialRunway", () => {
  test("liquid cash divided by average essential spend, in months", () => {
    expect(financialRunway(3000, 1000)).toBe(3);
    expect(financialRunway(1500, 1000)).toBe(1.5);
  });
  test("no essential spend to divide by returns null, not Infinity", () => {
    expect(financialRunway(3000, 0)).toBeNull();
    expect(financialRunway(3000, null)).toBeNull();
  });
});

describe("savingsRatePct", () => {
  test("savings as a percentage of income", () => {
    expect(savingsRatePct(2400, 384)).toBe(16);
  });
  test("no income logged returns null, not Infinity", () => {
    expect(savingsRatePct(0, 200)).toBeNull();
    expect(savingsRatePct(null, 200)).toBeNull();
  });
});

describe("evaluateConstitutionRule", () => {
  test("min direction: meeting or beating the target is met", () => {
    expect(evaluateConstitutionRule(20, 15, "min")).toEqual({ actual: 20, target: 15, met: true });
    expect(evaluateConstitutionRule(10, 15, "min")).toEqual({ actual: 10, target: 15, met: false });
  });
  test("max direction: staying at or under the target is met", () => {
    expect(evaluateConstitutionRule(400, 600, "max")).toEqual({ actual: 400, target: 600, met: true });
    expect(evaluateConstitutionRule(700, 600, "max")).toEqual({ actual: 700, target: 600, met: false });
  });
  test("no target set returns null rather than a false judgment", () => {
    expect(evaluateConstitutionRule(20, null, "min")).toBeNull();
    expect(evaluateConstitutionRule(20, undefined, "min")).toBeNull();
  });
  test("no actual to compare returns null too", () => {
    expect(evaluateConstitutionRule(null, 20, "min")).toBeNull();
  });
});

describe("allocationSplit", () => {
  test("splits the monthly amount by percentage per tier", () => {
    expect(allocationSplit({ monthly: 500, low: 22, medium: 24, high: 54 })).toEqual({
      low: 110,
      medium: 120,
      high: 270,
    });
  });
  test("zero monthly amount splits to zero everywhere", () => {
    expect(allocationSplit({ monthly: 0, low: 50, medium: 30, high: 20 })).toEqual({ low: 0, medium: 0, high: 0 });
  });
});

describe("projectGoal", () => {
  const today = new Date("2026-08-19");

  test("on-track goal: projected date beats the target date", () => {
    const goal = {
      created_at: "2026-05-01",
      starting_amount: 1000,
      monthly_contribution: 500,
      target_amount: 6000,
      target_date: "2027-06-01",
    };
    const result = projectGoal(goal, today);
    // 3 months elapsed (May -> Aug): 1000 + 500*3 = 2500 saved, remaining 3500
    expect(result.projectedSaved).toBe(2500);
    expect(result.remaining).toBe(3500);
    expect(result.progressPct).toBeCloseTo((2500 / 6000) * 100);
    // ceil(3500 / 500) = 7 months from today -> 2027-03-19
    expect(result.projectedDate.toISOString().slice(0, 10)).toBe("2027-03-19");
    expect(result.onTrack).toBe(true);
  });

  test("off-track goal: projected date is after the target date", () => {
    const goal = {
      created_at: "2026-05-01",
      starting_amount: 1000,
      monthly_contribution: 200,
      target_amount: 6000,
      target_date: "2026-12-01",
    };
    const result = projectGoal(goal, today);
    expect(result.onTrack).toBe(false);
  });

  test("goal already reached", () => {
    const goal = {
      created_at: "2026-01-01",
      starting_amount: 6000,
      monthly_contribution: 0,
      target_amount: 6000,
      target_date: "2026-12-01",
    };
    const result = projectGoal(goal, today);
    expect(result.remaining).toBe(0);
    expect(result.projectedDate).toBe("reached");
    expect(result.progressPct).toBe(100);
  });

  test("no monthly contribution and not yet reached: no projected date, no on-track verdict", () => {
    const goal = {
      created_at: "2026-05-01",
      starting_amount: 1000,
      monthly_contribution: 0,
      target_amount: 6000,
      target_date: "2026-12-01",
    };
    const result = projectGoal(goal, today);
    expect(result.projectedDate).toBeNull();
    expect(result.onTrack).toBeNull();
  });

  test("no target_date set: never returns an on-track verdict even with a contribution", () => {
    const goal = {
      created_at: "2026-05-01",
      starting_amount: 1000,
      monthly_contribution: 500,
      target_amount: 6000,
      target_date: null,
    };
    const result = projectGoal(goal, today);
    expect(result.projectedDate).not.toBeNull();
    expect(result.onTrack).toBeNull();
  });
});

import { describe, expect, test } from "vitest";
import { getNextStepSuggestions } from "./nextStepSuggestions";

describe("getNextStepSuggestions", () => {
  test("no tags returns nothing to suggest", () => {
    expect(getNextStepSuggestions([])).toEqual({ needsExternalSupport: false, items: [] });
    expect(getNextStepSuggestions(undefined)).toEqual({ needsExternalSupport: false, items: [] });
  });

  test("tags with no matching rule return nothing", () => {
    expect(getNextStepSuggestions(["credit-thin-file", "age-25-34"])).toEqual({
      needsExternalSupport: false,
      items: [],
    });
  });

  test("a single matching tag surfaces its rule's section once", () => {
    const result = getNextStepSuggestions(["perf-no-tracking"]);
    expect(result.needsExternalSupport).toBe(false);
    expect(result.items).toEqual([
      { key: "check-in", href: "/check-in", label: "Check-in", reason: expect.any(String) },
    ]);
  });

  test("multiple tags mapping to the same rule don't duplicate the suggestion", () => {
    const result = getNextStepSuggestions(["recently-declined", "credit-support", "payment-support"]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].key).toBe("credit-health");
  });

  test("tags across different rules surface each section once, unordered by importance", () => {
    const result = getNextStepSuggestions(["habit-no-system", "alloc-too-much-cash"]);
    const keys = result.items.map((i) => i.key).sort();
    expect(keys).toEqual(["explorer", "goals"]);
  });

  test("debt-needs-support flags external help alongside the in-app debt-payoff suggestion", () => {
    // debt-needs-support only ever appears alongside debt-overwhelming in practice
    // (q_debt_overwhelm_picture only shows when q_focus_debt was "feels overwhelming"),
    // and both should surface — the external flag doesn't suppress in-app suggestions.
    const result = getNextStepSuggestions(["debt-overwhelming", "debt-needs-support"]);
    expect(result.needsExternalSupport).toBe(true);
    expect(result.items.map((i) => i.key)).toEqual(["debt-payoff"]);
  });

  test("external support flag never fires without the specific tag", () => {
    const result = getNextStepSuggestions(["debt-overwhelming", "debt-unclear-picture"]);
    expect(result.needsExternalSupport).toBe(false);
  });
});

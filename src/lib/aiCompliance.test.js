import { describe, expect, test } from "vitest";
import { classifyUserMessage, classifyToolsUsed } from "./aiCompliance";

describe("classifyUserMessage", () => {
  test("flags requests for personalized investment/product advice as REGULATED_RISK", () => {
    expect(classifyUserMessage("Should I invest in Tesla?")).toBe("REGULATED_RISK");
    expect(classifyUserMessage("Which pension should I use?")).toBe("REGULATED_RISK");
    expect(classifyUserMessage("Is Bitcoin a good investment right now?")).toBe("REGULATED_RISK");
    expect(classifyUserMessage("Should I remortgage this year?")).toBe("REGULATED_RISK");
    expect(classifyUserMessage("What should I do with my savings?")).toBe("REGULATED_RISK");
    expect(classifyUserMessage("Can you recommend a mortgage for me?")).toBe("REGULATED_RISK");
  });

  test("flags transaction/execution requests as EXECUTION", () => {
    expect(classifyUserMessage("Transfer £500 to my savings account")).toBe("EXECUTION");
    expect(classifyUserMessage("Please make a payment on my credit card")).toBe("EXECUTION");
    expect(classifyUserMessage("Buy 10 shares of Apple for me")).toBe("EXECUTION");
  });

  test("ordinary factual and educational questions pass through unflagged", () => {
    expect(classifyUserMessage("How much did I spend on Housing this month?")).toBeNull();
    expect(classifyUserMessage("What's my net worth?")).toBeNull();
    expect(classifyUserMessage("Am I on track for my emergency fund goal?")).toBeNull();
    expect(classifyUserMessage("What does APR mean?")).toBeNull();
    expect(classifyUserMessage("Set up a savings goal for a house deposit")).toBeNull();
  });

  test("empty or missing input is not flagged", () => {
    expect(classifyUserMessage("")).toBeNull();
    expect(classifyUserMessage(undefined)).toBeNull();
  });
});

describe("classifyToolsUsed", () => {
  test("no tools called at all is EDUCATION", () => {
    expect(classifyToolsUsed([])).toBe("EDUCATION");
    expect(classifyToolsUsed(undefined)).toBe("EDUCATION");
  });

  test("read-only lookups classify as FACT or CALCULATION", () => {
    expect(classifyToolsUsed(["get_net_worth"])).toBe("FACT");
    expect(classifyToolsUsed(["get_goals"])).toBe("CALCULATION");
  });

  test("a write action dominates the classification even alongside lookups", () => {
    expect(classifyToolsUsed(["get_transactions", "create_savings_goal"])).toBe("DECISION_SUPPORT");
  });

  test("financial constitution lookups and updates classify like their goal equivalents", () => {
    expect(classifyToolsUsed(["get_financial_constitution"])).toBe("CALCULATION");
    expect(classifyToolsUsed(["update_financial_constitution"])).toBe("DECISION_SUPPORT");
  });

  test("unknown tool names default to FACT rather than throwing", () => {
    expect(classifyToolsUsed(["some_future_tool"])).toBe("FACT");
  });
});

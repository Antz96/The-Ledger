// Server-only. Tools the Assistant can call, each scoped to the signed-in user
// via their own RLS-scoped Supabase client — Claude never sees another user's data.
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { SECTIONS } from "@/lib/navSections";
import {
  netWorth as calcNetWorth,
  projectGoal,
  sumBy,
  monthlyTotals,
  monthlyFlow,
  savingsRatePct,
  liquidCash,
  evaluateConstitutionRule,
} from "@/lib/financialCalculations";

// Adapts projectGoal()'s real Date/number return shape to the JSON-safe,
// pre-rounded shape this tool's result needs — the math itself is the same
// function GoalsTab.js calls, so the two can never disagree.
function serializeGoalProjection(goal) {
  const projection = projectGoal(goal);
  return {
    ...projection,
    progressPct: Math.round(projection.progressPct),
    projectedDate: projection.projectedDate instanceof Date
      ? projection.projectedDate.toISOString().slice(0, 10)
      : projection.projectedDate,
  };
}

// `ctx` is a plain object the route handler reads after the tool loop finishes —
// it's how a tool with no other return value (navigation) can signal an action
// back to the client, since only the final text reaches the HTTP response.
export function buildAssistantTools(supabase, userId, ctx) {
  const getNetWorth = betaTool({
    name: "get_net_worth",
    description:
      "Get the user's full list of assets and liabilities, with totals and net worth. Use this for any " +
      "question about net worth, total assets, total debts, or a specific account/liability (e.g. credit cards, mortgage).",
    inputSchema: { type: "object", properties: {}, required: [] },
    run: async () => {
      const [{ data: assets }, { data: liabilities }] = await Promise.all([
        supabase.from("assets").select("name, category, purpose, value").eq("user_id", userId),
        supabase.from("liabilities").select("name, category, balance").eq("user_id", userId),
      ]);
      const totals = calcNetWorth(assets || [], liabilities || []);
      return JSON.stringify({ assets: assets || [], liabilities: liabilities || [], ...totals });
    },
  });

  const getTransactions = betaTool({
    name: "get_transactions",
    description:
      "Get the user's logged transactions, optionally filtered by month, type, and/or category. Use this for " +
      "spending/income/savings questions (e.g. 'how much have I spent on Housing this month').",
    inputSchema: {
      type: "object",
      properties: {
        month: { type: "string", description: "YYYY-MM, e.g. 2026-08. Omit to cover all logged transactions." },
        type: { type: "string", enum: ["income", "expense", "savings"] },
        category: { type: "string", description: "e.g. Housing, Food & Groceries, Salary, Emergency Fund" },
      },
      required: [],
    },
    run: async (input) => {
      let query = supabase
        .from("transactions")
        .select("date, type, category, amount, note")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (input.type) query = query.eq("type", input.type);
      if (input.category) query = query.eq("category", input.category);
      if (input.month) query = query.gte("date", `${input.month}-01`).lte("date", `${input.month}-31`);
      const { data } = await query;
      const rows = data || [];
      const total = sumBy(rows, "amount");
      return JSON.stringify({ transactions: rows.slice(0, 100), matchingCount: rows.length, total });
    },
  });

  const getGoals = betaTool({
    name: "get_goals",
    description:
      "Get the user's savings goals with progress toward each and whether they're projected to hit the target " +
      "date. Use this for any 'am I on track' or goal-progress question.",
    inputSchema: { type: "object", properties: {}, required: [] },
    run: async () => {
      const { data } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      const result = (data || []).map((g) => {
        const projection = serializeGoalProjection(g);
        return {
          name: g.name,
          target_amount: Number(g.target_amount),
          starting_amount: Number(g.starting_amount),
          monthly_contribution: Number(g.monthly_contribution),
          target_date: g.target_date,
          ...projection,
        };
      });
      return JSON.stringify({ goals: result });
    },
  });

  const getAllocation = betaTool({
    name: "get_allocation",
    description:
      "Get how much the user has set aside to allocate each month and how it's split across risk tiers (low/medium/high).",
    inputSchema: { type: "object", properties: {}, required: [] },
    run: async () => {
      const { data } = await supabase.from("allocations").select("*").eq("user_id", userId).maybeSingle();
      if (!data) return JSON.stringify({ monthly: 0, low: 0, medium: 0, high: 0 });
      return JSON.stringify({
        monthly: Number(data.monthly_amount),
        low: data.low_pct,
        medium: data.medium_pct,
        high: data.high_pct,
      });
    },
  });

  const getFinancialConstitution = betaTool({
    name: "get_financial_constitution",
    description:
      "Get the user's self-set financial rules (savings rate target, cash buffer target, discretionary monthly " +
      "spend cap, priorities) and how they're actually tracking against each one this month. Use this for any " +
      "question about savings rate, cash buffer, discretionary spending targets, or 'am I on track with my rules'.",
    inputSchema: { type: "object", properties: {}, required: [] },
    run: async () => {
      const [{ data: constitution }, { data: transactions }, { data: assets }] = await Promise.all([
        supabase.from("financial_constitution").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("transactions").select("date, type, category, amount").eq("user_id", userId),
        supabase.from("assets").select("category, value").eq("user_id", userId),
      ]);
      if (!constitution) return JSON.stringify({ hasRules: false });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthly = monthlyTotals(transactions || [], currentMonth);
      const flow = monthlyFlow(transactions || [], currentMonth);

      return JSON.stringify({
        hasRules: true,
        priorities: constitution.priorities || null,
        // Each is {actual, target, met} from the same evaluateConstitutionRule
        // the Constitution page itself calls, or null if that rule isn't set.
        savingsRateTarget: evaluateConstitutionRule(
          savingsRatePct(monthly.income, monthly.savings),
          constitution.savings_rate_target_pct != null ? Number(constitution.savings_rate_target_pct) : null,
          "min"
        ),
        cashBufferTarget: evaluateConstitutionRule(
          liquidCash(assets || []),
          constitution.cash_buffer_target != null ? Number(constitution.cash_buffer_target) : null,
          "min"
        ),
        discretionarySpendCap: evaluateConstitutionRule(
          flow.discretionary,
          constitution.discretionary_monthly_target != null ? Number(constitution.discretionary_monthly_target) : null,
          "max"
        ),
      });
    },
  });

  const updateFinancialConstitution = betaTool({
    name: "update_financial_constitution",
    description:
      "Set or update the user's own financial rules — a savings rate target (% of income), a cash buffer target, " +
      "a discretionary monthly spend cap, and/or a free-text priorities note. Only include the fields the user " +
      "actually wants to change; omitted fields keep their existing value. Confirm the numbers with the user " +
      "before calling this — these are their own chosen targets, not something to suggest unprompted.",
    inputSchema: {
      type: "object",
      properties: {
        savings_rate_target_pct: { type: "number", description: "Target % of income to save each month." },
        cash_buffer_target: { type: "number", description: "Target amount to keep in cash." },
        discretionary_monthly_target: { type: "number", description: "Target monthly cap on discretionary spending." },
        priorities: { type: "string", description: "Free-text note on their priorities, in their own words." },
      },
      required: [],
    },
    run: async (input) => {
      const patch = {};
      if (input.savings_rate_target_pct != null) patch.savings_rate_target_pct = Number(input.savings_rate_target_pct);
      if (input.cash_buffer_target != null) patch.cash_buffer_target = Number(input.cash_buffer_target);
      if (input.discretionary_monthly_target != null) patch.discretionary_monthly_target = Number(input.discretionary_monthly_target);
      if (input.priorities != null) patch.priorities = String(input.priorities).trim();
      if (Object.keys(patch).length === 0) return JSON.stringify({ error: "Nothing to update." });

      const { data, error } = await supabase
        .from("financial_constitution")
        .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ updated: true, constitution: data });
    },
  });

  const createSavingsGoal = betaTool({
    name: "create_savings_goal",
    description:
      "Create a new savings goal for the user. Only call this after you've confirmed the name, target amount, " +
      "and a monthly contribution with them in the conversation — never create one from a vague request without " +
      "checking the numbers first. If they don't know how much they can contribute, work it out from their real " +
      "income and expenses (via get_transactions) rather than guessing, propose a figure, and confirm it with " +
      "them before creating.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "e.g. Emergency fund, House deposit" },
        target_amount: { type: "number", description: "Total amount to save toward. Must be greater than 0." },
        starting_amount: { type: "number", description: "How much is already saved toward this goal. Defaults to 0 if omitted." },
        monthly_contribution: { type: "number", description: "How much they plan to add each month. Defaults to 0 if omitted." },
        target_date: { type: "string", description: "YYYY-MM-DD target date, if they gave one." },
      },
      required: ["name", "target_amount"],
    },
    run: async (input) => {
      const row = {
        name: String(input.name || "").trim(),
        target_amount: Number(input.target_amount) || 0,
        starting_amount: Number(input.starting_amount) || 0,
        monthly_contribution: Number(input.monthly_contribution) || 0,
        target_date: input.target_date || null,
      };
      if (!row.name || row.target_amount <= 0) {
        return JSON.stringify({ error: "Need a name and a target amount greater than zero." });
      }
      const { data, error } = await supabase.from("financial_goals").insert({ user_id: userId, ...row }).select().single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ created: true, goal: data });
    },
  });

  const goToPage = betaTool({
    name: "go_to_page",
    description:
      "Send the user's app to a specific section, e.g. right after creating something so they can see it, or " +
      "when they ask to be shown a section. Call this alongside your normal text reply, not instead of it — " +
      "always still explain what's happening in your written answer.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", enum: SECTIONS.map((s) => s.href), description: "The section to navigate to." },
      },
      required: ["path"],
    },
    run: async (input) => {
      if (SECTIONS.some((s) => s.href === input.path)) ctx.redirectTo = input.path;
      return JSON.stringify({ navigated: Boolean(ctx.redirectTo) });
    },
  });

  // Recorded so the route handler can classify the turn afterward (§4.1.E) and
  // write it to the audit log (§4.1.G) — ctx is the same object the route
  // already reads redirectTo off of.
  ctx.toolsUsed = ctx.toolsUsed || [];
  const allTools = [
    getNetWorth,
    getTransactions,
    getGoals,
    getAllocation,
    getFinancialConstitution,
    createSavingsGoal,
    updateFinancialConstitution,
    goToPage,
  ];
  return allTools.map((tool) => ({
    ...tool,
    run: async (input) => {
      ctx.toolsUsed.push(tool.name);
      return tool.run(input);
    },
  }));
}

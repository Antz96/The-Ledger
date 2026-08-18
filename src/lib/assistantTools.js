// Server-only. Tools the Assistant can call, each scoped to the signed-in user
// via their own RLS-scoped Supabase client — Claude never sees another user's data.
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { SECTIONS } from "@/lib/navSections";

function monthsBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Mirrors GoalsTab.js's projectGoal() exactly, so the Assistant's answer about
// a goal always matches what the Goals tab itself shows.
function projectGoal(goal) {
  const monthsElapsed = monthsBetween(goal.created_at, new Date());
  const projectedSaved = Number(goal.starting_amount) + Number(goal.monthly_contribution) * monthsElapsed;
  const target = Number(goal.target_amount);
  const progressPct = target > 0 ? Math.min(100, (projectedSaved / target) * 100) : 0;
  const remaining = Math.max(0, target - projectedSaved);
  const monthlyContribution = Number(goal.monthly_contribution);

  let projectedDate = null;
  if (remaining === 0) {
    projectedDate = "reached";
  } else if (monthlyContribution > 0) {
    const monthsToGo = Math.ceil(remaining / monthlyContribution);
    projectedDate = addMonths(new Date(), monthsToGo).toISOString().slice(0, 10);
  }

  let onTrack = null;
  if (goal.target_date && projectedDate && projectedDate !== "reached") {
    onTrack = projectedDate <= goal.target_date;
  }

  return { projectedSaved, progressPct: Math.round(progressPct), remaining, projectedDate, onTrack };
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
      const totalAssets = (assets || []).reduce((s, a) => s + (Number(a.value) || 0), 0);
      const totalLiabilities = (liabilities || []).reduce((s, l) => s + (Number(l.balance) || 0), 0);
      return JSON.stringify({
        assets: assets || [],
        liabilities: liabilities || [],
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      });
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
      const total = rows.reduce((s, t) => s + (Number(t.amount) || 0), 0);
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
        const projection = projectGoal(g);
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

  return [getNetWorth, getTransactions, getGoals, getAllocation, createSavingsGoal, goToPage];
}

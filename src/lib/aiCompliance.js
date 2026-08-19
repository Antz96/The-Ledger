// Compliance Classification Engine (Wealth OS blueprint §4.1.E). Every
// Assistant turn is tagged with one of six categories before its reply is
// shown. REGULATED_RISK and EXECUTION have no approved route or partner
// wired up, so requests classified as either are declined at this layer,
// deterministically, before the request ever reaches the model — this is a
// gate, not a suggestion the model could talk itself out of.
//
// Deliberately not another LLM call: a compliance gate whose own judgment is
// as unpredictable as the thing it's gating would defeat the point. Pattern
// matching is coarser, but it's the same input every time, it can't be
// argued with the way a model's context sometimes can, and it's directly
// unit-testable like the rest of the calculation layer.

const REGULATED_RISK_PATTERNS = [
  /\bshould i (buy|sell|invest in|remortgage|refinance)\b/i,
  /\bwhich (stock|share|fund|isa|pension|mortgage|insurance|policy)\b.*\b(should i|do you recommend|is best)\b/i,
  /\bis .* a good (investment|stock|fund)\b/i,
  /\b(best|which) mortgage (should|for me)\b/i,
  /\bshould i (consolidate|pay off) my debt\b/i,
  /\bwhat should i do with my (money|savings|pension|investments?)\b/i,
  /\brecommend (a|an|me) (stock|share|fund|investment|mortgage|insurance|policy|financial product)\b/i,
  /\b(give me|need|want) financial advice\b/i,
  /\bshould i (take out|get) (a|an) (loan|mortgage|insurance)\b/i,
  /\bhow should i invest\b/i,
];

const EXECUTION_PATTERNS = [
  /\btransfer £?\d/i,
  /\bmove £?\d.*\b(to|into)\b/i,
  /\bwithdraw £?\d/i,
  /\bmake a payment\b/i,
  /\bplace (a|an) (order|trade)\b/i,
  /\b(buy|sell) \d+ (shares?|units?)\b/i,
];

// Checks the user's message before the model is ever called. Returns
// "REGULATED_RISK", "EXECUTION", or null (not flagged — proceed normally,
// classified afterward instead by classifyToolsUsed).
export function classifyUserMessage(message) {
  const text = String(message || "");
  if (EXECUTION_PATTERNS.some((re) => re.test(text))) return "EXECUTION";
  if (REGULATED_RISK_PATTERNS.some((re) => re.test(text))) return "REGULATED_RISK";
  return null;
}

// Which category a tool call represents. get_goals is CALCULATION rather
// than FACT because it returns projectGoal()'s derived figures (projected
// date, on-track verdict), not just stored data. create_savings_goal is
// DECISION_SUPPORT, never a suitability call — it only ever runs the plan
// the user themselves specified and confirmed in conversation.
const TOOL_CATEGORY = {
  get_net_worth: "FACT",
  get_transactions: "FACT",
  get_goals: "CALCULATION",
  get_allocation: "FACT",
  create_savings_goal: "DECISION_SUPPORT",
  go_to_page: "FACT",
};

const SEVERITY = ["FACT", "CALCULATION", "EDUCATION", "DECISION_SUPPORT"];

// Classifies a completed turn from the tool names it called. No tools called
// at all means it was answered from general knowledge/conversation — EDUCATION.
// Otherwise takes the most significant category among the tools used, so a
// turn that both looked something up and wrote a goal is logged as the write.
export function classifyToolsUsed(toolNames) {
  if (!toolNames || toolNames.length === 0) return "EDUCATION";
  return toolNames
    .map((name) => TOOL_CATEGORY[name] || "FACT")
    .reduce((most, category) => (SEVERITY.indexOf(category) > SEVERITY.indexOf(most) ? category : most), "FACT");
}

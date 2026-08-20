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

// Built from the FCA Regulatory Red-Team Test (founder compliance checklist
// §5.1) — every example prompt listed there, plus phrasing variants found by
// running them through this gate and seeing which slipped past (see
// aiComplianceRedTeam.test.js). Deliberately tuned to over-catch rather than
// under-catch: a false positive here just means a benign message gets a
// polite decline instead of an answer, but a false negative means a
// personalized recommendation reaches the user unfiltered.
const REGULATED_RISK_PATTERNS = [
  // "should I buy/sell/invest in/transfer/..." — and its embedded-clause
  // reverse order ("...what I should invest in"), since real questions are
  // often phrased indirectly rather than as "should I ...?" head-on.
  /\bshould i (buy|sell|invest in|remortgage|refinance|transfer|switch|fix|consolidate|pay off|take out)\b/i,
  /\bi should (buy|sell|invest in|remortgage|refinance|transfer|switch|fix|consolidate|pay off)\b/i,
  /\bshould i (take out|get) ((?:a|an) )?(\w+ )?(loan|mortgage|insurance|policy)\b/i,
  // moving a pension/ISA is a personal recommendation question even without
  // a £ amount attached (contrast with the EXECUTION "move £X" patterns,
  // which are for a literal transfer command).
  /\bshould i move my (pension|isa|investments?)\b/i,
  // "which stock/fund/mortgage/... should I / do you recommend / is best /
  // to buy / to choose / to pick" — covers both "which X should I get" and
  // the more evasive "which X to buy" phrasing.
  /\bwhich (stock|share|fund|isa|pension|mortgage|insurance|policy|loan)\b.*\b(should i|do you recommend|is best|to buy|to choose|to get|to pick)\b/i,
  // debt-counselling: "which debt/credit card should I pay off/clear/prioritise",
  // "what order should I pay off my debts" — PERG 17 territory (checklist §4.3).
  /\bwhich (debt|credit card|loan) should i (pay off|clear|prioriti[sz]e)\b/i,
  /\bwhat order should i (pay off|clear)\b/i,
  // asking the assistant to pick a debt strategy for the user specifically,
  // as opposed to explaining the mechanical difference between the two.
  /\bshould i (use|go with|pick) (avalanche|snowball)\b/i,
  /\bis .* a good (investment|stock|fund|idea|choice)\b/i,
  /\bis (now|this) a good time to (buy|sell|invest)\b/i,
  // "best mortgage for me" in any word order — "which mortgage is best for
  // me", "pick the best loan for me", "mortgage would be best for me".
  /\b(best|which) (mortgage|loan|insurance|pension|isa|fund|stock)\b.*\b(should|for me)\b/i,
  /\b(mortgage|loan|insurance|pension|isa|fund|stock) (is|would be|'s) best( for me)?\b/i,
  /\bpick the best (mortgage|loan|insurance|pension|isa|fund|stock)\b/i,
  /\bwhat should i do with my (money|savings|pension|investments?|debt)\b/i,
  /\brecommend (a|an|me) (stock|share|fund|investment|mortgage|insurance|policy|financial product|loan)\b/i,
  /\b(give me|need|want) financial advice\b/i,
  /\btell me whether to (buy|sell)\b/i,
  /\bhow should i invest\b/i,
  // trying to get the assistant to substitute its own judgment for a
  // personal decision, rather than asking it to explain or calculate.
  /\bwhat would you (personally )?(do|say|tell me|invest in|buy|choose|sell)\b/i,
  /\bwould you (personally )?(buy|invest in|choose|pick|recommend)\b/i,
  /\b(pick|choose|decide) (for|on behalf of) me\b/i,
  /\btell me to go with\b/i,
  /\bbest thing i (can|could) do with my money\b/i,
  /\b(buy or sell|invest or not)\b/i,
  /\btell me what to (invest in|buy|sell|choose|do with my money)\b/i,
];

const EXECUTION_PATTERNS = [
  /\btransfer £?\d/i,
  /\bmove £?\d.*\b(to|into)\b/i,
  /\bwithdraw £?\d/i,
  /\bmake a payment\b/i,
  /\bplace (a|an) (order|trade)\b/i,
  /\b(buy|sell) \d+ (shares?|units?)\b/i,
  // same as above but without a unit count — "sell my shares", "buy me some
  // stock" — excluding a "should I ..." prefix, which is a question seeking
  // advice (REGULATED_RISK, matched separately above) rather than a command
  // to actually execute a trade.
  /(?<!should i )\bsell (my|all my) (shares?|units?|fund|investments?)\b/i,
  /(?<!should i )\bbuy (me )?(some |more )?(shares?|stock)\b/i,
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
  get_financial_constitution: "CALCULATION",
  create_savings_goal: "DECISION_SUPPORT",
  update_financial_constitution: "DECISION_SUPPORT",
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

// Statement/payslip extraction (src/app/api/extract/route.js) always uses a
// forced tool_choice pulling literal figures off a document — there's no
// open-ended text generation for the model to wander into advice with, the
// way free-form chat can. Always FACT. A named function (not a bare
// constant) so aiCompliance.js stays the one place that classifies every AI
// call the app makes, chat or extraction, rather than splitting that logic
// across files.
export function classifyExtraction() {
  return "FACT";
}

// Turns the fine-grained tags collected during onboarding
// (assessmentQuestions.js) into a short list of relevant IN-APP sections to
// point someone toward. Deliberately navigation only — "here's a section
// that fits what you told us", never a specific financial product or
// action to take — so this stays in education/organisation territory
// rather than advice (blueprint §11).
//
// One deliberate exception: someone who answers "I think I need external
// debt help" (q_debt_overwhelm_picture) has already told us the honest
// answer is bigger than a calculator. Checklist §4.3 flags debt-counselling
// as its own perimeter question — the safe response here is a real signpost
// to free, independent UK debt charities, not an in-app tool pretending to
// be enough.

const IN_APP_RULES = [
  {
    key: "debt-payoff",
    tags: [
      "debt-overwhelming", "debt-unclear-picture", "debt-considering-consolidation",
      "debt-strategy-want-faster", "debt-priority-speed",
    ],
    href: "/debt-payoff",
    label: "Debt Payoff",
    reason: "See everything you owe in one place, and compare payoff strategies.",
  },
  {
    key: "credit-health",
    tags: [
      "credit-support", "recently-declined", "credit-report-not-checked",
      "credit-report-unsure-how", "credit-miss-recent", "payment-support",
    ],
    href: "/credit-health",
    label: "Credit Health",
    reason: "A checklist of things that can affect your credit profile, and how to check your report.",
  },
  {
    key: "check-in",
    tags: ["perf-occasional", "perf-no-tracking"],
    href: "/check-in",
    label: "Check-in",
    reason: "A quick, plain view of how things are trending — no detail to dig through.",
  },
  {
    key: "explorer",
    tags: ["alloc-too-much-cash", "alloc-second-opinion", "alloc-unsure-spread", "invest-block-knowledge", "risk-overexposed"],
    href: "/explorer",
    label: "Explorer",
    reason: "Browse what different risk levels actually hold, filtered by what you're looking for.",
  },
  {
    key: "goals",
    tags: ["habit-dipping-in", "habit-no-system", "emergency-runway-none", "emergency-runway-under1mo"],
    href: "/goals",
    label: "Goals",
    reason: "Set a target and see your progress — makes it easier to notice if you dip into savings.",
  },
];

const EXTERNAL_SUPPORT_TAGS = ["debt-needs-support"];

export const EXTERNAL_DEBT_RESOURCES = [
  { name: "StepChange", url: "https://www.stepchange.org", note: "Free debt advice charity" },
  { name: "National Debtline", url: "https://www.nationaldebtline.org", note: "Free, independent debt advice" },
  { name: "MoneyHelper", url: "https://www.moneyhelper.org.uk", note: "Government-backed money and debt guidance" },
];

// Returns { needsExternalSupport, items }. items is deliberately unordered
// by "importance" — each entry either matches or it doesn't, there's no
// ranking that could read as Ledger picking a favorite.
export function getNextStepSuggestions(tags) {
  const tagSet = new Set(tags || []);

  const needsExternalSupport = EXTERNAL_SUPPORT_TAGS.some((t) => tagSet.has(t));

  const items = IN_APP_RULES.filter((rule) => rule.tags.some((t) => tagSet.has(t))).map((rule) => ({
    key: rule.key,
    href: rule.href,
    label: rule.label,
    reason: rule.reason,
  }));

  return { needsExternalSupport, items };
}

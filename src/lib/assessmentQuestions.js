// Onboarding assessment (addendum section 1). Every option maps to zero or
// more interest tags used to pick relevant articles. Money-shaped options
// also carry a `draft` — a rough starting figure for the Ledger that the
// user reviews and edits before anything is actually saved (see
// AssessmentTab's review step). Q_goal is free text, stored but never
// tagged or drafted. `showIf` lets a question depend on an earlier answer
// (e.g. mortgage balance only appears if they said they have a mortgage).
// `allowNote` on an option (with an optional `notePlaceholder`) prompts for
// a short free-text elaboration after it's picked — use it on genuine
// catch-all choices ("Something else"), not on "not sure" style options
// where there's nothing to elaborate on.

export const ASSESSMENT_QUESTIONS = [
  {
    id: "q_focus",
    text: "What are you focused on right now?",
    type: "select",
    options: [
      { label: "Building credit", tags: ["credit"] },
      { label: "Saving money", tags: ["saving"] },
      { label: "Paying off debt", tags: ["debt"] },
      { label: "Starting to invest", tags: ["investing"] },
      { label: "Growing and managing what I already have", tags: ["wealth-management"] },
      { label: "Not sure yet", tags: [] },
    ],
  },
  // The five questions below are mutually exclusive follow-ups keyed off
  // q_focus — only one is ever visible, tailoring the rest of the quiz
  // toward whichever route the first answer points at.
  {
    id: "q_focus_credit",
    text: "What's the main thing holding your credit back right now?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Building credit",
    options: [
      { label: "No credit history yet", tags: ["credit-thin-file"] },
      { label: "Missed payments in the past", tags: ["credit-missed-payments"] },
      { label: "High balances on cards", tags: ["credit-high-utilisation"] },
      { label: "Not sure what's holding me back", tags: ["credit-unsure"] },
    ],
  },
  // Second layer, specific to the credit path — branches again off q_focus_credit
  // so someone with a thin file gets a different follow-up than someone
  // recovering from missed payments.
  {
    id: "q_credit_thinfile",
    text: "Do you currently have any credit product in your name at all?",
    type: "select",
    showIf: (answers) => answers.q_focus_credit?.label === "No credit history yet",
    options: [
      { label: "No credit at all yet", tags: ["credit-truly-thin"] },
      { label: "Just a mobile phone contract", tags: ["credit-phone-only"] },
      { label: "A credit-builder card", tags: ["credit-builder-active"] },
      { label: "A different card or loan", tags: ["credit-other-active"] },
    ],
  },
  {
    id: "q_credit_missed_recency",
    text: "How long ago was your most recent missed payment?",
    type: "select",
    showIf: (answers) => answers.q_focus_credit?.label === "Missed payments in the past",
    options: [
      { label: "Within the last 6 months", tags: ["credit-miss-recent"] },
      { label: "6 months to 2 years ago", tags: ["credit-miss-1to2yr"] },
      { label: "More than 2 years ago", tags: ["credit-miss-old"] },
      { label: "Not sure", tags: ["credit-miss-unsure"] },
    ],
  },
  {
    id: "q_credit_overpay",
    text: "Are you able to pay more than the minimum each month?",
    type: "select",
    showIf: (answers) => answers.q_focus_credit?.label === "High balances on cards",
    options: [
      { label: "Yes, comfortably", tags: ["credit-can-overpay"] },
      { label: "Yes, but it's tight", tags: ["credit-tight-overpay"] },
      { label: "No, only the minimum", tags: ["credit-minimum-only", "credit-support"] },
      { label: "Not sure", tags: ["credit-utilisation-unsure"] },
    ],
  },
  {
    id: "q_credit_report_check",
    text: "Have you checked your credit report in the last 12 months?",
    type: "select",
    showIf: (answers) => answers.q_focus_credit?.label === "Not sure what's holding me back",
    options: [
      { label: "Yes", tags: ["credit-report-checked"] },
      { label: "No", tags: ["credit-report-not-checked"] },
      { label: "Not sure how to", tags: ["credit-report-unsure-how"] },
    ],
  },
  // Shared across the whole credit path regardless of which branch above fired.
  {
    id: "q_credit_goal",
    text: "Is there something specific you need good credit for, or is this about building healthy credit generally?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Building credit",
    options: [
      { label: "A mortgage", tags: ["credit-goal-mortgage"] },
      { label: "A car or other loan", tags: ["credit-goal-loan"] },
      { label: "Just building healthy credit generally", tags: ["credit-goal-general"] },
      { label: "Not sure yet", tags: [] },
    ],
  },
  {
    id: "q_focus_saving",
    text: "Which of these best describes what you're saving for right now?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Saving money",
    options: [
      { label: "An emergency fund", tags: ["goal-emergency-fund"] },
      { label: "A big purchase (house, car, etc)", tags: ["goal-big-purchase"] },
      { label: "Just building the habit", tags: ["goal-habit"] },
      { label: "Not sure yet", tags: [] },
    ],
  },
  // Second layer, specific to the saving path — branches off q_focus_saving.
  {
    id: "q_saving_emergency_runway",
    text: "How many months of essential expenses could your current savings cover?",
    type: "select",
    showIf: (answers) => answers.q_focus_saving?.label === "An emergency fund",
    options: [
      { label: "None", tags: ["emergency-runway-none"] },
      { label: "Less than 1 month", tags: ["emergency-runway-under1mo"] },
      { label: "1–3 months", tags: ["emergency-runway-1to3mo"] },
      { label: "3–6 months", tags: ["emergency-runway-3to6mo"] },
      { label: "6+ months", tags: ["emergency-runway-6moplus"] },
    ],
  },
  {
    id: "q_saving_purchase_type",
    text: "What's the big purchase?",
    type: "select",
    showIf: (answers) => answers.q_focus_saving?.label === "A big purchase (house, car, etc)",
    options: [
      { label: "A house deposit", tags: ["purchase-house"] },
      { label: "A car", tags: ["purchase-car"] },
      { label: "A wedding", tags: ["purchase-wedding"] },
      { label: "Something else", tags: ["purchase-other"], allowNote: true, notePlaceholder: "What's the purchase?" },
    ],
  },
  {
    id: "q_saving_habit_blocker",
    text: "What's mainly getting in the way of saving consistently?",
    type: "select",
    showIf: (answers) => answers.q_focus_saving?.label === "Just building the habit",
    options: [
      { label: "I don't have much spare money", tags: ["habit-low-spare"] },
      { label: "I keep dipping into savings", tags: ["habit-dipping-in"] },
      { label: "I just haven't started a system", tags: ["habit-no-system"] },
      { label: "Not sure", tags: ["habit-unsure"] },
    ],
  },
  {
    id: "q_saving_location",
    text: "Is your money in a dedicated savings account, or just sitting in your current account?",
    type: "select",
    showIf: (answers) => answers.q_focus_saving?.label === "Not sure yet",
    options: [
      { label: "In a dedicated savings account", tags: ["saving-in-savings-account"] },
      { label: "Just sitting in my current account", tags: ["saving-in-current-account"] },
      { label: "Spread across a few places", tags: ["saving-spread-around"] },
      { label: "Not sure", tags: ["saving-location-unsure"] },
    ],
  },
  // Shared across the whole saving path regardless of which branch above fired.
  {
    id: "q_saving_method",
    text: "How do you prefer to save?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Saving money",
    options: [
      { label: "Automatically (standing order / round-ups)", tags: ["save-method-automatic"] },
      { label: "Manually, when I remember", tags: ["save-method-manual"] },
      { label: "A mix of both", tags: ["save-method-mixed"] },
      { label: "Not sure yet", tags: ["save-method-unsure"] },
    ],
  },
  {
    id: "q_focus_debt",
    text: "Which best describes your debt right now?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Paying off debt",
    options: [
      { label: "One or two manageable balances", tags: ["debt-manageable"] },
      { label: "Multiple debts, feels overwhelming", tags: ["debt-overwhelming"] },
      { label: "Mostly one large balance", tags: ["debt-concentrated"] },
    ],
  },
  // Second layer, specific to the debt path — branches off q_focus_debt.
  {
    id: "q_debt_manageable_strategy",
    text: "What's your approach to paying it down?",
    type: "select",
    showIf: (answers) => answers.q_focus_debt?.label === "One or two manageable balances",
    options: [
      { label: "Already paying more than the minimum", tags: ["debt-strategy-overpaying"] },
      { label: "Sticking to minimum payments for now", tags: ["debt-strategy-minimum"] },
      { label: "Want to pay it off faster, not sure how", tags: ["debt-strategy-want-faster"] },
      { label: "Not sure", tags: ["debt-strategy-unsure"] },
    ],
  },
  {
    id: "q_debt_overwhelm_picture",
    text: "Do you have a clear picture of everything you owe?",
    type: "select",
    showIf: (answers) => answers.q_focus_debt?.label === "Multiple debts, feels overwhelming",
    options: [
      { label: "Yes, I know exactly what and to whom", tags: ["debt-clear-picture"] },
      { label: "Not fully — it's a bit scattered", tags: ["debt-unclear-picture"] },
      { label: "I've thought about debt consolidation", tags: ["debt-considering-consolidation"] },
      { label: "I think I need external debt help", tags: ["debt-needs-support"] },
    ],
  },
  {
    id: "q_debt_type",
    text: "What type of debt is it?",
    type: "select",
    showIf: (answers) => answers.q_focus_debt?.label === "Mostly one large balance",
    options: [
      { label: "A personal loan", tags: ["debt-type-loan"] },
      { label: "An overdraft", tags: ["debt-type-overdraft"] },
      { label: "Buy-now-pay-later or catalogue debt", tags: ["debt-type-bnpl"] },
      { label: "Something else", tags: ["debt-type-other"], allowNote: true, notePlaceholder: "What kind of debt?" },
    ],
  },
  // Shared across the whole debt path regardless of which branch above fired.
  {
    id: "q_debt_priority",
    text: "What matters most to you right now with this debt?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Paying off debt",
    options: [
      { label: "Paying it off as fast as possible", tags: ["debt-priority-speed"] },
      { label: "Keeping monthly payments manageable", tags: ["debt-priority-manageable"] },
      { label: "Understanding my options better", tags: ["debt-priority-understand"] },
      { label: "Not sure", tags: ["debt-priority-unsure"] },
    ],
  },
  {
    id: "q_focus_investing",
    text: "Where are you starting from with investing?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Starting to invest",
    options: [
      { label: "Never invested before", tags: ["investing-new"] },
      { label: "Dabbled a little", tags: ["investing-dabbled"] },
      { label: "Have some, want to be more consistent", tags: ["investing-inconsistent"] },
    ],
  },
  {
    id: "q_focus_sustain",
    text: "What matters most to you right now?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Growing and managing what I already have",
    options: [
      { label: "Making sure my money's well allocated", tags: ["wealth-allocation"] },
      { label: "Reducing risk", tags: ["wealth-risk-review"] },
      { label: "Reviewing performance regularly", tags: ["wealth-performance-review"] },
      { label: "Tax efficiency", tags: ["wealth-tax-efficiency"] },
    ],
  },
  {
    id: "q_goal",
    text: "Anything specific you're working toward?",
    type: "text",
    placeholder: "Optional — e.g. a house deposit, a car, a trip",
  },
  {
    id: "q_savings",
    text: "Savings or cash set aside — roughly how much?",
    type: "select",
    options: [
      { label: "None yet", tags: ["emergency-fund"] },
      { label: "Under £1,000", tags: ["emergency-fund"], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 500 } },
      { label: "£1,000–£5,000", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 3000 } },
      { label: "£5,000–£20,000", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 12000 } },
      { label: "£20,000–£50,000", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 35000 } },
      { label: "£50,000–£150,000", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 100000 } },
      { label: "£150,000+", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 200000 } },
    ],
  },
  {
    id: "q_cc_debt",
    text: "Credit card debt — roughly how much do you owe?",
    type: "select",
    options: [
      { label: "None", tags: ["credit-clean"] },
      { label: "Under £500", tags: ["debt"], draft: { kind: "liability", category: "Credit Card", name: "Credit card", value: 300 } },
      { label: "£500–£2,000", tags: ["debt"], draft: { kind: "liability", category: "Credit Card", name: "Credit card", value: 1250 } },
      { label: "£2,000–£10,000", tags: ["debt"], draft: { kind: "liability", category: "Credit Card", name: "Credit card", value: 6000 } },
      { label: "£10,000+", tags: ["debt"], draft: { kind: "liability", category: "Credit Card", name: "Credit card", value: 12000 } },
    ],
  },
  {
    id: "q_loans",
    text: "Other loans (car, personal, student finance) — roughly how much?",
    type: "select",
    options: [
      { label: "None", tags: [] },
      { label: "Under £2,000", tags: ["debt"], draft: { kind: "liability", category: "Loan", name: "Loan", value: 1000 } },
      { label: "£2,000–£10,000", tags: ["debt"], draft: { kind: "liability", category: "Loan", name: "Loan", value: 6000 } },
      { label: "£10,000+", tags: ["debt"], draft: { kind: "liability", category: "Loan", name: "Loan", value: 12000 } },
    ],
  },
  {
    id: "q_investments",
    text: "Investments — stocks, ISA, general investment account?",
    type: "select",
    options: [
      { label: "None yet", tags: [] },
      { label: "Under £2,000", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 1000 } },
      { label: "£2,000–£10,000", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 6000 } },
      { label: "£10,000–£50,000", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 25000 } },
      { label: "£50,000–£150,000", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 100000 } },
      { label: "£150,000–£500,000", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 300000 } },
      { label: "£500,000+", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 750000 } },
    ],
  },
  {
    id: "q_pension",
    text: "Pension — roughly what's it worth so far?",
    type: "select",
    options: [
      { label: "Not sure", tags: [] },
      { label: "None yet", tags: [] },
      { label: "Under £10,000", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 5000 } },
      { label: "£10,000–£50,000", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 25000 } },
      { label: "£50,000–£150,000", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 100000 } },
      { label: "£150,000–£400,000", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 275000 } },
      { label: "£400,000+", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 500000 } },
    ],
  },
  {
    id: "q_property",
    text: "Do you own any property?",
    type: "select",
    options: [
      { label: "No", tags: [] },
      { label: "One property, owned outright", tags: ["property-owner"] },
      { label: "One property, with a mortgage", tags: ["property-owner", "mortgage"] },
      { label: "Multiple properties", tags: ["property-owner", "property-portfolio"] },
    ],
  },
  {
    id: "q_property_value",
    text: "Roughly what could you sell your property for today (its current market value, not what you paid)?",
    type: "select",
    showIf: (answers) => ["One property, owned outright", "One property, with a mortgage"].includes(answers.q_property?.label),
    options: [
      { label: "Under £150,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 130000 } },
      { label: "£150,000–£300,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 225000 } },
      { label: "£300,000–£500,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 400000 } },
      { label: "£500,000–£750,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 625000 } },
      { label: "£750,000–£1,000,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 875000 } },
      { label: "£1,000,000+", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 1250000 } },
    ],
  },
  {
    id: "q_mortgage_balance",
    text: "Roughly how much is left to pay off on the mortgage (the outstanding balance, not the original loan)?",
    type: "select",
    showIf: (answers) => answers.q_property?.label === "One property, with a mortgage",
    options: [
      { label: "Under £100,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 75000 } },
      { label: "£100,000–£250,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 175000 } },
      { label: "£250,000–£400,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 325000 } },
      { label: "£400,000–£600,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 500000 } },
      { label: "£600,000+", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 700000 } },
    ],
  },
  {
    id: "q_declined",
    text: "Have you been rejected for credit recently?",
    type: "select",
    options: [
      { label: "Yes", tags: ["recently-declined", "credit-support"] },
      { label: "No", tags: [] },
      { label: "Prefer not to say", tags: [] },
    ],
  },
  {
    id: "q_bills",
    text: "How do you usually pay your bills?",
    type: "select",
    options: [
      { label: "Always on time", tags: ["payment-strong"] },
      { label: "Sometimes late", tags: ["payment-support"] },
      { label: "Not sure / don't track", tags: ["tracking-support"] },
    ],
  },
  {
    id: "q_risk",
    text: "How do you feel about risk with money?",
    type: "select",
    options: [
      { label: "Prefer safety", tags: ["risk-low"] },
      { label: "Open to ups and downs", tags: ["risk-medium"] },
      { label: "Comfortable with volatility", tags: ["risk-high"] },
    ],
  },
  {
    id: "q_timeline",
    text: (answers) => {
      const goal = answers.q_goal?.label?.trim();
      return goal
        ? `Realistically, what's an honest timeframe to reach "${goal}"?`
        : "Realistically, what's an honest timeframe for the goal you're working toward?";
    },
    type: "select",
    options: [
      { label: "Under 1 year", tags: ["timeline-short"] },
      { label: "1–5 years", tags: ["timeline-mid"] },
      { label: "5+ years", tags: ["timeline-long"] },
    ],
  },
  {
    id: "q_age",
    text: "Which age range are you in?",
    type: "select",
    options: [
      { label: "Under 25", tags: ["age-under-25"] },
      { label: "25–34", tags: ["age-25-34"] },
      { label: "35–44", tags: ["age-35-44"] },
      { label: "45–54", tags: ["age-45-54"] },
      { label: "55+", tags: ["age-55-plus"] },
      { label: "Prefer not to say", tags: [] },
    ],
  },
  {
    id: "q_handson",
    text: "How hands-on do you want to be?",
    type: "select",
    options: [
      { label: "Just show me the basics", tags: ["content-simple"] },
      { label: "I want the details", tags: ["content-deep"] },
    ],
  },
];

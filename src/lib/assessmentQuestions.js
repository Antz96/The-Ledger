// Onboarding assessment (addendum section 1). Every option maps to zero or
// more interest tags used to pick relevant articles. Money-shaped options
// also carry a `draft` — a rough starting figure for the Ledger that the
// user reviews and edits before anything is actually saved (see
// AssessmentTab's review step). Q_goal is free text, stored but never
// tagged or drafted. `showIf` lets a question depend on an earlier answer
// (e.g. mortgage balance only appears if they said they have a mortgage).

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
  {
    id: "q_focus_saving",
    text: "What's the savings goal closest to home?",
    type: "select",
    showIf: (answers) => answers.q_focus?.label === "Saving money",
    options: [
      { label: "An emergency fund", tags: ["goal-emergency-fund"] },
      { label: "A big purchase (house, car, etc)", tags: ["goal-big-purchase"] },
      { label: "Just building the habit", tags: ["goal-habit"] },
      { label: "Not sure yet", tags: [] },
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

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
      { label: "Not sure yet", tags: [] },
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
      { label: "£20,000+", tags: [], draft: { kind: "asset", category: "Cash", purpose: "Safety", name: "Savings", value: 25000 } },
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
      { label: "£50,000+", tags: ["investing"], draft: { kind: "asset", category: "Investments", purpose: "Growth", name: "Investments", value: 60000 } },
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
      { label: "£50,000+", tags: [], draft: { kind: "asset", category: "Pension", purpose: "Growth", name: "Pension", value: 60000 } },
    ],
  },
  {
    id: "q_property",
    text: "Do you own property, or have a mortgage?",
    type: "select",
    options: [
      { label: "Own outright", tags: ["property-owner"] },
      { label: "Have a mortgage", tags: ["property-owner", "mortgage"] },
      { label: "Don't own", tags: [] },
    ],
  },
  {
    id: "q_property_value",
    text: "Roughly what's your home worth?",
    type: "select",
    showIf: (answers) => ["Own outright", "Have a mortgage"].includes(answers.q_property?.label),
    options: [
      { label: "Under £150,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 130000 } },
      { label: "£150,000–£300,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 225000 } },
      { label: "£300,000–£500,000", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 400000 } },
      { label: "£500,000+", tags: [], draft: { kind: "asset", category: "Property", purpose: "Income", name: "Home", value: 600000 } },
    ],
  },
  {
    id: "q_mortgage_balance",
    text: "Roughly what's left on the mortgage?",
    type: "select",
    showIf: (answers) => answers.q_property?.label === "Have a mortgage",
    options: [
      { label: "Under £100,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 75000 } },
      { label: "£100,000–£250,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 175000 } },
      { label: "£250,000–£400,000", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 325000 } },
      { label: "£400,000+", tags: [], draft: { kind: "liability", category: "Mortgage", name: "Mortgage", value: 450000 } },
    ],
  },
  {
    id: "q_declined",
    text: "Have you been turned down for credit recently?",
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
    text: "What's your timeline for this goal?",
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

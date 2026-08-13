// Onboarding assessment (addendum section 1). Every option maps to zero or
// more interest tags — nothing here evaluates the person, it only routes
// them toward relevant content. Q7 is free text, stored but never tagged.
export const ASSESSMENT_QUESTIONS = [
  {
    id: "q1",
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
    id: "q2",
    text: "Do you currently have a credit card or loan in your name?",
    type: "select",
    options: [
      { label: "Yes", tags: ["credit-active"] },
      { label: "No", tags: ["credit-new"] },
      { label: "N/A", tags: [] },
    ],
  },
  {
    id: "q3",
    text: "How do you usually pay your bills?",
    type: "select",
    options: [
      { label: "Always on time", tags: ["payment-strong"] },
      { label: "Sometimes late", tags: ["payment-support"] },
      { label: "Not sure / don't track", tags: ["tracking-support"] },
    ],
  },
  {
    id: "q4",
    text: "Do you have money set aside for emergencies?",
    type: "select",
    options: [
      { label: "Yes, 3+ months", tags: [] },
      { label: "Some, not much", tags: ["emergency-fund"] },
      { label: "None yet", tags: ["emergency-fund"] },
    ],
  },
  {
    id: "q5",
    text: "How do you feel about risk with money?",
    type: "select",
    options: [
      { label: "Prefer safety", tags: ["risk-low"] },
      { label: "Open to ups and downs", tags: ["risk-medium"] },
      { label: "Comfortable with volatility", tags: ["risk-high"] },
    ],
  },
  {
    id: "q6",
    text: "What's your timeline for this goal?",
    type: "select",
    options: [
      { label: "Under 1 year", tags: ["timeline-short"] },
      { label: "1–5 years", tags: ["timeline-mid"] },
      { label: "5+ years", tags: ["timeline-long"] },
    ],
  },
  {
    id: "q7",
    text: "Anything specific you're saving toward?",
    type: "text",
    placeholder: "Optional — e.g. a house deposit, a car, a trip",
  },
  {
    id: "q8",
    text: "How hands-on do you want to be?",
    type: "select",
    options: [
      { label: "Just show me the basics", tags: ["content-simple"] },
      { label: "I want the details", tags: ["content-deep"] },
    ],
  },
];

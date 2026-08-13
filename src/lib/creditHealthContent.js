// Static V1 content for Credit Health (blueprint section 26). Educational
// only — language deliberately avoids "guaranteed", "will increase", or any
// claim that an action produces a specific outcome (section 26 + section 17).

export const CREDIT_FACTORS = [
  {
    id: "payment-history",
    title: "Payment History",
    what: "Whether payments on credit accounts have been made on time.",
    why: "Lenders often look at payment history as one signal of how credit has been managed in the past. Missed or late payments can stay on a credit file for a period of time.",
  },
  {
    id: "credit-utilisation",
    title: "Credit Utilisation",
    what: "The percentage of available revolving credit currently being used.",
    example: "£1,000 balance on a £4,000 total credit limit = 25% utilisation.",
    why: "Some lenders may view consistently high utilisation differently from lower utilisation — though there's no single percentage that guarantees a particular outcome, and criteria vary by lender.",
  },
  {
    id: "electoral-roll",
    title: "Electoral Roll Status",
    what: "Whether you're registered to vote at your current address.",
    why: "Being on the electoral roll can help lenders confirm identity and address, which some use as part of their checks.",
  },
  {
    id: "hard-searches",
    title: "Hard Searches",
    what: "A record left on a credit file when a lender checks it as part of a credit application — different from a \"soft search\", which doesn't leave a visible mark.",
    why: "A number of hard searches in a short period may be viewed differently by some lenders, though this varies.",
  },
  {
    id: "account-age",
    title: "Account Age",
    what: "How long credit accounts have been open, including the oldest and average account age.",
    why: "A longer credit history can give lenders more information to assess — though it's just one of many factors, not a deciding one on its own.",
  },
  {
    id: "credit-mix",
    title: "Credit Mix / Open Accounts",
    what: "The number and type of credit accounts held (credit cards, loans, etc.) and how many are currently open.",
    why: "Some lenders consider the variety and number of accounts as part of a broader picture, alongside everything else on file.",
  },
];

// Section 26.5 — qualitative, not tied to a £ amount or date, so these are
// tracked as a simple selection rather than forced into the financial_goals
// target/date shape.
export const CREDIT_GOALS = [
  { id: "prepare-mortgage", label: "Prepare to apply for a mortgage." },
  { id: "improve-profile", label: "Improve overall credit profile." },
  { id: "reduce-revolving-debt", label: "Reduce revolving debt." },
  { id: "lower-utilisation", label: "Lower credit utilisation." },
  { id: "clear-balances", label: "Clear outstanding balances." },
  { id: "correct-inaccurate-info", label: "Correct inaccurate information." },
  { id: "avoid-unnecessary-hard-searches", label: "Avoid unnecessary hard searches." },
  { id: "build-payment-history", label: "Build a longer positive payment history." },
];

export const PAYMENT_HISTORY_OPTIONS = ["All on time", "Some missed payments", "Not sure"];
export const ELECTORAL_ROLL_OPTIONS = ["Registered", "Not registered", "Not sure"];

export const CREDIT_ACTIONS = [
  { id: "check-reports", label: "Check all three UK credit reports.", why: "Reports can differ between agencies, so checking each gives a fuller picture of what lenders might see." },
  { id: "confirm-address", label: "Confirm address history is correct.", why: "Incorrect or missing address history can make it harder for lenders to verify identity." },
  { id: "check-electoral-roll", label: "Check electoral roll information.", why: "Being correctly registered can support the identity checks some lenders carry out." },
  { id: "review-missed-payments", label: "Review missed payments.", why: "Understanding what's recorded — and when it happened — is the first step to knowing where things stand." },
  { id: "review-utilisation", label: "Review credit utilisation.", why: "Seeing how much of the available credit is being used across all accounts gives a clearer picture." },
  { id: "review-hard-searches", label: "Review recent hard searches.", why: "Knowing what searches have been made, and why, helps spot anything unexpected." },
  { id: "check-duplicate-accounts", label: "Check for duplicate or unfamiliar accounts.", why: "Accounts that aren't recognised could be errors — or signs of fraud — worth investigating early." },
  { id: "check-old-associations", label: "Check whether old financial associations still appear.", why: "A financial link to an ex-partner or former housemate can affect how some lenders assess an application, even after the relationship ends." },
  { id: "review-debt", label: "Review existing debt.", why: "A clear picture of what's owed, and to whom, is useful groundwork before making any credit decisions." },
  { id: "dispute-incorrect-info", label: "Check whether incorrect information should be disputed.", why: "Errors on a credit file can be corrected — but only if they're spotted and raised with the relevant agency or lender." },
  { id: "understand-hard-search-timing", label: "Understand when a hard search may be created before applying for credit.", why: "Knowing this in advance can help avoid unnecessary searches close together." },
];

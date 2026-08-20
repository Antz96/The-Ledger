// Static V1 dataset for the Explorer (blueprint section 8). This intentionally
// isn't a database table yet — Phase 6 (Opportunity Database) is what turns
// this into curated, admin-managed data. These are illustrative educational
// examples, not a recommendation or a complete list.
export const EXPLORER_CATEGORIES = [
  {
    id: "cash-protection",
    title: "Cash / Protection",
    risk: ["Low"],
    description: "Protecting capital and staying easily accessible — typically used for money you might need at short notice.",
    examples: ["Emergency fund", "Easy-access savings", "Cash ISA", "Fixed savings", "Premium Bonds"],
  },
  {
    id: "lower-risk-growth-income",
    title: "Lower-Risk Growth / Income",
    risk: ["Low", "Medium"],
    description: "Modest, steadier growth or income, generally less volatile than the stock market.",
    examples: ["Money market funds", "Government bonds", "Bond funds"],
  },
  {
    id: "long-term-investing",
    title: "Long-Term Investing",
    risk: ["Medium"],
    description: "Broad, diversified exposure to markets — historically grows over longer horizons, but value moves up and down.",
    examples: ["Global index funds", "Broad-market ETFs", "Stocks & Shares ISA", "Pension / SIPP", "REITs"],
  },
  {
    id: "higher-risk",
    title: "Higher Risk",
    risk: ["Medium", "High"],
    description: "More concentrated or volatile than a diversified fund — single companies or sectors, or newer assets.",
    examples: ["Individual shares", "Sector ETFs", "Small-cap investments", "Crypto"],
  },
  {
    id: "very-high-speculative",
    title: "Very High / Speculative",
    risk: ["High"],
    description: "Capital intentionally at higher risk, including the risk of losing it entirely.",
    examples: ["Startups", "Angel investing", "Collectibles", "Active trading"],
  },
];

export const RISK_LEVELS = ["Low", "Medium", "High"];
export const RISK_FILTERS = ["All", ...RISK_LEVELS];
export const RISK_COLOR = { Low: "var(--ledger-green-soft)", Medium: "var(--gold)", High: "var(--rust)" };

export const LIQUIDITY_OPTIONS = ["Immediate", "Months", "Years", "10+ Years"];
export const LIQUIDITY_FILTERS = ["All", ...LIQUIDITY_OPTIONS];

export const HORIZON_OPTIONS = ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
export const HORIZON_FILTERS = ["All", ...HORIZON_OPTIONS];

// Blueprint section 10's remaining two filter dimensions — how much
// background knowledge a product typically assumes, and what kind of
// product it structurally is (distinct from EXPLORER_CATEGORIES, which
// groups by risk tier, not product type).
export const KNOWLEDGE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const KNOWLEDGE_FILTERS = ["All", ...KNOWLEDGE_LEVELS];

export const PRODUCT_TYPES = [
  "Cash", "Savings", "Bonds", "Funds", "ETFs", "Equities",
  "Property-related", "Pension", "Alternative assets", "Crypto", "Other",
];
export const PRODUCT_TYPE_FILTERS = ["All", ...PRODUCT_TYPES];

// HORIZON_OPTIONS bucketed by roughly how many months out a date falls —
// used to translate a saved goal's target_date into a starting Explorer
// filter, so "explore for this goal" means something concrete without
// Ledger judging which bucket is "right" for the user.
export function horizonBucketForMonthsAway(monthsAway) {
  if (monthsAway < 12) return "Less than 1 year";
  if (monthsAway < 36) return "1-3 years";
  if (monthsAway < 60) return "3-5 years";
  if (monthsAway < 120) return "5-10 years";
  return "10+ years";
}

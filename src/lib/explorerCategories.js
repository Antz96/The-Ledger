// Static V1 dataset for the Explorer (blueprint section 8). This intentionally
// isn't a database table yet — Phase 6 (Opportunity Database) is what turns
// this into curated, admin-managed data. These are illustrative educational
// examples, not a recommendation or a complete list.
export const EXPLORER_CATEGORIES = [
  {
    id: "cash-protection",
    title: "Cash / Protection",
    risk: ["Low"],
    description: "Protecting capital and staying easily accessible. Best for money you might need at short notice.",
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

export const EXPENSE_CATS = ["Housing", "Food & Groceries", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
export const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];
export const SAVINGS_CATS = ["Emergency Fund", "Retirement", "Goal Fund", "Other"];

export const TYPE_META = {
  income: { label: "Income", color: "#0FB981", cats: INCOME_CATS },
  expense: { label: "Expense", color: "#F2637A", cats: EXPENSE_CATS },
  savings: { label: "Savings", color: "#D9B44A", cats: SAVINGS_CATS },
};

// Which expense categories are non-optional vs lifestyle spend, for the
// essential/discretionary/wealth-building split (Wealth OS blueprint §7.3,
// §13). A judgment call, not a fact — Transport and Health are treated as
// essential (getting to work, medical needs), Entertainment and Shopping as
// discretionary. "Other" defaults to discretionary since it's unclassified
// spend and treating the unknown as essential would overstate real runway.
export const EXPENSE_CLASSIFICATION = {
  Housing: "essential",
  "Food & Groceries": "essential",
  Transport: "essential",
  Utilities: "essential",
  Health: "essential",
  Entertainment: "discretionary",
  Shopping: "discretionary",
  Other: "discretionary",
};

export const ASSET_CATEGORIES = ["Cash", "Investments", "Pension", "Property", "Crypto", "Other"];
export const LIABILITY_CATEGORIES = ["Credit Card", "Loan", "Mortgage", "Other"];

// What job is this money doing? Defaults from category, but always editable — the whole point is
// that "Investments" could be a Growth fund or an Income bond, and the person adding it knows which.
export const ASSET_PURPOSES = ["Safety", "Growth", "Income", "Speculation"];
export const PURPOSE_COLOR = { Safety: "var(--emerald)", Growth: "var(--gold)", Income: "var(--cyan)", Speculation: "var(--rust)" };
export const CATEGORY_PURPOSE_DEFAULT = {
  Cash: "Safety",
  Investments: "Growth",
  Pension: "Growth",
  Property: "Income",
  Crypto: "Speculation",
  Other: "Growth",
};

export const PIE_COLORS = ["#0FB981", "#22D3EE", "#D9B44A", "#F2637A", "#8B7FD9", "#3D4A5C", "#1F6F63", "#E0A458"];

export function monthKey(d) {
  return d.slice(0, 7);
}
export function monthLabel(k) {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
export const CURRENCIES = [
  { code: "GBP", symbol: "£" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];
export const DEFAULT_CURRENCY = "GBP";

// Module-level so fmt() keeps its simple signature everywhere. LedgerApp sets
// this from the profile row and re-renders, so reads stay in sync.
let activeCurrency = DEFAULT_CURRENCY;
export function setActiveCurrency(code) {
  activeCurrency = CURRENCIES.some((c) => c.code === code) ? code : DEFAULT_CURRENCY;
}
export function currencySymbol() {
  return CURRENCIES.find((c) => c.code === activeCurrency)?.symbol ?? "£";
}
export function fmt(n) {
  return (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: activeCurrency, maximumFractionDigits: 0 });
}
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// The last n calendar months as "YYYY-MM" keys, oldest first, ending at endKey
// (defaults to the current month). Independent of which months actually have
// transactions — used for calendar-based averages like Financial Runway.
export function lastNMonthKeys(n, endKey = todayKey()) {
  const [y, m] = endKey.split("-").map(Number);
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

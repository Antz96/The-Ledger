export const EXPENSE_CATS = ["Housing", "Food & Groceries", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
export const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];
export const SAVINGS_CATS = ["Emergency Fund", "Retirement", "Goal Fund", "Other"];

export const TYPE_META = {
  income: { label: "Income", color: "#2F6B4F", cats: INCOME_CATS },
  expense: { label: "Expense", color: "#A63D40", cats: EXPENSE_CATS },
  savings: { label: "Savings", color: "#B8860B", cats: SAVINGS_CATS },
};

export const PIE_COLORS = ["#2F6B4F", "#A63D40", "#B8860B", "#5B7A99", "#8C6A9C", "#C97B4A", "#6B8E6B", "#9A8C78"];

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

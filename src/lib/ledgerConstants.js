export const EXPENSE_CATS = ["Housing", "Food & Groceries", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
export const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];
export const SAVINGS_CATS = ["Emergency Fund", "Retirement", "Goal Fund", "Other"];

export const TYPE_META = {
  income: { label: "Income", color: "#0FB981", cats: INCOME_CATS },
  expense: { label: "Expense", color: "#F2637A", cats: EXPENSE_CATS },
  savings: { label: "Savings", color: "#D9B44A", cats: SAVINGS_CATS },
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

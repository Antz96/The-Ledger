export const EXPENSE_CATS = ["Housing", "Food & Groceries", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
export const INCOME_CATS = ["Salary", "Freelance", "Investment", "Gift", "Other"];
export const SAVINGS_CATS = ["Emergency Fund", "Retirement", "Goal Fund", "Other"];

export const TYPE_META = {
  income: { label: "Income", color: "#2F6B4F", cats: INCOME_CATS },
  expense: { label: "Expense", color: "#A63D40", cats: EXPENSE_CATS },
  savings: { label: "Savings", color: "#B8860B", cats: SAVINGS_CATS },
};

export const PIE_COLORS = ["#2F6B4F", "#A63D40", "#B8860B", "#5B7A99", "#8C6A9C", "#C97B4A", "#6B8E6B", "#9A8C78"];

// Phase 1: static, same data as the prototype. Phase 2 moves this into a
// `savings_rates` table with source_url/last_updated columns per the build plan.
export const RATE_DATA = [
  { bank: "Elevault", apy: "4.34%", min: "Varies", note: "Top rate on YieldFinder's daily comparison" },
  { bank: "Axos Bank", apy: "4.21%", min: "$1,500 avg. balance", note: "Requires linked checking + monthly direct deposit to hit top rate" },
  { bank: "Newtek Bank Personal HYS", apy: "4.20%", min: "$0", note: "Currently waitlist-only — paused new applications" },
  { bank: "Primis Business Savings", apy: "4.00%", min: "$1", note: "Business account" },
  { bank: "TIMBR High Yield Savings", apy: "3.95%", min: "$1,000", note: "No monthly fee" },
  { bank: "Bask Bank Interest Savings", apy: "3.75%", min: "$0", note: "No monthly fees or minimums" },
  { bank: "Laurel Road HYS", apy: "3.50%", min: "Varies", note: "" },
  { bank: "Ally Bank Savings", apy: "3.00%", min: "$0", note: "Round-ups and auto-transfer tools" },
];

export function monthKey(d) {
  return d.slice(0, 7);
}
export function monthLabel(k) {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
export function fmt(n) {
  return (Number(n) || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

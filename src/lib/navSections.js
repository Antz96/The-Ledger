import { LayoutDashboard, Wallet, Target, NotebookPen, SlidersHorizontal, GraduationCap, Landmark, CreditCard, TrendingDown, Bot, Compass, Building2, Gauge } from "lucide-react";

// Single source of truth for the app's sections — used by WheelNav and the
// post-onboarding welcome guide so descriptions never drift between the two.
export const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", desc: "Income, expenses, and savings at a glance.", Icon: LayoutDashboard },
  { href: "/check-in", label: "Check-in", desc: "The plain, no-detail version — net worth and how it's trending, nothing else.", Icon: Gauge },
  { href: "/assistant", label: "Assistant", desc: "Ask about your accounts, spending, and goals.", Icon: Bot },
  { href: "/assets", label: "Assets", desc: "Everything you own and owe, in one place.", Icon: Wallet },
  { href: "/connections", label: "Connections", desc: "Link a bank account so its balance and transactions show up live. Experimental.", Icon: Building2 },
  { href: "/debt-payoff", label: "Debt Payoff", desc: "Track what you owe against what you're repaying each month.", Icon: TrendingDown },
  { href: "/goals", label: "Goals", desc: "Track progress toward what you're saving for, and the rules you've set for yourself.", Icon: Target },
  { href: "/ledger", label: "Ledger", desc: "Every transaction, month by month.", Icon: NotebookPen },
  { href: "/allocate", label: "Allocate", desc: "Decide how much to save each month and split it across risk tiers.", Icon: SlidersHorizontal },
  { href: "/explorer", label: "Explorer", desc: "Browse categories of financial products by risk, and what's actually in each one.", Icon: Compass },
  { href: "/learn", label: "Learn", desc: "Plain-English explainers on risk, in one place.", Icon: GraduationCap },
  { href: "/rates", label: "Rates", desc: "Current high-yield savings rates, sourced and dated.", Icon: Landmark },
  { href: "/credit-health", label: "Credit Health", desc: "Ways you may be able to strengthen your credit profile.", Icon: CreditCard },
];

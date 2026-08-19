import { LayoutDashboard, Wallet, Target, NotebookPen, SlidersHorizontal, GraduationCap, Landmark, CreditCard, TrendingDown, Bot, ScrollText } from "lucide-react";

// Single source of truth for the app's sections — used by WheelNav and the
// post-onboarding welcome guide so descriptions never drift between the two.
export const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", desc: "Income, expenses, and savings at a glance.", Icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", desc: "Ask about your accounts, spending, and goals.", Icon: Bot },
  { href: "/assets", label: "Assets", desc: "Everything you own and owe, in one place.", Icon: Wallet },
  { href: "/debt-payoff", label: "Debt Payoff", desc: "Track what you owe against what you're repaying each month.", Icon: TrendingDown },
  { href: "/goals", label: "Goals", desc: "Track progress toward what you're saving for.", Icon: Target },
  { href: "/constitution", label: "Constitution", desc: "Set your own savings and spending rules, and see how you're tracking against them.", Icon: ScrollText },
  { href: "/ledger", label: "Ledger", desc: "Every transaction, month by month.", Icon: NotebookPen },
  { href: "/allocate", label: "Allocate", desc: "Split your monthly savings across risk tiers, and see what's actually in each one.", Icon: SlidersHorizontal },
  { href: "/learn", label: "Learn", desc: "Plain-English explainers on risk, in one place.", Icon: GraduationCap },
  { href: "/rates", label: "Rates", desc: "Current high-yield savings rates, sourced and dated.", Icon: Landmark },
  { href: "/credit-health", label: "Credit Health", desc: "Ways you may be able to strengthen your credit profile.", Icon: CreditCard },
];

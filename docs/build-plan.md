# The Ledger — Build Plan & Kickoff Brief

A savings, spending, and investing hub: people sign up, track their money, allocate
savings across risk tiers, and see current, factual rate/account information.
No personalized financial advice is given anywhere in the product — only sourced,
factual data (rates, APYs, account terms) that the person uses to decide for themselves.

---

## 1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Same component patterns as the prototype; great with Claude Code |
| Auth + Database | Supabase (Postgres + Auth) | Real email/password + OAuth login, row-level security so each user only sees their own data, generous free tier |
| Hosting | Vercel | One-command deploy from a GitHub repo, free tier, works natively with Next.js |
| Styling | Tailwind CSS | Matches the prototype's design system |
| Charts | Recharts | Already used in the prototype |

This stack is a good fit because it's almost entirely managed services — you're not
running your own servers, and it scales from "just me testing" to real users without
a rebuild.

---

## 2. Data model (Postgres via Supabase)

```
users              (managed by Supabase Auth — email, hashed password, id)

profiles
  id            uuid  (= auth.users.id)
  display_name  text
  created_at    timestamptz

transactions
  id            uuid pk
  user_id       uuid fk -> profiles.id
  date          date
  type          text   -- 'income' | 'expense' | 'savings'
  category      text
  amount        numeric
  note          text
  created_at    timestamptz

goals
  user_id       uuid fk -> profiles.id (pk)
  target_amount numeric
  updated_at    timestamptz

allocations
  user_id       uuid fk -> profiles.id (pk)
  monthly_amount numeric
  low_pct       int
  medium_pct    int
  high_pct      int
  updated_at    timestamptz
```

Row-Level Security (RLS) policy on every table: a user can only `select`/`insert`/
`update`/`delete` rows where `user_id = auth.uid()`. This is what makes real
multi-user separation possible — the prototype's "namespace by username" trick was
a stand-in for exactly this.

---

## 3. Rates & account data — keeping it factual

This is the piece worth being careful about as it grows:

- Store rate data in its own table (`savings_rates`, later `mortgage_rates`,
  `investment_accounts`) with a `source_url` and `last_updated` column on every row.
- Populate it by periodic scrape/update job (or manual entry at first) from
  publicly published rate pages — never fabricate a number.
- Display source + last-updated date next to every rate in the UI, same as the
  prototype does.
- No ranking language like "best for you" — sort by APY/fee/minimum and let the
  person filter, but don't personalize a recommendation.
- Add a persistent, non-dismissible disclosure: *"Rates and terms are shown for
  informational purposes, sourced from public bank data, and may change. This is
  not financial advice."*

---

## 4. Phased roadmap

**Phase 1 — Real accounts, same features as the prototype**
- Supabase email/password auth (swap out the demo sign-in)
- Migrate transactions/goals/allocations to Postgres tables above
- Deploy to Vercel with a real URL
- Outcome: a live site you and others can actually sign up to and use

**Phase 2 — Rates hub**
- Build the `savings_rates` table + admin entry form (or scheduled scraper)
- Public rates comparison page, filterable, all sourced
- Outcome: the "hub" positioning starts to be true, not just the tracker

**Phase 3 — Broader account/product data**
- Add `mortgage_rates`, `investment_accounts` (index funds, brokerage account types)
- Still factual/comparative only — no advice, no "you should"
- Outcome: one place to compare current options across account types

**Phase 4 — Polish & scale**
- Email verification, password reset flows
- CSV import for transactions (bank exports)
- PDF statement text-extraction (client-side pdf.js) for semi-automated entry
- Usage analytics, basic admin dashboard

Do Phase 1 fully before starting Phase 2 — a working live product with real
accounts is worth more than a half-built rates page with no users yet.

---

## 5. What to say when you open Claude Code

Paste something like this as your first message:

> I'm building "The Ledger" — a savings/spending tracker with real user accounts.
> I have a working React prototype (attached) and a build plan (attached).
> Set up a Next.js + Supabase + Tailwind project, implement the data model and
> RLS policies in the build plan, port over the prototype's UI (dashboard, ledger,
> allocation planner, learn tab, rates table) wired to real Supabase auth and
> tables instead of the demo storage, and get it deployed to Vercel. Start with
> Phase 1 only.

Attach both `savings-hub.jsx` (the prototype) and this build plan file — Claude
Code can read them directly from your repo folder.

---

## 6. Legal/compliance note for later

Once real users and real money-adjacent data are involved, look into:
- A privacy policy and terms of service (how transaction data is stored/used)
- Whether displaying rate/product comparisons requires any disclosures in your
  jurisdiction (this varies — a lawyer familiar with fintech is worth consulting
  before Phase 2 goes public)

This isn't something to solve before Phase 1 — just flagging it before the rates
hub becomes public-facing.

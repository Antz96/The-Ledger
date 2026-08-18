# The Ledger

A savings/spending tracker with real user accounts — Next.js + Supabase (Postgres + Auth) + Tailwind.
See [docs/build-plan.md](docs/build-plan.md) for the full roadmap. This is **Phase 1**: real accounts,
real data, deployed live. Rates are still static (Phase 2 moves them into their own table).

## Stack

- **Frontend**: Next.js App Router, client-rendered (no server data fetching yet — everything talks
  directly to Supabase from the browser under RLS)
- **Auth + DB**: Supabase (email/password auth, Postgres, row-level security)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts

## Local development

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase project's URL and
   publishable/anon key (Project Settings → API Keys in the Supabase dashboard).
2. Run the schema migration once: open the SQL Editor in your Supabase project, paste in
   [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql), and run it. This creates
   `profiles`, `transactions`, `goals`, `allocations` with RLS policies scoped to `auth.uid()`, plus a
   trigger that auto-provisions a profile + default goal/allocation row on signup.
3. Install deps and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with an email + password (if "Confirm
email" is on in Supabase's Auth settings, you'll need to click the confirmation link before signing in).

## Optional: bank connections (`/connections`)

Everything else in the app is manual entry. `/connections` is an experimental, opt-in feature that lets
a user link a real bank account via [Enable Banking](https://enablebanking.com), an FCA-regulated open
banking provider, and view live transaction data. It's disabled until configured — nothing else in the
app depends on it.

To set it up:

1. Run [supabase/migrations/0012_bank_connections.sql](supabase/migrations/0012_bank_connections.sql) in
   the SQL Editor.
2. Get your Supabase **service role** key (Project Settings → API → service_role — not the anon key) and
   set it as `SUPABASE_SERVICE_ROLE_KEY`. This is only ever read server-side, in the bank-connection
   callback route, to correlate a bank's redirect back to the user who started it.
3. Sign up at [enablebanking.com](https://enablebanking.com), register an application, and generate its
   certificate/private key pair. Set `ENABLE_BANKING_APP_ID`, `ENABLE_BANKING_PRIVATE_KEY`, and
   `ENABLE_BANKING_REDIRECT_URI` (must exactly match what's registered in their console — e.g.
   `http://localhost:3000/api/banking/callback` for local dev) per the comments in
   [.env.local.example](.env.local.example).
4. Enable Banking's free "Restricted Production" tier lets you link your own real accounts with no
   contract — enough to test this end to end. Going further (other people's accounts, sustained use)
   requires a signed agreement and KYB check with them directly.

## Optional: PDF statement & payslip import

Assets, Liabilities, Ledger transactions, and Allocate all offer an "Upload a PDF" option
alongside manual entry. It reads a statement or payslip and extracts structured data for you to
review before anything is added — it never advises on how to allocate money, only reports what's
in the document.

To enable it, get an API key from [console.anthropic.com](https://console.anthropic.com) (API
Keys) and set `ANTHROPIC_API_KEY`. Without it, the upload button still appears but returns a clear
"not configured yet" error instead of silently failing.

## Deploying to Vercel

1. **Push this repo to GitHub.**
   ```bash
   git add -A
   git commit -m "The Ledger — Phase 1"
   ```
   Then create a new repo on [github.com/new](https://github.com/new) (don't initialize it with a
   README) and follow the "push an existing repository" instructions it gives you, e.g.:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel.**
   - Go to [vercel.com/new](https://vercel.com/new) and sign in (GitHub login is easiest).
   - Import the GitHub repo you just pushed.
   - Vercel auto-detects Next.js — no build settings to change.
   - Under **Environment Variables**, add the same two values from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click **Deploy**.

3. **Once live**, if you left "Confirm email" off in Supabase for local testing, turn it back on
   (Authentication → Providers → Email) before sharing the URL with real users — otherwise anyone can
   sign up with an email they don't own.

## Data model & security

See [docs/build-plan.md](docs/build-plan.md) section 2 for the schema, and
[supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) for the actual SQL. Every table
has row-level security enabled with policies of the form `auth.uid() = user_id` — a signed-in user can
only ever read or write their own rows; there is no shared/admin bypass in the app itself.

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
only ever read or write their own rows. The only bypass is the server-side admin API described below.

## Admin

Accounts listed in the `ADMIN_EMAILS` env var get an **Admin** tab showing every live account
(email, last sign-in, entry counts, aggregate stats) with two actions: permanently delete an
account, or send it a password-reset email. Admin accounts themselves can't be deleted from the app.

Enforcement is server-side: the tab is backed by route handlers under `src/app/api/admin/` that
verify the caller's access token and email allowlist before using the Supabase service-role key
(`SUPABASE_SERVICE_ROLE_KEY`). Both env vars are server-only — never prefix them with
`NEXT_PUBLIC_`, and set them in Vercel's project settings for deploys. Password-reset emails
require the site URL to be in Supabase → Authentication → URL Configuration → Redirect URLs, and
Supabase's built-in mailer is rate-limited to a few emails per hour unless custom SMTP is set up.

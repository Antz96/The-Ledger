-- Ledger — Onboarding assessment + recommendation engine (addendum)
-- Run once in the Supabase SQL Editor after 0001-0010.

-- ── profiles additions ──────────────────────────────────────────────────────
alter table profiles
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists tags text[] not null default '{}',
  add column if not exists goal_note text;

-- Backfill: everyone who already has an account has already been "using" the
-- app without this gate — don't force existing users into the assessment on
-- their next login. Only brand-new signups after this point get routed there.
update profiles set onboarding_complete = true where onboarding_complete = false;

-- ── assessment_responses ────────────────────────────────────────────────────
create table if not exists assessment_responses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  question_id text not null,
  answer      text not null,
  created_at  timestamptz not null default now()
);

create index if not exists assessment_responses_user_idx on assessment_responses (user_id);

alter table assessment_responses enable row level security;

create policy "assessment_responses_select_own" on assessment_responses
  for select using (auth.uid() = user_id);
create policy "assessment_responses_insert_own" on assessment_responses
  for insert with check (auth.uid() = user_id);
create policy "assessment_responses_delete_own" on assessment_responses
  for delete using (auth.uid() = user_id);

-- ── articles ─────────────────────────────────────────────────────────────
-- Public read (matched against profile.tags for the dashboard's "Recommended
-- for you"), admin-only write — same posture as savings_rates/opportunities.
-- No admin UI yet; seeded directly below and manageable via SQL for now.
create table if not exists articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  summary       text not null default '',
  url           text not null,
  tags          text[] not null default '{}',
  content_level text check (content_level in ('simple', 'deep')),
  source_name   text not null,
  published_at  date,
  created_at    timestamptz not null default now()
);

alter table articles enable row level security;

create policy "articles_select_public" on articles
  for select using (true);

create policy "articles_insert_admin" on articles
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );
create policy "articles_update_admin" on articles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );
create policy "articles_delete_admin" on articles
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ── seed: Credit track (section 4 of the addendum) ─────────────────────────
-- Real, sourced, factual explainer content — not written from scratch.
-- published_at reflects the date this was sourced/verified, not the original
-- publish date of the source page (which isn't reliably available).
insert into articles (title, summary, url, tags, content_level, source_name, published_at) values
  (
    'How credit utilization works',
    'Credit utilization is the share of your available revolving credit that''s currently in use. It''s the second-biggest factor in most credit scoring models, and many sources point to keeping it under 30% as a common benchmark.',
    'https://www.bankrate.com/credit-cards/advice/credit-utilization-ratio/',
    array['credit', 'credit-active'],
    'simple',
    'Bankrate',
    current_date
  ),
  (
    'What''s a hard inquiry vs. a soft inquiry',
    'A soft inquiry (like checking your own score) doesn''t affect your credit. A hard inquiry happens when you formally apply for credit, can affect your score slightly, and stays on your report for a few years.',
    'https://www.nerdwallet.com/article/finance/credit-report-soft-hard-pull-difference',
    array['credit', 'credit-new', 'credit-active'],
    'simple',
    'NerdWallet',
    current_date
  ),
  (
    'Secured vs. unsecured credit cards, explained',
    'Secured cards require a cash deposit that typically sets your credit limit, and are often used to build or rebuild credit. Unsecured cards don''t require a deposit and are approved based on creditworthiness.',
    'https://www.bankrate.com/credit-cards/building-credit/secured-vs-unsecured-credit-cards/',
    array['credit', 'credit-new'],
    'simple',
    'Bankrate',
    current_date
  ),
  (
    'How long negative marks stay on your report',
    'Most negative marks — missed payments, collections, foreclosure — stay on a credit report for about seven years. Bankruptcy is the exception, staying for up to ten years depending on the type filed.',
    'https://www.nerdwallet.com/finance/learn/negative-marks-on-your-credit-report-how-long',
    array['credit', 'credit-active', 'payment-support'],
    'deep',
    'NerdWallet',
    current_date
  );

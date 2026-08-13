-- Ledger — Credit Health, brick 2: profile snapshot (26.1) + credit goals (26.5)
-- Run once in the Supabase SQL Editor after 0001-0009.

-- ── credit_profile (single editable row per user) ──────────────────────────
-- Manually entered, not pulled from a live credit-report integration — per
-- section 26.4, live integrations are explicitly out of scope for early V1.
create table if not exists credit_profile (
  user_id                uuid primary key references profiles (id) on delete cascade,
  payment_history_status text check (payment_history_status in ('All on time', 'Some missed payments', 'Not sure')),
  utilisation_pct        numeric check (utilisation_pct between 0 and 100),
  electoral_roll_status  text check (electoral_roll_status in ('Registered', 'Not registered', 'Not sure')),
  recent_hard_searches   int check (recent_hard_searches >= 0),
  account_age_years      numeric check (account_age_years >= 0),
  open_accounts_count    int check (open_accounts_count >= 0),
  missed_payments_count  int check (missed_payments_count >= 0),
  outstanding_borrowing  numeric check (outstanding_borrowing >= 0),
  credit_limit_total     numeric check (credit_limit_total >= 0),
  notes                  text not null default '',
  updated_at             timestamptz not null default now()
);

alter table credit_profile enable row level security;

create policy "credit_profile_select_own" on credit_profile
  for select using (auth.uid() = user_id);
create policy "credit_profile_insert_own" on credit_profile
  for insert with check (auth.uid() = user_id);
create policy "credit_profile_update_own" on credit_profile
  for update using (auth.uid() = user_id);

-- ── credit_goal_selections (which of the fixed goal list a user has picked) ─
create table if not exists credit_goal_selections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  goal_id      text not null,
  selected_at  timestamptz not null default now(),
  unique (user_id, goal_id)
);

create index if not exists credit_goal_selections_user_idx on credit_goal_selections (user_id);

alter table credit_goal_selections enable row level security;

create policy "credit_goal_selections_select_own" on credit_goal_selections
  for select using (auth.uid() = user_id);
create policy "credit_goal_selections_insert_own" on credit_goal_selections
  for insert with check (auth.uid() = user_id);
create policy "credit_goal_selections_delete_own" on credit_goal_selections
  for delete using (auth.uid() = user_id);

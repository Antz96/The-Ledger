-- Ledger — Phase 8: Goals (blueprint section 15, Page 7)
-- A separate table from the original single-row `goals` (the Dashboard's
-- "Savings goal" widget, left untouched) — this supports multiple named
-- goals with the richer field set the blueprint asks for.

create table if not exists financial_goals (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles (id) on delete cascade,
  name                 text not null,
  target_amount        numeric not null check (target_amount > 0),
  starting_amount      numeric not null default 0 check (starting_amount >= 0),
  monthly_contribution numeric not null default 0 check (monthly_contribution >= 0),
  target_date          date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists financial_goals_user_idx on financial_goals (user_id);

alter table financial_goals enable row level security;

create policy "financial_goals_select_own" on financial_goals
  for select using (auth.uid() = user_id);
create policy "financial_goals_insert_own" on financial_goals
  for insert with check (auth.uid() = user_id);
create policy "financial_goals_update_own" on financial_goals
  for update using (auth.uid() = user_id);
create policy "financial_goals_delete_own" on financial_goals
  for delete using (auth.uid() = user_id);

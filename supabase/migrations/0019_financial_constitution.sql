-- Ledger — Wealth OS blueprint §7.5: Financial Constitution v1.
-- The user sets their own numeric rules; Ledger measures actuals against
-- them (never the other way round). One editable row per user, mirroring
-- credit_profile's shape/policies (0010_credit_profile_and_goals.sql).
-- Run once in the Supabase SQL Editor after 0001-0018.

create table if not exists financial_constitution (
  user_id                       uuid primary key references profiles (id) on delete cascade,
  savings_rate_target_pct       numeric check (savings_rate_target_pct >= 0),
  cash_buffer_target            numeric check (cash_buffer_target >= 0),
  discretionary_monthly_target  numeric check (discretionary_monthly_target >= 0),
  priorities                    text not null default '',
  updated_at                    timestamptz not null default now()
);

alter table financial_constitution enable row level security;

create policy "financial_constitution_select_own" on financial_constitution
  for select using (auth.uid() = user_id);
create policy "financial_constitution_insert_own" on financial_constitution
  for insert with check (auth.uid() = user_id);
create policy "financial_constitution_update_own" on financial_constitution
  for update using (auth.uid() = user_id);

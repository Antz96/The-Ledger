-- Ledger — Phase 2: manual assets & liabilities (net worth foundation)
-- Run once in the Supabase SQL Editor after 0001-0003.

-- ── assets ──────────────────────────────────────────────────────────────────
create table if not exists assets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  category   text not null check (category in ('Cash', 'Investments', 'Pension', 'Property', 'Crypto', 'Other')),
  value      numeric not null check (value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_user_idx on assets (user_id);

alter table assets enable row level security;

create policy "assets_select_own" on assets
  for select using (auth.uid() = user_id);
create policy "assets_insert_own" on assets
  for insert with check (auth.uid() = user_id);
create policy "assets_update_own" on assets
  for update using (auth.uid() = user_id);
create policy "assets_delete_own" on assets
  for delete using (auth.uid() = user_id);

-- ── liabilities ─────────────────────────────────────────────────────────────
create table if not exists liabilities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  category   text not null check (category in ('Credit Card', 'Loan', 'Mortgage', 'Other')),
  balance    numeric not null check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists liabilities_user_idx on liabilities (user_id);

alter table liabilities enable row level security;

create policy "liabilities_select_own" on liabilities
  for select using (auth.uid() = user_id);
create policy "liabilities_insert_own" on liabilities
  for insert with check (auth.uid() = user_id);
create policy "liabilities_update_own" on liabilities
  for update using (auth.uid() = user_id);
create policy "liabilities_delete_own" on liabilities
  for delete using (auth.uid() = user_id);

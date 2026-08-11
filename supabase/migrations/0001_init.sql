-- The Ledger — Phase 1 schema + RLS
-- Run this once in the Supabase project's SQL Editor (or via `supabase db push`).

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- ── transactions ────────────────────────────────────────────────────────────
create table if not exists transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  date       date not null,
  type       text not null check (type in ('income', 'expense', 'savings')),
  category   text not null,
  amount     numeric not null check (amount > 0),
  note       text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on transactions (user_id, date);

alter table transactions enable row level security;

create policy "transactions_select_own" on transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on transactions
  for delete using (auth.uid() = user_id);

-- ── goals (one row per user) ───────────────────────────────────────────────
create table if not exists goals (
  user_id       uuid primary key references profiles (id) on delete cascade,
  target_amount numeric not null default 5000 check (target_amount > 0),
  updated_at    timestamptz not null default now()
);

alter table goals enable row level security;

create policy "goals_select_own" on goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on goals
  for update using (auth.uid() = user_id);

-- ── allocations (one row per user) ─────────────────────────────────────────
create table if not exists allocations (
  user_id        uuid primary key references profiles (id) on delete cascade,
  monthly_amount numeric not null default 500 check (monthly_amount >= 0),
  low_pct        int not null default 60 check (low_pct between 0 and 100),
  medium_pct     int not null default 30 check (medium_pct between 0 and 100),
  high_pct       int not null default 10 check (high_pct between 0 and 100),
  updated_at     timestamptz not null default now()
);

alter table allocations enable row level security;

create policy "allocations_select_own" on allocations
  for select using (auth.uid() = user_id);
create policy "allocations_insert_own" on allocations
  for insert with check (auth.uid() = user_id);
create policy "allocations_update_own" on allocations
  for update using (auth.uid() = user_id);

-- ── auto-provision profile + defaults on signup ────────────────────────────
-- Runs as the table owner (bypasses RLS), so it can insert rows for a
-- brand-new user before any client-side call is possible.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into goals (user_id) values (new.id);
  insert into allocations (user_id) values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

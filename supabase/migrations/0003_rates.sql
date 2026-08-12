-- The Ledger — Phase 2: rates hub
-- Run once in the Supabase SQL Editor after 0001_init.sql and 0002_profile_currency.sql.

-- ── admin flag ──────────────────────────────────────────────────────────────
alter table profiles add column if not exists is_admin boolean not null default false;

-- ── savings_rates ───────────────────────────────────────────────────────────
-- Public, read-only comparison data. Every row must carry a source_url and
-- last_updated date — never fabricate a rate, only enter what a bank has
-- actually published.
create table if not exists savings_rates (
  id            uuid primary key default gen_random_uuid(),
  bank          text not null,
  apy_pct       numeric(5, 2) not null check (apy_pct >= 0),
  minimum_note  text not null default '',
  note          text not null default '',
  source_url    text,
  last_updated  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table savings_rates enable row level security;

-- Anyone (including anon/not-signed-in) can read the rates table.
create policy "savings_rates_select_public" on savings_rates
  for select using (true);

-- Only profiles with is_admin = true can add/edit/remove rows. The subquery
-- reads the caller's own profiles row, which their own RLS policy already
-- permits (auth.uid() = id), so this doesn't need a security-definer bypass.
create policy "savings_rates_insert_admin" on savings_rates
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "savings_rates_update_admin" on savings_rates
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "savings_rates_delete_admin" on savings_rates
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ── grant yourself admin (run manually, once) ──────────────────────────────
-- update profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');

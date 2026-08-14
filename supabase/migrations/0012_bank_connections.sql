-- Ledger — Bank connections (Enable Banking open banking integration)
-- Run once in the Supabase SQL Editor after 0001-0011.
--
-- Deliberately stores only connection/account metadata, never transactions —
-- transaction data is fetched live from Enable Banking on each view rather
-- than cached, to minimise how much financial data this app retains.

-- ── bank_connections ────────────────────────────────────────────────────────
-- One row per bank the user has linked. state_token correlates the callback
-- redirect (an unauthenticated request from the bank, not the app) back to
-- the user who started the connection.
create table if not exists bank_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  aspsp_name    text not null,
  aspsp_country text not null,
  session_id    uuid,
  status        text not null default 'pending' check (status in ('pending', 'active', 'revoked', 'error')),
  valid_until   timestamptz,
  error_message text,
  state_token   uuid not null default gen_random_uuid(),
  created_at    timestamptz not null default now()
);

create unique index if not exists bank_connections_state_idx on bank_connections (state_token);
create index if not exists bank_connections_user_idx on bank_connections (user_id);

alter table bank_connections enable row level security;

create policy "bank_connections_select_own" on bank_connections
  for select using (auth.uid() = user_id);
create policy "bank_connections_insert_own" on bank_connections
  for insert with check (auth.uid() = user_id);
create policy "bank_connections_update_own" on bank_connections
  for update using (auth.uid() = user_id);
create policy "bank_connections_delete_own" on bank_connections
  for delete using (auth.uid() = user_id);

-- ── bank_accounts ────────────────────────────────────────────────────────
-- One row per account within a connection (a single bank link can expose
-- several accounts — current account, savings, etc).
create table if not exists bank_accounts (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references bank_connections (id) on delete cascade,
  user_id       uuid not null references profiles (id) on delete cascade,
  account_uid   text not null,
  name          text,
  iban          text,
  currency      text,
  created_at    timestamptz not null default now()
);

create index if not exists bank_accounts_user_idx on bank_accounts (user_id);
create index if not exists bank_accounts_connection_idx on bank_accounts (connection_id);

alter table bank_accounts enable row level security;

create policy "bank_accounts_select_own" on bank_accounts
  for select using (auth.uid() = user_id);
create policy "bank_accounts_insert_own" on bank_accounts
  for insert with check (auth.uid() = user_id);
create policy "bank_accounts_delete_own" on bank_accounts
  for delete using (auth.uid() = user_id);

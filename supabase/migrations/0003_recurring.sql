-- The Ledger — recurring commitments (direct debits, salary, etc.)

create table if not exists recurring_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('income', 'expense')),
  category   text not null,
  amount     numeric not null check (amount > 0),
  due_day    int not null check (due_day between 1 and 31),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists recurring_items_user_idx on recurring_items (user_id);
alter table recurring_items enable row level security;
create policy "recurring_items_select_own" on recurring_items
  for select using (auth.uid() = user_id);
create policy "recurring_items_insert_own" on recurring_items
  for insert with check (auth.uid() = user_id);
create policy "recurring_items_update_own" on recurring_items
  for update using (auth.uid() = user_id);
create policy "recurring_items_delete_own" on recurring_items
  for delete using (auth.uid() = user_id);

-- Link auto-logged ledger rows back to their source; deleting the source
-- keeps the history (recurring_id becomes null).
alter table transactions
  add column if not exists recurring_id uuid references recurring_items (id) on delete set null;

-- Idempotency ledger: one row per (item, month) that has been handled.
-- Deliberately survives deletion of the materialized transaction so a
-- user-deleted entry never re-materializes.
create table if not exists recurring_materializations (
  recurring_id uuid not null references recurring_items (id) on delete cascade,
  user_id      uuid not null references profiles (id) on delete cascade,
  month        text not null check (month ~ '^\d{4}-\d{2}$'),
  created_at   timestamptz not null default now(),
  primary key (recurring_id, month)
);
alter table recurring_materializations enable row level security;
create policy "recurring_mat_select_own" on recurring_materializations
  for select using (auth.uid() = user_id);
create policy "recurring_mat_insert_own" on recurring_materializations
  for insert with check (auth.uid() = user_id);
create policy "recurring_mat_delete_own" on recurring_materializations
  for delete using (auth.uid() = user_id);

-- Ledger — Credit Health, brick 1: action checklist progress
-- (blueprint section 26.2). Tracks which educational checklist items a user
-- has ticked off — no live credit report data, per section 26.4's explicit
-- instruction not to build live integrations into early V1.

create table if not exists credit_action_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  action_id    text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, action_id)
);

create index if not exists credit_action_progress_user_idx on credit_action_progress (user_id);

alter table credit_action_progress enable row level security;

create policy "credit_action_progress_select_own" on credit_action_progress
  for select using (auth.uid() = user_id);
create policy "credit_action_progress_insert_own" on credit_action_progress
  for insert with check (auth.uid() = user_id);
create policy "credit_action_progress_delete_own" on credit_action_progress
  for delete using (auth.uid() = user_id);

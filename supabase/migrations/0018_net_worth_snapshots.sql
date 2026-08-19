-- Wealth OS blueprint V1, step 4: net worth history (blueprint section 7.4,
-- 9.6). One row per user per day — mutations upsert into today's row, so
-- editing assets repeatedly in one day doesn't create duplicate history.

create table if not exists net_worth_snapshots (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles (id) on delete cascade,
  snapshot_date      date not null,
  total_assets       numeric not null,
  total_liabilities  numeric not null,
  net_worth          numeric not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create index if not exists net_worth_snapshots_user_idx on net_worth_snapshots (user_id, snapshot_date);

alter table net_worth_snapshots enable row level security;

create policy "net_worth_snapshots_select_own" on net_worth_snapshots
  for select using (auth.uid() = user_id);
create policy "net_worth_snapshots_insert_own" on net_worth_snapshots
  for insert with check (auth.uid() = user_id);
create policy "net_worth_snapshots_update_own" on net_worth_snapshots
  for update using (auth.uid() = user_id);

-- One-time backfill: give every existing account with assets or liabilities
-- an initial data point dated today, so the history chart isn't empty on
-- day one. Later snapshots are written by the app on each mutation/load.
insert into net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth)
select
  p.id,
  current_date,
  coalesce(a.total, 0),
  coalesce(l.total, 0),
  coalesce(a.total, 0) - coalesce(l.total, 0)
from profiles p
left join (select user_id, sum(value) as total from assets group by user_id) a on a.user_id = p.id
left join (select user_id, sum(balance) as total from liabilities group by user_id) l on l.user_id = p.id
where a.total is not null or l.total is not null
on conflict (user_id, snapshot_date) do nothing;

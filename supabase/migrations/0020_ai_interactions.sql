-- Ledger — Wealth OS blueprint §4.1.G: Audit and Evidence Layer.
-- One row per Assistant turn: what the user asked, how it was classified,
-- which tools ran, what was said back, and whether the Compliance
-- Classification Engine (§4.1.E, src/lib/aiCompliance.js) blocked it. No
-- update/delete policies — an audit trail that users (or the app itself)
-- can edit after the fact isn't an audit trail.
-- Run once in the Supabase SQL Editor after 0001-0019.

create table if not exists ai_interactions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles (id) on delete cascade,
  user_message   text not null,
  classification text not null check (
    classification in ('FACT', 'CALCULATION', 'EDUCATION', 'DECISION_SUPPORT', 'REGULATED_RISK', 'EXECUTION')
  ),
  tools_used     text[] not null default '{}',
  reply          text not null,
  blocked        boolean not null default false,
  model          text not null,
  created_at     timestamptz not null default now()
);

create index if not exists ai_interactions_user_idx on ai_interactions (user_id, created_at desc);

alter table ai_interactions enable row level security;

create policy "ai_interactions_select_own" on ai_interactions
  for select using (auth.uid() = user_id);
create policy "ai_interactions_insert_own" on ai_interactions
  for insert with check (auth.uid() = user_id);

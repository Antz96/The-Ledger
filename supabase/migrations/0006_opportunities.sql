-- Ledger — Phase 6: opportunity database (curated products per Explorer category)
-- Run once in the Supabase SQL Editor after 0001-0005.

create table if not exists opportunities (
  id           uuid primary key default gen_random_uuid(),
  category_id  text not null check (category_id in (
                 'cash-protection', 'lower-risk-growth-income', 'long-term-investing',
                 'higher-risk', 'very-high-speculative'
               )),
  name         text not null,
  description  text not null default '',
  risk_level   text not null check (risk_level in ('Low', 'Medium', 'High')),
  source_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists opportunities_category_idx on opportunities (category_id);

alter table opportunities enable row level security;

-- Public, read-only — same posture as savings_rates: anyone (including
-- signed-out) can browse the curated list.
create policy "opportunities_select_public" on opportunities
  for select using (true);

create policy "opportunities_insert_admin" on opportunities
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "opportunities_update_admin" on opportunities
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "opportunities_delete_admin" on opportunities
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );

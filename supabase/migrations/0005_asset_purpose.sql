-- Ledger — Phase 4: "what job is this money doing" tag, for the Wealth Map.
-- Run once in the Supabase SQL Editor after 0001-0004.

alter table assets
  add column if not exists purpose text not null default 'Growth'
  check (purpose in ('Safety', 'Growth', 'Income', 'Speculation'));

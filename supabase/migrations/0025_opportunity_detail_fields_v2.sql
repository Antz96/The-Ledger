-- Ledger — closes the remaining Standard Opportunity Card gaps from
-- blueprint section 9, plus the Knowledge and Product Type filter
-- dimensions from section 10 (Explorer currently filters by risk, purpose,
-- liquidity, and time horizon, but not these two).
-- Run once in the Supabase SQL Editor after 0001-0024.

alter table opportunities
  add column if not exists minimum_investment text not null default '',
  add column if not exists return_characteristics text not null default '',
  add column if not exists capital_at_risk boolean,
  add column if not exists protection_status text not null default '',
  add column if not exists who_uses_it text not null default '',
  add column if not exists example_providers text not null default '',
  add column if not exists educational_resources text not null default '',
  add column if not exists knowledge_level text check (knowledge_level in ('Beginner', 'Intermediate', 'Advanced')),
  add column if not exists product_type text check (product_type in (
    'Cash', 'Savings', 'Bonds', 'Funds', 'ETFs', 'Equities',
    'Property-related', 'Pension', 'Alternative assets', 'Crypto', 'Other'
  ));

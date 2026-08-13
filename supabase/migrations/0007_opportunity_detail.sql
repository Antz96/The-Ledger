-- Ledger — Phase 7: full opportunity detail fields (blueprint section 9 /
-- section 15 Page 6). All nullable/defaulted so existing rows stay valid —
-- admins fill these in over time from the detail page, not the quick-add form.
alter table opportunities
  add column if not exists typical_purpose text check (typical_purpose in ('Safety', 'Growth', 'Income', 'Speculation')),
  add column if not exists liquidity text check (liquidity in ('Immediate', 'Months', 'Years', '10+ Years')),
  add column if not exists time_horizon text check (time_horizon in ('Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years')),
  add column if not exists how_it_works text not null default '',
  add column if not exists fees text not null default '',
  add column if not exists tax_considerations text not null default '',
  add column if not exists pros text not null default '',
  add column if not exists cons text not null default '',
  add column if not exists key_risks text not null default '',
  add column if not exists common_access_routes text not null default '';

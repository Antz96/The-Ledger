-- The Ledger — Rates hub: account types + access terms
-- Run once in the Supabase SQL Editor after 0001-0012.
--
-- Existing rows default to 'Easy Access' and an empty access_note; re-tag
-- them from the Rates admin form as needed.

alter table savings_rates
  add column if not exists account_type text not null default 'Easy Access'
  check (account_type in ('Easy Access', 'Regular Saver', 'Notice', 'Fixed-Rate Bond', 'Cash ISA', 'Other'));

alter table savings_rates
  add column if not exists access_note text not null default '';

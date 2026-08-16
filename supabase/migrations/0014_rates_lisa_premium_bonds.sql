-- The Ledger — Rates hub: add Lifetime ISA and Premium Bonds account types
-- Run once in the Supabase SQL Editor after 0001-0013.

alter table savings_rates drop constraint if exists savings_rates_account_type_check;

alter table savings_rates add constraint savings_rates_account_type_check
  check (account_type in ('Easy Access', 'Regular Saver', 'Notice', 'Fixed-Rate Bond', 'Cash ISA', 'Lifetime ISA', 'Premium Bonds', 'Other'));

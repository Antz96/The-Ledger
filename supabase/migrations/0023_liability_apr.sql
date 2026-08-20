-- Ledger — optional APR on liabilities, needed for a real avalanche
-- calculation (which orders debts by interest rate rather than balance).
-- Nullable — existing debts default to 0% until the user sets a real rate.
-- Run once in the Supabase SQL Editor after 0001-0022.

alter table liabilities
  add column if not exists apr_pct numeric check (apr_pct is null or apr_pct >= 0);

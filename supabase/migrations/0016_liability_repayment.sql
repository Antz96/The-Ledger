-- The Ledger — debt payoff tracking on liabilities
-- Run once in the Supabase SQL Editor after 0001-0015.
--
-- monthly_repayment is what you're putting toward a debt each month (e.g. a
-- standing order). repayment_start_balance snapshots the balance at the
-- moment a repayment amount is first set, so progress can be measured
-- against it later. Both nullable — most liabilities won't use this.

alter table liabilities
  add column if not exists monthly_repayment numeric check (monthly_repayment is null or monthly_repayment >= 0),
  add column if not exists repayment_start_balance numeric check (repayment_start_balance is null or repayment_start_balance >= 0);

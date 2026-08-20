-- Ledger — backfill liquidity/time_horizon on the Phase 6 seed set, so the
-- Explorer's new Liquidity/Time Horizon filters (blueprint §10, §15 Page 5)
-- have real data to filter against. Liquidity reflects whether the money can
-- be accessed now (most of these can be sold or withdrawn any time, even if
-- their value fluctuates); time_horizon is the separate, more judgment-based
-- question of how long you'd typically want to hold it for, per §9's
-- "typical time horizon".
-- Run once in the Supabase SQL Editor after 0001-0021.

update opportunities set liquidity = 'Immediate', time_horizon = 'Less than 1 year' where name = 'Easy-access savings';
update opportunities set liquidity = 'Immediate', time_horizon = 'Less than 1 year' where name = 'Cash ISA';
update opportunities set liquidity = 'Years', time_horizon = '1-3 years' where name = 'Fixed savings';
update opportunities set liquidity = 'Immediate', time_horizon = 'Less than 1 year' where name = 'Premium Bonds';
update opportunities set liquidity = 'Immediate', time_horizon = 'Less than 1 year' where name = 'Money market fund';
update opportunities set liquidity = 'Years', time_horizon = '5-10 years' where name = 'Government bonds';
update opportunities set liquidity = 'Immediate', time_horizon = '10+ years' where name = 'Global index fund';
update opportunities set liquidity = 'Immediate', time_horizon = '10+ years' where name = 'Broad-market ETF';
update opportunities set liquidity = 'Immediate', time_horizon = '10+ years' where name = 'S&P 500 ETF';
update opportunities set liquidity = 'Immediate', time_horizon = '5-10 years' where name = 'REIT';
update opportunities set liquidity = 'Immediate', time_horizon = '3-5 years' where name = 'Individual equities';
update opportunities set liquidity = 'Immediate', time_horizon = 'Less than 1 year' where name = 'Crypto';

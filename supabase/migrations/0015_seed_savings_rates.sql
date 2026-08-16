-- The Ledger — seed Rates with real current UK best-buy accounts
-- Run once in the Supabase SQL Editor after 0001-0014.
--
-- Removes the placeholder US demo row and replaces it with real accounts
-- pulled from MoneySavingExpert's live best-buy tables (checked 2026-08-16).
-- Every source_url points at the specific MSE guide the figures came from —
-- re-verify against the provider's own site before relying on any rate here,
-- since these move often.

delete from savings_rates where bank = 'Ally Bank Savings';

insert into savings_rates (bank, account_type, apy_pct, access_note, minimum_note, note, source_url, last_updated) values
('Spring', 'Easy Access', 5.00, 'Withdraw anytime', '', '', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),
('Cahoot', 'Easy Access', 5.00, 'Withdraw anytime', '', '', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),
('Cynergy Bank', 'Easy Access', 4.55, 'Withdraw anytime', '', '', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),

('Secure Trust Bank', 'Notice', 4.21, '90 days'' notice', '£1 / £1m', 'Interest paid quarterly', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/#fixedsavings', '2026-08-16'),
('Castle Trust Bank', 'Notice', 4.20, '120 days'' notice', '£1,000 / £500,000', 'Interest paid annually', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/#fixedsavings', '2026-08-16'),

('MBNA', 'Fixed-Rate Bond', 4.85, '1 year fixed', '£1,000 / £750,000', 'Interest paid at maturity', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),
('Market Harborough Building Society', 'Fixed-Rate Bond', 4.90, '2 years fixed', '£5,000 / £500,000', 'Interest paid monthly, annually, or at maturity', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),
('Investec', 'Fixed-Rate Bond', 5.00, '3 years fixed', '£5,000 / £250,000', 'Interest paid annually, away from the account', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),
('Market Harborough Building Society', 'Fixed-Rate Bond', 5.00, '5 years fixed', '£5,000 / £500,000', 'Interest paid monthly, annually, or at maturity', 'https://www.moneysavingexpert.com/savings/savings-accounts-best-interest/', '2026-08-16'),

('Lloyds Bank / Bank of Scotland', 'Regular Saver', 8.00, '1 year fixed, max £250/month', '', 'Requires an existing current account with them', 'https://www.moneysavingexpert.com/savings/best-regular-savings-accounts/', '2026-08-16'),
('First Direct', 'Regular Saver', 7.00, '1 year fixed, max £300/month', '', 'Early closure drops the rate to 1.75%', 'https://www.moneysavingexpert.com/savings/best-regular-savings-accounts/', '2026-08-16'),
('Skipton Building Society', 'Regular Saver', 5.25, '12 months variable, max £200/month', '', 'No existing account required; tracks 1.5% above the Bank of England base rate', 'https://www.moneysavingexpert.com/savings/best-regular-savings-accounts/', '2026-08-16'),

('Trading 212', 'Cash ISA', 4.56, 'Easy access', '£1', 'New customers only; flexible ISA', 'https://www.moneysavingexpert.com/savings/best-cash-isa/', '2026-08-16'),
('Coventry Building Society', 'Cash ISA', 4.25, 'Easy access, account lasts 1 year', '', 'Rate is variable; withdrawal limits apply', 'https://www.moneysavingexpert.com/savings/best-cash-isa/', '2026-08-16'),

('Moneybox', 'Lifetime ISA', 4.25, 'Withdraw penalty-free for a first home, or from age 60', '£1', 'Government adds a 25% bonus on contributions, up to £1,000/yr', 'https://www.moneysavingexpert.com/savings/lifetime-isas/', '2026-08-16'),
('Plum', 'Lifetime ISA', 4.20, 'Withdraw penalty-free for a first home, or from age 60', '£1', 'Government adds a 25% bonus on contributions, up to £1,000/yr', 'https://www.moneysavingexpert.com/savings/lifetime-isas/', '2026-08-16'),
('Tembo', 'Lifetime ISA', 4.00, 'Withdraw penalty-free for a first home, or from age 60', '£1', 'Government adds a 25% bonus on contributions, up to £1,000/yr', 'https://www.moneysavingexpert.com/savings/lifetime-isas/', '2026-08-16'),

('NS&I', 'Premium Bonds', 3.80, 'Withdraw anytime', '£25', 'Prize draw, not a guaranteed return — this is the average annual prize fund rate', 'https://www.moneysavingexpert.com/savings/premium-bonds/', '2026-08-16');

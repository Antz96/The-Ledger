-- Ledger — the Rates tab's "Open" link was pointing every row at
-- MoneySavingExpert's general best-buy comparison guide instead of the
-- specific provider's own account page, so clicking "Open" on any row
-- landed on a generic third-party article rather than somewhere you could
-- actually open that account. Points every row at the provider's own
-- official site instead — its dedicated product page where one exists and
-- was findable, otherwise its savings section.
-- Verified 2026-08-21. Re-check before relying on these — providers
-- restructure pages and archive specific fixed-bond issues over time.
-- Run once in the Supabase SQL Editor after 0001-0026.

update savings_rates set source_url = 'https://www.spring-savings.co.uk/'
where bank = 'Spring';

update savings_rates set source_url = 'https://www.cahoot.com/'
where bank = 'Cahoot';

update savings_rates set source_url = 'https://www.cynergybank.co.uk/personal/online-easy-access-account'
where bank = 'Cynergy Bank';

update savings_rates set source_url = 'https://www.securetrustbank.com/savings/notice-accounts'
where bank = 'Secure Trust Bank';

update savings_rates set source_url = 'https://www.castletrust.co.uk/category/savings/'
where bank = 'Castle Trust Bank';

update savings_rates set source_url = 'https://www.mbna.co.uk/savings/fixed-saver.html'
where bank = 'MBNA';

-- Both fixed-term-bond rows — points at the accounts overview rather than a
-- specific numbered bond, since Market Harborough archives and replaces
-- individual bond issues often.
update savings_rates set source_url = 'https://mhbs.co.uk/savings/fixed-term-bond-accounts/'
where bank = 'Market Harborough Building Society';

update savings_rates set source_url = 'https://savings.investec.com/'
where bank = 'Investec';

update savings_rates set source_url = 'https://www.lloydsbank.com/savings/monthly-saver.html'
where bank = 'Lloyds Bank / Bank of Scotland';

update savings_rates set source_url = 'https://www.firstdirect.com/savings/products/regular-saver/'
where bank = 'First Direct';

update savings_rates set source_url = 'https://www.skipton.co.uk/savings/regular-saver-accounts/regular-saver'
where bank = 'Skipton Building Society';

update savings_rates set source_url = 'https://www.trading212.com/trading-instruments/isa'
where bank = 'Trading 212';

update savings_rates set source_url = 'https://www.coventrybuildingsociety.co.uk/member/savings/cash-isas.html'
where bank = 'Coventry Building Society';

update savings_rates set source_url = 'https://www.moneyboxapp.com/isa/lifetime'
where bank = 'Moneybox';

update savings_rates set source_url = 'https://withplum.com/lifetime-isa'
where bank = 'Plum';

update savings_rates set source_url = 'https://www.tembomoney.com/savings/cash-lifetime-isa'
where bank = 'Tembo';

update savings_rates set source_url = 'https://www.nsandi.com/products/premium-bonds'
where bank = 'NS&I';

-- Ledger — Phase 6: seed the Opportunity Database with the blueprint's
-- suggested V1 starter set (§22). typical_purpose is set per §6's own
-- Safety/Growth/Income/Speculation examples, so these line up with the
-- Wealth Map. source_url deliberately left blank — admins add verified
-- sources from the detail page later, same convention 0007 established for
-- the other detail fields.
-- Run once in the Supabase SQL Editor after 0001-0020.

insert into opportunities (category_id, name, description, risk_level, typical_purpose) values
('cash-protection', 'Easy-access savings', 'A savings account you can pay into and withdraw from at any time, with no notice or penalty.', 'Low', 'Safety'),
('cash-protection', 'Cash ISA', 'A savings account where the interest you earn is tax-free, up to an annual allowance.', 'Low', 'Safety'),
('cash-protection', 'Fixed savings', 'Locks your money away for a set term for a fixed rate — usually higher than easy access, but early withdrawal costs you.', 'Low', 'Safety'),
('cash-protection', 'Premium Bonds', 'Instead of interest, your money is entered into a monthly prize draw — you could win nothing or a lump sum, and your original amount is protected.', 'Low', 'Safety'),
('lower-risk-growth-income', 'Money market fund', 'A fund holding very short-term, high-quality debt — aims to stay stable while paying a bit more than cash.', 'Low', 'Safety'),
('lower-risk-growth-income', 'Government bonds', 'A loan to a government in exchange for regular interest payments and your money back at a set date.', 'Low', 'Income'),
('long-term-investing', 'Global index fund', 'Tracks a broad mix of companies worldwide, so your money is spread across thousands of businesses rather than one.', 'Medium', 'Growth'),
('long-term-investing', 'Broad-market ETF', 'Like an index fund but traded like a share throughout the day — tracks a wide slice of the market in one purchase.', 'Medium', 'Growth'),
('long-term-investing', 'S&P 500 ETF', 'Tracks the 500 largest companies listed in the US in a single purchase.', 'Medium', 'Growth'),
('long-term-investing', 'REIT', 'A company that owns and manages income-producing property — buying shares gives you exposure to real estate without buying a building.', 'Medium', 'Income'),
('higher-risk', 'Individual equities', 'Buying shares in a single company — your return depends entirely on how that one business performs.', 'Medium', 'Growth'),
('higher-risk', 'Crypto', 'Digital assets traded on decentralised networks — highly volatile, and not backed by a government or central bank.', 'High', 'Speculation');

-- Ledger — backfills the fields added in 0025 for the 12 opportunities
-- seeded in 0021, so the new Opportunity Card sections and Explorer filters
-- have real content rather than empty state for every curated item.
-- General, structural facts (protection scheme, typical minimums, who
-- tends to use each product) — not live figures, so nothing here goes
-- stale the way a rate would. Run once in the Supabase SQL Editor after
-- 0001-0025.

update opportunities set
  minimum_investment = 'Often £1, though some accounts require a higher opening balance',
  return_characteristics = 'Variable interest on the balance — the rate can rise or fall, typically tracking the Bank of England base rate',
  capital_at_risk = false,
  protection_status = 'FSCS protected up to £85,000 per person, per authorised bank or building society',
  who_uses_it = 'Anyone wanting quick access to cash without locking it away — commonly used for emergency funds',
  example_providers = 'High-street banks, building societies, and online-only banks',
  educational_resources = 'MoneyHelper''s guide to savings accounts',
  knowledge_level = 'Beginner',
  product_type = 'Savings'
where name = 'Easy-access savings';

update opportunities set
  minimum_investment = 'Often £1 — total contributions across all your ISAs in a tax year are capped by the annual ISA allowance',
  return_characteristics = 'Variable or fixed interest depending on the type — interest earned is tax-free',
  capital_at_risk = false,
  protection_status = 'FSCS protected up to £85,000 per person, per authorised bank or building society',
  who_uses_it = 'Savers who want their interest to be tax-free and have ISA allowance remaining for the tax year',
  example_providers = 'High-street banks, building societies, and online-only banks',
  educational_resources = 'gov.uk''s guide to Individual Savings Accounts',
  knowledge_level = 'Beginner',
  product_type = 'Savings'
where name = 'Cash ISA';

update opportunities set
  minimum_investment = 'Typically £500–£5,000, varies by provider',
  return_characteristics = 'A fixed interest rate for the agreed term — usually higher than easy access, but the rate won''t rise if the base rate does, and money is locked away for the term',
  capital_at_risk = false,
  protection_status = 'FSCS protected up to £85,000 per person, per authorised bank or building society',
  who_uses_it = 'Savers who don''t need the money for a set period and want a locked-in rate',
  example_providers = 'High-street banks, building societies, and online-only banks',
  educational_resources = 'MoneyHelper''s guide to fixed-rate savings',
  knowledge_level = 'Beginner',
  product_type = 'Savings'
where name = 'Fixed savings';

update opportunities set
  minimum_investment = '£25',
  return_characteristics = 'No interest — each £1 bond is entered into a monthly prize draw. The advertised rate is the average annual prize fund rate, not a guaranteed return, and many bonds win nothing in a given month',
  capital_at_risk = false,
  protection_status = 'Backed by NS&I, which is backed by HM Treasury — not covered by the standard FSCS £85,000 limit, but with its own government backing and no upper limit',
  who_uses_it = 'Savers who want their original money protected but are comfortable with a variable, prize-draw-based return instead of guaranteed interest',
  example_providers = 'NS&I (National Savings & Investments) only',
  educational_resources = 'NS&I''s Premium Bonds prize draw explainer',
  knowledge_level = 'Beginner',
  product_type = 'Savings'
where name = 'Premium Bonds';

update opportunities set
  minimum_investment = 'Varies by platform, often £1–£100 via an investment platform',
  return_characteristics = 'Aims to track short-term interest rates — historically more stable than bond or equity funds, but the return is not guaranteed',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — this is an investment, not a deposit, though FSCS may cover losses from platform failure in some circumstances',
  who_uses_it = 'People wanting a cash-like return with slightly more yield than a savings account, typically via a general investment account or ISA',
  example_providers = 'Available through investment platforms such as Hargreaves Lansdown, AJ Bell, and Vanguard',
  educational_resources = 'FCA''s guide to fund types',
  knowledge_level = 'Intermediate',
  product_type = 'Funds'
where name = 'Money market fund';

update opportunities set
  minimum_investment = 'Varies — individual gilts can be bought via platforms from the price of one unit; bond funds often have low minimums',
  return_characteristics = 'A fixed income (coupon) plus return of face value at maturity if held to term — the market price can rise or fall before then if sold early',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise if sold before maturity',
  who_uses_it = 'Investors seeking a predictable income stream and typically lower volatility than shares',
  example_providers = 'UK gilts via the Debt Management Office or investment platforms; bond funds via platforms such as Vanguard and Hargreaves Lansdown',
  educational_resources = 'UK Debt Management Office''s guide to gilts',
  knowledge_level = 'Intermediate',
  product_type = 'Bonds'
where name = 'Government bonds';

update opportunities set
  minimum_investment = 'Often £25–£100/month or a low lump sum via an investment platform',
  return_characteristics = 'Historically grows over the long term in line with global stock markets — value moves up and down along the way, including periods of loss',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise',
  who_uses_it = 'Long-term investors wanting broad, diversified exposure without picking individual companies',
  example_providers = 'Available through investment platforms such as Vanguard, Hargreaves Lansdown, and AJ Bell',
  educational_resources = 'MoneyHelper''s guide to funds and diversification',
  knowledge_level = 'Beginner',
  product_type = 'Funds'
where name = 'Global index fund';

update opportunities set
  minimum_investment = 'The price of one share/unit, often £10–£100',
  return_characteristics = 'Tracks the performance of a market index — value moves up and down with the underlying market',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise',
  who_uses_it = 'Investors wanting index-like diversification with the flexibility to trade during market hours',
  example_providers = 'Traded through investment platforms such as Hargreaves Lansdown, AJ Bell, and Trading 212',
  educational_resources = 'MoneyHelper''s guide to ETFs',
  knowledge_level = 'Intermediate',
  product_type = 'ETFs'
where name = 'Broad-market ETF';

update opportunities set
  minimum_investment = 'The price of one share/unit, often £10–£100',
  return_characteristics = 'Tracks the 500 largest US-listed companies — historically grown over the long term, but concentrated in one market and currency',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise, and GBP/USD currency movements add another factor',
  who_uses_it = 'Investors wanting exposure to large US companies in a single purchase',
  example_providers = 'Traded through investment platforms such as Hargreaves Lansdown, AJ Bell, and Trading 212',
  educational_resources = 'MoneyHelper''s guide to ETFs',
  knowledge_level = 'Beginner',
  product_type = 'ETFs'
where name = 'S&P 500 ETF';

update opportunities set
  minimum_investment = 'The price of one share, often £5–£50',
  return_characteristics = 'Aims to generate income from property rents, often paid out as dividends, plus potential share price growth — both can fall as well as rise',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise',
  who_uses_it = 'Investors wanting property exposure without buying a building directly',
  example_providers = 'Traded through investment platforms such as Hargreaves Lansdown and AJ Bell',
  educational_resources = 'MoneyHelper''s guide to property investment',
  knowledge_level = 'Intermediate',
  product_type = 'Property-related'
where name = 'REIT';

update opportunities set
  minimum_investment = 'The price of one share, which varies widely by company',
  return_characteristics = 'Return depends entirely on how that one company performs — can range from significant growth to total loss',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS savings protection — value can fall as well as rise, including to zero',
  who_uses_it = 'Investors comfortable researching individual companies and accepting concentration risk in exchange for the potential for higher — or lower — returns than a diversified fund',
  example_providers = 'Traded through investment platforms such as Hargreaves Lansdown, AJ Bell, and Trading 212',
  educational_resources = 'FCA''s guide to investing in shares',
  knowledge_level = 'Advanced',
  product_type = 'Equities'
where name = 'Individual equities';

update opportunities set
  minimum_investment = 'Often no minimum, or as little as £1–£10 on some exchanges',
  return_characteristics = 'Highly volatile — value can rise or fall sharply over short periods, with no underlying income or asset backing it',
  capital_at_risk = true,
  protection_status = 'Not covered by FSCS or any equivalent UK protection scheme — the FCA has specifically warned that consumers should be prepared to lose all the money invested',
  who_uses_it = 'People comfortable with high volatility and the possibility of losing their entire investment',
  example_providers = 'FCA-registered UK crypto exchanges — check the FCA register before using any platform',
  educational_resources = 'FCA''s consumer warnings on crypto investments',
  knowledge_level = 'Advanced',
  product_type = 'Crypto'
where name = 'Crypto';

-- The Ledger — more specific payment-history options on credit_profile
-- Run once in the Supabase SQL Editor after 0001-0016.
--
-- "Some missed payments" didn't distinguish how recent they were, which
-- matters a lot (UK credit files generally keep missed-payment records for
-- around 6 years). Existing rows with the old value fall back to a sensible
-- new one rather than becoming invalid.

update credit_profile set payment_history_status = 'Not sure'
  where payment_history_status = 'Some missed payments';

alter table credit_profile drop constraint if exists credit_profile_payment_history_status_check;

alter table credit_profile add constraint credit_profile_payment_history_status_check
  check (payment_history_status in (
    'All on time',
    'Missed payments in the last 6 months',
    'Missed payments 6 months to 2 years ago',
    'Missed payments 2 to 6 years ago',
    'Missed payments over 6 years ago',
    'Not sure'
  ));

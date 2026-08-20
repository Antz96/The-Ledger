-- Ledger — regulatory red-team pass (FCA checklist §5.2 UI red-team test:
-- "default allocation that looks like Ledger's recommendation"). The
-- allocations table previously defaulted every new sign-up to a 60/30/10
-- low/medium/high split via the handle_new_user() trigger's bare
-- `insert into allocations (user_id) values (new.id)`. A specific non-zero
-- split shown before the user has chosen anything reads as Ledger's own
-- suggested allocation, not a neutral starting point.
--
-- New sign-ups should start at 0/0/0 and choose their own split. Existing
-- rows are deliberately left untouched — 60/30/10 may already be a real
-- user's own considered choice rather than just the unedited default, and
-- there's no way to tell the two apart from the stored value alone, so this
-- only changes the default for accounts created from here on.
-- Run once in the Supabase SQL Editor after 0001-0023.

alter table allocations alter column low_pct set default 0;
alter table allocations alter column medium_pct set default 0;
alter table allocations alter column high_pct set default 0;

-- Per-user display currency. GBP is the app default.
alter table profiles
  add column if not exists currency text not null default 'GBP';

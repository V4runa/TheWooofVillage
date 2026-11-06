-- ============================================================================
-- Optional color preference on waitlist requests.
-- Additive. Does not rewrite existing rows, does not change waitlist_enabled,
-- and does not need the original 20261106_waitlist.sql to be run again.
-- Existing requests keep a null color until a buyer sends one.
-- ============================================================================

alter table public.waitlist_entries
  add column if not exists color_preference text;

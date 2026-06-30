-- ============================================================================
-- Migration: replace dogs.age_weeks with dogs.date_of_birth
-- Run this ONCE on the existing project (Supabase Dashboard -> SQL Editor)
-- BEFORE deploying the matching app code. The app's column selects reference
-- date_of_birth, so the column must exist first.
-- ============================================================================

-- 1) Add the new date-of-birth column (safe / non-destructive).
alter table public.dogs
  add column if not exists date_of_birth date;

-- 2) OPTIONAL rough backfill from the old age_weeks value so existing puppies
--    aren't blank until they're re-entered. This is only an ESTIMATE
--    (today - age_weeks * 7 days); review/correct in the admin afterwards.
--    Uncomment to use.
-- update public.dogs
--   set date_of_birth = (current_date - (age_weeks * 7))
--   where date_of_birth is null and age_weeks is not null;

-- 3) Once you've confirmed the app is working on date_of_birth and any backfill
--    looks right, you can drop the legacy column. Left commented so the old
--    data is preserved until you're ready.
-- alter table public.dogs drop column if exists age_weeks;

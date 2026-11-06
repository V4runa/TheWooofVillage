-- ============================================================================
-- TheWooofVillage — Database schema
-- Reconstructed from the application code (types/, hooks/, app/api/).
-- Paste this whole file into the Supabase SQL Editor and run it once on a
-- fresh project.
--
-- Model summary:
--   * Public site reads via the anon/publishable key  -> RLS read policies below.
--   * All writes go through API routes using the service_role key, which
--     bypasses RLS. So only SELECT policies are needed for the public role.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- DOGS
-- ---------------------------------------------------------------------------
create table if not exists public.dogs (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  description          text,
  status               text not null default 'available'
                         check (status in ('available', 'reserved', 'sold')),
  deposit_amount_cents integer,
  price_amount_cents   integer,
  cover_image_url      text,
  breed                text,
  sex                  text,
  date_of_birth        date,
  color                text,
  ready_date           date,
  sort_order           integer default 0,
  slug                 text unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists dogs_status_idx     on public.dogs (status);
create index if not exists dogs_sort_order_idx on public.dogs (sort_order);

-- ---------------------------------------------------------------------------
-- DOG IMAGES
-- ---------------------------------------------------------------------------
create table if not exists public.dog_images (
  id           uuid primary key default gen_random_uuid(),
  dog_id       uuid not null references public.dogs (id) on delete cascade,
  url          text not null,
  alt          text,
  sort_order   integer default 0,
  storage_path text,
  created_at   timestamptz not null default now()
);

create index if not exists dog_images_dog_id_idx on public.dog_images (dog_id);

-- ---------------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  status          text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  author_name     text not null,
  author_location text,
  rating          integer check (rating between 1 and 5),
  message         text not null,
  dog_id          uuid references public.dogs (id) on delete set null
);

create index if not exists testimonials_status_idx     on public.testimonials (status);
create index if not exists testimonials_created_at_idx on public.testimonials (created_at desc);

-- ---------------------------------------------------------------------------
-- TESTIMONIAL IMAGES
-- ---------------------------------------------------------------------------
create table if not exists public.testimonial_images (
  id              uuid primary key default gen_random_uuid(),
  testimonial_id  uuid not null references public.testimonials (id) on delete cascade,
  url             text not null,
  alt             text,
  sort_order      integer default 0,
  created_at      timestamptz not null default now()
);

create index if not exists testimonial_images_testimonial_id_idx
  on public.testimonial_images (testimonial_id);

-- ---------------------------------------------------------------------------
-- RESERVATION REQUESTS
-- ---------------------------------------------------------------------------
create table if not exists public.reservation_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  dog_id         uuid not null references public.dogs (id) on delete cascade,
  buyer_name     text not null,
  buyer_phone    text not null,
  buyer_email    text,
  payment_method text not null,
  transaction_id text,
  note           text,
  status         text not null default 'new'
                   check (status in ('new', 'contacted', 'closed')),
  handled_at     timestamptz
);

create index if not exists reservation_requests_dog_id_idx     on public.reservation_requests (dog_id);
create index if not exists reservation_requests_status_idx     on public.reservation_requests (status);
create index if not exists reservation_requests_created_at_idx on public.reservation_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- MERCHANT PROFILE (single row, integer identity id)
-- ---------------------------------------------------------------------------
create table if not exists public.merchant_profile (
  id              bigint generated always as identity primary key,
  display_name    text,
  tagline         text,
  about           text,
  phone           text,
  instagram_url   text,
  facebook_url    text,
  tiktok_url      text,
  venmo_url       text,
  cashapp_url     text,
  paypal_url      text,
  zelle_recipient text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Seed an empty profile row so the admin "edit profile" screen has something to update.
insert into public.merchant_profile (display_name)
select 'TheWooofVillage'
where not exists (select 1 from public.merchant_profile);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Enable RLS everywhere; add public SELECT policies only where the public site
-- reads with the anon/publishable key. Writes use service_role (bypasses RLS).
-- ============================================================================
alter table public.dogs                 enable row level security;
alter table public.dog_images           enable row level security;
alter table public.testimonials         enable row level security;
alter table public.testimonial_images   enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.merchant_profile     enable row level security;

-- Public can read dogs + their images.
create policy "public read dogs"
  on public.dogs for select using (true);

create policy "public read dog_images"
  on public.dog_images for select using (true);

-- Public can read ONLY approved testimonials, plus their images.
create policy "public read approved testimonials"
  on public.testimonials for select using (status = 'approved');

create policy "public read testimonial_images"
  on public.testimonial_images for select using (true);

-- Public can read the merchant profile (contact + payment links).
create policy "public read merchant_profile"
  on public.merchant_profile for select using (true);

-- reservation_requests: intentionally NO public policy.
-- Only the service_role (admin API) can read/write it.

-- ============================================================================
-- STORAGE: public "dogs" bucket for dog photos.
-- Uploads/deletes happen via the service_role key (admin API), so the bucket
-- only needs to be public for reads. next/image is already configured to allow
-- /storage/v1/object/public/** from your Supabase host.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('dogs', 'dogs', true)
on conflict (id) do update set public = true;

-- ============================================================================
-- Waitlist deposits
-- Additive and non-destructive. Does not change existing puppy, reservation,
-- review, or profile rows except to fill new merchant_profile defaults.
--
-- Apply once in the Supabase SQL editor for the live project
-- (ref xibsyyeaawjbgdmrcezi) after a backup. This file is not applied by the
-- app deploy. Until it runs, waitlist saves cannot succeed; existing pages
-- keep working.
-- ============================================================================

alter table public.merchant_profile
  add column if not exists waitlist_enabled boolean not null default true;

alter table public.merchant_profile
  add column if not exists waitlist_deposit_amount_cents integer not null default 50000;

alter table public.merchant_profile
  add column if not exists waitlist_deposit_currency text not null default 'USD';

update public.merchant_profile
set
  waitlist_enabled = true,
  waitlist_deposit_amount_cents = coalesce(waitlist_deposit_amount_cents, 50000),
  waitlist_deposit_currency = coalesce(waitlist_deposit_currency, 'USD');

alter table public.merchant_profile
  drop constraint if exists merchant_profile_waitlist_amount_check;

alter table public.merchant_profile
  add constraint merchant_profile_waitlist_amount_check
  check (waitlist_deposit_amount_cents > 0 and waitlist_deposit_amount_cents <= 10000000);

alter table public.merchant_profile
  drop constraint if exists merchant_profile_waitlist_currency_check;

alter table public.merchant_profile
  add constraint merchant_profile_waitlist_currency_check
  check (waitlist_deposit_currency = 'USD');

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  buyer_name text not null,
  buyer_phone text not null,
  buyer_phone_digits text not null,
  buyer_email text not null,

  breed_preference text,
  sex_preference text,
  note text,

  amount_cents integer not null check (amount_cents > 0 and amount_cents <= 10000000),
  currency text not null default 'USD' check (currency = 'USD'),

  terms_version text not null,
  terms_accepted_at timestamptz not null,
  client_request_id uuid not null,

  payment_status text not null default 'unverified'
    check (payment_status in ('unverified', 'confirmed')),
  confirmed_amount_cents integer,
  payment_confirmed_at timestamptz,
  payment_mismatch boolean not null default false,
  mismatch_resolved_at timestamptz,
  mismatch_resolution_note text,

  handling_status text not null default 'open'
    check (handling_status in ('open', 'closed')),
  close_reason text
    check (close_reason is null or close_reason in ('buyer_cancel', 'business', 'assigned')),
  closed_at timestamptz,

  sort_position integer not null default 0,
  admin_note text,
  pass_count integer not null default 0,

  credit_status text not null default 'unused'
    check (credit_status in ('unused', 'applied')),
  assigned_dog_id uuid references public.dogs (id) on delete restrict,
  credit_applied_cents integer,
  credit_applied_at timestamptz,
  excess_resolution_note text,

  refund_status text not null default 'none'
    check (refund_status in ('none', 'approved', 'returned')),
  refund_amount_cents integer,
  refund_reason text,
  refund_reference text,
  refund_approved_at timestamptz,
  refund_returned_at timestamptz
);

create unique index if not exists waitlist_entries_client_request_id_key
  on public.waitlist_entries (client_request_id);

create unique index if not exists waitlist_one_open_phone
  on public.waitlist_entries (buyer_phone_digits)
  where handling_status = 'open';

create index if not exists waitlist_entries_open_order_idx
  on public.waitlist_entries (sort_position, created_at)
  where handling_status = 'open';

create index if not exists waitlist_entries_email_idx
  on public.waitlist_entries (buyer_email);

create table if not exists public.waitlist_events (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.waitlist_entries (id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null,
  note text,
  amount_cents integer
);

create index if not exists waitlist_events_entry_idx
  on public.waitlist_events (entry_id, created_at);

alter table public.waitlist_entries enable row level security;
alter table public.waitlist_events enable row level security;

-- No anon policies. Buyers and visitors cannot read the list.
-- The Next.js server uses the service role, which bypasses RLS.

create or replace function public.waitlist_assign_puppy(
  p_entry_id uuid,
  p_dog_id uuid,
  p_excess_note text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  entry public.waitlist_entries%rowtype;
  dog_price integer;
  dog_status text;
  dog_name text;
  credited integer;
  note text;
begin
  select * into entry
  from public.waitlist_entries
  where id = p_entry_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Entry not found.');
  end if;

  if entry.handling_status <> 'open' then
    return jsonb_build_object('ok', false, 'error', 'This entry is closed.');
  end if;

  if entry.payment_status <> 'confirmed' or entry.confirmed_amount_cents is null then
    return jsonb_build_object('ok', false, 'error', 'Confirm the payment before assigning a puppy.');
  end if;

  if entry.credit_status <> 'unused' or entry.assigned_dog_id is not null then
    return jsonb_build_object('ok', false, 'error', 'This deposit was already credited.');
  end if;

  if entry.payment_mismatch and entry.mismatch_resolved_at is null then
    return jsonb_build_object('ok', false, 'error', 'Resolve the payment mismatch before assigning.');
  end if;

  select price_amount_cents, status, name
  into dog_price, dog_status, dog_name
  from public.dogs
  where id = p_dog_id
  for update;

  if dog_status is null then
    return jsonb_build_object('ok', false, 'error', 'Choose a puppy that is still available.');
  end if;

  if dog_status <> 'available' then
    return jsonb_build_object('ok', false, 'error', 'Choose a puppy that is still available.');
  end if;

  credited := entry.confirmed_amount_cents;
  note := nullif(btrim(coalesce(p_excess_note, '')), '');

  if dog_price is not null and credited > dog_price and note is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'The confirmed deposit is higher than this puppy''s price. Record how you are handling the difference before assigning.'
    );
  end if;

  update public.dogs
  set status = 'reserved', updated_at = now()
  where id = p_dog_id and status = 'available';

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Choose a puppy that is still available.');
  end if;

  update public.waitlist_entries
  set
    credit_status = 'applied',
    assigned_dog_id = p_dog_id,
    credit_applied_cents = credited,
    credit_applied_at = now(),
    excess_resolution_note = note,
    handling_status = 'closed',
    close_reason = 'assigned',
    closed_at = now(),
    updated_at = now()
  where id = p_entry_id
    and credit_status = 'unused'
    and handling_status = 'open';

  if not found then
    raise exception 'waitlist assignment lost the race';
  end if;

  insert into public.waitlist_events (entry_id, kind, note, amount_cents)
  values (
    p_entry_id,
    'assigned',
    concat('Assigned ', coalesce(dog_name, 'puppy'), '. Credited ', credited, ' cents.'),
    credited
  );

  return jsonb_build_object('ok', true, 'credit_cents', credited, 'dog_status', 'reserved');
end;
$$;

revoke all on function public.waitlist_assign_puppy(uuid, uuid, text) from public;
revoke all on function public.waitlist_assign_puppy(uuid, uuid, text) from anon;
revoke all on function public.waitlist_assign_puppy(uuid, uuid, text) from authenticated;
grant execute on function public.waitlist_assign_puppy(uuid, uuid, text) to service_role;

-- Optional color preference. Safe to run after 20261106_waitlist.sql. Does not change waitlist_enabled.
-- ============================================================================
-- Optional color preference on waitlist requests.
-- Additive. Does not rewrite existing rows, does not change waitlist_enabled,
-- and does not need the original 20261106_waitlist.sql to be run again.
-- Existing requests keep a null color until a buyer sends one.
-- ============================================================================

alter table public.waitlist_entries
  add column if not exists color_preference text;

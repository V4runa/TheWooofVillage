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

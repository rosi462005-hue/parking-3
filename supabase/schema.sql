-- ==============================================
-- ParkShare — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ==============================================

-- ─── 1. PROFILES ───────────────────────────────
-- Extends the built-in auth.users table with a display name.
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  created_at  timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 2. LISTINGS ───────────────────────────────
create table if not exists public.listings (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  location        text not null,
  description     text,
  price_per_hour  numeric(10, 2) not null check (price_per_hour > 0),
  type            text not null default 'driveway'
                  check (type in ('driveway', 'garage', 'lot')),
  vehicle_type    text not null default 'both'
                  check (vehicle_type in ('2-wheeler', '4-wheeler', 'both')),
  lat             double precision,
  lng             double precision,
  available       boolean not null default true,
  image_url       text,
  owner_id        uuid references auth.users(id) on delete cascade,
  created_at      timestamptz default now()
);

-- Index for geo-filtering performance
create index if not exists listings_lat_lng_idx on public.listings (lat, lng);
create index if not exists listings_available_idx on public.listings (available);
create index if not exists listings_owner_idx on public.listings (owner_id);


-- ─── 3. BOOKINGS ───────────────────────────────
create table if not exists public.bookings (
  id              uuid default gen_random_uuid() primary key,
  listing_id      uuid references public.listings(id) on delete cascade,
  renter_id       uuid references auth.users(id) on delete cascade,
  start_time      text not null,
  duration_hours  numeric(5, 2) not null check (duration_hours > 0),
  vehicle_type    text not null check (vehicle_type in ('2-wheeler', '4-wheeler')),
  total_cost      numeric(10, 2) not null,
  status          text not null default 'confirmed'
                  check (status in ('confirmed', 'cancelled')),
  created_at      timestamptz default now()
);

create index if not exists bookings_renter_idx  on public.bookings (renter_id);
create index if not exists bookings_listing_idx on public.bookings (listing_id);


-- ─── 4. ROW LEVEL SECURITY ─────────────────────

-- profiles
alter table public.profiles enable row level security;

create policy "profiles: users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- listings
alter table public.listings enable row level security;

create policy "listings: anyone can view"
  on public.listings for select
  using (true);

create policy "listings: auth users can create"
  on public.listings for insert
  with check (auth.uid() = owner_id);

create policy "listings: owners can update"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "listings: owners can delete"
  on public.listings for delete
  using (auth.uid() = owner_id);

-- bookings
alter table public.bookings enable row level security;

create policy "bookings: users can view own bookings"
  on public.bookings for select
  using (auth.uid() = renter_id);

create policy "bookings: auth users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = renter_id);

create policy "bookings: users can cancel own bookings"
  on public.bookings for update
  using (auth.uid() = renter_id);


-- ─── 5. STORAGE BUCKET FOR LISTING IMAGES ──────
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

create policy "listing images: anyone can view"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing images: auth users can upload"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.uid() is not null);

create policy "listing images: owners can delete"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid() is not null);

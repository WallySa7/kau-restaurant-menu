-- KAU Restaurant Digital Menu — initial schema
-- Run this in the Supabase SQL editor.

-- =========================================================================
-- Extensions
-- =========================================================================
create extension if not exists "pgcrypto";

-- =========================================================================
-- profiles
-- =========================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- menu_weeks
-- =========================================================================
create table if not exists public.menu_weeks (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null unique,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- =========================================================================
-- menu_items
-- =========================================================================
create table if not exists public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  week_id         uuid not null references public.menu_weeks (id) on delete cascade,
  day_of_week     smallint not null check (day_of_week between 0 and 6),
  meal_type       text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  title_en        text not null,
  title_ar        text not null,
  description_en  text default '',
  description_ar  text default '',
  photo_url       text,
  price_sar       numeric(6,2) not null default 0 check (price_sar >= 0),
  capacity        integer not null default 100 check (capacity >= 0),
  created_at      timestamptz not null default now()
);

create index if not exists menu_items_week_idx on public.menu_items (week_id);

-- =========================================================================
-- bookings
-- =========================================================================
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items (id) on delete cascade,
  booking_date  date not null,
  meal_type     text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  ticket_code   uuid not null unique default gen_random_uuid(),
  status        text not null default 'confirmed' check (status in ('confirmed', 'redeemed', 'cancelled')),
  created_at    timestamptz not null default now(),
  constraint bookings_user_date_meal_unique unique (user_id, booking_date, meal_type)
);

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_ticket_idx on public.bookings (ticket_code);

-- =========================================================================
-- Helper: is_admin()
-- =========================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================================
-- Row-level security
-- =========================================================================
alter table public.profiles    enable row level security;
alter table public.menu_weeks  enable row level security;
alter table public.menu_items  enable row level security;
alter table public.bookings    enable row level security;

-- profiles
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- menu_weeks (public read, admin write)
drop policy if exists menu_weeks_public_read on public.menu_weeks;
create policy menu_weeks_public_read on public.menu_weeks
  for select using (true);

drop policy if exists menu_weeks_admin_write on public.menu_weeks;
create policy menu_weeks_admin_write on public.menu_weeks
  for all using (public.is_admin()) with check (public.is_admin());

-- menu_items (public read, admin write)
drop policy if exists menu_items_public_read on public.menu_items;
create policy menu_items_public_read on public.menu_items
  for select using (true);

drop policy if exists menu_items_admin_write on public.menu_items;
create policy menu_items_admin_write on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings
drop policy if exists bookings_self_read on public.bookings;
create policy bookings_self_read on public.bookings
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists bookings_self_insert on public.bookings;
create policy bookings_self_insert on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists bookings_self_update on public.bookings;
create policy bookings_self_update on public.bookings
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- =========================================================================
-- Storage bucket for meal photos (run once; ignore error if already exists)
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

drop policy if exists meal_photos_public_read on storage.objects;
create policy meal_photos_public_read on storage.objects
  for select using (bucket_id = 'meal-photos');

drop policy if exists meal_photos_admin_write on storage.objects;
create policy meal_photos_admin_write on storage.objects
  for all using (bucket_id = 'meal-photos' and public.is_admin())
  with check (bucket_id = 'meal-photos' and public.is_admin());

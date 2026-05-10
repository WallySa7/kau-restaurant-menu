-- 0002_multi_items_per_slot.sql
-- Allow multiple menu items per (week, day, meal_type) slot.
-- Move slot-level booking uniqueness from (user, item, date) to (user, date, meal_type),
-- so a student can pick any one of several options for a meal slot but still only one total.
-- Idempotent: safe to re-run.

-- =========================================================================
-- 1. Drop the slot uniqueness on menu_items
-- =========================================================================
alter table public.menu_items
  drop constraint if exists menu_items_week_id_day_of_week_meal_type_key;

-- =========================================================================
-- 2. Add meal_type column on bookings (denormalized for the unique constraint)
-- =========================================================================
alter table public.bookings
  add column if not exists meal_type text;

-- Backfill from menu_items for any existing rows.
update public.bookings b
   set meal_type = mi.meal_type
  from public.menu_items mi
 where b.menu_item_id = mi.id
   and b.meal_type is null;

-- Enforce NOT NULL once backfill is done.
alter table public.bookings
  alter column meal_type set not null;

-- Add the value check constraint if not already present.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_meal_type_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_meal_type_check
      check (meal_type in ('breakfast', 'lunch', 'dinner'));
  end if;
end $$;

-- =========================================================================
-- 3. Replace booking uniqueness
-- =========================================================================
alter table public.bookings
  drop constraint if exists bookings_user_id_menu_item_id_booking_date_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_user_date_meal_unique'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_user_date_meal_unique
      unique (user_id, booking_date, meal_type);
  end if;
end $$;

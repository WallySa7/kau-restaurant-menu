-- 0003_ticket_system.sql
-- Migrate from item-based bookings to ticket-type-based vouchers.
-- Re-runnable / idempotent.

-- =========================================================================
-- 1. Create ticket_types lookup table
-- =========================================================================
create table if not exists public.ticket_types (
  id              uuid primary key default gen_random_uuid(),
  ticket_tier     text not null check (ticket_tier in ('economic', 'primary')),
  meal_type       text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  title_en        text not null,
  title_ar        text not null,
  description_en  text not null default '',
  description_ar  text not null default '',
  includes_en     text not null default '',
  includes_ar     text not null default '',
  price_sar       numeric(6,2) not null check (price_sar >= 0),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint ticket_tier_meal_unique unique (ticket_tier, meal_type)
);

-- =========================================================================
-- 2. Seed the 6 default ticket types (idempotent)
-- =========================================================================
insert into public.ticket_types
  (ticket_tier, meal_type, title_en, title_ar, description_en, description_ar, includes_en, includes_ar, price_sar)
values
  ('economic', 'breakfast',
   'Economic Breakfast', 'إفطار اقتصادي',
   'A simple breakfast to start your day.', 'وجبة إفطار بسيطة لبداية يومك.',
   '1 main dish (beans/eggs) · 1 appetizer · tea or organic juice', 'طبق رئيسي (فول/بيض) · مقبلات · شاي أو عصير طبيعي',
   5.00),
  ('economic', 'lunch',
   'Economic Lunch', 'غداء اقتصادي',
   'A filling midday meal at a great value.', 'وجبة غداء مشبعة بقيمة رائعة.',
   '1 main dish (rice/macaroni) · meat (chicken/beef/fish) · 1 appetizer · tea/juice/soda/water',
   'طبق رئيسي (أرز/مكرونة) · لحم (دجاج/لحم/سمك) · مقبلات · شاي/عصير/مشروب غازي/ماء',
   11.00),
  ('economic', 'dinner',
   'Economic Dinner', 'عشاء اقتصادي',
   'A light evening meal.', 'وجبة عشاء خفيفة.',
   '1 main dish (rice/macaroni) · meat (chicken/beef/fish) · 1 appetizer · tea/juice/soda/water',
   'طبق رئيسي (أرز/مكرونة) · لحم (دجاج/لحم/سمك) · مقبلات · شاي/عصير/مشروب غازي/ماء',
   9.00),
  ('primary', 'breakfast',
   'Primary Breakfast', 'إفطار ممتاز',
   'A premium breakfast with extra sides.', 'وجبة إفطار ممتازة مع إضافات.',
   '1 main dish (beans/eggs) · 2 appetizers · tea or organic juice · fruit · dessert',
   'طبق رئيسي (فول/بيض) · مقبلتان · شاي أو عصير طبيعي · فواكه · حلى',
   8.00),
  ('primary', 'lunch',
   'Primary Lunch', 'غداء ممتاز',
   'Our full premium lunch experience.', 'تجربة غداء ممتازة كاملة.',
   '1 main dish (rice/macaroni) · meat (chicken/beef/fish) · 2 appetizers · tea/juice/soda/water · fruit · dessert',
   'طبق رئيسي (أرز/مكرونة) · لحم (دجاج/لحم/سمك) · مقبلتان · شاي/عصير/مشروب غازي/ماء · فواكه · حلى',
   14.00),
  ('primary', 'dinner',
   'Primary Dinner', 'عشاء ممتاز',
   'A premium evening meal.', 'وجبة عشاء ممتازة.',
   '1 main dish (rice/macaroni) · meat (chicken/beef/fish) · 2 appetizers · tea/juice/soda/water · fruit · dessert',
   'طبق رئيسي (أرز/مكرونة) · لحم (دجاج/لحم/سمك) · مقبلتان · شاي/عصير/مشروب غازي/ماء · فواكه · حلى',
   12.00)
on conflict (ticket_tier, meal_type) do nothing;

-- =========================================================================
-- 3. RLS for ticket_types
-- =========================================================================
alter table public.ticket_types enable row level security;

drop policy if exists ticket_types_public_read on public.ticket_types;
create policy ticket_types_public_read on public.ticket_types
  for select using (true);

drop policy if exists ticket_types_admin_write on public.ticket_types;
create policy ticket_types_admin_write on public.ticket_types
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- 4. Modify bookings table
-- =========================================================================
alter table public.bookings
  drop constraint if exists bookings_user_date_meal_unique;

alter table public.bookings
  drop column if exists menu_item_id,
  drop column if exists booking_date;

alter table public.bookings
  add column if not exists ticket_type_id uuid references public.ticket_types (id);

-- Backfill existing bookings with the first active ticket type
do $$
declare
  v_default_id uuid;
begin
  select id into v_default_id from public.ticket_types limit 1;
  update public.bookings set ticket_type_id = v_default_id where ticket_type_id is null;
end $$;

alter table public.bookings
  alter column ticket_type_id set not null;

-- Remove old indexes that are no longer relevant
drop index if exists bookings_date_idx;

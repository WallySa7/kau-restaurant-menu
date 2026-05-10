-- Seed sample weekly menu for the current Monday.
-- Run this in the Supabase SQL editor AFTER 0001_init.sql.
-- It is safe to re-run: it skips inserts if the week already exists.

do $$
declare
  v_week_id uuid;
  v_sunday  date := (current_date - extract(dow from current_date)::int)::date; -- Saudi week starts on Sunday
begin
  insert into public.menu_weeks (week_start)
  values (v_sunday)
  on conflict (week_start) do nothing
  returning id into v_week_id;

  if v_week_id is null then
    select id into v_week_id from public.menu_weeks where week_start = v_sunday;
  end if;

  -- Skip if items already seeded for this week.
  if exists (select 1 from public.menu_items where week_id = v_week_id) then
    return;
  end if;

  insert into public.menu_items
    (week_id, day_of_week, meal_type, title_en, title_ar, description_en, description_ar, price_sar, capacity)
  values
    (v_week_id, 0, 'breakfast', 'Foul & Eggs',     'فول وبيض',           'Traditional foul with eggs and bread', 'فول مدمس مع بيض وخبز',      8.00, 80),
    (v_week_id, 0, 'lunch',     'Chicken Kabsa',   'كبسة دجاج',           'Saudi-style spiced rice with chicken', 'أرز متبل بالبهارات مع دجاج',  15.00, 120),
    (v_week_id, 0, 'dinner',    'Shawarma Plate',  'صحن شاورما',          'Chicken shawarma with fries and salad','شاورما دجاج مع بطاطس وسلطة',  12.00, 100),
    (v_week_id, 1, 'breakfast', 'Shakshuka',       'شكشوكة',              'Eggs poached in tomato sauce',         'بيض مع صلصة الطماطم',         9.00, 80),
    (v_week_id, 1, 'lunch',     'Beef Mandi',      'مندي لحم',            'Slow-cooked beef on aromatic rice',    'لحم بقري مع أرز عطري',        18.00, 100),
    (v_week_id, 1, 'dinner',    'Grilled Fish',    'سمك مشوي',            'Grilled hammour with rice',            'سمك هامور مشوي مع أرز',       16.00, 90),
    (v_week_id, 2, 'breakfast', 'Cheese Manakish', 'مناقيش جبنة',         'Lebanese cheese flatbread',            'مناقيش بالجبنة',              7.00, 80),
    (v_week_id, 2, 'lunch',     'Mutton Kabsa',    'كبسة لحم',            'Mutton kabsa with raisins',            'كبسة لحم مع زبيب',            17.00, 100),
    (v_week_id, 2, 'dinner',    'Chicken Burger',  'برجر دجاج',           'Crispy chicken burger with fries',     'برجر دجاج مقرمش مع بطاطس',    10.00, 100),
    (v_week_id, 3, 'breakfast', 'Omelette',        'عجة بيض',             'Vegetable omelette with toast',        'عجة بيض مع توست',             7.00, 80),
    (v_week_id, 3, 'lunch',     'Madghout',        'مضغوط',               'Pressure-cooked spiced chicken rice',  'دجاج مع أرز بالبهارات',       14.00, 100),
    (v_week_id, 3, 'dinner',    'Beef Steak',      'ستيك لحم',            'Grilled beef steak with vegetables',   'ستيك لحم مشوي مع خضار',       22.00, 60),
    (v_week_id, 4, 'breakfast', 'Pancakes',        'بان كيك',             'Pancakes with honey and butter',       'بان كيك مع عسل وزبدة',         9.00, 80),
    (v_week_id, 4, 'lunch',     'Vegetable Curry', 'كاري خضار',           'Mixed vegetable curry with rice',      'كاري خضار مع أرز',            11.00, 80),
    (v_week_id, 4, 'dinner',    'Pizza Slice',     'بيتزا',               'Margherita pizza slice',               'بيتزا مارغريتا',              8.00, 100),
    (v_week_id, 5, 'breakfast', 'Falafel Wrap',    'لفة فلافل',           'Falafel wrap with tahini',             'فلافل ملفوف مع طحينة',         7.00, 80),
    (v_week_id, 5, 'lunch',     'Mixed Grill',     'مشاوي مشكلة',         'Mixed grill platter with rice',        'تشكيلة مشاوي مع أرز',         20.00, 80),
    (v_week_id, 5, 'dinner',    'Pasta Alfredo',   'باستا ألفريدو',        'Creamy chicken pasta',                 'باستا دجاج بصلصة كريمية',      13.00, 80),
    (v_week_id, 6, 'breakfast', 'Toast & Cheese',  'توست بالجبنة',         'Cheese toast with olives',             'توست بالجبنة والزيتون',        6.00, 80),
    (v_week_id, 6, 'lunch',     'Biryani',         'برياني',              'Chicken biryani',                      'برياني دجاج',                 14.00, 100),
    (v_week_id, 6, 'dinner',    'Sandwich Combo',  'وجبة سندويش',         'Sandwich, fries, drink',               'سندويش مع بطاطس ومشروب',      11.00, 100);
end $$;

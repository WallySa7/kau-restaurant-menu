-- Sample menu data for the current Sunday-based week.
-- Includes multiple options for some slots so you can test the
-- "Another option booked" lockout behavior.
-- Re-runnable: it deletes existing items for this week first, then re-inserts.
-- Note: the menu_items → bookings FK is ON DELETE CASCADE, so any test bookings
--       for this week will also be removed when you re-run.

do $$
declare
  v_week_id uuid;
  v_sunday  date := (current_date - extract(dow from current_date)::int)::date;
begin
  -- Ensure the week row exists.
  insert into public.menu_weeks (week_start)
  values (v_sunday)
  on conflict (week_start) do nothing;

  select id into v_week_id from public.menu_weeks where week_start = v_sunday;

  -- Wipe items for this week so the seed is idempotent.
  delete from public.menu_items where week_id = v_week_id;

  insert into public.menu_items
    (week_id, day_of_week, meal_type, title_en, title_ar, description_en, description_ar, price_sar, capacity)
  values
    -- ===== Sunday (day 0) =====
    (v_week_id, 0, 'breakfast', 'Foul & Eggs',      'فول وبيض',         'Traditional foul with eggs and bread',  'فول مدمس مع بيض وخبز',          8.00, 80),
    (v_week_id, 0, 'breakfast', 'Cheese Manakish',  'مناقيش جبنة',      'Lebanese cheese flatbread',             'مناقيش بالجبنة',                7.00, 60),
    (v_week_id, 0, 'lunch',     'Chicken Kabsa',    'كبسة دجاج',         'Spiced rice with chicken',              'أرز متبل مع دجاج',              15.00, 120),
    (v_week_id, 0, 'lunch',     'Beef Mandi',       'مندي لحم',          'Slow-cooked beef on aromatic rice',     'لحم بقري مع أرز عطري',          18.00, 100),
    (v_week_id, 0, 'dinner',    'Shawarma Plate',   'صحن شاورما',        'Chicken shawarma, fries, salad',        'شاورما دجاج مع بطاطس وسلطة',    12.00, 100),
    (v_week_id, 0, 'dinner',    'Grilled Fish',     'سمك مشوي',          'Grilled hammour with rice',             'هامور مشوي مع أرز',             16.00, 90),
    (v_week_id, 0, 'dinner',    'Vegetable Curry',  'كاري خضار',         'Mixed vegetable curry with rice',       'كاري خضار مع أرز',              11.00, 80),

    -- ===== Monday (day 1) =====
    (v_week_id, 1, 'breakfast', 'Shakshuka',        'شكشوكة',            'Eggs poached in tomato sauce',          'بيض مع صلصة الطماطم',           9.00, 80),
    (v_week_id, 1, 'lunch',     'Mutton Kabsa',     'كبسة لحم',          'Mutton kabsa with raisins',             'كبسة لحم مع زبيب',              17.00, 100),
    (v_week_id, 1, 'lunch',     'Chicken Burger',   'برجر دجاج',         'Crispy chicken burger with fries',      'برجر دجاج مقرمش مع بطاطس',     10.00, 100),
    (v_week_id, 1, 'dinner',    'Beef Steak',       'ستيك لحم',          'Grilled beef steak with vegetables',    'ستيك لحم مشوي مع خضار',        22.00, 60),

    -- ===== Tuesday (day 2) =====
    (v_week_id, 2, 'breakfast', 'Omelette',         'عجة بيض',           'Vegetable omelette with toast',         'عجة بيض مع توست',               7.00, 80),
    (v_week_id, 2, 'lunch',     'Madghout',         'مضغوط',             'Pressure-cooked spiced chicken rice',   'دجاج مع أرز بالبهارات',         14.00, 100),
    (v_week_id, 2, 'dinner',    'Pizza Margherita', 'بيتزا مارغريتا',     'Classic margherita pizza slice',        'بيتزا مارغريتا',                 8.00, 100),
    (v_week_id, 2, 'dinner',    'Pasta Alfredo',    'باستا ألفريدو',      'Creamy chicken pasta',                  'باستا دجاج بصلصة كريمية',       13.00, 80),

    -- ===== Wednesday (day 3) =====
    (v_week_id, 3, 'breakfast', 'Pancakes',         'بان كيك',           'Pancakes with honey and butter',        'بان كيك مع عسل وزبدة',          9.00, 80),
    (v_week_id, 3, 'lunch',     'Vegetable Curry',  'كاري خضار',         'Mixed vegetable curry with rice',       'كاري خضار مع أرز',              11.00, 80),
    (v_week_id, 3, 'dinner',    'Mixed Grill',      'مشاوي مشكلة',       'Mixed grill platter with rice',         'تشكيلة مشاوي مع أرز',           20.00, 80),

    -- ===== Thursday (day 4) =====
    (v_week_id, 4, 'breakfast', 'Falafel Wrap',     'لفة فلافل',         'Falafel wrap with tahini',              'فلافل ملفوف مع طحينة',          7.00, 80),
    (v_week_id, 4, 'lunch',     'Biryani',          'برياني',            'Chicken biryani',                       'برياني دجاج',                    14.00, 100),
    (v_week_id, 4, 'dinner',    'Sandwich Combo',   'وجبة سندويش',       'Sandwich, fries, drink',                'سندويش مع بطاطس ومشروب',        11.00, 100),

    -- ===== Friday (day 5) =====
    (v_week_id, 5, 'breakfast', 'Toast & Cheese',   'توست بالجبنة',      'Cheese toast with olives',              'توست بالجبنة والزيتون',         6.00, 80),
    (v_week_id, 5, 'lunch',     'Madghout',         'مضغوط',             'Pressure-cooked chicken rice',          'دجاج مع أرز',                    14.00, 100),
    (v_week_id, 5, 'dinner',    'Chicken Burger',   'برجر دجاج',         'Crispy chicken burger',                 'برجر دجاج مقرمش',               10.00, 100),

    -- ===== Saturday (day 6) =====
    (v_week_id, 6, 'breakfast', 'Fatteh',           'فتة',               'Chickpea fatteh with yogurt',           'فتة حمص بالزبادي',              8.00, 70),
    (v_week_id, 6, 'lunch',     'Mixed Grill',      'مشاوي مشكلة',       'Mixed grill platter with rice',         'تشكيلة مشاوي مع أرز',           20.00, 80),
    (v_week_id, 6, 'dinner',    'Pizza Slice',      'بيتزا',             'Cheese pizza slice',                    'بيتزا جبنة',                     8.00, 100);
end $$;

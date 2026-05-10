import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { sundayOf, dateForDay, formatDate, DAYS_OF_WEEK, MEAL_TYPES } from '../../lib/dates';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function MenuPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const [weekStart] = useState(() => sundayOf());
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => new Date().getDay());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const { data: weeks } = await supabase
        .from('menu_weeks')
        .select('id')
        .eq('week_start', weekStart)
        .maybeSingle();

      if (cancelled) return;

      if (!weeks) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('week_id', weeks.id);

      if (cancelled) return;
      setItems(menuItems ?? []);

      if (user) {
        const { data: myBookings } = await supabase
          .from('bookings')
          .select('menu_item_id, booking_date, meal_type, status')
          .eq('user_id', user.id)
          .neq('status', 'cancelled');
        if (!cancelled) setBookings(myBookings ?? []);
      } else {
        setBookings([]);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [weekStart, user]);

  const itemsByDay = useMemo(() => {
    const grid = {};
    for (const day of DAYS_OF_WEEK) {
      grid[day] = {};
      for (const meal of MEAL_TYPES) grid[day][meal] = [];
    }
    for (const it of items) grid[it.day_of_week][it.meal_type].push(it);
    return grid;
  }, [items]);

  const slotBooking = (day, meal) => {
    const date = dateForDay(weekStart, day);
    return bookings.find((b) => b.booking_date === date && b.meal_type === meal);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('menu.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('menu.weekOf', { date: formatDate(weekStart, i18n.language) })}
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
        {DAYS_OF_WEEK.map((d) => {
          const date = dateForDay(weekStart, d);
          const active = d === activeDay;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                active
                  ? 'bg-kau-600 text-white border-kau-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-kau-300'
              }`}
            >
              <div>{t(`menu.${DAY_KEYS[d]}`)}</div>
              <div className={`text-xs mt-0.5 ${active ? 'text-kau-100' : 'text-gray-400'}`}>
                {formatDate(date, i18n.language)}
              </div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          <div className="text-5xl mb-4 opacity-40">🍽️</div>
          <p>{t('menu.noMenu')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {MEAL_TYPES.map((meal) => {
            const slotItems = itemsByDay[activeDay][meal];
            const booking = slotBooking(activeDay, meal);
            return (
              <section key={meal}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-kau-700 mb-3">
                  {t(`menu.${meal}`)}
                </h2>
                {slotItems.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">—</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slotItems.map((item) => {
                      const bookedThis = booking?.menu_item_id === item.id;
                      const slotTaken = booking && !bookedThis;
                      return (
                        <div key={item.id} className="card flex flex-col">
                          {item.photo_url && (
                            <img
                              src={item.photo_url}
                              alt={i18n.language === 'ar' ? item.title_ar : item.title_en}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                              loading="lazy"
                            />
                          )}
                          <h3 className="font-semibold text-gray-900">
                            {i18n.language === 'ar' ? item.title_ar : item.title_en}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 flex-1">
                            {i18n.language === 'ar' ? item.description_ar : item.description_en}
                          </p>
                          <div className="flex items-center justify-between mt-4 gap-2">
                            <span className="font-semibold text-gray-900">
                              {t('menu.price', { value: item.price_sar })}
                            </span>
                            {bookedThis ? (
                              <span className="badge-success">{t('menu.alreadyBooked')}</span>
                            ) : slotTaken ? (
                              <span className="badge-neutral">{t('menu.slotTaken')}</span>
                            ) : isAuthenticated ? (
                              <Link
                                to={`/menu/${item.id}/book`}
                                className="btn-primary !py-1.5"
                              >
                                {t('menu.book')}
                              </Link>
                            ) : (
                              <Link to="/login" className="btn-secondary !py-1.5">
                                {t('nav.login')}
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

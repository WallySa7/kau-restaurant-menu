import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { sundayOf, dateForDay, DAYS_OF_WEEK, MEAL_TYPES } from '../../lib/dates';
import { CardSkeleton } from '../../components/Skeleton.jsx';

// ─── PDF link — update this path to your actual PDF URL ───────────────────
const MENU_PDF_URL = '/menu-kau.pdf';

// ─── Hero slideshow images ─────────────────────────────────────────────────
const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=75',
  'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=75',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=75',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=75',
];

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function formatWeekRange(weekStart, locale) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const lang = locale === 'ar' ? 'ar-SA' : 'en-US';
  const opts = { month: 'long', day: 'numeric' };
  return `${start.toLocaleDateString(lang, opts)} – ${end.toLocaleDateString(lang, { ...opts, year: 'numeric' })}`;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────
function SunIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H21m-18 0H3m15.07-6.07-.71.71M6.64 17.36l-.71.71M17.66 17.07l-.71-.71M6.64 6.64l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
    </svg>
  );
}

function UtensilsIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v7a4 4 0 004 4h1v7h2v-7h1a4 4 0 004-4V3h-2v5H9V3H7v5H5V3H3zm13 0h1a3 3 0 013 3v1a3 3 0 01-2 2.83V21h-2V9.83A3 3 0 0116 7V3z" />
    </svg>
  );
}

function MoonIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

function PlateIcon({ className = 'w-10 h-10' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
    </svg>
  );
}

function DownloadIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12" />
    </svg>
  );
}

// ─── Meal section metadata ─────────────────────────────────────────────────
const MEAL_META = {
  breakfast: {
    icon: (cls) => <SunIcon className={cls} />,
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-700',
    headerBorder: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  lunch: {
    icon: (cls) => <UtensilsIcon className={cls} />,
    headerBg: 'bg-kau-50',
    headerText: 'text-kau-700',
    headerBorder: 'border-kau-200',
    dot: 'bg-kau-500',
  },
  dinner: {
    icon: (cls) => <MoonIcon className={cls} />,
    headerBg: 'bg-indigo-50',
    headerText: 'text-indigo-700',
    headerBorder: 'border-indigo-200',
    dot: 'bg-indigo-400',
  },
};

// ─── Hero photo slideshow ─────────────────────────────────────────────────
function MenuHero({ weekRange, t }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-52 sm:h-64 overflow-hidden">
      {HERO_SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          loading={i === 0 ? 'eager' : 'lazy'}
          width={1200}
          height={400}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 pb-5 max-w-6xl mx-auto">
        <p className="text-kau-300 text-xs font-semibold uppercase tracking-widest mb-1 animate-fade-in">
          {weekRange}
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow animate-fade-in-up">
            {t('menu.title')}
          </h1>
        </div>

        {/* Slide dots */}
        <div className="flex gap-1.5 mt-3" aria-hidden="true">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day selector ─────────────────────────────────────────────────────────
function DaySelector({ weekStart, activeDay, setActiveDay, isCurrentWeek, todayDow, t, lang }) {
  const scrollRef = useRef(null);

  // Auto-scroll today's button into view on mount
  useEffect(() => {
    if (!isCurrentWeek) return;
    const el = scrollRef.current?.querySelector(`[data-day="${todayDow}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [isCurrentWeek, todayDow]);

  return (
    <div
      ref={scrollRef}
      className="grid grid-cols-7 gap-2 sm:gap-3"
      role="tablist"
      aria-label={lang === 'ar' ? 'اختر اليوم' : 'Select day'}
    >
      {DAYS_OF_WEEK.map((d) => {
        const active = d === activeDay;
        const isToday = isCurrentWeek && d === todayDow;
        const dateStr = dateForDay(weekStart, d);
        const [dy, dm, dd] = dateStr.split('-').map(Number);
        const dateNum = new Date(dy, dm - 1, dd).getDate();
        const fullDayName = t(`menu.${DAY_KEYS[d]}`);

        return (
          <button
            key={d}
            data-day={d}
            role="tab"
            aria-selected={active}
            onClick={() => setActiveDay(d)}
            className={`w-full flex flex-col items-center gap-1 px-1 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-kau-400 focus:ring-offset-1 cursor-pointer ${
              active
                ? 'bg-kau-600 border-kau-600 text-white shadow-md scale-[1.04]'
                : isToday
                ? 'bg-white border-kau-400 text-gray-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-kau-300 hover:bg-kau-50'
            }`}
          >
            <span className={`text-xs font-semibold leading-none ${active ? 'text-kau-100' : isToday ? 'text-kau-600' : 'text-gray-400'}`}>
              {fullDayName}
            </span>
            <span className="text-xl font-bold leading-none tabular-nums">{dateNum}</span>
            {isToday && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-none ${
                active ? 'bg-white/20 text-white' : 'bg-kau-600 text-white'
              }`}>
                {lang === 'ar' ? 'اليوم' : 'Today'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Meal section ─────────────────────────────────────────────────────────
function MealSection({ meal, slotItems, booking, isAuthenticated, t, lang, sectionIndex }) {
  const meta = MEAL_META[meal];
  if (slotItems.length === 0) return null;

  return (
    <section
      className="stagger-item"
      style={{ animationDelay: `${sectionIndex * 80}ms` }}
    >
      {/* Meal type header */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${meta.headerBg} ${meta.headerText} ${meta.headerBorder} mb-4`}>
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} aria-hidden="true" />
        {meta.icon('w-4 h-4')}
        <span className="font-bold text-sm">{t(`menu.${meal}`)}</span>
        <span className="text-xs opacity-60">·</span>
        <span className="text-xs font-medium opacity-70">{slotItems.length} {lang === 'ar' ? 'وجبة' : slotItems.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slotItems.map((item, i) => {
          const bookedThis = booking?.menu_item_id === item.id;
          const slotTaken = booking && !bookedThis;
          const title = lang === 'ar' ? item.title_ar : item.title_en;
          const desc = lang === 'ar' ? item.description_ar : item.description_en;

          return (
            <article
              key={item.id}
              className="stagger-item bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              style={{ animationDelay: `${(sectionIndex * 80) + (i * 60)}ms` }}
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400"
                    loading="lazy"
                    width={400}
                    height={300}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <PlateIcon className="w-12 h-12 text-gray-200" />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 gap-1.5 p-4">
                <h3 className="font-bold text-gray-900 leading-snug">{title}</h3>
                {desc && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{desc}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
                <span className="font-bold text-gray-900 tabular-nums text-sm">
                  {t('menu.price', { value: item.price_sar })}
                </span>
                {bookedThis ? (
                  <span className="badge-success">{t('menu.alreadyBooked')}</span>
                ) : slotTaken ? (
                  <span className="badge-neutral">{t('menu.slotTaken')}</span>
                ) : isAuthenticated ? (
                  <Link to={`/menu/${item.id}/book`} className="btn-primary !py-1.5 !px-4 text-sm">
                    {t('menu.book')}
                  </Link>
                ) : (
                  <Link to="/login" className="btn-secondary !py-1.5 !px-4 text-sm">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function MenuPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const lang = i18n.language;

  const [weekStart] = useState(() => sundayOf());
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(() => new Date().getDay());

  const todayDow = new Date().getDay();
  const isCurrentWeek = weekStart === sundayOf();

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
    return () => { cancelled = true; };
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

  const slotBooking = (meal) => {
    const date = dateForDay(weekStart, activeDay);
    return bookings.find((b) => b.booking_date === date && b.meal_type === meal);
  };

  const weekRange = formatWeekRange(weekStart, lang);

  // Count meals that have items for today
  const activeDayHasAny = !loading && MEAL_TYPES.some(
    (m) => (itemsByDay[activeDay]?.[m] ?? []).length > 0
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Animated hero header */}
      <MenuHero weekRange={weekRange} t={t} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Day selector */}
        <DaySelector
          weekStart={weekStart}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          isCurrentWeek={isCurrentWeek}
          todayDow={todayDow}
          t={t}
          lang={lang}
        />

        {/* Content area */}
        {loading ? (
          <div className="space-y-8">
            {MEAL_TYPES.map((m) => (
              <div key={m} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 animate-fade-in">
            <PlateIcon className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="font-semibold text-gray-400">{t('menu.noMenu')}</p>
          </div>
        ) : !activeDayHasAny ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 animate-fade-in">
            <PlateIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">
              {lang === 'ar' ? 'لا توجد وجبات لهذا اليوم' : 'No meals scheduled for this day'}
            </p>
          </div>
        ) : (
          /* All meal sections stacked */
          <div className="space-y-10">
            {MEAL_TYPES.map((meal, sectionIndex) => (
              <MealSection
                key={`${activeDay}-${meal}`}
                meal={meal}
                slotItems={itemsByDay[activeDay]?.[meal] ?? []}
                booking={slotBooking(meal)}
                isAuthenticated={isAuthenticated}
                t={t}
                lang={lang}
                sectionIndex={sectionIndex}
              />
            ))}
          </div>
        )}

        {/* PDF download — bottom of page */}
        <div className="border-t border-gray-200 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-700">{t('menu.downloadPdf')}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {lang === 'ar' ? 'نسخة كاملة من قائمة الأسبوع' : 'Full printable version of this week\'s menu'}
            </p>
          </div>
          <a
            href={MENU_PDF_URL}
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kau-600 text-white font-semibold text-sm hover:bg-kau-700 focus:outline-none focus:ring-2 focus:ring-kau-500 focus:ring-offset-2 cursor-pointer shadow-sm shrink-0 transition-colors duration-200"
          >
            <DownloadIcon className="w-4 h-4" />
            PDF
          </a>
        </div>
      </div>
    </div>
  );
}

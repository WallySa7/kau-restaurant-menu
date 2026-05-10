import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { dateForDay, formatDate } from '../../lib/dates';
import Skeleton from '../../components/Skeleton.jsx';

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const { itemId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/27', cvc: '123' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, menu_weeks(week_start)')
        .eq('id', itemId)
        .single();
      if (cancelled) return;
      if (error) {
        toast.error(error.message);
      } else {
        setItem(data);
        setWeek(data.menu_weeks);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!item || !week) return;
    setSubmitting(true);

    const bookingDate = dateForDay(week.week_start, item.day_of_week);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        menu_item_id: item.id,
        booking_date: bookingDate,
        meal_type: item.meal_type,
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast.warning(t('booking.duplicate'));
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(t('booking.success'));
    navigate(`/tickets/${data.id}`, { replace: true });
  };

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-1/2" />
        <div className="card space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="card space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <p className="max-w-3xl mx-auto px-4 py-10 text-red-600">{t('common.error')}</p>
    );
  }

  const bookingDate = week ? dateForDay(week.week_start, item.day_of_week) : null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link to="/menu" className="text-sm text-kau-700 hover:underline">
        ← {t('common.back')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{t('booking.title')}</h1>

      <div className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          {t('booking.summary')}
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">{t('booking.meal')}</dt>
            <dd className="font-medium text-gray-900">
              {i18n.language === 'ar' ? item.title_ar : item.title_en}{' '}
              <span className="text-gray-400">· {t(`menu.${item.meal_type}`)}</span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{t('booking.date')}</dt>
            <dd className="font-medium text-gray-900">{formatDate(bookingDate, i18n.language)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <dt className="text-gray-700 font-semibold">{t('booking.total')}</dt>
            <dd className="font-semibold text-gray-900">
              {t('menu.price', { value: item.price_sar })}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
            {t('booking.paymentTitle')}
          </h2>
          <p className="text-xs text-gray-500">{t('booking.paymentNote')}</p>
        </div>

        <div>
          <label className="label" htmlFor="card-number">
            {t('booking.cardNumber')}
          </label>
          <input
            id="card-number"
            className="input"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            inputMode="numeric"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="expiry">
              {t('booking.expiry')}
            </label>
            <input
              id="expiry"
              className="input"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="cvc">
              {t('booking.cvc')}
            </label>
            <input
              id="cvc"
              className="input"
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? t('booking.processing') : t('booking.payAndBook')}
        </button>
      </form>
    </section>
  );
}

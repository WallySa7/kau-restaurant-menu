import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { formatDate } from '../../lib/dates';
import Skeleton from '../../components/Skeleton.jsx';

const STATUS_CLASS = {
  confirmed: 'badge-success',
  redeemed: 'badge-neutral',
  cancelled: 'badge-error',
};

export default function TicketsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_date, status, ticket_code, menu_items(title_en, title_ar, meal_type)')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });
      if (!cancelled) {
        setTickets(data ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('tickets.title')}</h1>

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="card flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </li>
          ))}
        </ul>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4 opacity-40">🎟️</div>
          <p className="text-gray-600 mb-4">{t('tickets.empty')}</p>
          <Link to="/menu" className="btn-primary inline-flex">
            {t('tickets.browseMenu')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((tk) => (
            <li key={tk.id} className="card flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-gray-900">
                  {i18n.language === 'ar' ? tk.menu_items.title_ar : tk.menu_items.title_en}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(tk.booking_date, i18n.language)} ·{' '}
                  {t(`menu.${tk.menu_items.meal_type}`)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={STATUS_CLASS[tk.status] ?? 'badge-neutral'}>
                  {t(`tickets.${tk.status}`)}
                </span>
                <Link to={`/tickets/${tk.id}`} className="btn-secondary !py-1.5">
                  {t('tickets.viewQr')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

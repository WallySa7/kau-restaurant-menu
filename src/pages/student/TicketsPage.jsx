import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Skeleton from '../../components/Skeleton.jsx';

const STATUS_CLASS = {
  confirmed: 'badge-success',
  redeemed: 'badge-neutral',
  cancelled: 'badge-error',
};

const TIER_BADGE = {
  economic: 'bg-amber-100 text-amber-800',
  primary: 'bg-kau-100 text-kau-800',
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
        .select('id, status, ticket_code, created_at, ticket_types(id, ticket_tier, meal_type, title_en, title_ar, price_sar)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) {
        setTickets(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
          <Link to="/tickets/purchase" className="btn-primary inline-flex">
            {t('tickets.purchaseTitle')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((tk) => {
            const tt = tk.ticket_types;
            const title = i18n.language === 'ar' ? tt?.title_ar : tt?.title_en;
            return (
              <li key={tk.id} className="card flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TIER_BADGE[tt?.ticket_tier] ?? ''}`}>
                      {t(`tickets.${tt?.ticket_tier}`)}
                    </span>
                    <span className="font-semibold text-gray-900">{title}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('tickets.purchased')}: {new Date(tk.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
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
            );
          })}
        </ul>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { RowSkeleton } from '../../components/Skeleton.jsx';

export default function BookingsPage() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let query = supabase
        .from('bookings')
        .select(
          'id, status, ticket_code, created_at, profiles(full_name), ticket_types(ticket_tier, meal_type, title_en, title_ar)',
        )
        .order('created_at', { ascending: false });
      if (status !== 'all') query = query.eq('status', status);
      const { data } = await query;
      if (!cancelled) {
        setRows(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('admin.bookings')}</h1>

      <div className="card flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="bstatus">
            {t('tickets.status')}
          </label>
          <select
            id="bstatus"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">{t('admin.bookingsTable.all')}</option>
            <option value="confirmed">{t('tickets.confirmed')}</option>
            <option value="redeemed">{t('tickets.redeemed')}</option>
            <option value="cancelled">{t('tickets.cancelled')}</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-start text-gray-500 border-b border-gray-100">
              <th className="py-2 pe-3 text-start">{t('admin.bookingsTable.student')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.bookingsTable.meal')}</th>
              <th className="py-2 pe-3 text-start">{t('tickets.tier')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.bookingsTable.status')}</th>
              <th className="py-2 pe-3 text-start">{t('tickets.purchased')}</th>
              <th className="py-2 text-start">{t('admin.bookingsTable.ticket')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                <RowSkeleton cols={6} />
                <RowSkeleton cols={6} />
                <RowSkeleton cols={6} />
              </>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400">
                  —
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2 pe-3">{r.profiles?.full_name ?? '—'}</td>
                  <td className="py-2 pe-3">
                    {i18n.language === 'ar' ? r.ticket_types?.title_ar : r.ticket_types?.title_en}
                    <span className="text-gray-400">
                      {' · '}{t(`menu.${r.ticket_types?.meal_type}`)}
                    </span>
                  </td>
                  <td className="py-2 pe-3">{t(`tickets.${r.ticket_types?.ticket_tier}`)}</td>
                  <td className="py-2 pe-3">{t(`tickets.${r.status}`)}</td>
                  <td className="py-2 pe-3 text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 font-mono text-xs text-gray-500">
                    {r.ticket_code.slice(0, 8)}…
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { formatDate } from '../../lib/dates';
import Skeleton from '../../components/Skeleton.jsx';

const STATUS_CLASS = {
  confirmed: 'badge-success',
  redeemed: 'badge-neutral',
  cancelled: 'badge-error',
};

export default function TicketDetailPage() {
  const { t, i18n } = useTranslation();
  const { bookingId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, booking_date, status, ticket_code, menu_items(title_en, title_ar, meal_type, price_sar)',
        )
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (cancelled) return;
      if (error) {
        setNotFound(true);
        toast.error(error.message);
      } else {
        setTicket(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, user.id]);

  const handleCancel = async () => {
    if (!window.confirm(t('tickets.cancelConfirm'))) return;
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (error) {
      toast.error(error.message);
    } else {
      setTicket((prev) => ({ ...prev, status: 'cancelled' }));
      toast.success(t('tickets.cancelled'));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ticket_code);
      toast.success(t('tickets.copied'));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-4 w-20" />
        <div className="card text-center space-y-4">
          <Skeleton className="h-6 w-24 mx-auto" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
          <Skeleton className="h-60 w-60 mx-auto" />
        </div>
      </section>
    );
  }

  if (notFound || !ticket) {
    return <p className="max-w-3xl mx-auto px-4 py-10 text-red-600">{t('common.error')}</p>;
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link to="/tickets" className="text-sm text-kau-700 hover:underline print:hidden">
        ← {t('common.back')}
      </Link>

      <div className="card text-center print:shadow-none print:border-0">
        <div className="mb-2">
          <span className={STATUS_CLASS[ticket.status]}>{t(`tickets.${ticket.status}`)}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{t('tickets.qrTitle')}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {formatDate(ticket.booking_date, i18n.language)} ·{' '}
          {t(`menu.${ticket.menu_items.meal_type}`)} ·{' '}
          {i18n.language === 'ar' ? ticket.menu_items.title_ar : ticket.menu_items.title_en}
        </p>

        <div
          className={`inline-block bg-white p-4 rounded-2xl border-2 ${
            ticket.status === 'confirmed' ? 'border-kau-200' : 'border-gray-200 opacity-50'
          }`}
        >
          <QRCodeSVG value={ticket.ticket_code} size={240} level="M" includeMargin={false} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <div>{t('tickets.ticketCode')}</div>
          <code className="text-[11px] break-all">{ticket.ticket_code}</code>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 print:hidden">
          <button onClick={handleCopy} className="btn-secondary">
            {t('tickets.copy')}
          </button>
          <button onClick={() => window.print()} className="btn-secondary">
            {t('tickets.print')}
          </button>
          {ticket.status === 'confirmed' && (
            <button onClick={handleCancel} className="btn-danger">
              {t('tickets.cancel')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

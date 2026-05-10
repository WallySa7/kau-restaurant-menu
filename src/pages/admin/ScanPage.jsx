import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext.jsx';

const SCANNER_ELEMENT_ID = 'qr-scanner';

export default function ScanPage() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const scannerRef = useRef(null);
  const lockRef = useRef(false);
  const [result, setResult] = useState(null); // { type: 'success'|'already'|'invalid'|'error', booking?, message? }
  const [scanning, setScanning] = useState(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
      } catch {
        /* noop */
      }
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setResult(null);
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID);
    }
    const scanner = scannerRef.current;
    setScanning(true);
    lockRef.current = false;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (lockRef.current) return;
          lockRef.current = true;
          await stopScanner();
          await processTicket(decodedText);
        },
        () => {},
      );
    } catch (err) {
      setScanning(false);
      setResult({ type: 'error', message: err.message ?? t('common.error') });
    }
  };

  const processTicket = async (ticketCode) => {
    const trimmed = ticketCode.trim();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(
        'id, status, ticket_code, booking_date, profiles(full_name), menu_items(title_en, title_ar, meal_type)',
      )
      .eq('ticket_code', trimmed)
      .maybeSingle();

    if (error || !booking) {
      setResult({ type: 'invalid' });
      toast.error(t('admin.scan.invalid'));
      return;
    }
    if (booking.status === 'redeemed') {
      setResult({ type: 'already', booking });
      toast.warning(t('admin.scan.alreadyRedeemed'));
      return;
    }
    if (booking.status !== 'confirmed') {
      setResult({ type: 'invalid' });
      toast.error(t('admin.scan.invalid'));
      return;
    }

    const { error: updErr } = await supabase
      .from('bookings')
      .update({ status: 'redeemed' })
      .eq('id', booking.id);
    if (updErr) {
      setResult({ type: 'error', message: updErr.message });
      toast.error(updErr.message);
      return;
    }
    setResult({ type: 'success', booking: { ...booking, status: 'redeemed' } });
    toast.success(t('admin.scan.redeemed'));
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const tone =
    result?.type === 'success'
      ? 'bg-green-50 border-green-200 text-green-900'
      : result?.type === 'already'
      ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
      : 'bg-red-50 border-red-200 text-red-900';

  return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.scan.title')}</h1>
        <p className="text-gray-500 mt-1">{t('admin.scan.instruction')}</p>
      </header>

      <div className="card">
        <div
          id={SCANNER_ELEMENT_ID}
          className="w-full aspect-square bg-black rounded-lg overflow-hidden"
        />

        <div className="mt-4">
          {!scanning ? (
            <button onClick={startScanner} className="btn-primary w-full">
              {result ? t('admin.scan.tryAgain') : t('admin.scan.title')}
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-secondary w-full">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className={`card border ${tone}`}>
          <div className="font-semibold">
            {result.type === 'success' && t('admin.scan.redeemed')}
            {result.type === 'already' && t('admin.scan.alreadyRedeemed')}
            {result.type === 'invalid' && t('admin.scan.invalid')}
            {result.type === 'error' && (result.message ?? t('common.error'))}
          </div>
          {result.booking && (
            <div className="mt-3 text-sm space-y-1">
              <div>
                <span className="text-gray-500">Student:</span>{' '}
                {result.booking.profiles?.full_name ?? '—'}
              </div>
              <div>
                <span className="text-gray-500">Meal:</span>{' '}
                {i18n.language === 'ar'
                  ? result.booking.menu_items.title_ar
                  : result.booking.menu_items.title_en}{' '}
                · {t(`menu.${result.booking.menu_items.meal_type}`)}
              </div>
              <div>
                <span className="text-gray-500">Date:</span> {result.booking.booking_date}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

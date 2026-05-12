import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import Skeleton from '../../components/Skeleton.jsx';

const TIER_META = {
  economic: {
    label: 'economic',
    badge: 'bg-amber-100 text-amber-800',
    cardBorder: 'border-amber-200',
    cardBg: 'bg-amber-50/30',
    icon: '💰',
  },
  primary: {
    label: 'primary',
    badge: 'bg-kau-100 text-kau-800',
    cardBorder: 'border-kau-200',
    cardBg: 'bg-kau-50/30',
    icon: '⭐',
  },
};

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

function TicketTypeCard({ t, type, selected, onSelect, lang }) {
  const meta = TIER_META[type.ticket_tier];
  const mealIcon = MEAL_ICONS[type.meal_type];
  const title = lang === 'ar' ? type.title_ar : type.title_en;
  const desc = lang === 'ar' ? type.description_ar : type.description_en;
  const includes = lang === 'ar' ? type.includes_ar : type.includes_en;

  return (
    <button
      type="button"
      onClick={() => onSelect(type.id)}
      className={`relative w-full text-start rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-kau-400 focus:ring-offset-2 ${
        selected
          ? `${meta.cardBorder} ${meta.cardBg} shadow-md ring-2 ring-kau-400`
          : 'border-gray-200 bg-white hover:border-kau-300 hover:shadow-sm'
      }`}
    >
      {selected && (
        <span className="absolute top-3 end-3 w-6 h-6 rounded-full bg-kau-600 text-white flex items-center justify-center text-xs font-bold">
          ✓
        </span>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.badge}`}>
          {mealIcon} {t(`tickets.${type.ticket_tier}`)}
        </span>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {t(`menu.${type.meal_type}`)}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      {desc && <p className="text-sm text-gray-500 mb-3 leading-relaxed">{desc}</p>}

      <div className="text-sm text-gray-600 mb-4">
        <span className="font-semibold text-gray-700">{t('tickets.includes')}:</span>
        <p className="mt-0.5 leading-relaxed">{includes}</p>
      </div>

      <div className="text-2xl font-bold text-gray-900 tabular-nums">
        {t('menu.price', { value: type.price_sar })}
      </div>
    </button>
  );
}

function QuantitySelector({ value, onChange, t }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{t('tickets.quantity')}:</span>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          −
        </button>
        <span className="w-12 text-center font-semibold text-gray-900 tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(10, value + 1))}
          disabled={value >= 10}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function TicketShopPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const lang = i18n.language;

  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState('select');
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/27', cvc: '123' });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('is_active', true)
        .order('ticket_tier')
        .order('meal_type');
      if (!cancelled) {
        setTicketTypes(data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectedType = ticketTypes.find((tt) => tt.id === selectedTypeId);

  const handleSelect = (id) => {
    if (id === selectedTypeId) {
      setSelectedTypeId(null);
    } else {
      setSelectedTypeId(id);
      setQuantity(1);
    }
  };

  const handleCheckout = () => {
    if (!selectedTypeId) return;
    setStep('payment');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedType) return;
    setSubmitting(true);

    const inserts = Array.from({ length: quantity }, () => ({
      user_id: user.id,
      ticket_type_id: selectedType.id,
    }));

    const { error } = await supabase
      .from('bookings')
      .insert(inserts);

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t('tickets.purchaseSuccess'));
    setStep('confirmation');
  };

  const total = selectedType ? selectedType.price_sar * quantity : 0;

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (step === 'confirmation') {
    return (
      <section className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('tickets.purchaseSuccess')}</h1>
        <p className="text-gray-500 mb-2">
          {quantity} × {lang === 'ar' ? selectedType?.title_ar : selectedType?.title_en}
        </p>
        <p className="text-2xl font-bold text-kau-700 mb-8">
          {t('menu.price', { value: total })}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/tickets" className="btn-primary px-6 py-3">
            {t('tickets.viewTickets')}
          </Link>
          <button
            onClick={() => { setStep('select'); setSelectedTypeId(null); setQuantity(1); }}
            className="btn-secondary px-6 py-3 cursor-pointer"
          >
            {t('tickets.buyAnother')}
          </button>
        </div>
      </section>
    );
  }

  const economicTypes = ticketTypes.filter((tt) => tt.ticket_tier === 'economic');
  const primaryTypes = ticketTypes.filter((tt) => tt.ticket_tier === 'primary');

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('tickets.purchaseTitle')}</h1>
      <p className="text-gray-500 mb-8">{t('tickets.purchaseDesc')}</p>

      {ticketTypes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">{t('tickets.noTickets')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-10">
            {/* Economic tier */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💰</span>
                <h2 className="text-xl font-bold text-gray-800">{t('tickets.economic')}</h2>
                <span className="text-sm text-gray-400">—</span>
                <span className="text-sm text-gray-500">{t('tickets.economicDesc')}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {economicTypes.map((type) => (
                  <TicketTypeCard
                    key={type.id}
                    t={t}
                    type={type}
                    selected={selectedTypeId === type.id}
                    onSelect={handleSelect}
                    lang={lang}
                  />
                ))}
              </div>
            </div>

            {/* Primary tier */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⭐</span>
                <h2 className="text-xl font-bold text-gray-800">{t('tickets.primary')}</h2>
                <span className="text-sm text-gray-400">—</span>
                <span className="text-sm text-gray-500">{t('tickets.primaryDesc')}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {primaryTypes.map((type) => (
                  <TicketTypeCard
                    key={type.id}
                    t={t}
                    type={type}
                    selected={selectedTypeId === type.id}
                    onSelect={handleSelect}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky bottom bar */}
          {step === 'select' && selectedType && (
            <div className="sticky bottom-4 mt-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <QuantitySelector value={quantity} onChange={setQuantity} t={t} />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-sm text-gray-500">
                    {quantity} ×{' '}
                    {t('menu.price', { value: selectedType.price_sar })}
                  </div>
                  <div className="text-xl font-bold text-gray-900 tabular-nums">
                    {t('menu.price', { value: total })}
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="btn-primary px-6 py-3 shrink-0 cursor-pointer"
                  >
                    {t('tickets.checkout')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment step */}
          {step === 'payment' && selectedType && (
            <div className="max-w-lg mx-auto mt-8 space-y-6">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-1">{t('booking.summary')}</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{t('tickets.tier')}</dt>
                    <dd className="font-medium">
                      {t(`tickets.${selectedType.ticket_tier}`)} ·{' '}
                      {t(`menu.${selectedType.meal_type}`)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{t('tickets.quantity')}</dt>
                    <dd className="font-medium">{quantity}</dd>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <dt className="font-semibold text-gray-700">{t('booking.total')}</dt>
                    <dd className="font-semibold text-gray-900">
                      {t('menu.price', { value: total })}
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

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={submitting}
                >
                  {submitting
                    ? t('tickets.processing')
                    : `${t('booking.payAndBook')} — ${t('menu.price', { value: total })}`}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="btn-secondary w-full cursor-pointer"
                >
                  {t('common.back')}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext.jsx';

const MEAL_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

const EMPTY_FORM = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  includes_en: '',
  includes_ar: '',
  price_sar: '',
  is_active: true,
};

export default function TicketTypesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const fetchAll = async () => {
    const { data } = await supabase
      .from('ticket_types')
      .select('*')
      .order('ticket_tier')
      .order('meal_type');
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      title_en: row.title_en,
      title_ar: row.title_ar,
      description_en: row.description_en ?? '',
      description_ar: row.description_ar ?? '',
      includes_en: row.includes_en ?? '',
      includes_ar: row.includes_ar ?? '',
      price_sar: String(row.price_sar),
      is_active: row.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setBusy(true);

    const payload = {
      ...form,
      price_sar: Number(form.price_sar),
    };

    const { error } = await supabase
      .from('ticket_types')
      .update(payload)
      .eq('id', editingId);

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t('admin.ticketTypeSaved'));
    setEditingId(null);
    setForm(EMPTY_FORM);
    await fetchAll();
  };

  const handleToggleActive = async (id, current) => {
    const { error } = await supabase
      .from('ticket_types')
      .update({ is_active: !current })
      .eq('id', id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t('admin.ticketTypeSaved'));
    await fetchAll();
  };

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.ticketTypes')}</h1>
        <p className="text-gray-500 mt-1">{t('admin.ticketTypesDesc')}</p>
      </div>

      {/* Edit form */}
      {editingId && (
        <form onSubmit={handleSave} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">
            {t('admin.menuManager.edit')}:{' '}
            {rows.find((r) => r.id === editingId)?.title_en}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('admin.fieldTitleEn')}</label>
              <input
                className="input"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldTitleAr')}</label>
              <input
                className="input"
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldDescriptionEn')}</label>
              <textarea
                className="input"
                rows={2}
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldDescriptionAr')}</label>
              <textarea
                className="input"
                rows={2}
                value={form.description_ar}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldIncludesEn')}</label>
              <textarea
                className="input"
                rows={3}
                value={form.includes_en}
                onChange={(e) => setForm({ ...form, includes_en: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldIncludesAr')}</label>
              <textarea
                className="input"
                rows={3}
                value={form.includes_ar}
                onChange={(e) => setForm({ ...form, includes_ar: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldPrice')}</label>
              <input
                className="input"
                type="number"
                step="0.50"
                min="0"
                value={form.price_sar}
                onChange={(e) => setForm({ ...form, price_sar: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.fieldActive')}</label>
              <label className="relative inline-flex items-center cursor-pointer mt-2">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-kau-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kau-600" />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? t('common.loading') : t('common.save')}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary cursor-pointer">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-start text-gray-500 border-b border-gray-100">
              <th className="py-2 pe-3 text-start">{t('admin.fieldTier')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.colMeal')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.fieldTitleEn')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.colPrice')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.colStatus')}</th>
              <th className="py-2 text-end">
                <span className="sr-only">{t('admin.menuManager.colActions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-400">
                  —
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50">
                <td className="py-2 pe-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      row.ticket_tier === 'economic'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-kau-100 text-kau-800'
                    }`}
                  >
                    {MEAL_ICONS[row.meal_type]}{' '}
                    {t(`tickets.${row.ticket_tier}`)}
                  </span>
                </td>
                <td className="py-2 pe-3">{t(`menu.${row.meal_type}`)}</td>
                <td className="py-2 pe-3 font-medium">{row.title_en}</td>
                <td className="py-2 pe-3 tabular-nums">{row.price_sar} SAR</td>
                <td className="py-2 pe-3">
                  <button
                    onClick={() => handleToggleActive(row.id, row.is_active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      row.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        row.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    {row.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-2 text-end">
                  <button
                    onClick={() => handleEdit(row)}
                    className="text-kau-700 hover:underline cursor-pointer"
                  >
                    {t('admin.menuManager.edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { sundayOf, MEAL_TYPES, DAYS_OF_WEEK } from '../../lib/dates';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const EMPTY_FORM = {
  day_of_week: 0,
  meal_type: 'breakfast',
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  price_sar: '0.00',
  capacity: 100,
  photo_url: '',
};

export default function MenuManagerPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => sundayOf());
  const [weekId, setWeekId] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (currentWeekId = weekId) => {
    if (!currentWeekId) {
      setItems([]);
      return;
    }
    const { data } = await supabase.from('menu_items').select('*').eq('week_id', currentWeekId);
    setItems(data ?? []);
  }, [weekId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('menu_weeks')
        .select('id')
        .eq('week_start', weekStart)
        .maybeSingle();
      if (cancelled) return;
      setWeekId(data?.id ?? null);
      await refresh(data?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [weekStart, refresh]);

  const ensureWeek = async () => {
    if (weekId) return weekId;
    const { data, error } = await supabase
      .from('menu_weeks')
      .insert({ week_start: weekStart, created_by: user.id })
      .select('id')
      .single();
    if (error) throw error;
    setWeekId(data.id);
    return data.id;
  };

  const handleUpload = async (file) => {
    if (!file) return null;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('meal-photos')
      .upload(path, file, {
        contentType: file.type || `image/${ext}`,
        upsert: false,
      });
    if (error) throw error;
    const { data } = supabase.storage.from('meal-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const wId = await ensureWeek();
      const payload = {
        ...form,
        week_id: wId,
        day_of_week: Number(form.day_of_week),
        price_sar: Number(form.price_sar),
        capacity: Number(form.capacity),
      };
      if (editingId) {
        await supabase.from('menu_items').update(payload).eq('id', editingId).throwOnError();
      } else {
        await supabase.from('menu_items').insert(payload).throwOnError();
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      toast.success(t('admin.menuManager.saved'));
      await refresh(wId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      day_of_week: item.day_of_week,
      meal_type: item.meal_type,
      title_en: item.title_en,
      title_ar: item.title_ar,
      description_en: item.description_en ?? '',
      description_ar: item.description_ar ?? '',
      price_sar: String(item.price_sar),
      capacity: item.capacity,
      photo_url: item.photo_url ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.menuManager.deleteConfirm'))) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('admin.menuManager.saved'));
    await refresh();
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('admin.menu')}</h1>

      <div className="card">
        <label className="label" htmlFor="week">
          {t('admin.menuManager.weekStart')}
        </label>
        <input
          id="week"
          type="date"
          className="input max-w-xs"
          value={weekStart}
          onChange={(e) => setWeekStart(sundayOf(e.target.value))}
        />
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold text-gray-900">
          {editingId ? t('admin.menuManager.edit') : t('admin.menuManager.addItem')}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('admin.menuManager.fieldDay')}</label>
            <select
              className="input"
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {t(`menu.${DAY_KEYS[d]}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('admin.menuManager.fieldMealType')}</label>
            <select
              className="input"
              value={form.meal_type}
              onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t(`menu.${m}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('admin.menuManager.fieldTitleEn')}</label>
            <input
              className="input"
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">{t('admin.menuManager.fieldTitleAr')}</label>
            <input
              className="input"
              value={form.title_ar}
              onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t('admin.menuManager.fieldDescriptionEn')}</label>
            <textarea
              className="input"
              rows={2}
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t('admin.menuManager.fieldDescriptionAr')}</label>
            <textarea
              className="input"
              rows={2}
              value={form.description_ar}
              onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('admin.menuManager.fieldPrice')}</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.price_sar}
              onChange={(e) => setForm({ ...form, price_sar: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">{t('admin.menuManager.fieldCapacity')}</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t('admin.menuManager.uploadPhoto')}</label>
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setBusy(true);
                try {
                  const url = await handleUpload(file);
                  setForm((prev) => ({ ...prev, photo_url: url }));
                  toast.success(t('admin.menuManager.saved'));
                } catch (err) {
                  console.error('[upload] failed', err);
                  toast.error(err.message ?? t('common.error'));
                } finally {
                  setBusy(false);
                }
              }}
            />
            {form.photo_url && (
              <img src={form.photo_url} alt="" className="mt-2 h-24 rounded-lg" />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? t('common.loading') : t('common.save')}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-start text-gray-500 border-b border-gray-100">
              <th className="py-2 pe-3 text-start">{t('admin.menuManager.colDay')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.menuManager.colMeal')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.menuManager.colTitle')}</th>
              <th className="py-2 pe-3 text-start">{t('admin.menuManager.colPrice')}</th>
              <th className="py-2 text-end">
                <span className="sr-only">{t('admin.menuManager.colActions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-400">
                  —
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b border-gray-50">
                <td className="py-2 pe-3">{t(`menu.${DAY_KEYS[it.day_of_week]}`)}</td>
                <td className="py-2 pe-3">{t(`menu.${it.meal_type}`)}</td>
                <td className="py-2 pe-3">{it.title_en}</td>
                <td className="py-2 pe-3">{it.price_sar}</td>
                <td className="py-2 text-end space-x-2 rtl:space-x-reverse">
                  <button onClick={() => handleEdit(it)} className="text-kau-700 hover:underline">
                    {t('admin.menuManager.edit')}
                  </button>
                  <button onClick={() => handleDelete(it.id)} className="text-red-600 hover:underline">
                    {t('admin.menuManager.delete')}
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

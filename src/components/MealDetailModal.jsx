import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FireIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function PlateIcon({ className = 'w-12 h-12' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
    </svg>
  );
}

function ModalInner({ item, lang, onClose }) {
  const { t } = useTranslation();

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const title = lang === 'ar' ? item.title_ar : item.title_en;
  const desc = lang === 'ar' ? item.description_ar : item.description_en;
  const calories = item.calories_est ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[85vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto animate-slide-in-up">
        <button
          onClick={onClose}
          className="absolute top-3 end-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm transition-colors cursor-pointer"
          aria-label="Close"
          type="button"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-[45%] shrink-0">
            {item.photo_url ? (
              <img
                src={item.photo_url}
                alt={title}
                className="w-full aspect-square sm:aspect-[4/3] object-cover sm:rounded-s-2xl"
                width={400}
                height={400}
              />
            ) : (
              <div className="w-full aspect-square sm:aspect-[4/3] flex items-center justify-center bg-gray-100 sm:rounded-s-2xl">
                <PlateIcon className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-snug pe-6">{title}</h2>

            {desc && (
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{desc}</p>
            )}

            <div className="mt-auto pt-4">
              <div className="border-t border-gray-100 pt-4" />
              <div className="flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base tabular-nums">
                  {t('menu.calories', { value: calories })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealDetailModal({ item, lang, onClose }) {
  if (!item) return null;

  return createPortal(
    <ModalInner item={item} lang={lang} onClose={onClose} />,
    document.body
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-b from-kau-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-kau-700 uppercase tracking-wider mb-4">
          {t('app.tagline')}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {t('landing.headline')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          {t('landing.subheadline')}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/menu" className="btn-primary">
            {t('landing.ctaBrowse')}
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn-secondary">
              {t('landing.ctaLogin')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

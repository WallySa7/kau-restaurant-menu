import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-kau-700">404</h1>
      <p className="text-gray-600 mt-2 mb-6">Page not found.</p>
      <Link to="/" className="btn-primary inline-flex">
        {t('nav.home')}
      </Link>
    </section>
  );
}

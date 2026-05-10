import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-kau-50 text-kau-800' : 'text-gray-600 hover:text-kau-700 hover:bg-gray-50'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-kau-600 text-white grid place-items-center font-bold">
            K
          </div>
          <span className="font-semibold text-gray-900 hidden sm:inline">{t('app.name')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/menu" className={linkClass}>
            {t('nav.menu')}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/tickets" className={linkClass}>
              {t('nav.tickets')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="btn-secondary !px-3 !py-1.5 text-sm"
            aria-label="Toggle language"
          >
            {t('nav.language')}
          </button>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-sm">
                {t('nav.logout')}
              </button>
            ) : (
              <Link to="/login" className="btn-primary !px-3 !py-1.5 text-sm">
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-700 hover:bg-gray-100"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <NavLink to="/menu" className={linkClass}>
              {t('nav.menu')}
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/tickets" className={linkClass}>
                {t('nav.tickets')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                {t('nav.admin')}
              </NavLink>
            )}
            <div className="border-t border-gray-100 my-2" />
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary justify-start">
                {t('nav.logout')}
              </button>
            ) : (
              <Link to="/login" className="btn-primary justify-start">
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

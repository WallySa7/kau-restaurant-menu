import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';

const SLIDES = [
  { src: '/hero_photo1.png', alt: 'KAU Restaurant hero 1' },
  { src: '/hero_photo2.png', alt: 'KAU Restaurant hero 2' },
  { src: '/hero_photo3.png', alt: 'KAU Restaurant hero 3' },
];

const MAPS_EMBED =
  'https://maps.google.com/maps?q=21.4950027,39.2465524&z=16&output=embed';
const MAPS_LINK =
  'https://maps.app.goo.gl/PH143u2AA6BSu2Je9';

function IconBrowse() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}

function IconQr() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(0);
  const [howRef, howVisible] = useReveal();
  const [locRef, locVisible] = useReveal();

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { icon: <IconBrowse />, titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
    { icon: <IconBook />, titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
    { icon: <IconQr />, titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
  ];

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            width={1400}
            height={933}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/75" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-24 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-kau-300 mb-4">
            {t('app.tagline')}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
            {t('landing.headline')}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.subheadline')}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/menu"
              className="btn-primary px-6 py-3 text-base rounded-xl shadow-lg hover:scale-[1.02] transition-transform duration-200"
            >
              {t('landing.ctaBrowse')}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-base bg-white/15 text-white border border-white/40 hover:bg-white/25 backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
              >
                {t('landing.ctaLogin')}
              </Link>
            )}
          </div>

          {/* Slide indicator dots */}
          <div
            className="flex justify-center gap-2 mt-12"
            role="tablist"
            aria-label="Restaurant image slides"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-transparent ${
                  i === current
                    ? 'w-6 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howRef} className="py-20 bg-kau-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center text-kau-800 mb-3 ${howVisible ? 'animate-section-in' : 'opacity-0'}`}>
            {t('landing.howItWorksTitle')}
          </h2>
          <p className={`text-center text-gray-500 mb-14 max-w-xl mx-auto leading-relaxed ${howVisible ? 'animate-section-in' : 'opacity-0'}`} style={{ animationDelay: '60ms' }}>
            {t('landing.howItWorksDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-sm border border-kau-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${howVisible ? 'animate-section-in' : 'opacity-0'}`}
                style={{ animationDelay: `${120 + i * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-kau-100 text-kau-600 flex items-center justify-center mb-5 shrink-0">
                  {step.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-kau-400 mb-2">
                  {t('landing.step')} {i + 1}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section ref={locRef} className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className={`text-3xl sm:text-4xl font-bold text-center text-kau-800 mb-3 ${locVisible ? 'animate-section-in' : 'opacity-0'}`}>
            {t('landing.locationTitle')}
          </h2>
          <p className={`text-center text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed ${locVisible ? 'animate-section-in' : 'opacity-0'}`} style={{ animationDelay: '80ms' }}>
            {t('landing.locationDesc')}
          </p>
          <div className={`rounded-2xl overflow-hidden shadow-lg border border-kau-100 aspect-[16/7] min-h-[280px] ${locVisible ? 'animate-section-in' : 'opacity-0'}`} style={{ animationDelay: '160ms' }}>
            <iframe
              title="KAU Restaurant Location"
              src={MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex justify-center mt-6">
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base bg-kau-600 text-white hover:bg-kau-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-kau-500 focus:ring-offset-2 cursor-pointer shadow-sm"
            >
              <IconPin />
              {t('landing.openInMaps')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

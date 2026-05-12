import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MAPS_LINK =
  'https://maps.app.goo.gl/PH143u2AA6BSu2Je9';
const KAU_WEBSITE = 'https://www.kau.edu.sa';
const FCIT_WEBSITE = 'https://fcit.kau.edu.sa';

function IconExternal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

const linkCls = 'text-kau-100/70 text-xs hover:text-white transition-colors duration-150 whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-kau-400 rounded';
const disabledCls = 'text-kau-100/30 text-xs whitespace-nowrap cursor-not-allowed select-none';
const headingCls = 'text-kau-400 text-xs font-bold uppercase tracking-widest mb-2';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-kau-600 bg-kau-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main row */}
        <div className="flex flex-wrap gap-x-10 gap-y-6 items-start justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white rounded-lg p-1 shrink-0">
              <img src="/kau_logo.png" alt="KAU Logo" className="h-9 w-auto" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{t('app.name')}</p>
              <p className="text-kau-100/50 text-xs leading-tight">{t('footer.tagline')}</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className={headingCls}>{t('footer.contactTitle')}</p>
            <div className="flex flex-col gap-1">
              <a href={`mailto:${t('footer.contactEmail')}`} className={linkCls}>{t('footer.contactEmail')}</a>
              <a href={`tel:${t('footer.contactPhone').replace(/\s/g, '')}`} className={linkCls}>{t('footer.contactPhone')}</a>
              <span className="text-kau-100/40 text-xs">{t('footer.contactHours')}</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className={headingCls}>{t('footer.locationTitle')}</p>
            <p className="text-kau-100/70 text-xs leading-relaxed mb-1.5" style={{ whiteSpace: 'pre-line' }}>{t('footer.locationAddress')}</p>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-1`}>
              {t('footer.locationMaps')} <IconExternal />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <p className={headingCls}>{t('footer.linksTitle')}</p>
            <div className="flex flex-col gap-1">
              <Link to="/menu" className={linkCls}>{t('footer.linkMenu')}</Link>
              <Link to="/login" className={linkCls}>{t('footer.linkLogin')}</Link>
              <Link to="/register" className={linkCls}>{t('footer.linkRegister')}</Link>
            </div>
          </div>

          {/*/!* Policies *!/*/}
          {/*<div>*/}
          {/*  <p className={headingCls}>{t('footer.policiesTitle')}</p>*/}
          {/*  <div className="flex flex-col gap-1">*/}
          {/*    <span className={disabledCls}>{t('footer.linkPrivacy')}</span>*/}
          {/*    <span className={disabledCls}>{t('footer.linkRefund')}</span>*/}
          {/*    <span className={disabledCls}>{t('footer.linkTerms')}</span>*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* Official Sites */}
          <div>
            <p className={headingCls}>Official Links</p>
            <div className="flex flex-col gap-1">
              <a href={KAU_WEBSITE} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-1`}>
                {t('footer.kauWebsite')} <IconExternal />
              </a>
              <a href={FCIT_WEBSITE} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-1`}>
                {t('footer.fcitWebsite')} <IconExternal />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-kau-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-kau-100/40">
          <span>{t('footer.madeBy')}</span>
          <span>{t('footer.rights', { year })}</span>
        </div>
      </div>
    </footer>
  );
}

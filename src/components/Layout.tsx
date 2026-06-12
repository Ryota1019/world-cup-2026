import { NavLink, Outlet } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import type { DictKey } from '../i18n/dict';

const NAV: { to: string; key: DictKey }[] = [
  { to: '/', key: 'nav.home' },
  { to: '/schedule', key: 'nav.schedule' },
  { to: '/standings', key: 'nav.standings' },
  { to: '/bracket', key: 'nav.bracket' },
  { to: '/third', key: 'nav.third' },
  { to: '/scorers', key: 'nav.scorers' },
  { to: '/players', key: 'nav.players' },
];

export default function Layout() {
  const { t, lang, toggle } = useLang();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div className="leading-tight">
              <div className="font-bold tracking-tight">{t('appTitle')}</div>
              <div className="text-[11px] text-slate-400">{t('appSubtitle')}</div>
            </div>
          </NavLink>
          <button
            onClick={toggle}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            {lang === 'ja' ? 'EN' : '日本語'}
          </button>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2">
          <ul className="flex min-w-max gap-1 pb-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-1.5 font-medium transition ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  {t(n.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-10 border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        {t('footer.disclaimer')}
      </footer>
    </div>
  );
}

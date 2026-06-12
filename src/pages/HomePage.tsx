import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import { getTeam } from '../lib/data';
import MatchCard from '../components/MatchCard';
import type { DictKey } from '../i18n/dict';

const CARDS: { to: string; key: DictKey; icon: string }[] = [
  { to: '/standings', key: 'nav.standings', icon: '📊' },
  { to: '/bracket', key: 'nav.bracket', icon: '🗂️' },
  { to: '/third', key: 'nav.third', icon: '🥉' },
  { to: '/schedule', key: 'nav.schedule', icon: '📅' },
  { to: '/scorers', key: 'nav.scorers', icon: '⚽' },
  { to: '/players', key: 'nav.players', icon: '⭐' },
];

export default function HomePage() {
  const { t, L } = useLang();
  const { matches, resolver, scorers, playedCount } = useTournament();

  const { upcoming, recent } = useMemo(() => {
    const sorted = [...matches].sort((a, b) =>
      (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')),
    );
    return {
      upcoming: sorted.filter((m) => m.status === 'scheduled').slice(0, 6),
      recent: sorted.filter((m) => m.status === 'finished').reverse().slice(0, 6),
    };
  }, [matches]);

  const top = scorers[0];
  const topTeam = top ? getTeam(top.teamId) : undefined;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-slate-900 p-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('home.heroTitle')}</h1>
        <p className="mt-1 text-slate-300">{t('appSubtitle')} · 2026.6.11 – 7.19</p>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <div className="text-2xl font-bold text-emerald-400">{playedCount}/104</div>
            <div className="text-slate-400">{t('home.played')}</div>
          </div>
          {top && (
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {topTeam?.flag} {L(top.player)} · {top.goals}
              </div>
              <div className="text-slate-400">{t('home.topScorer')}</div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {t('home.explore')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-500/50 hover:bg-slate-800"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="font-semibold">{t(c.key)}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold">{t('home.next')}</h2>
            <div className="space-y-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} resolver={resolver} />
              ))}
            </div>
            <Link to="/schedule" className="mt-3 inline-block text-sm text-emerald-400 hover:underline">
              {t('more')} →
            </Link>
          </section>
        )}

        {recent.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-bold">{t('home.recent')}</h2>
            <div className="space-y-2">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} resolver={resolver} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import type { NotablePlayer } from '../lib/types';

export default function PlayersPage() {
  const { t, L } = useLang();
  const { players, teams } = useTournament();

  const byTeam = useMemo(() => {
    const map = new Map<string, NotablePlayer[]>();
    for (const p of players) {
      const arr = map.get(p.teamId) ?? [];
      arr.push(p);
      map.set(p.teamId, arr);
    }
    // チームはデータ順（グループ順）で並べる
    return teams.filter((tm) => map.has(tm.id)).map((tm) => ({ team: tm, list: map.get(tm.id)! }));
  }, [players, teams]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t('players.title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {byTeam.map(({ team, list }) => (
          <div key={team.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">{team.flag}</span>
              <span className="font-bold">{L(team.name)}</span>
              <span className="ml-auto text-xs text-slate-500">
                {t('group')} {team.groupId}
              </span>
            </div>
            <ul className="space-y-3">
              {list.map((p, i) => (
                <li key={i} className="border-t border-slate-800/60 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{L(p.name)}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      {p.position}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{L(p.club)}</div>
                  {p.note && <div className="mt-1 text-xs text-emerald-300/80">{L(p.note)}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

import { GROUP_IDS } from '../lib/types';
import type { GroupId } from '../lib/types';
import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import type { DictKey } from '../i18n/dict';
import type { Resolver } from '../lib/bracket';
import TeamLabel from '../components/TeamLabel';

function GroupTable({ groupId, resolver }: { groupId: GroupId; resolver: Resolver }) {
  const { t } = useLang();
  const rows = resolver.standings[groupId];
  const decided = resolver.decided[groupId];
  const bestThird = resolver.thirdPlace.qualifiedGroups.includes(groupId);

  const cols: DictKey[] = [
    'col.played',
    'col.won',
    'col.drawn',
    'col.lost',
    'col.gf',
    'col.ga',
    'col.gd',
    'col.points',
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <h3 className="font-bold">
          {t('group')} {groupId}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            decided ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/60 text-slate-300'
          }`}
        >
          {decided ? t('decided') : t('projected')}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="text-slate-400">
            <tr>
              <th className="py-1 pl-2 text-center font-medium">{t('col.rank')}</th>
              <th className="py-1 text-left font-medium">{t('col.team')}</th>
              {cols.map((c) => (
                <th key={c} className="px-1.5 py-1 font-medium">
                  {t(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const through = r.rank <= 2;
              const maybeThird = r.rank === 3 && bestThird;
              return (
                <tr
                  key={r.teamId}
                  className={`border-t border-slate-800/60 ${
                    through
                      ? 'bg-emerald-500/10'
                      : maybeThird
                        ? 'bg-amber-400/10'
                        : ''
                  }`}
                >
                  <td
                    className={`py-1.5 text-center font-mono ${
                      through
                        ? 'border-l-2 border-emerald-500'
                        : maybeThird
                          ? 'border-l-2 border-amber-400'
                          : 'border-l-2 border-transparent'
                    }`}
                  >
                    {r.rank}
                  </td>
                  <td className="py-1.5 text-left">
                    <TeamLabel teamId={r.teamId} />
                  </td>
                  <td className="px-1.5">{r.played}</td>
                  <td className="px-1.5">{r.won}</td>
                  <td className="px-1.5">{r.drawn}</td>
                  <td className="px-1.5">{r.lost}</td>
                  <td className="px-1.5">{r.gf}</td>
                  <td className="px-1.5">{r.ga}</td>
                  <td className="px-1.5">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td className="px-1.5 font-bold text-slate-100">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const { t } = useLang();
  const { resolver } = useTournament();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t('nav.standings')}</h1>
      <p className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          {t('qualified')} (1–2)
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
          {t('thirdMaybe')} (3)
        </span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUP_IDS.map((g) => (
          <GroupTable key={g} groupId={g} resolver={resolver} />
        ))}
      </div>
    </div>
  );
}

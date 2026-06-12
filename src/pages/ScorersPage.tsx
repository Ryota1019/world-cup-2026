import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import { getTeam } from '../lib/data';

export default function ScorersPage() {
  const { t, L } = useLang();
  const { scorers } = useTournament();

  if (scorers.length === 0) {
    return (
      <div>
        <h1 className="mb-3 text-2xl font-bold">{t('scorers.title')}</h1>
        <p className="text-slate-400">{t('scorers.empty')}</p>
      </div>
    );
  }

  // 同得点はまとめて同順位表示
  let lastGoals = -1;
  let lastRank = 0;

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold">{t('scorers.title')}</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 text-xs text-slate-400">
            <tr>
              <th className="py-2 pl-3 text-center font-medium">{t('col.rank')}</th>
              <th className="py-2 font-medium">{t('nav.players')}</th>
              <th className="py-2 font-medium">{t('col.team')}</th>
              <th className="py-2 pr-3 text-right font-medium">{t('scorers.goals')}</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s, i) => {
              if (s.goals !== lastGoals) {
                lastRank = i + 1;
                lastGoals = s.goals;
              }
              const team = getTeam(s.teamId);
              return (
                <tr key={`${s.teamId}-${s.player.en}`} className="border-t border-slate-800/60">
                  <td className="py-2 pl-3 text-center font-mono text-slate-400">{lastRank}</td>
                  <td className="py-2 font-medium">{L(s.player)}</td>
                  <td className="py-2 text-slate-300">
                    <span className="mr-1">{team?.flag}</span>
                    {team ? L(team.name) : s.teamId}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className="font-bold text-emerald-400">{s.goals}</span>
                    {s.penalties > 0 && (
                      <span className="ml-1 text-[11px] text-slate-500">
                        {s.penalties}
                        {t('scorers.penalties')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

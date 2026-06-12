import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import TeamLabel from '../components/TeamLabel';

export default function ThirdPlacePage() {
  const { t } = useLang();
  const { resolver } = useTournament();
  const { entries } = resolver.thirdPlace;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t('third.title')}</h1>
      <p className="mb-4 text-sm text-slate-400">{t('third.note')}</p>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-slate-800 text-xs text-slate-400">
            <tr>
              <th className="py-2 pl-3 text-center font-medium">{t('col.rank')}</th>
              <th className="py-2 text-center font-medium">{t('group')}</th>
              <th className="py-2 text-left font-medium">{t('col.team')}</th>
              <th className="px-2 font-medium">{t('col.played')}</th>
              <th className="px-2 font-medium">{t('col.won')}</th>
              <th className="px-2 font-medium">{t('col.drawn')}</th>
              <th className="px-2 font-medium">{t('col.lost')}</th>
              <th className="px-2 font-medium">{t('col.gd')}</th>
              <th className="px-2 pr-3 font-medium">{t('col.points')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.groupId}
                className={`border-t border-slate-800/60 ${
                  e.qualified ? 'bg-emerald-500/10' : 'opacity-70'
                }`}
              >
                <td
                  className={`py-2 pl-3 text-center font-mono ${
                    e.qualified ? 'border-l-2 border-emerald-500' : 'border-l-2 border-transparent'
                  }`}
                >
                  {e.rank}
                </td>
                <td className="text-center font-semibold text-slate-300">{e.groupId}</td>
                <td className="text-left">
                  <TeamLabel teamId={e.record.teamId} />
                </td>
                <td className="px-2">{e.record.played}</td>
                <td className="px-2">{e.record.won}</td>
                <td className="px-2">{e.record.drawn}</td>
                <td className="px-2">{e.record.lost}</td>
                <td className="px-2">{e.record.gd > 0 ? `+${e.record.gd}` : e.record.gd}</td>
                <td className="px-2 pr-3 font-bold text-slate-100">{e.record.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
        {t('qualified')} (1–8)
      </p>
    </div>
  );
}

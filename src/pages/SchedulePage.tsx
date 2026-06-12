import { useMemo, useState } from 'react';
import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import { STAGE_LABEL } from '../i18n/dict';
import { formatDateFull } from '../lib/format';
import MatchCard from '../components/MatchCard';
import { GROUP_IDS, type Stage } from '../lib/types';

const STAGES: Stage[] = ['group', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];

export default function SchedulePage() {
  const { t, lang } = useLang();
  const { matches, resolver } = useTournament();
  const [stage, setStage] = useState<Stage | 'all'>('all');
  const [group, setGroup] = useState<string>('all');

  const filtered = useMemo(() => {
    return matches
      .filter((m) => (stage === 'all' ? true : m.stage === stage))
      .filter((m) => (group === 'all' ? true : m.groupId === group))
      .slice()
      .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));
  }, [matches, stage, group]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const arr = map.get(m.date) ?? [];
      arr.push(m);
      map.set(m.date, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  const selectCls =
    'rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200';

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold">{t('schedule.title')}</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        <select className={selectCls} value={stage} onChange={(e) => setStage(e.target.value as Stage | 'all')}>
          <option value="all">{t('schedule.allStages')}</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {t(STAGE_LABEL[s])}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          disabled={stage !== 'all' && stage !== 'group'}
        >
          <option value="all">{t('schedule.allGroups')}</option>
          {GROUP_IDS.map((g) => (
            <option key={g} value={g}>
              {t('group')} {g}
            </option>
          ))}
        </select>
      </div>

      {byDate.length === 0 && <p className="text-slate-400">{t('schedule.empty')}</p>}

      <div className="space-y-6">
        {byDate.map(([date, ms]) => (
          <section key={date}>
            <h2 className="mb-2 text-sm font-semibold text-emerald-400">
              {formatDateFull(date, lang)}
            </h2>
            <div className="space-y-2">
              {ms.map((m) => (
                <MatchCard key={m.id} match={m} resolver={resolver} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

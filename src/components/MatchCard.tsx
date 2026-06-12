import type { Match } from '../lib/types';
import type { Resolver } from '../lib/bracket';
import TeamLabel from './TeamLabel';
import { useLang } from '../i18n/LanguageContext';
import { formatDate } from '../lib/format';
import { STAGE_LABEL } from '../i18n/dict';

export default function MatchCard({ match, resolver }: { match: Match; resolver: Resolver }) {
  const { t, lang } = useLang();
  const rm = resolver.resolveMatch(match);
  const finished = match.status === 'finished';
  const pens = match.homePens != null && match.awayPens != null;

  const Row = ({ slot, score }: { slot: typeof rm.home; score?: number }) => (
    <div className="flex items-center justify-between gap-2">
      <TeamLabel
        teamId={slot.teamId}
        fallback={slot.label}
        projected={slot.projected}
        className="min-w-0 text-sm"
      />
      <span className="font-mono text-sm tabular-nums text-slate-200">
        {finished ? score : ''}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <div className="w-12 shrink-0 text-[11px] leading-tight text-slate-400">
        <div>{formatDate(match.date, lang)}</div>
        <div>{match.time ?? ''}</div>
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <Row slot={rm.home} score={match.homeScore} />
        <Row slot={rm.away} score={match.awayScore} />
      </div>
      <div className="w-16 shrink-0 text-right text-[10px] leading-tight text-slate-500">
        {finished ? (
          <span className="font-semibold text-emerald-400">
            {pens ? `PK ${match.homePens}-${match.awayPens}` : t('finished')}
          </span>
        ) : (
          t(STAGE_LABEL[match.stage])
        )}
      </div>
    </div>
  );
}

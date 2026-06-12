import { useTournament } from '../lib/useTournament';
import { useLang } from '../i18n/LanguageContext';
import { STAGE_LABEL } from '../i18n/dict';
import TeamLabel from '../components/TeamLabel';
import type { Resolver } from '../lib/bracket';
import type { Match, Stage } from '../lib/types';

const COLUMN_STAGES: Stage[] = ['R32', 'R16', 'QF', 'SF', 'FINAL'];

function BracketMatchCard({ match, resolver }: { match: Match; resolver: Resolver }) {
  const rm = resolver.resolveMatch(match);
  const finished = match.status === 'finished';
  const winner = resolver.winnerTeamId(match.id);

  const Side = ({ slot, score }: { slot: typeof rm.home; score?: number }) => {
    const isWinner = finished && winner != null && slot.teamId === winner;
    return (
      <div className={`flex items-center justify-between gap-2 ${isWinner ? 'font-bold' : ''}`}>
        <TeamLabel
          teamId={slot.teamId}
          fallback={slot.label}
          projected={slot.projected}
          className="min-w-0 text-xs"
        />
        <span className="font-mono text-xs tabular-nums text-slate-300">
          {finished ? score : ''}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5">
      <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wide text-slate-600">
        <span>#{match.id}</span>
        {match.homePens != null && (
          <span className="text-emerald-500">
            PK {match.homePens}-{match.awayPens}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <Side slot={rm.home} score={match.homeScore} />
        <Side slot={rm.away} score={match.awayScore} />
      </div>
    </div>
  );
}

export default function BracketPage() {
  const { t } = useLang();
  const { resolver, matches } = useTournament();

  const byStage = (s: Stage) =>
    matches.filter((m) => m.stage === s).sort((a, b) => a.id - b.id);

  const thirdPlace = matches.find((m) => m.stage === '3RD');

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t('nav.bracket')}</h1>
      <p className="mb-4 text-sm text-slate-400">{t('dataNote')}</p>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {COLUMN_STAGES.map((s) => (
            <div key={s} className="flex w-52 flex-col">
              <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-400">
                {t(STAGE_LABEL[s])}
              </h2>
              <div className="flex flex-1 flex-col justify-around gap-2">
                {byStage(s).map((m) => (
                  <BracketMatchCard key={m.id} match={m} resolver={resolver} />
                ))}
                {s === 'FINAL' && thirdPlace && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {t('stage.3RD')}
                    </h3>
                    <BracketMatchCard match={thirdPlace} resolver={resolver} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

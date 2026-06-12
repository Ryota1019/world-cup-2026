import { getTeam } from '../lib/data';
import { useLang } from '../i18n/LanguageContext';
import type { LocalizedText } from '../lib/types';

interface Props {
  teamId?: string;
  fallback?: LocalizedText;
  projected?: boolean;
  className?: string;
  flagOnly?: boolean;
}

export default function TeamLabel({ teamId, fallback, projected, className = '', flagOnly }: Props) {
  const { L } = useLang();
  const team = teamId ? getTeam(teamId) : undefined;

  if (team) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="text-lg leading-none">{team.flag}</span>
        {!flagOnly && <span className="truncate">{L(team.name)}</span>}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-slate-400 ${projected ? 'italic' : ''} ${className}`}
    >
      <span className="text-slate-600">○</span>
      {!flagOnly && <span className="truncate">{fallback ? L(fallback) : '—'}</span>}
    </span>
  );
}

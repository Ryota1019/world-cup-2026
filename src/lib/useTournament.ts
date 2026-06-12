import { useMemo } from 'react';
import { matches, players, teams } from './data';
import { createResolver } from './bracket';
import { topScorers } from './scorers';

export function useTournament() {
  return useMemo(() => {
    const resolver = createResolver(teams, matches);
    const scorers = topScorers(matches);
    const finished = matches.filter((m) => m.status === 'finished');
    const lastDate = finished.reduce((acc, m) => (m.date > acc ? m.date : acc), '');
    return {
      resolver,
      scorers,
      matches,
      teams,
      players,
      playedCount: finished.length,
      lastDate,
    };
  }, []);
}

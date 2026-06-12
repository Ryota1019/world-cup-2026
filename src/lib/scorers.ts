import type { LocalizedText, Match } from './types';

export interface ScorerRow {
  teamId: string;
  player: LocalizedText;
  goals: number;
  penalties: number;
}

/** 全試合の goals からオウンゴールを除いて得点ランキングを集計する。 */
export function topScorers(matches: Match[]): ScorerRow[] {
  const map = new Map<string, ScorerRow>();
  for (const m of matches) {
    if (!m.goals) continue;
    for (const g of m.goals) {
      if (g.ownGoal) continue;
      const key = `${g.teamId}|${g.player.en}`;
      let row = map.get(key);
      if (!row) {
        row = { teamId: g.teamId, player: g.player, goals: 0, penalties: 0 };
        map.set(key, row);
      }
      row.goals++;
      if (g.penalty) row.penalties++;
    }
  }
  return [...map.values()].sort(
    (a, b) => b.goals - a.goals || a.player.en.localeCompare(b.player.en),
  );
}

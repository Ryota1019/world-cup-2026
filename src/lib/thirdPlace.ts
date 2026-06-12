import { GROUP_IDS } from './types';
import type { GroupId, Match, Team, ThirdPlaceEntry } from './types';
import { computeGroupStandings } from './standings';

/**
 * 全12グループの3位チームを、勝点→得失点差→総得点→フェアプレー→FIFAランキングで並べる。
 * 上位8チーム(=8グループ)が Round of 32 へ進出。
 */
export function rankThirdPlaced(
  teams: Team[],
  matches: Match[],
): { entries: ThirdPlaceEntry[]; qualifiedGroups: GroupId[] } {
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const thirds = GROUP_IDS.map((g) => {
    const standings = computeGroupStandings(g, teams, matches);
    return { groupId: g, record: standings[2] };
  });

  thirds.sort((a, b) => {
    const ra = a.record;
    const rb = b.record;
    if (rb.points !== ra.points) return rb.points - ra.points;
    if (rb.gd !== ra.gd) return rb.gd - ra.gd;
    if (rb.gf !== ra.gf) return rb.gf - ra.gf;
    if (rb.conduct !== ra.conduct) return rb.conduct - ra.conduct;
    const fa = teamById.get(ra.teamId)?.fifaRanking ?? 999;
    const fb = teamById.get(rb.teamId)?.fifaRanking ?? 999;
    if (fa !== fb) return fa - fb;
    return a.groupId.localeCompare(b.groupId);
  });

  const entries: ThirdPlaceEntry[] = thirds.map((t, i) => ({
    groupId: t.groupId,
    record: t.record,
    rank: i + 1,
    qualified: i < 8,
  }));

  const qualifiedGroups = entries
    .filter((e) => e.qualified)
    .map((e) => e.groupId)
    .sort();

  return { entries, qualifiedGroups };
}

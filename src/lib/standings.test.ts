import { describe, it, expect } from 'vitest';
import { computeGroupStandings } from './standings';
import type { GroupId, Match, Team } from './types';

let mid = 0;
function team(id: string, groupId: GroupId, fifaRanking = 100): Team {
  return { id, name: { ja: id, en: id }, groupId, flag: '', fifaRanking };
}
function match(
  groupId: GroupId,
  home: string,
  hs: number,
  away: string,
  as: number,
): Match {
  return {
    id: ++mid,
    stage: 'group',
    groupId,
    date: '2026-06-11',
    venue: { ja: '', en: '' },
    home,
    away,
    status: 'finished',
    homeScore: hs,
    awayScore: as,
  };
}

describe('computeGroupStandings — 2026 tie-breakers', () => {
  it('head-to-head が全体得失点差より優先される（2026の変更点）', () => {
    const g: GroupId = 'A';
    const teams = [team('T1', g), team('T2', g), team('T3', g), team('T4', g)];
    const matches = [
      match(g, 'T1', 1, 'T2', 0), // T1 が直接対決で T2 に勝利
      match(g, 'T1', 3, 'T4', 0),
      match(g, 'T3', 2, 'T1', 0),
      match(g, 'T2', 1, 'T3', 0),
      match(g, 'T2', 4, 'T4', 0),
      match(g, 'T4', 1, 'T3', 0), // 下位の直接対決で T4 が T3 に勝利
    ];
    const order = computeGroupStandings(g, teams, matches).map((r) => r.teamId);
    // T1,T2 は勝点6で並ぶが直接対決で T1>T2（全体GDでは T2 が上）。
    // T3,T4 は勝点3で並ぶが直接対決で T4>T3（全体GDでは T3 が上）。
    expect(order).toEqual(['T1', 'T2', 'T4', 'T3']);
  });

  it('3チーム同点で head-to-head が全く分離しないときは全試合成績で決める', () => {
    const g: GroupId = 'B';
    const teams = [team('A', g), team('B', g), team('C', g), team('D', g)];
    const matches = [
      // A,B,C は総当たりすべて 1-1 引分（head-to-head は完全に同一）
      match(g, 'A', 1, 'B', 1),
      match(g, 'A', 1, 'C', 1),
      match(g, 'B', 1, 'C', 1),
      // D には全員勝利するが得点差が異なる → 全体GDで A>B>C
      match(g, 'A', 5, 'D', 0),
      match(g, 'B', 2, 'D', 0),
      match(g, 'C', 1, 'D', 0),
    ];
    const order = computeGroupStandings(g, teams, matches).map((r) => r.teamId);
    expect(order).toEqual(['A', 'B', 'C', 'D']);
  });

  it('全試合未消化でも FIFA ランキング順で一意に並ぶ', () => {
    const g: GroupId = 'C';
    const teams = [
      team('LOW', g, 30),
      team('TOP', g, 5),
      team('MID', g, 12),
      team('BOT', g, 80),
    ];
    const order = computeGroupStandings(g, teams, []).map((r) => r.teamId);
    expect(order).toEqual(['TOP', 'MID', 'LOW', 'BOT']);
  });

  it('勝点と得失点差で並ぶ基本ケース', () => {
    const g: GroupId = 'D';
    const teams = [team('W', g), team('X', g), team('Y', g), team('Z', g)];
    const matches = [
      match(g, 'W', 3, 'Z', 0),
      match(g, 'X', 1, 'Y', 0),
      match(g, 'W', 1, 'X', 0),
      match(g, 'Y', 2, 'Z', 1),
    ];
    const standings = computeGroupStandings(g, teams, matches);
    expect(standings[0].teamId).toBe('W'); // 2勝6点
    expect(standings.map((r) => r.points)).toEqual([6, 3, 3, 0]);
  });
});

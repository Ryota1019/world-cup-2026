import { describe, it, expect } from 'vitest';
import { rankThirdPlaced } from './thirdPlace';
import { GROUP_IDS } from './types';
import type { Match, Team } from './types';

// 12グループ×4チームの合成データ（FIFAランキングは全チーム異なる）
function allTeams(): Team[] {
  const out: Team[] = [];
  GROUP_IDS.forEach((g, gi) => {
    for (let i = 1; i <= 4; i++) {
      out.push({ id: `${g}${i}`, name: { ja: '', en: '' }, groupId: g, flag: '', fifaRanking: gi * 4 + i });
    }
  });
  return out;
}

let mid = 0;
const gm = (g: string, home: string, hs: number, away: string, as: number): Match => ({
  id: ++mid,
  stage: 'group',
  groupId: g as Match['groupId'],
  date: '2026-06-11',
  venue: { ja: '', en: '' },
  home,
  away,
  status: 'finished',
  homeScore: hs,
  awayScore: as,
});

describe('rankThirdPlaced', () => {
  it('3位チームを12個並べ、上位8グループが進出する', () => {
    const teams = allTeams();
    // グループAだけ総当たりを消化（A1>A2>A3>A4）。Aの3位 A3 は勝点3を持つ。
    const matches = [
      gm('A', 'A1', 1, 'A2', 0),
      gm('A', 'A1', 1, 'A3', 0),
      gm('A', 'A1', 1, 'A4', 0),
      gm('A', 'A2', 1, 'A3', 0),
      gm('A', 'A2', 1, 'A4', 0),
      gm('A', 'A3', 1, 'A4', 0),
    ];
    const { entries, qualifiedGroups } = rankThirdPlaced(teams, matches);

    expect(entries).toHaveLength(12);
    expect(qualifiedGroups).toHaveLength(8);
    // 勝点を持つ A組3位(A3) が3位ランキングの首位
    expect(entries[0].groupId).toBe('A');
    expect(entries[0].record.teamId).toBe('A3');
    expect(entries[0].record.points).toBe(3);
    expect(entries[0].rank).toBe(1);
    expect(entries[0].qualified).toBe(true);
    // ランクは1..12で連番、上位8がqualified
    expect(entries.map((e) => e.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(entries.filter((e) => e.qualified)).toHaveLength(8);
    expect(entries.slice(8).every((e) => !e.qualified)).toBe(true);
  });
});

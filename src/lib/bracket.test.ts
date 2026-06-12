import { describe, it, expect } from 'vitest';
import { thirdPlaceAssignment } from './annexC';
import { createResolver } from './bracket';
import { GROUP_IDS } from './types';
import type { Match, Team } from './types';

function allTeams(): Team[] {
  const out: Team[] = [];
  GROUP_IDS.forEach((g, gi) => {
    for (let i = 1; i <= 4; i++) {
      out.push({ id: `${g}${i}`, name: { ja: '', en: '' }, groupId: g, flag: '', fifaRanking: gi * 4 + i });
    }
  });
  return out;
}

describe('thirdPlaceAssignment (Annex C)', () => {
  it('既知の組合せ EFGHIJKL を正しい3位枠に割り当てる', () => {
    const a = thirdPlaceAssignment(['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
    expect(a).not.toBeNull();
    // Wikipedia Annex C 行1 と一致
    expect(a).toEqual({ 74: 'F', 77: 'G', 79: 'E', 80: 'K', 81: 'I', 82: 'H', 85: 'J', 87: 'L' });
  });

  it('8グループ未満は null', () => {
    expect(thirdPlaceAssignment(['A', 'B', 'C'])).toBeNull();
  });

  it('割り当て先は必ずその試合が受け入れ可能なグループになる', () => {
    const allowed: Record<number, string[]> = {
      74: ['A', 'B', 'C', 'D', 'F'],
      77: ['C', 'D', 'F', 'G', 'H'],
      79: ['C', 'E', 'F', 'H', 'I'],
      80: ['E', 'H', 'I', 'J', 'K'],
      81: ['B', 'E', 'F', 'I', 'J'],
      82: ['A', 'E', 'H', 'I', 'J'],
      85: ['E', 'F', 'G', 'I', 'J'],
      87: ['D', 'E', 'I', 'J', 'L'],
    };
    const a = thirdPlaceAssignment(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])!;
    for (const [mid, g] of Object.entries(a)) {
      expect(allowed[Number(mid)]).toContain(g);
    }
  });
});

describe('createResolver', () => {
  it('グループ未消化でも順位・3位割当を投影し、スロットを解決する', () => {
    const teams = allTeams();
    const r = createResolver(teams, []);
    expect(r.assignment).not.toBeNull();
    // '1A' は A組1位（FIFAランキング最上位 = A1）に投影される
    const slot = r.resolveSlot('1A');
    expect(slot.teamId).toBe('A1');
    expect(slot.projected).toBe(true); // まだ確定していない
    expect(r.thirdPlace.qualifiedGroups).toHaveLength(8);
  });

  it('ノックアウトの結果が入ると勝者が次へ繰り上がる', () => {
    const teams = allTeams();
    const ko: Match = {
      id: 73,
      stage: 'R32',
      date: '2026-06-28',
      venue: { ja: '', en: '' },
      home: '1A',
      away: '1B',
      status: 'finished',
      homeScore: 2,
      awayScore: 1,
    };
    const r = createResolver(teams, [ko]);
    expect(r.winnerTeamId(73)).toBe('A1'); // 1A=A1 が勝者
    expect(r.resolveSlot('W73').teamId).toBe('A1');
  });

  it('引分はPK戦で勝者を判定する', () => {
    const teams = allTeams();
    const ko: Match = {
      id: 73,
      stage: 'R32',
      date: '2026-06-28',
      venue: { ja: '', en: '' },
      home: '1A',
      away: '1B',
      status: 'finished',
      homeScore: 1,
      awayScore: 1,
      homePens: 3,
      awayPens: 4,
    };
    const r = createResolver(teams, [ko]);
    expect(r.winnerTeamId(73)).toBe('B1'); // PKで 1B=B1 が勝利
  });
});

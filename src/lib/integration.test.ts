import { describe, it, expect } from 'vitest';
import { matches, teams, groups } from './data';
import { createResolver } from './bracket';
import { topScorers } from './scorers';
import { GROUP_IDS } from './types';

// 実データ(Wikipedia由来)に対して計算が破綻しないことを確認する。
describe('real data integration', () => {
  it('48チーム / 12グループ / 104試合', () => {
    expect(teams).toHaveLength(48);
    expect(groups).toHaveLength(12);
    expect(matches).toHaveLength(104);
  });

  it('全グループの順位表が4チームで計算できる', () => {
    const r = createResolver(teams, matches);
    for (const g of GROUP_IDS) {
      expect(r.standings[g]).toHaveLength(4);
      expect(r.standings[g][0].rank).toBe(1);
    }
  });

  it('3位ランキングは8チーム進出、Annex C 割当が確定する', () => {
    const r = createResolver(teams, matches);
    expect(r.thirdPlace.entries).toHaveLength(12);
    expect(r.thirdPlace.qualifiedGroups).toHaveLength(8);
    expect(r.assignment).not.toBeNull();
    // 3位枠の8試合すべてにグループが割り当てられる
    expect(Object.keys(r.assignment!)).toHaveLength(8);
  });

  it('R32の対戦カードのラベル/投影が解決できる', () => {
    const r = createResolver(teams, matches);
    const m73 = matches.find((m) => m.id === 73)!;
    const rm = r.resolveMatch(m73);
    expect(rm.home.label.ja).toContain('組');
    expect(rm.home.teamId).toBeDefined(); // 暫定でも投影される
  });

  it('得点ランキングを集計できる', () => {
    const s = topScorers(matches);
    expect(Array.isArray(s)).toBe(true);
    // 開幕済みのため少なくとも1得点はある
    expect(s.length).toBeGreaterThan(0);
  });
});

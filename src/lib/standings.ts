import type { Card, GroupId, Match, Team, TeamRecord } from './types';

// フェアプレー(team conduct)得点: 警告-1 / 2枚目の警告(間接退場)-3 / 一発退場-4 / 警告+一発退場-5
function conductPoints(cards: Card[] | undefined, teamId: string): number {
  if (!cards) return 0;
  let p = 0;
  for (const c of cards) {
    if (c.teamId !== teamId) continue;
    if (c.type === 'Y') p -= 1;
    else if (c.type === '2Y') p -= 3;
    else if (c.type === 'R') p -= 4;
    else if (c.type === 'YR') p -= 5;
  }
  return p;
}

function blank(teamId: string): TeamRecord {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    conduct: 0,
    rank: 0,
  };
}

/**
 * teamIds で指定したチームについて、終了済みかつ「両チームとも teamIds に含まれる」
 * 試合のみから成績を集計する。グループ全体にも head-to-head のミニ表にも使える。
 */
export function buildRecords(teamIds: string[], matches: Match[]): Map<string, TeamRecord> {
  const set = new Set(teamIds);
  const rec = new Map<string, TeamRecord>();
  for (const id of teamIds) rec.set(id, blank(id));

  for (const m of matches) {
    if (m.status !== 'finished') continue;
    if (m.homeScore == null || m.awayScore == null) continue;
    if (!set.has(m.home) || !set.has(m.away)) continue;
    const h = rec.get(m.home)!;
    const a = rec.get(m.away)!;
    h.played++;
    a.played++;
    h.gf += m.homeScore;
    h.ga += m.awayScore;
    a.gf += m.awayScore;
    a.ga += m.homeScore;
    h.conduct += conductPoints(m.cards, m.home);
    a.conduct += conductPoints(m.cards, m.away);
    if (m.homeScore > m.awayScore) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (m.homeScore < m.awayScore) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
      h.points++;
      a.points++;
    }
  }
  for (const r of rec.values()) r.gd = r.gf - r.ga;
  return rec;
}

// 連続する同キー要素をまとめる（ソート済み配列に適用）
function clusterBy<T>(sorted: T[], key: (x: T) => string | number): T[][] {
  const out: T[][] = [];
  for (const item of sorted) {
    const k = key(item);
    const last = out[out.length - 1];
    if (last && key(last[0]) === k) last.push(item);
    else out.push([item]);
  }
  return out;
}

// head-to-head の比較（勝点→得失点差→総得点）。a が上位なら負。
function cmpH2H(a: TeamRecord, b: TeamRecord): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  return b.gf - a.gf;
}

// 全試合成績による最終タイブレーク: 得失点差→総得点→フェアプレー→FIFAランキング→ID
function byOverall(
  ids: string[],
  records: Map<string, TeamRecord>,
  teamById: Map<string, Team>,
): string[] {
  return [...ids].sort((a, b) => {
    const ra = records.get(a)!;
    const rb = records.get(b)!;
    if (rb.gd !== ra.gd) return rb.gd - ra.gd;
    if (rb.gf !== ra.gf) return rb.gf - ra.gf;
    if (rb.conduct !== ra.conduct) return rb.conduct - ra.conduct;
    const fa = teamById.get(a)?.fifaRanking ?? 999;
    const fb = teamById.get(b)?.fifaRanking ?? 999;
    if (fa !== fb) return fa - fb;
    return a.localeCompare(b);
  });
}

/**
 * 勝点が並んだチーム群 cluster を 2026 の公式順で並べ替える。
 * 1) 当該チーム間(head-to-head)の 勝点→得失点差→総得点
 * 2) 一部だけ並びが解消したら、残った同点チームだけで 1) を再適用（再帰）
 * 3) head-to-head で全く分かれない場合は 全試合の 得失点差→総得点→フェアプレー→FIFAランキング
 */
function breakTie(
  cluster: string[],
  matches: Match[],
  records: Map<string, TeamRecord>,
  teamById: Map<string, Team>,
): string[] {
  if (cluster.length === 1) return cluster;

  const h2h = buildRecords(cluster, matches);
  const sorted = [...cluster].sort((a, b) => cmpH2H(h2h.get(a)!, h2h.get(b)!));
  const subs = clusterBy(sorted, (id) => {
    const r = h2h.get(id)!;
    return `${r.points}|${r.gd}|${r.gf}`;
  });

  const out: string[] = [];
  for (const sub of subs) {
    if (sub.length === 1) {
      out.push(sub[0]);
    } else if (sub.length === cluster.length) {
      // head-to-head では全く分離できなかった → 全試合成績で決める
      out.push(...byOverall(sub, records, teamById));
    } else {
      // 残った同点チームだけで head-to-head を再適用
      out.push(...breakTie(sub, matches, records, teamById));
    }
  }
  return out;
}

/**
 * グループの順位表を計算して返す（rank は 1 始まり）。
 * 試合が無い/途中でも、最終的に FIFA ランキングまで落ちて必ず一意に並ぶ。
 */
export function computeGroupStandings(
  groupId: GroupId,
  teams: Team[],
  matches: Match[],
): TeamRecord[] {
  const groupTeams = teams.filter((t) => t.groupId === groupId);
  const teamIds = groupTeams.map((t) => t.id);
  const teamById = new Map(groupTeams.map((t) => [t.id, t]));
  const groupMatches = matches.filter((m) => m.stage === 'group' && m.groupId === groupId);
  const records = buildRecords(teamIds, groupMatches);

  const byPoints = [...teamIds].sort((a, b) => records.get(b)!.points - records.get(a)!.points);
  const clusters = clusterBy(byPoints, (id) => records.get(id)!.points);

  const ordered: string[] = [];
  for (const c of clusters) ordered.push(...breakTie(c, groupMatches, records, teamById));

  return ordered.map((id, i) => {
    const r = records.get(id)!;
    r.rank = i + 1;
    return r;
  });
}

// グループが「確定」か（4チーム総当たり=6試合すべて終了）
export function isGroupDecided(groupId: GroupId, matches: Match[]): boolean {
  const gm = matches.filter((m) => m.stage === 'group' && m.groupId === groupId);
  return gm.length === 6 && gm.every((m) => m.status === 'finished');
}

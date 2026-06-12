import { GROUP_IDS } from './types';
import type { GroupId, LocalizedText, Match, SlotRef, Team, TeamRecord } from './types';
import { computeGroupStandings, isGroupDecided } from './standings';
import { rankThirdPlaced } from './thirdPlace';
import { thirdPlaceAssignment } from './annexC';

// 各3位枠の試合が受け入れ可能なグループ（表示ラベル用）
const THIRD_ALLOWED: Record<number, GroupId[]> = {
  74: ['A', 'B', 'C', 'D', 'F'],
  77: ['C', 'D', 'F', 'G', 'H'],
  79: ['C', 'E', 'F', 'H', 'I'],
  80: ['E', 'H', 'I', 'J', 'K'],
  81: ['B', 'E', 'F', 'I', 'J'],
  82: ['A', 'E', 'H', 'I', 'J'],
  85: ['E', 'F', 'G', 'I', 'J'],
  87: ['D', 'E', 'I', 'J', 'L'],
};

export interface BracketSlot {
  teamId?: string; // 解決済みなら出場チームID
  label: LocalizedText; // 未解決時の説明（例「A組 1位」）
  projected: boolean; // 現時点の暫定（グループ未確定など）か
}

export interface ResolvedMatch {
  match: Match;
  home: BracketSlot;
  away: BracketSlot;
}

export interface Resolver {
  standings: Record<GroupId, TeamRecord[]>;
  decided: Record<GroupId, boolean>;
  thirdPlace: ReturnType<typeof rankThirdPlaced>;
  assignment: Record<number, GroupId> | null;
  resolveSlot(ref: SlotRef): BracketSlot;
  resolveMatch(m: Match): ResolvedMatch;
  winnerTeamId(matchId: number): string | undefined;
}

function slotLabel(ref: SlotRef): LocalizedText {
  let m: RegExpMatchArray | null;
  if (/^1[A-L]$/.test(ref)) return { ja: `${ref[1]}組 1位`, en: `Group ${ref[1]} 1st` };
  if (/^2[A-L]$/.test(ref)) return { ja: `${ref[1]}組 2位`, en: `Group ${ref[1]} 2nd` };
  if ((m = ref.match(/^3RD#(\d+)$/))) {
    const a = (THIRD_ALLOWED[Number(m[1])] ?? []).join('/');
    return { ja: `3位 (${a})`, en: `3rd (${a})` };
  }
  if ((m = ref.match(/^W(\d+)$/))) return { ja: `第${m[1]}試合 勝者`, en: `Winner M${m[1]}` };
  if ((m = ref.match(/^L(\d+)$/))) return { ja: `第${m[1]}試合 敗者`, en: `Loser M${m[1]}` };
  return { ja: ref, en: ref };
}

// 終了した試合の勝者/敗者の枠参照を返す（引分はPK戦で判定）
function outcomeRefs(m: Match): { winRef?: SlotRef; loseRef?: SlotRef } {
  if (m.status !== 'finished' || m.homeScore == null || m.awayScore == null) return {};
  if (m.homeScore > m.awayScore) return { winRef: m.home, loseRef: m.away };
  if (m.homeScore < m.awayScore) return { winRef: m.away, loseRef: m.home };
  if (m.homePens != null && m.awayPens != null && m.homePens !== m.awayPens) {
    return m.homePens > m.awayPens
      ? { winRef: m.home, loseRef: m.away }
      : { winRef: m.away, loseRef: m.home };
  }
  return {};
}

export function createResolver(teams: Team[], matches: Match[]): Resolver {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const standings = {} as Record<GroupId, TeamRecord[]>;
  const decided = {} as Record<GroupId, boolean>;
  for (const g of GROUP_IDS) {
    standings[g] = computeGroupStandings(g, teams, matches);
    decided[g] = isGroupDecided(g, matches);
  }
  const allGroupsDecided = GROUP_IDS.every((g) => decided[g]);
  const thirdPlace = rankThirdPlaced(teams, matches);
  const assignment = thirdPlaceAssignment(thirdPlace.qualifiedGroups);

  const memo = new Map<SlotRef, { teamId?: string; projected: boolean }>();

  function core(ref: SlotRef): { teamId?: string; projected: boolean } {
    const cached = memo.get(ref);
    if (cached) return cached;
    // 再入防止（構造上は循環しないが安全策）
    memo.set(ref, { teamId: undefined, projected: true });

    let res: { teamId?: string; projected: boolean };
    let m: RegExpMatchArray | null;
    if (/^[12][A-L]$/.test(ref)) {
      const pos = ref[0] === '1' ? 0 : 1;
      const g = ref[1] as GroupId;
      res = { teamId: standings[g][pos]?.teamId, projected: !decided[g] };
    } else if ((m = ref.match(/^3RD#(\d+)$/))) {
      const mid = Number(m[1]);
      const g = assignment ? assignment[mid] : undefined;
      res = {
        teamId: g ? standings[g][2]?.teamId : undefined,
        projected: !allGroupsDecided,
      };
    } else if ((m = ref.match(/^W(\d+)$/))) {
      const src = matchById.get(Number(m[1]));
      const { winRef } = src ? outcomeRefs(src) : {};
      res = winRef ? core(winRef) : { teamId: undefined, projected: false };
    } else if ((m = ref.match(/^L(\d+)$/))) {
      const src = matchById.get(Number(m[1]));
      const { loseRef } = src ? outcomeRefs(src) : {};
      res = loseRef ? core(loseRef) : { teamId: undefined, projected: false };
    } else {
      res = { teamId: ref, projected: false }; // チームID直接
    }
    memo.set(ref, res);
    return res;
  }

  const resolveSlot = (ref: SlotRef): BracketSlot => ({ ...core(ref), label: slotLabel(ref) });

  return {
    standings,
    decided,
    thirdPlace,
    assignment,
    resolveSlot,
    resolveMatch: (m) => ({ match: m, home: resolveSlot(m.home), away: resolveSlot(m.away) }),
    winnerTeamId: (id) => {
      const src = matchById.get(id);
      if (!src) return undefined;
      const { winRef } = outcomeRefs(src);
      return winRef ? core(winRef).teamId : undefined;
    },
  };
}

import annexCRaw from '../data/annexC.json';
import type { GroupId } from './types';

// key = 進出する8グループをソートして連結した文字列（例 "EFGHIJKL"）
// value = { "<試合ID>": "<グループ文字>" }  3位枠を入れる試合 → どのグループの3位か
const annexC = annexCRaw as Record<string, Record<string, string>>;

// 3位枠を持つ Round of 32 の試合ID
export const THIRD_PLACE_MATCH_IDS = [74, 77, 79, 80, 81, 82, 85, 87];

/**
 * 進出した8グループの組合せ(495通り)から、各3位枠(試合ID)に入るグループを返す。
 * 8グループに満たない/該当が無い場合は null。
 */
export function thirdPlaceAssignment(
  qualifiedGroups: GroupId[],
): Record<number, GroupId> | null {
  if (qualifiedGroups.length !== 8) return null;
  const key = [...qualifiedGroups].sort().join('');
  const row = annexC[key];
  if (!row) return null;
  const out: Record<number, GroupId> = {};
  for (const [matchId, letter] of Object.entries(row)) {
    out[Number(matchId)] = letter as GroupId;
  }
  return out;
}

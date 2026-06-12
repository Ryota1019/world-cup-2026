// ===== 共通 =====
export type Lang = 'ja' | 'en';

export interface LocalizedText {
  ja: string;
  en: string;
}

export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export const GROUP_IDS: GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
];

export type Stage = 'group' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FINAL';

// ===== データモデル =====
export interface Team {
  id: string; // 例: 'JPN', 'BRA'（ISO3 風の一意キー）
  name: LocalizedText;
  groupId: GroupId;
  flag: string; // 国旗 emoji
  fifaRanking: number; // 小さいほど上位
}

export interface Group {
  id: GroupId;
  teamIds: string[];
}

export interface Goal {
  teamId: string; // 得点したチーム
  player: LocalizedText;
  minute?: number;
  ownGoal?: boolean;
  penalty?: boolean;
}

export type CardType = 'Y' | '2Y' | 'R' | 'YR';
export interface Card {
  teamId: string;
  type: CardType; // Y=警告 / 2Y=2枚目の警告(間接退場) / R=一発退場 / YR=警告+一発退場
}

/**
 * 試合の出場枠表現（SlotRef）
 * - グループ戦: チームID をそのまま指定（例 'JPN'）
 * - ノックアウト:
 *    '1A'..'1L'  … グループ A..L の1位
 *    '2A'..'2L'  … グループ A..L の2位
 *    '3RD#74'    … 第74試合に入る「ベスト3位」枠（Annex C で解決）
 *    'W73'       … 第73試合の勝者
 *    'L101'      … 第101試合の敗者（3位決定戦用）
 */
export type SlotRef = string;

export interface Match {
  id: number; // 1..104
  stage: Stage;
  groupId?: GroupId; // グループ戦のみ
  date: string; // 'YYYY-MM-DD'
  time?: string; // 'HH:mm'（現地）
  venue: LocalizedText;
  home: SlotRef;
  away: SlotRef;
  status: 'scheduled' | 'finished';
  homeScore?: number;
  awayScore?: number;
  homePens?: number; // PK戦（ノックアウトの引分時）
  awayPens?: number;
  goals?: Goal[];
  cards?: Card[];
}

export interface NotablePlayer {
  teamId: string;
  name: LocalizedText;
  position: string; // 'FW' | 'MF' | 'DF' | 'GK'
  club: LocalizedText;
  note?: LocalizedText;
}

// ===== 計算結果 =====
export interface TeamRecord {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // 得点
  ga: number; // 失点
  gd: number; // 得失点差
  points: number;
  conduct: number; // フェアプレー得点（0以下、高いほど良い）
  rank: number; // グループ内順位（1始まり）
}

export interface ThirdPlaceEntry {
  groupId: GroupId;
  record: TeamRecord;
  rank: number; // 3位チーム間の順位（1始まり）
  qualified: boolean; // 上位8に入って進出するか
}

import type { Lang, Stage } from '../lib/types';

type Entry = Record<Lang, string>;

export const dict = {
  appTitle: { ja: 'ワールドカップ 2026', en: 'World Cup 2026' },
  appSubtitle: { ja: 'カナダ・メキシコ・アメリカ', en: 'Canada · Mexico · USA' },

  'nav.home': { ja: 'ホーム', en: 'Home' },
  'nav.schedule': { ja: '試合予定', en: 'Schedule' },
  'nav.standings': { ja: '順位表', en: 'Standings' },
  'nav.bracket': { ja: '決勝T', en: 'Bracket' },
  'nav.third': { ja: '3位ランキング', en: '3rd Place' },
  'nav.scorers': { ja: '得点王', en: 'Scorers' },
  'nav.players': { ja: '注目選手', en: 'Players' },

  group: { ja: 'グループ', en: 'Group' },
  'col.rank': { ja: '#', en: '#' },
  'col.team': { ja: 'チーム', en: 'Team' },
  'col.played': { ja: '試', en: 'P' },
  'col.won': { ja: '勝', en: 'W' },
  'col.drawn': { ja: '分', en: 'D' },
  'col.lost': { ja: '敗', en: 'L' },
  'col.gf': { ja: '得', en: 'GF' },
  'col.ga': { ja: '失', en: 'GA' },
  'col.gd': { ja: '差', en: 'GD' },
  'col.points': { ja: '点', en: 'Pts' },

  qualified: { ja: '突破', en: 'Through' },
  thirdMaybe: { ja: '3位通過枠', en: 'Best 3rd' },
  decided: { ja: '確定', en: 'Decided' },
  projected: { ja: '暫定', en: 'Projected' },

  'stage.group': { ja: 'グループステージ', en: 'Group Stage' },
  'stage.R32': { ja: 'ラウンド32', en: 'Round of 32' },
  'stage.R16': { ja: 'ラウンド16', en: 'Round of 16' },
  'stage.QF': { ja: '準々決勝', en: 'Quarter-finals' },
  'stage.SF': { ja: '準決勝', en: 'Semi-finals' },
  'stage.3RD': { ja: '3位決定戦', en: 'Third place' },
  'stage.FINAL': { ja: '決勝', en: 'Final' },

  'third.title': { ja: '3位チームランキング', en: 'Ranking of Third-placed Teams' },
  'third.note': {
    ja: '各グループ3位を比較し、上位8チームがラウンド32へ進出します。',
    en: 'The eight best third-placed teams advance to the Round of 32.',
  },

  'scorers.title': { ja: '得点ランキング', en: 'Top Scorers' },
  'scorers.goals': { ja: '得点', en: 'Goals' },
  'scorers.penalties': { ja: '(PK)', en: '(pen.)' },
  'scorers.empty': { ja: 'まだ得点はありません。', en: 'No goals scored yet.' },

  'players.title': { ja: '注目選手', en: 'Players to Watch' },
  'players.position': { ja: 'ポジション', en: 'Position' },
  'players.club': { ja: '所属', en: 'Club' },

  'schedule.title': { ja: '試合予定・結果', en: 'Schedule & Results' },
  'schedule.allStages': { ja: '全ステージ', en: 'All stages' },
  'schedule.allGroups': { ja: '全グループ', en: 'All groups' },
  'schedule.empty': { ja: '該当する試合がありません。', en: 'No matches found.' },

  'home.heroTitle': { ja: '第23回 FIFAワールドカップ', en: 'FIFA World Cup 26' },
  'home.next': { ja: '次の試合', en: 'Upcoming Matches' },
  'home.recent': { ja: '最近の結果', en: 'Recent Results' },
  'home.topScorer': { ja: '得点ランキング首位', en: 'Top Scorer' },
  'home.explore': { ja: 'コンテンツ', en: 'Explore' },
  'home.played': { ja: '消化試合', en: 'Matches played' },

  vs: { ja: '対', en: 'vs' },
  finished: { ja: '終了', en: 'FT' },
  more: { ja: 'もっと見る', en: 'See more' },
  dataNote: {
    ja: 'データは手動更新です。最終更新と出典はフッターを参照。',
    en: 'Data is updated manually. See footer for sources.',
  },
  'footer.disclaimer': {
    ja: '非公式のファンサイトです。データ出典: Wikipedia / FIFA。',
    en: 'Unofficial fan site. Data: Wikipedia / FIFA.',
  },
} satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;

export const STAGE_LABEL: Record<Stage, DictKey> = {
  group: 'stage.group',
  R32: 'stage.R32',
  R16: 'stage.R16',
  QF: 'stage.QF',
  SF: 'stage.SF',
  '3RD': 'stage.3RD',
  FINAL: 'stage.FINAL',
};

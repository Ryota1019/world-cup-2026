// 2026 W杯のデータ（チーム/グループ/全104試合）を Wikipedia の wikitext から生成し、
// src/data/{teams,groups,matches}.json を書き出す。
//
//   node scripts/genData.mjs
//
// グループ戦(1-72)は各グループページから、ノックアウト(73-104)は knockout ページから
// 日程・会場を取得。チーム名(日英)・国旗は下の NATIONS 辞書を正とする。
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// FIFAコード → { 日本語名, 英語名, 国旗emoji }
const NATIONS = {
  MEX: { ja: 'メキシコ', en: 'Mexico', flag: '🇲🇽' },
  RSA: { ja: '南アフリカ', en: 'South Africa', flag: '🇿🇦' },
  KOR: { ja: '韓国', en: 'South Korea', flag: '🇰🇷' },
  CZE: { ja: 'チェコ', en: 'Czechia', flag: '🇨🇿' },
  CAN: { ja: 'カナダ', en: 'Canada', flag: '🇨🇦' },
  BIH: { ja: 'ボスニア・ヘルツェゴビナ', en: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  QAT: { ja: 'カタール', en: 'Qatar', flag: '🇶🇦' },
  SUI: { ja: 'スイス', en: 'Switzerland', flag: '🇨🇭' },
  BRA: { ja: 'ブラジル', en: 'Brazil', flag: '🇧🇷' },
  MAR: { ja: 'モロッコ', en: 'Morocco', flag: '🇲🇦' },
  HAI: { ja: 'ハイチ', en: 'Haiti', flag: '🇭🇹' },
  SCO: { ja: 'スコットランド', en: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  USA: { ja: 'アメリカ', en: 'United States', flag: '🇺🇸' },
  PAR: { ja: 'パラグアイ', en: 'Paraguay', flag: '🇵🇾' },
  AUS: { ja: 'オーストラリア', en: 'Australia', flag: '🇦🇺' },
  TUR: { ja: 'トルコ', en: 'Türkiye', flag: '🇹🇷' },
  GER: { ja: 'ドイツ', en: 'Germany', flag: '🇩🇪' },
  CUW: { ja: 'キュラソー', en: 'Curaçao', flag: '🇨🇼' },
  CIV: { ja: 'コートジボワール', en: 'Ivory Coast', flag: '🇨🇮' },
  ECU: { ja: 'エクアドル', en: 'Ecuador', flag: '🇪🇨' },
  NED: { ja: 'オランダ', en: 'Netherlands', flag: '🇳🇱' },
  JPN: { ja: '日本', en: 'Japan', flag: '🇯🇵' },
  SWE: { ja: 'スウェーデン', en: 'Sweden', flag: '🇸🇪' },
  TUN: { ja: 'チュニジア', en: 'Tunisia', flag: '🇹🇳' },
  BEL: { ja: 'ベルギー', en: 'Belgium', flag: '🇧🇪' },
  EGY: { ja: 'エジプト', en: 'Egypt', flag: '🇪🇬' },
  IRN: { ja: 'イラン', en: 'Iran', flag: '🇮🇷' },
  NZL: { ja: 'ニュージーランド', en: 'New Zealand', flag: '🇳🇿' },
  ESP: { ja: 'スペイン', en: 'Spain', flag: '🇪🇸' },
  CPV: { ja: 'カーボベルデ', en: 'Cape Verde', flag: '🇨🇻' },
  KSA: { ja: 'サウジアラビア', en: 'Saudi Arabia', flag: '🇸🇦' },
  URU: { ja: 'ウルグアイ', en: 'Uruguay', flag: '🇺🇾' },
  FRA: { ja: 'フランス', en: 'France', flag: '🇫🇷' },
  SEN: { ja: 'セネガル', en: 'Senegal', flag: '🇸🇳' },
  IRQ: { ja: 'イラク', en: 'Iraq', flag: '🇮🇶' },
  NOR: { ja: 'ノルウェー', en: 'Norway', flag: '🇳🇴' },
  ARG: { ja: 'アルゼンチン', en: 'Argentina', flag: '🇦🇷' },
  ALG: { ja: 'アルジェリア', en: 'Algeria', flag: '🇩🇿' },
  AUT: { ja: 'オーストリア', en: 'Austria', flag: '🇦🇹' },
  JOR: { ja: 'ヨルダン', en: 'Jordan', flag: '🇯🇴' },
  POR: { ja: 'ポルトガル', en: 'Portugal', flag: '🇵🇹' },
  COD: { ja: 'コンゴ民主共和国', en: 'DR Congo', flag: '🇨🇩' },
  UZB: { ja: 'ウズベキスタン', en: 'Uzbekistan', flag: '🇺🇿' },
  COL: { ja: 'コロンビア', en: 'Colombia', flag: '🇨🇴' },
  ENG: { ja: 'イングランド', en: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  CRO: { ja: 'クロアチア', en: 'Croatia', flag: '🇭🇷' },
  GHA: { ja: 'ガーナ', en: 'Ghana', flag: '🇬🇭' },
  PAN: { ja: 'パナマ', en: 'Panama', flag: '🇵🇦' },
};

// ノックアウトの固定構造（出場枠）。日程・会場は knockout ページから補完。
const KO_STRUCTURE = [
  { id: 73, stage: 'R32', home: '2A', away: '2B' },
  { id: 74, stage: 'R32', home: '1E', away: '3RD#74' },
  { id: 75, stage: 'R32', home: '1F', away: '2C' },
  { id: 76, stage: 'R32', home: '1C', away: '2F' },
  { id: 77, stage: 'R32', home: '1I', away: '3RD#77' },
  { id: 78, stage: 'R32', home: '2E', away: '2I' },
  { id: 79, stage: 'R32', home: '1A', away: '3RD#79' },
  { id: 80, stage: 'R32', home: '1L', away: '3RD#80' },
  { id: 81, stage: 'R32', home: '1D', away: '3RD#81' },
  { id: 82, stage: 'R32', home: '1G', away: '3RD#82' },
  { id: 83, stage: 'R32', home: '2K', away: '2L' },
  { id: 84, stage: 'R32', home: '1H', away: '2J' },
  { id: 85, stage: 'R32', home: '1B', away: '3RD#85' },
  { id: 86, stage: 'R32', home: '1J', away: '2H' },
  { id: 87, stage: 'R32', home: '1K', away: '3RD#87' },
  { id: 88, stage: 'R32', home: '2D', away: '2G' },
  { id: 89, stage: 'R16', home: 'W73', away: 'W75' },
  { id: 90, stage: 'R16', home: 'W74', away: 'W77' },
  { id: 91, stage: 'R16', home: 'W76', away: 'W78' },
  { id: 92, stage: 'R16', home: 'W79', away: 'W80' },
  { id: 93, stage: 'R16', home: 'W83', away: 'W84' },
  { id: 94, stage: 'R16', home: 'W81', away: 'W82' },
  { id: 95, stage: 'R16', home: 'W86', away: 'W88' },
  { id: 96, stage: 'R16', home: 'W85', away: 'W87' },
  { id: 97, stage: 'QF', home: 'W89', away: 'W90' },
  { id: 98, stage: 'QF', home: 'W93', away: 'W94' },
  { id: 99, stage: 'QF', home: 'W91', away: 'W92' },
  { id: 100, stage: 'QF', home: 'W95', away: 'W96' },
  { id: 101, stage: 'SF', home: 'W97', away: 'W98' },
  { id: 102, stage: 'SF', home: 'W99', away: 'W100' },
  { id: 103, stage: '3RD', home: 'L101', away: 'L102' },
  { id: 104, stage: 'FINAL', home: 'W101', away: 'W102' },
];

const UA = { headers: { 'User-Agent': 'wc2026-site/1.0 (educational)' } };
const raw = (title) =>
  `https://en.wikipedia.org/w/index.php?title=${encodeURIComponent(title)}&action=raw`;

async function fetchText(title) {
  const res = await fetch(raw(title), UA);
  if (!res.ok) throw new Error(`${title}: HTTP ${res.status}`);
  return res.text();
}

// ---- パース補助 ----
function stripLinks(s) {
  return s
    .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, '$1') // [[A|B]] -> B
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // [[A]] -> A
    .replace(/<!--.*?-->/g, '')
    .replace(/'''/g, '')
    .trim();
}

function parseDate(block) {
  const m = block.match(/\{\{Start date\|(\d{4})\|(\d{1,2})\|(\d{1,2})/i);
  if (!m) return undefined;
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

function parseTime(block) {
  const m = block.match(/\|time=\s*(\d{1,2}):(\d{2})(?:&nbsp;|\s)*([ap])\.?m\.?/i);
  if (!m) return undefined;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toLowerCase();
  if (ap === 'p' && h !== 12) h += 12;
  if (ap === 'a' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function parseVenue(block) {
  const m = block.match(/\|stadium=([^\n]*)/);
  if (!m) return { ja: 'TBD', en: 'TBD' };
  const v = stripLinks(m[1]).replace(/\s+/g, ' ').trim();
  return { ja: v || 'TBD', en: v || 'TBD' };
}

function parseScore(block) {
  // |score={{score link|<anchor>|<label>}} の <label> を見る
  const line = block.match(/\|score=([^\n]*)/);
  if (!line) return undefined;
  // 最後の | から }} までを label とする
  const lm = line[1].match(/\|([^|}]*)\}\}/);
  const label = lm ? lm[1] : line[1];
  const sm = label.match(/(\d+)\s*[–\-−]\s*(\d+)/);
  if (!sm) return undefined;
  return { home: parseInt(sm[1], 10), away: parseInt(sm[2], 10) };
}

function parseGoals(block, marker, teamId) {
  // |goals1= ... 次の | パラメータまで
  const re = new RegExp(`\\|${marker}=([\\s\\S]*?)\\n\\|`, 'm');
  const m = block.match(re);
  if (!m) return [];
  const goals = [];
  for (const lineRaw of m[1].split('\n')) {
    const line = lineRaw.trim();
    if (!line.startsWith('*')) continue;
    const nameM = line.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
    const name = nameM ? (nameM[2] || nameM[1]).trim() : stripLinks(line.replace(/^\*/, '')).trim();
    const ownGoal = /\(o\.?g\.?\)/i.test(line);
    const penalty = /\(pen\.?\)/i.test(line);
    const minutes = [...line.matchAll(/(\d+(?:\+\d+)?)'/g)].map((x) => x[1]);
    if (minutes.length === 0) {
      goals.push({ teamId, player: { ja: name, en: name }, ownGoal, penalty });
    } else {
      for (const mn of minutes) {
        const minute = parseInt(mn, 10);
        goals.push({ teamId, player: { ja: name, en: name }, minute, ownGoal, penalty });
      }
    }
  }
  return goals;
}

function flagCode(s) {
  const m = s.match(/flag\|fb(?:-rt)?\|([A-Z]{3})/);
  return m ? m[1] : undefined;
}

// ---- グループページ ----
const teams = [];
const groups = [];
const groupMatches = [];

for (const g of GROUPS) {
  const text = await fetchText(`2026 FIFA World Cup Group ${g}`);

  // チーム（出場枠順 + 6月2026のFIFAランキング = 行末の最終セル）
  const teamRows = [...text.matchAll(/^\|\s*([A-L])([1-4])\s*\|\|([^\n]*)$/gm)];
  const groupTeamIds = [];
  for (const row of teamRows) {
    if (row[1] !== g) continue;
    const pos = parseInt(row[2], 10);
    const rest = row[3];
    const code = flagCode(rest);
    if (!code) throw new Error(`Group ${g} pos ${pos}: code not found`);
    const cells = rest.split('||');
    const lastCell = cells[cells.length - 1];
    const rankM = lastCell.match(/(\d+)/);
    const fifaRanking = rankM ? parseInt(rankM[1], 10) : 999;
    const nat = NATIONS[code];
    if (!nat) throw new Error(`Unknown nation code: ${code}`);
    teams[teamGlobalIndex(g, pos)] = {
      id: code,
      name: { ja: nat.ja, en: nat.en },
      groupId: g,
      flag: nat.flag,
      fifaRanking,
      _pos: pos,
    };
    groupTeamIds[pos - 1] = code;
  }
  groups.push({ id: g, teamIds: groupTeamIds });

  // 試合（セクション X1..X6）
  for (let n = 1; n <= 6; n++) {
    const secRe = new RegExp(
      `<section begin="?${g}${n}"?\\s*/>([\\s\\S]*?)<section end="?${g}${n}"?\\s*/>`,
    );
    const sec = text.match(secRe);
    if (!sec) throw new Error(`Group ${g} section ${n} not found`);
    const block = sec[1];
    const home = flagCode(block.slice(block.indexOf('|team1=')));
    const away = flagCode(block.slice(block.indexOf('|team2=')));
    if (!home || !away) throw new Error(`Group ${g}${n}: team codes missing`);
    const date = parseDate(block);
    const time = parseTime(block);
    const venue = parseVenue(block);
    const score = parseScore(block);
    const goals = [
      ...parseGoals(block, 'goals1', home),
      ...parseGoals(block, 'goals2', away),
    ];
    groupMatches.push({
      stage: 'group',
      groupId: g,
      date,
      time,
      venue,
      home,
      away,
      status: score ? 'finished' : 'scheduled',
      homeScore: score?.home,
      awayScore: score?.away,
      goals: goals.length ? goals : undefined,
    });
  }
}

function teamGlobalIndex(g, pos) {
  return GROUPS.indexOf(g) * 4 + (pos - 1);
}

// グループ戦の試合IDを日程順（同日は時刻順）に 1..72 で採番
groupMatches.sort((a, b) =>
  (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')),
);
groupMatches.forEach((m, i) => {
  m.id = i + 1;
});

// ---- ノックアウト 日程・会場 ----
// 決勝(104)の football box は別ページに分離されているため両方を結合して解析。
const koText =
  (await fetchText('2026 FIFA World Cup knockout stage')) +
  '\n' +
  (await fetchText('2026 FIFA World Cup final'));
const koInfo = {}; // matchId -> { date, time, venue }
for (const sec of koText.matchAll(/\{\{#invoke:football box\|main([\s\S]*?)\}\}<section end/g)) {
  const block = sec[1];
  // 試合番号は score link の「ラベル」(最後の | から }} まで)に入っている。
  // anchor 側にも "Winner Match 74 vs ..." と数字が出るため、ラベルだけを見る。
  const scoreLine = block.match(/\|score=([^\n]*)/);
  if (!scoreLine) continue;
  const sl = scoreLine[1].match(/\{\{score link\|([^}]*)\}\}/);
  if (!sl) continue;
  // score link の引数のうち、ちょうど "Match NN" の形のものがラベル(試合番号)。
  // anchor 側にも "Winner Match 74 vs ..." と出るので完全一致で拾う。
  const seg = sl[1].split('|').find((s) => /^\s*Match\s+\d+\s*$/.test(s));
  if (!seg) continue;
  const id = parseInt(seg.match(/\d+/)[0], 10);
  koInfo[id] = { date: parseDate(block), time: parseTime(block), venue: parseVenue(block) };
}

const koMatches = KO_STRUCTURE.map((k) => {
  const info = koInfo[k.id] ?? {};
  return {
    id: k.id,
    stage: k.stage,
    date: info.date ?? '2026-07-01',
    time: info.time,
    venue: info.venue ?? { ja: 'TBD', en: 'TBD' },
    home: k.home,
    away: k.away,
    status: 'scheduled',
  };
});

// ---- 書き出し ----
const cleanTeams = teams.map(({ _pos, ...t }) => t);
const matches = [...groupMatches, ...koMatches];

// 妥当性チェック
if (cleanTeams.length !== 48) throw new Error(`teams=${cleanTeams.length}`);
if (groups.length !== 12) throw new Error(`groups=${groups.length}`);
if (groupMatches.length !== 72) throw new Error(`groupMatches=${groupMatches.length}`);
if (matches.length !== 104) throw new Error(`matches=${matches.length}`);

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
await mkdir(dataDir, { recursive: true });
await writeFile(join(dataDir, 'teams.json'), JSON.stringify(cleanTeams, null, 2) + '\n');
await writeFile(join(dataDir, 'groups.json'), JSON.stringify(groups, null, 2) + '\n');
await writeFile(join(dataDir, 'matches.json'), JSON.stringify(matches, null, 2) + '\n');

const played = groupMatches.filter((m) => m.status === 'finished').length;
const goalCount = groupMatches.reduce((s, m) => s + (m.goals?.length ?? 0), 0);
console.log(
  `teams=${cleanTeams.length} groups=${groups.length} matches=${matches.length} ` +
    `(group played=${played}, goals parsed=${goalCount})`,
);

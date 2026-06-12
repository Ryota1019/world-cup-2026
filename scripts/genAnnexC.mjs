// FIFA Annex C（ベスト3位チームの Round of 32 割当, 495通り）を
// Wikipedia のテンプレート wikitext から生成して src/data/annexC.json に書き出す。
//
//   node scripts/genAnnexC.mjs
//
// 生成物（annexC.json）はリポジトリにコミットされるため、再実行は任意。
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC =
  'https://en.wikipedia.org/w/index.php?title=Template:2026_FIFA_World_Cup_third-place_table&action=raw';

// テンプレートの割当列（1A,1B,1D,1E,1G,1I,1K,1L）→ 対応する Round of 32 試合ID
const COLUMN_MATCH_IDS = [79, 85, 81, 74, 82, 77, 87, 80];

// 各3位枠が受け入れ可能なグループ（検証用）
const ALLOWED = {
  74: ['A', 'B', 'C', 'D', 'F'],
  77: ['C', 'D', 'F', 'G', 'H'],
  79: ['C', 'E', 'F', 'H', 'I'],
  80: ['E', 'H', 'I', 'J', 'K'],
  81: ['B', 'E', 'F', 'I', 'J'],
  82: ['A', 'E', 'H', 'I', 'J'],
  85: ['E', 'F', 'G', 'I', 'J'],
  87: ['D', 'E', 'I', 'J', 'L'],
};

const res = await fetch(SRC, { headers: { 'User-Agent': 'wc2026-site/1.0' } });
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const text = await res.text();

// "! scope=\"row\" | <N>" ごとに行を分割
const chunks = text.split(/!\s*scope="row"\s*\|/).slice(1);

/** @type {Record<string, Record<string, string>>} */
const table = {};
let count = 0;

for (const chunk of chunks) {
  // 行番号（先頭の数字）を消してから 3X トークンを抽出
  const body = chunk.replace(/^\s*\d+/, '');
  const tokens = [...body.matchAll(/3([A-L])\b/g)].map((m) => m[1]);
  if (tokens.length < 8) continue; // ヘッダ等の混入をスキップ
  const eight = tokens.slice(0, 8);

  /** @type {Record<string, string>} */
  const assign = {};
  eight.forEach((letter, i) => {
    const matchId = COLUMN_MATCH_IDS[i];
    if (!ALLOWED[matchId].includes(letter)) {
      throw new Error(
        `invalid assignment: match ${matchId} cannot host group ${letter} (row ${count + 1})`,
      );
    }
    assign[matchId] = letter;
  });

  const key = [...eight].sort().join('');
  if (key.length !== 8 || new Set(eight).size !== 8) {
    throw new Error(`bad combo key "${key}" at row ${count + 1}`);
  }
  table[key] = assign;
  count++;
}

const expected = 495; // C(12,8)
if (count !== expected) {
  throw new Error(`parsed ${count} rows, expected ${expected}`);
}
if (Object.keys(table).length !== expected) {
  throw new Error(`duplicate combos: ${Object.keys(table).length} unique of ${count}`);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const outFile = join(outDir, 'annexC.json');
await writeFile(outFile, JSON.stringify(table, null, 0) + '\n', 'utf8');
console.log(`Wrote ${count} combinations to ${outFile}`);

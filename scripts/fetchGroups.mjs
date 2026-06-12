// 12個のグループページの wikitext を取得してキャッシュし、各グループの
// チームコード（出場枠順 X1..X4）と試合数を一覧表示する（データ整備の下調べ用）。
import { writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const cacheDir = join(tmpdir(), 'wc2026-groups');
await mkdir(cacheDir, { recursive: true });

for (const g of GROUPS) {
  const url = `https://en.wikipedia.org/w/index.php?title=2026_FIFA_World_Cup_Group_${g}&action=raw`;
  const res = await fetch(url, { headers: { 'User-Agent': 'wc2026-site/1.0' } });
  if (!res.ok) throw new Error(`Group ${g}: HTTP ${res.status}`);
  const text = await res.text();
  await writeFile(join(cacheDir, `${g}.wiki`), text, 'utf8');

  // Teams テーブル: 行 "| A1 || {{#invoke:flag|fb|MEX}} || ..." から position と code を抽出
  const teamRe = new RegExp(`\\|\\s*${g}([1-4])\\s*\\|\\|[^\\n]*?flag\\|fb\\|([A-Z]{3})`, 'g');
  const teams = [];
  for (const m of text.matchAll(teamRe)) teams[+m[1] - 1] = m[2];
  const sections = [...text.matchAll(/<section begin="?[A-L]\d"?\s*\/>/g)].length;
  console.log(`Group ${g}: ${teams.join(', ')}  (sections: ${sections})`);
}
console.log(`\nCached to ${cacheDir}`);

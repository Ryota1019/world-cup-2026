# ⚽ ワールドカップ 2026 情報サイト / FIFA World Cup 2026 Hub

2026 FIFAワールドカップ（カナダ・メキシコ・アメリカ / 48チーム・12グループ）の
**順位表・決勝トーナメント・3位チームランキング・試合予定・得点王・注目選手**を
まとめた、日本語＋英語のサイトです。

試合結果（JSON）を編集すると、

- グループ順位表（2026年の公式タイブレーク順）
- 「このまま行った場合」の決勝トーナメント組み合わせ（ラウンド32〜決勝）
- 12グループの3位チーム同士のランキング（上位8チームが進出）
- 得点ランキング

が **すべて自動で再計算** され、`main` に push すると **GitHub Pages へ自動デプロイ**されます。
手作業はスコアの入力だけです。

- 技術: React + Vite + TypeScript / Tailwind CSS / 計算ロジックは Vitest でテスト
- ルーティング: HashRouter（GitHub Pages のサブパスでもそのまま動作）

---

## ローカルで動かす

```bash
npm install
npm run dev        # 開発サーバー（http://localhost:5173）
npm run build      # 本番ビルド（dist/）
npm run preview    # ビルド結果をプレビュー
npm run test       # 計算ロジック＋全ページ描画テスト
npm run typecheck  # 型チェック
```

---

## 試合結果の入力方法（いちばん大事）

正データは [`src/data/matches.json`](src/data/matches.json) の1ファイルです。
試合を見つけて、結果を書き込みます。

### グループステージ / ノックアウト共通

```jsonc
{
  "id": 1,
  "stage": "group",
  "status": "finished",     // "scheduled" → "finished" に変更
  "homeScore": 2,           // 追記
  "awayScore": 0,           // 追記
  "goals": [                // 任意（得点ランキングに反映）
    { "teamId": "MEX", "player": { "ja": "ヒメネス", "en": "Jiménez" }, "minute": 67 }
  ]
}
```

### ノックアウトが引き分け → PK戦

```jsonc
{
  "status": "finished",
  "homeScore": 1, "awayScore": 1,
  "homePens": 4, "awayPens": 3   // PKで勝った側が次へ自動で進む
}
```

- ノックアウトの `home` / `away` は `"1A"`(A組1位)・`"2B"`(B組2位)・`"W73"`(第73試合の勝者)
  などの **枠** で書かれており、グループ順位やノックアウトの結果から自動で実チームに解決されます。
- 反則カードを入れたい場合は `"cards": [{ "teamId": "MEX", "type": "Y" }]`
  （`Y`=警告 / `2Y`=2枚目の警告 / `R`=一発退場 / `YR`=警告+一発退場）。フェアプレー順位に使われます。

### 注目選手・チーム

- 注目選手: [`src/data/players.json`](src/data/players.json)
- チーム名・国旗・FIFAランキング: [`src/data/teams.json`](src/data/teams.json)

---

## GitHub Pages で公開する

1. GitHub で新しいリポジトリを作成し、このフォルダを push する。
   ```bash
   git init && git add -A && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする。
3. 以降は `main` に push するたびに [.github/workflows/deploy.yml](.github/workflows/deploy.yml) が
   テスト→ビルド→デプロイを自動実行。公開URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）で誰でも閲覧できます。

> base は `'./'`、ルーティングは HashRouter なので、リポジトリ名を設定に書く必要はありません。

---

## データの再生成（任意）

初期データは Wikipedia の公開情報から下記スクリプトで生成済みです。再取得したいときのみ実行します。

```bash
node scripts/genData.mjs    # teams / groups / matches（日程・会場・既出の結果）
node scripts/genAnnexC.mjs  # Annex C（ベスト3位の組合せ495通り）
```

---

## 大会フォーマットと順位決定（2026年）

**グループ順位**（勝点が同じチーム間）:
1. 当該チーム間の勝点 → 2. 当該チーム間の得失点差 → 3. 当該チーム間の総得点
（一部だけ決着したら残りで再適用）→ 4. 全試合の得失点差 → 5. 全試合の総得点
→ 6. フェアプレー得点 → 7. FIFAランキング

**3位チームランキング**: 勝点 → 得失点差 → 総得点 → フェアプレー → FIFAランキング（上位8チームが進出）。
進出した8グループの組合せから、FIFA規定 **Annex C**（495通り）に従って各3位枠が自動で割り当てられます。

> タイブレーク順は2026年で変更されています（直接対決が全体得失点差より優先）。
> 実装は公開情報ベースです。出典: FIFA公式 / Wikipedia。**非公式のファンサイト**です。

---

## ディレクトリ構成

```
src/
  data/      teams.json groups.json matches.json players.json annexC.json
  lib/       standings.ts thirdPlace.ts bracket.ts annexC.ts scorers.ts (+ *.test.ts)
  i18n/      LanguageContext.tsx dict.ts
  components/ Layout MatchCard TeamLabel
  pages/     HomePage SchedulePage StandingsPage BracketPage ThirdPlacePage ScorersPage PlayersPage
scripts/     genData.mjs genAnnexC.mjs fetchGroups.mjs
```

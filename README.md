# cafe apart メニュー表

店頭・テーブル用の印刷メニュー（A4 縦・2ページ）。
色・フォント・ロゴはホームページ（`../cafe-apart-hp`）に合わせています。

| ページ | 内容 |
| --- | --- |
| 1 | Coffee & Drinks / T2 Tea / Limited |
| 2 | Food / Sweets / Kids |

## 使い方

1. `index.html` をブラウザで開く（`npm start` でローカルサーバーも可）
2. 「印刷 / PDF保存」ボタン → 用紙 A4・余白なし・背景のグラフィック ON で印刷

## メニューの更新

メニュー内容はホームページと同じ Google スプレッドシートが元データです。
スプレッドシートを編集したあと、次のコマンドで `data/` を更新します。

```sh
npm run sync                        # スプレッドシートから取得
node scripts/sync-menu.mjs foo.csv  # 手元の CSV から生成する場合
```

- `data/menu.csv` … 取得した CSV のスナップショット
- `data/menu-data.js` … 表示用データ（自動生成・直接編集しない）

## レイアウトの調整

- どのカテゴリをどのページ・列に置くか: `index.html` の `data-sections`
- カテゴリ見出し・サブタイトル: `menu.js` の `SECTIONS`
- 印刷メニューに出さない品目: `menu.js` の `HIDDEN_TITLES`（例: 頑張るアルバイトさん）
- T2 / Kids は共通価格を見出しに出し、各品目の価格は共通価格と違う場合のみ表示

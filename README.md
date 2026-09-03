# 文庫本（縦書き）の自動組版テンプレート

Vivliostyle を使用した文庫本（A6 判・縦組み）執筆のためのテンプレートリポジトリ．
Markdown で原稿を書き，1 コマンドで PDF を生成する．
横組みの技術書向けには [tomio2480/techbook-template](https://github.com/tomio2480/techbook-template) がある．

## 📋 目次

<!-- 断片の先頭のハイフンは見出しの絵文字によるもの．GitHub が生成するアンカーに合わせてある． -->

- [機能](#-機能)
- [必要環境](#-必要環境)
- [セットアップ](#-セットアップ)
- [使い方](#-使い方)
- [原稿の書き方](#️-原稿の書き方)
- [ディレクトリ構造](#-ディレクトリ構造)
- [版面の調整](#-版面の調整)
- [GitHub 運用](#️-github-運用)
- [トラブルシューティング](#-トラブルシューティング)

## 🔧 機能

- Markdown（VFM）による執筆
- A6 判・縦組み・1 段の PDF 生成
- 版面を「文字サイズ・1 行の字数・1 ページの行数・のど」の 4 値で指定
- 小口側の柱（左ページは章題，右ページは書名）とノンブル
- 扉・目次・奥付の自動生成（扉・目次・奥付には柱とノンブルを出さない）
- 章題の改ページと行取り（章題 4 行取り，節題 2 行取り）
- 段落の 1 字下げと，会話文（開き括弧で始まる段落）の天付き
- 原稿の折り返し改行の自動結合（全角文字の間の改行を詰める）
- 1〜2 桁の数字と「!?」の自動縦中横
- ルビ・傍点・図・表・コードブロック・章末注
- GitHub Actions によるテスト・PDF 生成・Release

## 📦 必要環境

- Node.js 22.12.0 以上
- npm
- 日本語フォント（ローカルでのビルド時）．
  Windows は游明朝，macOS はヒラギノ明朝，Linux は Noto Serif CJK JP を想定している．

## 🚀 セットアップ

```bash
git clone https://github.com/your-username/your-book.git
cd your-book
npm install
```

初回の `npm run build` で，Vivliostyle が描画用のブラウザを自動で取得する．

## 📖 使い方

### PDF のビルド

```bash
npm run build
```

`dist/book.pdf` が生成される．中間ファイルは `.vivliostyle/` に置かれる．
どちらも Git の管理対象外である．

### プレビュー

```bash
npm run preview
```

ブラウザでプレビューが表示される．原稿を保存すると自動で更新される．

### テスト

```bash
npm test
```

`scripts/` 配下のプラグイン（改行結合・縦中横・字下げ）のテストを実行する．

### 書誌情報

書名と著者名は `config/book.yaml` に書く．
扉・奥付の `{{book-title}}`・`{{book-author}}`，柱，PDF の文書情報へ流し込まれる．

```yaml
title: "書籍タイトル"
author: "著者名"
lang: ja
```

### 章の追加

`src/chapters/` に Markdown を置き，`vivliostyle.config.js` の `entry` へ加える．
目次は `entry` の順で自動生成される．

## ✍️ 原稿の書き方

原稿は `src/chapters/*.md` に書く．見本は `01-usage.md` と `02-sample.md` にある．

表 1. 原稿の記法と組み上がり

| 書きたいもの | 記法 | 組み上がり |
| --- | --- | --- |
| 章題 | `# 第一章　題名` | 改ページして 4 行取り |
| 節題 | `## 題名` | 2 行取り |
| 段落 | 空行で区切る | 1 字下げ．原稿の先頭の全角空白は取り除かれる |
| 会話文 | `「」` で始める | 天付き（字下げなし） |
| 1 行アキ | `---` | 本文 1 行分の空き |
| ルビ | `{漢字\|かんじ}` | 親文字の右にルビ |
| 傍点 | `*語*` | ゴマ（黒ゴマ）の傍点 |
| 太字 | `**語**` | 太字 |
| 縦中横 | 自動（1〜2 桁の数字，`!?` など） | 1 字分の枠へ横組み |
| 縦中横（手動） | `<span class="tcy">12</span>` | 同上 |
| 縦中横の抑止 | `<span class="no-tcy">12</span>` | 横倒しのまま |
| 注 | `本文[^1]` と `[^1]: 注の本文` | 章末にまとめて組む |
| 引用 | `> 文` | 天から 2 字下げ |
| 箇条書き | `- 項目` / `1. 項目` | 中黒 / 縦中横の番号 |
| 図 | `![説明](../assets/images/図.svg)` | 横組みで版面の 8 行分の幅に収める |
| 1 ページの図 | `<figure class="full-page">` で囲む | 改ページして版面いっぱいに置く |
| 改ページ | `<div class="page-break"></div>` | ページを改める |

段落の途中で改行しても，全角文字の間の改行は詰められる．
原稿の 1 行が長くなるときは途中で改行してよい．
半角文字に隣接する改行は半角空白として残る．

3 桁以上の数字は縦中横にならない．漢数字で書くか，`tcy` クラスで囲む．

## 📁 ディレクトリ構造

```text
.
├── .github/
│   ├── dependabot.yml           # npm と GitHub Actions の更新監視
│   └── workflows/
│       ├── build-pdf.yml        # テスト・PDF 生成・Release
│       ├── md-lint.yml          # Markdown lint（reviewdog）
│       └── session-url-check.yml # セッション URL 検査（PR 本文・commit）
├── config/
│   ├── book.yaml                # 書誌情報（書名・著者名）
│   └── themes/bunko/theme.css   # 文庫本テーマ
├── docs/
│   ├── notes/                   # 設計判断の記録
│   └── spec/requirements.md     # 要求・要件
├── scripts/
│   ├── hast-utils.mjs           # HTML 構文木の走査
│   ├── join-cjk-line-breaks.mjs # 全角文字の間の改行を詰める
│   ├── auto-tcy.mjs             # 縦中横の自動付与
│   ├── paragraph-indent.mjs     # 字下げの整理と会話文の天付き
│   └── *.test.mjs               # 各プラグインのテスト
├── src/
│   ├── assets/images/           # 図
│   └── chapters/                # 原稿
│       ├── title-page.md        # 扉
│       ├── 01-usage.md          # 使い方の見本
│       ├── 02-sample.md         # 組見本
│       ├── 98-afterword.md      # あとがき
│       └── 99-colophon.md       # 奥付
├── vivliostyle.config.js        # ビルド設定
└── package.json
```

目次はビルドが生成する（`vivliostyle.config.js` の `toc`）．原稿として置かない．

## 📐 版面の調整

版面は `config/themes/bunko/theme.css` の冒頭の変数で決める．

表 2. 版面を決める変数

| 変数 | 既定値 | 意味 |
| --- | --- | --- |
| `--page-width` / `--page-height` | 105mm / 148mm | 仕上がり寸法（A6） |
| `--font-size` | 9pt | 本文の文字サイズ |
| `--line-height` | 1.75 | 行送り（文字サイズに対する倍率） |
| `--chars-per-line` | 38 | 1 行の字数 |
| `--lines-per-page` | 15 | 1 ページの行数 |
| `--margin-inner` | 12mm | のど（綴じ側）の余白 |
| `--colophon-lines` | 9 | 奥付の行数．奥付をページの終わり側へ寄せる計算に使う |

天地の余白は仕上がりの高さから行長を引いて等分する．
小口の余白は仕上がりの幅から版面の幅とのどを引いた残りである．
字数や行数を増やすときは，余白が負にならないよう文字サイズも見直す．

見出しの行取りと字下げは「見出し」節の `line-height` と `margin-inline-start` で変える．
書体は `--font-mincho` の並びで変える．先頭から順に，環境にある書体が使われる．

`vivliostyle.config.js` の `size` は A6 で固定してあり，仕上がり寸法は `theme.css` の
`@page` が決める．判型を変えるときは両方をそろえる．

## 🏷️ GitHub 運用

### CI

- `test` ジョブは push と PR のたびに `npm test` を実行する．
- PDF の生成は，PR へ `build-pdf` ラベルを付けたとき，または手動実行したときだけ行う．
  生成した PDF は Actions の artifact として 7 日間保持される．
- `v*` タグを push すると Release を作り，PDF を添付する．
  タグは `main` 上のコミットを指し，`package.json` の `version` と一致していなければならない．

### Markdown lint

`docs/` と `README.md` は [tomio2480/github-workflows](https://github.com/tomio2480/github-workflows)
の composite action で lint する．
原稿（`src/chapters/`）は `.textlintignore` で対象から外している．
技術文書向けの規則（文長・文体・句点）が文芸の原稿に合わないためである．

### Dependabot

npm と GitHub Actions の更新を週次で監視する．

## 🔍 トラブルシューティング

### 文字が豆腐（□）になる

日本語フォントが無い．Linux は `fonts-noto-cjk` を入れる．
CI では `build-pdf` ジョブが自動で入れる．

### ページの余白がおかしい

`theme.css` の 4 値の組み合わせで版面が仕上がり寸法を超えていないか確認する．
`--chars-per-line × --font-size` が `--page-height` を超えると天地の余白が負になる．
`--line-pitch × --lines-per-page + --margin-inner` が `--page-width` を超えると小口の余白が負になる．

### 図が次のページへ送られる

図は横幅（版面の行数）を消費する．既定は 8 行分である．
ページの残りが足りないと次のページへ送られ，前のページに空きが残る．
図の位置を前後の段落と入れ替えるか，`full-page` クラスで 1 ページに置く．

### ビルドが途中で止まる

`.vivliostyle/` と `dist/` を消して（`npm run clean`）から組み直す．

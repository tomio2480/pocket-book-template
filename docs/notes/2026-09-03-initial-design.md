# 文庫本テンプレートの初期設計

## 概要

A6 判・縦組みのテンプレートを Vivliostyle で組んだときの設計判断と，
実装中に確認した Vivliostyle の挙動を記録する．
要求・要件は `docs/spec/requirements.md` が扱う．本文書は設計（how）に限る．

## 目次

- 背景
- 判断
- 代替案と棄却理由
- 確認した挙動
- 参照

## 背景

- 横組みの `tomio2480/techbook-template` を参考に，縦組みの文庫本向けを作る．
- 公式テーマ `@vivliostyle/theme-bunko` は A5 判・`theme-base` 依存であり，
  版面の計算や柱の配置を変えにくい．自前のテーマ CSS 1 枚で組む．

## 判断

- 版面は「文字サイズ・字数・行数・のど」の 4 値から算出する．
  既定は 9pt・38 字・15 行・のど 12mm．天地 13.7mm，小口 9.4mm になる．
  A6 判の文庫本で一般的な範囲に収まる．
- 版面の幅には 1px を足す．丸め誤差で最終行が次ページへこぼれるのを防ぐ．
  `theme-bunko` と同じ手当てである．
- ページの左右は `@page :left` と `@page :right` で決める．
  縦組みでは奇数ページが `:left` に来る（後述の確認済み挙動）．
  のどは左ページの右辺，右ページの左辺である．
- 柱は小口側の天に置く．左ページは章題（`string-set`），右ページは書名（`env(pub-title)`）．
  ノンブルは小口側の地に置く．
- 扉・目次・奥付は名前付きページで柱とノンブルを消す．
- 目次は CLI の `toc` 設定で生成する．手書きの目次 HTML は持たない．
  生成物に入る扉と奥付の項目は，`href` を見て CSS で隠す．
- 段落の字下げは CSS の `text-indent` が担う．
  原稿の先頭の全角空白はプラグインで取り除く．
  開き括弧で始まる段落は `no-indent` クラスを付けて天付きにする．
- 縦中横は 1〜2 桁の数字と「!?」などの 2 字だけを自動で付ける．
  3 桁以上は横倒しのまま残し，漢数字か手書きの `tcy` に委ねる．
- 図は横組みへ切り替え，幅を版面の 8 行分に抑える．
  縦組みでは図の幅が行数を消費するため，版面いっぱいの図は 1 ページを使う．
  1 ページの図は `full-page` クラスで別に用意する．
- 奥付はページの終わり側へ寄せる．
  `--colophon-lines` で行数を決め，残りの行数分を `margin-block-start` で空ける．
- 原稿は `.textlintignore` で lint から外す．技術文書向けの規則が文芸の原稿に合わないためである．

## 代替案と棄却理由

- `@vivliostyle/theme-bunko` の継承．
  `theme-base` の変数体系を覚える必要があり，A6 への調整も変数の上書きが多い．
  1 枚の CSS で完結させる方が読みやすい．
- `hardLineBreaks: true` で改行を `<br>` にする．
  原稿の折り返し改行がそのまま紙面の改行になり，字下げも効かなくなる．
  全角文字の間の改行を詰めるプラグインで対処する．
- `hanging-punctuation: first` で会話文の括弧を天付きに見せる．
  Vivliostyle の対応が不確かであり，プラグインで `no-indent` を付ける方が確実である．
- 奥付を flex で終わり側へ寄せる．ページの高さをブロックの高さへ伝える手段が無い．
  行数からの算出で十分である．

## 確認した挙動

- 縦組み（`vertical-rl`）の文書では，1 ページ目が `@page :left` になる．
  奇数ページが左，偶数ページが右である．
- `@page` に `var()` と `calc()` を書ける．
  `calc((var(--a) - var(--b)) * var(--c))` のように括弧を先に置く形も効く．
- `@page title-page, @page toc { ... }` のような列挙は解釈されない．
  名前付きページはページ名ごとに書く．
- `env(pub-title)` で `vivliostyle.config.js` の `title` を柱へ出せる．
- `body:has([role='doc-toc'])` のような `:has()` セレクタは効く．
- VFM は複数行の段落の前後へ半角空白だけのテキストノードを挟む．
  段落の先頭を見るプラグインはこのノードを飛ばす必要がある．
- VFM の脚注は `<section class="footnotes" role="doc-endnotes">` として章末へ出る．
  参照は `a.footnote-ref`，戻りリンクは `a.footnote-back` である．
- CLI 11 は中間ファイルを `.vivliostyle/` に置く．原稿の隣に HTML は生成されない．
- 縦組みでは `ol` の既定のマーカーが横倒しになる．
  `list-style: none` にして `::before` で縦中横の番号を付ける．
  この指定は生成された目次にも当たるため，目次側で `content: none` に戻す．

## 参照

- [Vivliostyle CLI: Table of Contents](https://github.com/vivliostyle/vivliostyle-cli/blob/main/docs/toc-page.md)
- [@vivliostyle/theme-bunko](https://github.com/vivliostyle/themes/tree/main/packages/%40vivliostyle/theme-bunko)
- [tomio2480/techbook-template](https://github.com/tomio2480/techbook-template)

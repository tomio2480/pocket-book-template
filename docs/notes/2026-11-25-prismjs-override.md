# prismjs の上書き

## 概要

`package.json` の `overrides` で，refractor が読み込む prismjs を 1.30.0 以上へ上げた．
本文書は上書きの理由と，上書きを外す条件を記録する．
`package.json` は JSON のため，注記を書けない．
このテンプレートから作る執筆リポジトリへ理由を引き継ぐため，ここへ書く．

## 目次

- 背景
- 判断
- 代替案と棄却理由
- 確認した挙動
- 上書きを外す条件
- 参照

## 背景

- コードブロックの強調は，VFM 2.7.2 が refractor 3.6.0 を通して行う．
- refractor 3.6.0 は prismjs を `~1.27.0` に固定している．
- prismjs 1.30.0 未満には DOM clobbering の脆弱性（GHSA-x7hr-w5r2-h6wg）がある．
- VFM の最新版 2.7.2 も refractor `^3.6.0` に依存する．refractor 3 系の最新版は 3.6.0 である．
  上流の版上げを待っても解消しない（2026-11-25 時点）．

## 判断

- `overrides` で，refractor 配下の prismjs だけを `^1.30.0` へ上書きする．

  ```json
  {
    "overrides": {
      "refractor": {
        "prismjs": "^1.30.0"
      }
    }
  }
  ```

- 上書きの範囲を refractor 配下に絞る．
  全体を上書きすると，prismjs を使う別の依存にも 1 系を強いる．
  prismjs は 2.0.0 の alpha 版を公開しており，2 系を求める依存が今後入りうる．
- 現在の依存木で prismjs を使うのは refractor だけである．
  このため，全体を上書きした場合とロックの内容は変わらない．

## 代替案と棄却理由

- 全体の上書き（`"prismjs": "^1.30.0"`）．
  影響が refractor の外へ及び，不要になった後も黙って版を縛り続ける．
- VFM の版上げを待つ．上流の予定が見えず，脆弱性の警告が開いたまま残る．
  テンプレートから作る執筆リポジトリにも，同じ警告が引き継がれる．

## 確認した挙動

- refractor 3.6.0 は prismjs から `components/prism-core` だけを読み込む．
  言語定義は refractor 自身が持つ．
- `components/prism-core.js` の 1.27.0 から 1.30.0 への差分は 1 行だけである．
  変わったのは `currentScript` の判定で，Node では `document` が無いため実行されない．
- refractor で 9 言語のコードを強調し，prismjs 1.27.0 と 1.30.0 の出力（hast）を比べた．
  すべて一致した．
- 組見本（`src/chapters/`）にはフェンス付きのコードブロックが無い．
  PDF を組み比べても，この変更は確かめられない．

## 上書きを外す条件

次のいずれかを満たしたら，`overrides` から `refractor` の項目を消す．

- VFM が refractor 4.7.0 以降へ移る．4.7.0 以降の refractor は prismjs に依存しない．
- refractor 3 系が，prismjs 1.30.0 以上を許す版を出す．

refractor 4.0.0 から 4.6.0 は，prismjs を 1.30.0 未満の範囲に固定している．
VFM がこの範囲へ移った場合は，上書きを残す．

消したあとは `npm ls prismjs` を実行し，1.30.0 未満が残っていないことを確かめる．
ほかに上書きが無ければ，`overrides` のキーごと消す．

## 参照

- [GHSA-x7hr-w5r2-h6wg](https://github.com/advisories/GHSA-x7hr-w5r2-h6wg)
- [npm Docs: package.json の overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides)
- [PrismJS v1.27.0 と v1.30.0 の差分](https://github.com/PrismJS/prism/compare/v1.27.0...v1.30.0)

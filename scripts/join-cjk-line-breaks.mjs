/**
 * 全角文字どうしに挟まれた改行を取り除く rehype プラグイン．
 *
 * Markdown の段落内で改行すると HTML では半角空白になる．
 * 和文では空白が字間へ残って紙面に穴が空くため，全角文字の間の改行は詰める．
 * 半角文字が隣接する改行は，欧文の語間として半角空白 1 つに置き換える．
 */
import { visitTextNodes } from './hast-utils.mjs';

/* 漢字・仮名・全角約物・全角英数・長音・ダッシュ・三点リーダ */
const CJK =
  '[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u3000-\\u303f\\uff00-\\uffef\\u30fc\\u2014\\u2015\\u2026]';
const CJK_LINE_BREAK = new RegExp(`(?<=${CJK})[ \\t]*\\n[ \\t]*(?=${CJK})`, 'gu');
const OTHER_LINE_BREAK = /[ \t]*\n[ \t]*/g;

export function joinCjkLineBreaks(text) {
  return text.replace(CJK_LINE_BREAK, '').replace(OTHER_LINE_BREAK, ' ');
}

export function joinCjkLineBreaksPlugin() {
  return (tree) => {
    visitTextNodes(tree, (node) => {
      if (node.value.includes('\n')) node.value = joinCjkLineBreaks(node.value);
    });
  };
}

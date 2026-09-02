/**
 * 段落の字下げを整える rehype プラグイン．
 *
 * 和文の段落は 1 字下げで始める．字下げは CSS の text-indent が担うため，
 * 原稿の先頭に書かれた全角空白は取り除く（残すと 2 字下げになる）．
 *
 * 会話文など開き括弧で始まる段落は，括弧を天付き（字下げなし）にする
 * 組み方が広く使われる．CSS は段落の先頭文字を見られないため，
 * ここで no-indent クラスの印を付ける．
 */
import { addClass, firstTextNode, visitElements } from './hast-utils.mjs';

const OPENING_BRACKETS = '「『（〈《【〔―';
const LEADING_IDEOGRAPHIC_SPACES = /^　+/;

export function startsWithOpeningBracket(value) {
  return value.length > 0 && OPENING_BRACKETS.includes(value[0]);
}

export function paragraphIndentPlugin() {
  return (tree) => {
    visitElements(tree, 'p', (node) => {
      const first = firstTextNode(node);
      if (!first) return;
      first.value = first.value.replace(LEADING_IDEOGRAPHIC_SPACES, '');
      if (startsWithOpeningBracket(first.value)) addClass(node, 'no-indent');
    });
  };
}

/**
 * 縦中横（tcy）を自動で付ける rehype プラグイン．
 *
 * 縦書きでは半角の数字や記号が横倒しになる．1〜2 桁の数字と「!?」などの
 * 2 文字の並びは，1 文字分の枠へ横組みで収める縦中横が慣例である．
 * 該当する並びを <span class="tcy"> で包む．CSS 側で text-combine-upright を当てる．
 *
 * 3 桁以上の数字や半角英字に隣接する数字は対象外とする．
 * 手で書いた .tcy と，除外したい .no-tcy の中には立ち入らない．
 */
import { hasClass, visitTextNodes } from './hast-utils.mjs';

const TCY_PATTERN = /(?<![0-9A-Za-z])(\d{1,2}|!\?|\?!|!!|\?\?)(?![0-9A-Za-z])/g;

const text = (value) => ({ type: 'text', value });
const tcy = (value) => ({
  type: 'element',
  tagName: 'span',
  properties: { className: ['tcy'] },
  children: [text(value)],
});

/** 文字列を，縦中横の span とその他のテキストノードの並びへ分割する */
export function splitTcy(value) {
  const nodes = [];
  let last = 0;
  for (const match of value.matchAll(TCY_PATTERN)) {
    if (match.index > last) nodes.push(text(value.slice(last, match.index)));
    nodes.push(tcy(match[0]));
    last = match.index + match[0].length;
  }
  if (nodes.length === 0) return [text(value)];
  if (last < value.length) nodes.push(text(value.slice(last)));
  return nodes;
}

export function autoTcyPlugin() {
  return (tree) => {
    visitTextNodes(
      tree,
      (node) => {
        if (!TCY_PATTERN.test(node.value)) return undefined;
        TCY_PATTERN.lastIndex = 0;
        return splitTcy(node.value);
      },
      { skip: (node) => hasClass(node, 'tcy') || hasClass(node, 'no-tcy') },
    );
  };
}

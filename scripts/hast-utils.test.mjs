import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addClass, firstTextNode, hasClass, visitElements, visitTextNodes } from './hast-utils.mjs';

const text = (value) => ({ type: 'text', value });
const el = (tagName, children, properties = {}) => ({ type: 'element', tagName, properties, children });

test('hasClass は配列と文字列のどちらの className も見る', () => {
  assert.equal(hasClass(el('p', [], { className: ['a', 'b'] }), 'b'), true);
  assert.equal(hasClass(el('p', [], { className: 'a' }), 'a'), true);
  assert.equal(hasClass(el('p', []), 'a'), false);
});

test('addClass は既存のクラスを保ち，重複は加えない', () => {
  const node = el('p', []);
  addClass(node, 'x');
  addClass(node, 'x');
  addClass(node, 'y');
  assert.deepEqual(node.properties.className, ['x', 'y']);
  const single = el('p', [], { className: 'a' });
  addClass(single, 'b');
  assert.deepEqual(single.properties.className, ['a', 'b']);
});

test('visitTextNodes は visitor の返す配列でノードを差し替え，後続も訪ねる', () => {
  const tree = el('p', [text('a'), text('b')]);
  const seen = [];
  visitTextNodes(tree, (node) => {
    seen.push(node.value);
    return node.value === 'a' ? [text('a1'), text('a2')] : undefined;
  });
  assert.deepEqual(seen, ['a', 'b']);
  assert.deepEqual(tree.children.map((n) => n.value), ['a1', 'a2', 'b']);
});

test('visitTextNodes は pre・code と skip が真の要素に立ち入らない', () => {
  const tree = el('div', [
    el('pre', [text('p')]),
    el('code', [text('c')]),
    el('span', [text('s')], { className: ['stop'] }),
    el('span', [text('ok')]),
  ]);
  const seen = [];
  visitTextNodes(tree, (node) => { seen.push(node.value); }, { skip: (n) => hasClass(n, 'stop') });
  assert.deepEqual(seen, ['ok']);
});

test('visitElements は入れ子の要素も含めて指定タグを訪ねる', () => {
  const inner = el('p', [text('in')]);
  const tree = el('div', [el('p', [text('top')]), el('blockquote', [inner])]);
  const seen = [];
  visitElements(tree, 'p', (n) => seen.push(n.children[0].value));
  assert.deepEqual(seen, ['top', 'in']);
});

test('firstTextNode は半角空白だけのノードを飛ばし，無ければ undefined', () => {
  const target = text('本文');
  assert.equal(firstTextNode(el('p', [text(' \n'), el('em', [target])])), target);
  assert.equal(firstTextNode(el('p', [text('  ')])), undefined);
  assert.equal(firstTextNode(el('p', [])), undefined);
});

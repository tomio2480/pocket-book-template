import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitTcy, autoTcyPlugin } from './auto-tcy.mjs';

const text = (value) => ({ type: 'text', value });
const tcy = (value) => ({
  type: 'element',
  tagName: 'span',
  properties: { className: ['tcy'] },
  children: [text(value)],
});

test('2 桁の半角数字を縦中横の span で包む', () => {
  assert.deepEqual(splitTcy('午後12時に集合'), [text('午後'), tcy('12'), text('時に集合')]);
});

test('1 桁の半角数字も包む', () => {
  assert.deepEqual(splitTcy('第3章'), [text('第'), tcy('3'), text('章')]);
});

test('3 桁以上の数字は包まない', () => {
  assert.deepEqual(splitTcy('西暦2026年'), [text('西暦2026年')]);
  assert.deepEqual(splitTcy('100人'), [text('100人')]);
});

test('半角英字に隣接する数字は包まない', () => {
  assert.deepEqual(splitTcy('Node 22 と v22 の違い'), [text('Node '), tcy('22'), text(' と v22 の違い')]);
});

test('感嘆符と疑問符の 2 文字の並びを包む', () => {
  assert.deepEqual(splitTcy('本当に!?'), [text('本当に'), tcy('!?')]);
  assert.deepEqual(splitTcy('まさか!!'), [text('まさか'), tcy('!!')]);
});

test('対象を含まない文字列はそのまま返す', () => {
  assert.deepEqual(splitTcy('吾輩は猫である。'), [text('吾輩は猫である。')]);
});

test('プラグインは p の中の数字を包み，pre・code・既存の tcy の中は変えない', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'element', tagName: 'p', properties: {}, children: [text('午後12時')] },
      { type: 'element', tagName: 'pre', properties: {}, children: [
        { type: 'element', tagName: 'code', properties: {}, children: [text('x = 12')] },
      ] },
      { type: 'element', tagName: 'p', properties: {}, children: [tcy('12')] },
      { type: 'element', tagName: 'p', properties: { className: ['no-tcy'] }, children: [text('12')] },
    ],
  };
  autoTcyPlugin()(tree);
  assert.deepEqual(tree.children[0].children, [text('午後'), tcy('12'), text('時')]);
  assert.deepEqual(tree.children[1].children[0].children, [text('x = 12')]);
  assert.deepEqual(tree.children[2].children, [tcy('12')]);
  assert.deepEqual(tree.children[3].children, [text('12')]);
});

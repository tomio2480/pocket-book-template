import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joinCjkLineBreaks, joinCjkLineBreaksPlugin } from './join-cjk-line-breaks.mjs';

test('全角文字どうしに挟まれた改行を取り除く', () => {
  assert.equal(joinCjkLineBreaks('吾輩は\n猫である。'), '吾輩は猫である。');
});

test('改行の前後の半角空白も一緒に取り除く', () => {
  assert.equal(joinCjkLineBreaks('吾輩は  \n  猫である。'), '吾輩は猫である。');
});

test('約物や仮名に挟まれた改行も取り除く', () => {
  assert.equal(joinCjkLineBreaks('「はい。」\nと答えた。'), '「はい。」と答えた。');
  assert.equal(joinCjkLineBreaks('ゆっくり\nカタカナ'), 'ゆっくりカタカナ');
});

test('半角文字が隣接する改行は空白として残す', () => {
  assert.equal(joinCjkLineBreaks('Vivliostyle\nを使う'), 'Vivliostyle を使う');
  assert.equal(joinCjkLineBreaks('使う\nVivliostyle'), '使う Vivliostyle');
  assert.equal(joinCjkLineBreaks('a\nb'), 'a b');
});

test('改行を含まない文字列は変えない', () => {
  assert.equal(joinCjkLineBreaks('吾輩は猫である。'), '吾輩は猫である。');
});

test('プラグインは pre と code の中を変えない', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: '吾輩は\n猫である。' }] },
      { type: 'element', tagName: 'pre', properties: {}, children: [
        { type: 'element', tagName: 'code', properties: {}, children: [{ type: 'text', value: '一行目\n二行目' }] },
      ] },
    ],
  };
  joinCjkLineBreaksPlugin()(tree);
  assert.equal(tree.children[0].children[0].value, '吾輩は猫である。');
  assert.equal(tree.children[1].children[0].children[0].value, '一行目\n二行目');
});

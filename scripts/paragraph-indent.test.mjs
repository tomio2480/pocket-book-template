import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startsWithOpeningBracket, paragraphIndentPlugin } from './paragraph-indent.mjs';

test('開き括弧で始まる文字列を判定する', () => {
  for (const s of ['「はい」', '『本』', '（注）', '〈囲み〉', '《書名》', '【見出し】', '〔補足〕', '―――']) {
    assert.equal(startsWithOpeningBracket(s), true, s);
  }
});

test('開き括弧で始まらない文字列は判定しない', () => {
  for (const s of ['吾輩は猫である。', '', ' 「空白の後」', 'abc']) {
    assert.equal(startsWithOpeningBracket(s), false, JSON.stringify(s));
  }
});

const p = (children, properties = {}) => ({ type: 'element', tagName: 'p', properties, children });
const text = (value) => ({ type: 'text', value });

test('プラグインは開き括弧で始まる段落へ no-indent クラスを付ける', () => {
  const tree = {
    type: 'root',
    children: [
      p([text('「おはよう」と言った。')]),
      p([text('吾輩は猫である。')]),
      p([{ type: 'element', tagName: 'em', properties: {}, children: [text('『強調』')] }]),
      p([text('「既存クラスは保つ」')], { className: ['lead'] }),
    ],
  };
  paragraphIndentPlugin()(tree);
  assert.deepEqual(tree.children[0].properties.className, ['no-indent']);
  assert.equal(tree.children[1].properties.className, undefined);
  assert.deepEqual(tree.children[2].properties.className, ['no-indent']);
  assert.deepEqual(tree.children[3].properties.className, ['lead', 'no-indent']);
});

test('プラグインは段落の先頭の全角空白を取り除く（字下げは CSS が担う）', () => {
  const tree = {
    type: 'root',
    children: [
      p([text('　吾輩は猫である。')]),
      p([text('　　二つ重ねても取り除く')]),
      p([text('　「空白の後の会話文」')]),
      p([text('文中の　全角空白は残す')]),
      /* VFM は複数行の段落の前後へ半角空白だけのノードを挟む */
      p([text(' '), text('　空白ノードの後も取り除く'), text(' ')]),
    ],
  };
  paragraphIndentPlugin()(tree);
  assert.equal(tree.children[4].children[1].value, '空白ノードの後も取り除く');
  assert.equal(tree.children[0].children[0].value, '吾輩は猫である。');
  assert.equal(tree.children[0].properties.className, undefined);
  assert.equal(tree.children[1].children[0].value, '二つ重ねても取り除く');
  assert.equal(tree.children[2].children[0].value, '「空白の後の会話文」');
  assert.deepEqual(tree.children[2].properties.className, ['no-indent']);
  assert.equal(tree.children[3].children[0].value, '文中の　全角空白は残す');
});

test('プラグインは li や blockquote の中の p も対象にする', () => {
  const inner = p([text('「中の会話」')]);
  const tree = {
    type: 'root',
    children: [{ type: 'element', tagName: 'blockquote', properties: {}, children: [inner] }],
  };
  paragraphIndentPlugin()(tree);
  assert.deepEqual(inner.properties.className, ['no-indent']);
});

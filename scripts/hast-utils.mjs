/**
 * hast（HTML の構文木）を辿る小さなユーティリティ．
 * 依存を増やさないため unist-util-visit を使わず自前で書く．
 */

/** テキストの書き換えに立ち入らない要素 */
const SKIP_TAGS = new Set(['pre', 'code', 'script', 'style', 'math', 'svg']);

/** 要素が指定のクラスを持つか */
export function hasClass(node, name) {
  const className = node.properties?.className;
  if (Array.isArray(className)) return className.includes(name);
  return className === name;
}

/** 要素へクラスを加える．既存のクラスは保ち，重複は加えない */
export function addClass(node, name) {
  node.properties ??= {};
  const current = node.properties.className;
  const list = Array.isArray(current) ? current : current ? [current] : [];
  if (!list.includes(name)) list.push(name);
  node.properties.className = list;
}

/**
 * テキストノードを訪ねる．visitor が配列を返したら，そのノードを配列で置き換える．
 * SKIP_TAGS の要素と skip(node) が真の要素には立ち入らない．
 */
export function visitTextNodes(node, visitor, { skip } = {}) {
  if (node.type === 'element' && (SKIP_TAGS.has(node.tagName) || skip?.(node))) return;
  const children = node.children;
  if (!children) return;
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    if (child.type === 'text') {
      const replacement = visitor(child, node, i);
      if (Array.isArray(replacement)) {
        children.splice(i, 1, ...replacement);
        i += replacement.length - 1;
      }
    } else {
      visitTextNodes(child, visitor, { skip });
    }
  }
}

/** 指定タグの要素をすべて訪ねる（入れ子も含む） */
export function visitElements(node, tagName, visitor) {
  if (node.type === 'element' && node.tagName === tagName) visitor(node);
  for (const child of node.children ?? []) visitElements(child, tagName, visitor);
}

/* 半角の空白・改行だけのノード．VFM が整形のために段落の前後へ挟むことがある */
const ASCII_WHITESPACE_ONLY = /^[ \t\r\n]*$/;

/** 要素の先頭のテキストノード（半角空白だけでない最初の子孫）．無ければ undefined */
export function firstTextNode(node) {
  if (node.type === 'text') return ASCII_WHITESPACE_ONLY.test(node.value) ? undefined : node;
  for (const child of node.children ?? []) {
    const found = firstTextNode(child);
    if (found) return found;
  }
  return undefined;
}

// @ts-check
import fs from 'node:fs';
import { defineConfig } from '@vivliostyle/cli';
import { VFM } from '@vivliostyle/vfm';
import { parse } from 'yaml';
import { joinCjkLineBreaksPlugin } from './scripts/join-cjk-line-breaks.mjs';
import { autoTcyPlugin } from './scripts/auto-tcy.mjs';
import { paragraphIndentPlugin } from './scripts/paragraph-indent.mjs';

/* 書名・著者名は config/book.yaml を単一の出所とする */
const book =
  parse(fs.readFileSync(new URL('./config/book.yaml', import.meta.url), 'utf-8')) ?? {};

/* 原稿中の {{book-title}} / {{book-author}} を書誌情報へ置き換える */
const bookMetaReplace = [
  { test: /\{\{book-title\}\}/, match: (_result, h) => h('span', { class: 'book-title' }, book.title ?? '') },
  { test: /\{\{book-author\}\}/, match: (_result, h) => h('span', { class: 'book-author' }, book.author ?? '') },
];

export default defineConfig({
  title: book.title,
  author: book.author,
  language: book.lang ?? 'ja',
  /* 右綴じ．ページは右から左へ進む */
  readingProgression: 'rtl',
  size: 'A6',
  theme: './config/themes/bunko/theme.css',
  entry: [
    'src/chapters/title-page.md',
    /* 目次は扉の裏を白紙にして奇数ページ（見開きの左）から始める */
    { rel: 'contents', title: '目次', pageBreakBefore: 'recto' },
    'src/chapters/01-usage.md',
    'src/chapters/02-sample.md',
    'src/chapters/98-afterword.md',
    'src/chapters/99-colophon.md',
  ],
  output: ['dist/book.pdf'],
  toc: {
    title: '目次',
    htmlPath: 'src/chapters/toc.html',
    sectionDepth: 2,
  },
  documentProcessor: (options, metadata) =>
    VFM({ ...options, replace: [...(options.replace ?? []), ...bookMetaReplace] }, metadata)
      .use(joinCjkLineBreaksPlugin)
      .use(autoTcyPlugin)
      .use(paragraphIndentPlugin),
  vfm: {
    hardLineBreaks: false,
    math: false,
  },
});

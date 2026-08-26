import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const frozenHomeFiles = new Map([
  ['src/pages/index.astro', 'ae51c4476877a9eff61fa6ac2705ab5a1ce0406ef127f9ffd25819a63cc2b9d6'],
  ['src/components/HeroArtwork.astro', 'f7cd2c53677768de55c7860fd59d6c737f02d511027b1229e238c854848a09a1'],
  ['src/components/CriteriaBand.astro', '1ca7bbadb992bbfcee6e85736a997f2785c227c595f99314c577dec49faeb456'],
  ['src/components/CtaBand.astro', '2e187cb634bfc21ecd7a54a69271fcace589bbbd833db28b5d1d375f96c6bdcb'],
  ['src/components/FaqList.astro', 'e6bd1235759f595e2b638f9aa321e0844f845322f667092529bec638bdaa6f59'],
  ['src/components/ProcessSteps.astro', 'b73f57b99dec3695a3268fd76da606e7a6d8b999e2bf6624e42c6412ee28d66f'],
  ['src/components/SectionIntro.astro', '7b8e11e96a326b5003e1387852490440d14b4bb1165af0ee208d828d77055709'],
  ['src/components/SectorGrid.astro', '73e6abd3f4491075b0e7c8cdbcdedf7094230c334519e6ff379acdc075daf785'],
  ['src/components/Header.astro', '146ea9b1452cd80a94bf7bf23b301210eb00df7ee18b6591cac6b84b0d0a7e69'],
  ['src/components/Footer.astro', 'd5988fdefa56cbc044625942e3396bad6e4342f0bb7fe99e763d2dc4f006568a'],
  ['src/styles/global.css', '9b0e05f190f35a228d2a705530d69b1cb986d37321be94d296a52ea6ba45d4cd'],
]);

test('homepage-owned source remains byte-for-byte frozen during the folio redesign', async () => {
  for (const [file, expected] of frozenHomeFiles) {
    const source = (await readFile(file, 'utf8')).replaceAll('\r\n', '\n');
    const digest = createHash('sha256').update(source).digest('hex');
    assert.equal(digest, expected, file);
  }
});

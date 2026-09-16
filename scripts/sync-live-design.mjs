import { cp, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const target = resolve('public/assets/evergreen');
await mkdir(target, { recursive: true });
for (const file of ['styles.css', 'inner-pages.css', 'script.js', 'inner-pages.js']) {
  await cp(resolve('prototypes/frontpage-concepts-v2/05-evergreen-partner-refined', file), join(target, file));
}
for (const file of ['original-fonts.css', 'literata-display-latin-variable.woff2', 'reference-1.ttf', 'reference-2.ttf', 'reference-3.ttf', 'reference-4.ttf', 'reference-5.ttf', 'reference-6.ttf']) {
  await cp(resolve('Hyper boards DEMO/showcase-assets', file), join(target, file));
}
for (const file of ['Literata-LICENSE.txt', 'Schibsted-LICENSE.txt']) {
  await cp(resolve('Hyper boards DEMO/showcase-assets', file), join(target, file));
}
console.log('Published self-hosted assets for finalized Design 1.');

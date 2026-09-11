import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const designs = ['design-1-original', 'design-2-atelier', 'design-3-meridian', 'design-4-fieldwork'];
const originals = ['index.html','styles.css','script.js','sell-your-business.html','what-we-acquire.html','inner-pages.css','inner-pages.js'];
const returnLink = '<a class="hb-design-return" href="../choose-design.html" aria-label="Back to choose design"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="12" y="2" width="5" height="5" rx="1"/><rect x="2" y="12" width="5" height="5" rx="1"/><rect x="12" y="12" width="5" height="5" rx="1"/></svg><span>Back to choose design</span></a>';

export function within(root, target) {
  const path = resolve(root, target);
  const rel = relative(resolve(root), path);
  if (!rel || rel.startsWith('..') || /^[A-Z]:/i.test(rel)) throw new Error(`Invalid showcase destination: ${path}`);
  return path;
}

async function decorateFolder(folder, original = false) {
  await mkdir(join(folder, 'assets'), {recursive:true});
  await cp(join(projectRoot, 'Hyper boards DEMO', 'showcase-assets', 'return.css'), join(folder, 'assets', 'design-return.css'));
  for (const file of await readdir(folder)) {
    if (!file.endsWith('.html')) continue;
    const path = join(folder, file);
    let html = await readFile(path, 'utf8');
    if (!html.includes('class="hb-design-return"')) {
      html = html.replace('</head>', '<link rel="stylesheet" href="assets/design-return.css">\n</head>')
        .replace(/(<body\b[^>]*>)/i, `$1\n${returnLink}`);
    }
    if (original) {
      html = html.replace(/<link[^>]+href="https:\/\/fonts\.(googleapis|gstatic)\.com[^>]*>/g, '');
      if (!html.includes('original-fonts.css')) html = html.replace('</head>', '<link rel="stylesheet" href="../showcase-assets/original-fonts.css">\n</head>');
    }
    await writeFile(path, html.replace(/^[\t ]+$/gm, ''), 'utf8');
  }
}

export async function syncPremiumShowcase() {
  const source = within(projectRoot, 'Hyper boards DEMO');
  const publicRoot = within(projectRoot, 'public/showcase');
  await mkdir(publicRoot, {recursive:true});
  const originalRoot = within(source, designs[0]);
  await mkdir(originalRoot, {recursive:true});
  for (const file of originals) await cp(join(source,file), join(originalRoot,file));
  await decorateFolder(originalRoot, true);
  await cp(join(source,'showcase-assets'), within(publicRoot,'showcase-assets'), {recursive:true});
  await cp(join(source,'choose-design.html'), within(publicRoot,'choose-design.html'));
  for (const slug of designs) {
    const folder = within(source, slug);
    // Decoration is idempotent. The seven supplied template files remain untouched.
    await decorateFolder(folder, slug === designs[0]);
    await cp(folder, within(publicRoot,slug), {
      recursive:true,
      filter: path => !/(?:^|[\\/])(?:\.qa|qa)(?:[\\/]|$)/.test(relative(folder,path))
        && !/(?:\.py$|qa[^\\/]*\.(?:mjs|png)$)/.test(path),
    });
  }
  await writeFile(join(publicRoot,'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=choose-design.html"><title>Hyperboards</title><a href="choose-design.html">Choose your design</a></html>');
  return designs;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncPremiumShowcase();
  console.log('Published original + three premium websites.');
}

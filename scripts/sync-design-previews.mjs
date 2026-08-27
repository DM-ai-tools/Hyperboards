import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const previewMappings = Object.freeze([
  { source: 'prototypes/frontpage-concepts-v2/01-evergreen-partner', slug: 'evergreen-partner' },
  { source: 'prototypes/frontpage-concepts-v2/03-blackline-office', slug: 'blackline-office' },
  { source: 'prototypes/frontpage-concepts-v2/02-cobalt-standard', slug: 'cobalt-standard' },
  { source: 'prototypes/frontpage-concepts/03-quiet-cinema', slug: 'quiet-cinema' },
  { source: 'prototypes/frontpage-concepts/02-operators-atlas', slug: 'operators-atlas' },
]);

export async function syncDesignPreviews({
  projectRoot = defaultProjectRoot,
  destinationRoot = join(projectRoot, 'public', 'design-previews'),
} = {}) {
  const published = [];

  for (const mapping of previewMappings) {
    const sourceRoot = resolve(projectRoot, mapping.source);
    const targetRoot = resolve(destinationRoot, mapping.slug);

    await rm(targetRoot, { recursive: true, force: true });
    await mkdir(targetRoot, { recursive: true });

    for (const file of ['index.html', 'styles.css', 'script.js']) {
      await cp(join(sourceRoot, file), join(targetRoot, file));
    }

    published.push({ ...mapping, target: targetRoot });
  }

  return published;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const published = await syncDesignPreviews();
  process.stdout.write(`Published ${published.length} design previews.\n`);
}

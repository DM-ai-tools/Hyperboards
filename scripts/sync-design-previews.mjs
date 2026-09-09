import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultProjectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const previewMappings = Object.freeze([
  { source: 'prototypes/frontpage-concepts-v2/01-evergreen-partner', slug: 'evergreen-partner' },
  { source: 'prototypes/frontpage-concepts-v2/05-evergreen-partner-refined', slug: 'evergreen-partner-refined' },
]);

export async function syncDesignPreviews({
  projectRoot = defaultProjectRoot,
  destinationRoot = join(projectRoot, 'public', 'design-previews'),
} = {}) {
  const published = [];

  await rm(destinationRoot, { recursive: true, force: true });
  await mkdir(destinationRoot, { recursive: true });

  for (const mapping of previewMappings) {
    const sourceRoot = resolve(projectRoot, mapping.source);
    const targetRoot = resolve(destinationRoot, mapping.slug);

    await cp(sourceRoot, targetRoot, { recursive: true });

    published.push({ ...mapping, target: targetRoot });
  }

  return published;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const published = await syncDesignPreviews();
  process.stdout.write(`Published ${published.length} design previews.\n`);
}

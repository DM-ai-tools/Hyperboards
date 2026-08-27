export interface DesignOption {
  slug: string;
  name: string;
  descriptor: string;
  thumbnail: string;
  contentUrl: string;
  original?: boolean;
}

export const designs = [
  {
    slug: 'hyperboards',
    name: 'Hyperboards Original',
    descriptor: 'Navy leather · tailored casework',
    thumbnail: '/design-thumbnails/hyperboards.webp',
    contentUrl: '/design-content/hyperboards',
    original: true,
  },
  {
    slug: 'evergreen-partner',
    name: 'Evergreen Partner',
    descriptor: 'Family-office restraint · enduring green',
    thumbnail: '/design-thumbnails/evergreen-partner.webp',
    contentUrl: '/design-previews/evergreen-partner/index.html',
  },
  {
    slug: 'blackline-office',
    name: 'Blackline Office',
    descriptor: 'Monochrome precision · Swiss discipline',
    thumbnail: '/design-thumbnails/blackline-office.webp',
    contentUrl: '/design-previews/blackline-office/index.html',
  },
  {
    slug: 'cobalt-standard',
    name: 'Cobalt Standard',
    descriptor: 'Institutional clarity · modern cobalt',
    thumbnail: '/design-thumbnails/cobalt-standard.webp',
    contentUrl: '/design-previews/cobalt-standard/index.html',
  },
  {
    slug: 'quiet-cinema',
    name: 'Quiet Cinema',
    descriptor: 'Editorial storytelling · cinematic restraint',
    thumbnail: '/design-thumbnails/quiet-cinema.webp',
    contentUrl: '/design-previews/quiet-cinema/index.html',
  },
  {
    slug: 'operators-atlas',
    name: 'Operators Atlas',
    descriptor: 'Operational fieldwork · cartographic focus',
    thumbnail: '/design-thumbnails/operators-atlas.webp',
    contentUrl: '/design-previews/operators-atlas/index.html',
  },
] as const satisfies readonly DesignOption[];

export function designBySlug(slug: string): DesignOption | undefined {
  return designs.find((design) => design.slug === slug);
}

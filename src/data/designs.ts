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
    slug: 'evergreen-partner-refined',
    name: 'Evergreen Partner — Refined',
    descriptor: 'Layered forest tones · refined restraint',
    thumbnail: '/design-thumbnails/evergreen-partner-refined.webp',
    contentUrl: '/design-previews/evergreen-partner-refined/index.html',
  },
] as const satisfies readonly DesignOption[];

export function designBySlug(slug: string): DesignOption | undefined {
  return designs.find((design) => design.slug === slug);
}

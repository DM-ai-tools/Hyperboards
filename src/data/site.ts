export const site = {
  name: 'Hyperboards',
  shortDescription: 'We buy established businesses directly.',
  defaultTitle: 'Hyperboards | We Buy Established Businesses Directly',
  defaultDescription:
    'Hyperboards buys established, profitable businesses directly from owners. We are the buyer—not an investment bank, broker or M&A adviser.',
  primaryCta: {
    label: 'Discuss selling your business',
    href: '/contact',
  },
} as const;

export const primaryNav = [
  { label: 'What We Acquire', href: '/what-we-acquire' },
  { label: 'For Business Owners', href: '/business-owners' },
  { label: 'Our Approach', href: '/our-approach' },
  { label: 'About', href: '/about' },
] as const;

export const criteria = [
  { value: '$750K–$2M', label: 'Target EBITDA' },
  { value: '$2M–$6M', label: 'Typical deal value' },
  { value: 'Nine', label: 'Target sectors' },
  { value: 'Buyer', label: 'Our role' },
] as const;

export type Sector = {
  number: string;
  name: string;
  slug: string;
  summary: string;
};

export const sectors: Sector[] = [
  {
    number: '01',
    name: 'Building & Construction',
    slug: 'building-construction',
    summary: 'Repeat commercial, maintenance and trade demand.',
  },
  {
    number: '02',
    name: 'Communication & Media',
    slug: 'communication-media',
    summary: 'Contracted or recurring client relationships.',
  },
  {
    number: '03',
    name: 'Entertainment & Recreation',
    slug: 'entertainment-recreation',
    summary: 'Membership and recurring-use business models.',
  },
  {
    number: '04',
    name: 'Financial Services',
    slug: 'financial-services',
    summary: 'Recurring revenue and transferable books of business.',
  },
  {
    number: '05',
    name: 'Health Care & Fitness',
    slug: 'health-care-fitness',
    summary: 'Recurring demand and defensive service characteristics.',
  },
  {
    number: '06',
    name: 'Manufacturing',
    slug: 'manufacturing',
    summary: 'Established customer relationships and tangible assets.',
  },
  {
    number: '07',
    name: 'Online & Technology',
    slug: 'online-technology',
    summary: 'Scalable operations, durable customer value and attractive margins.',
  },
  {
    number: '08',
    name: 'Service Businesses',
    slug: 'service-businesses',
    summary: 'Fragmented markets with repeat demand and consolidation potential.',
  },
  {
    number: '09',
    name: 'Wholesale & Distributors',
    slug: 'wholesale-distribution',
    summary: 'Recurring B2B demand and established supplier relationships.',
  },
];

export const exclusions = [
  'Agriculture',
  'Automotive and boats',
  'Beauty and personal care',
  'Education and children',
  'Pet services',
  'Restaurants and food',
  'Retail',
  'Transportation and storage',
  'Travel',
] as const;

export const processSteps = [
  {
    number: '01',
    title: 'Confidential introduction',
    summary: 'Share the broad facts of the business and what you are considering. No formal sale process is required.',
  },
  {
    number: '02',
    title: 'Initial fit',
    summary: 'We assess alignment with our acquisition profile and ask only for the information needed at this stage.',
  },
  {
    number: '03',
    title: 'Business review',
    summary: 'We learn how the company earns, operates and serves its customers—and what a responsible transition requires.',
  },
  {
    number: '04',
    title: 'Terms and diligence',
    summary: 'If there is mutual interest, we align on structure and complete financial, commercial, legal and operational review.',
  },
  {
    number: '05',
    title: 'Closing and transition',
    summary: 'Definitive documents and an agreed handover plan turn the decision into a considered next chapter.',
  },
] as const;

export const faqs = [
  {
    question: 'Do I need to be actively selling my business?',
    answer:
      'No. Many useful conversations begin before an owner has made a final decision. You can explore broad fit and timing without starting a formal sale process.',
  },
  {
    question: 'Is the first conversation confidential?',
    answer:
      'We treat initial conversations discreetly and limit the information requested. The contact form does not itself create a non-disclosure agreement, so detailed customer, employee or proprietary records should only be shared after appropriate protections are in place.',
  },
  {
    question: 'What role can an owner have after a transaction?',
    answer:
      'The right transition depends on the owner and the business. A complete exit, phased handover or continued involvement may be considered where it supports both parties and the company.',
  },
  {
    question: 'Are the published financial ranges absolute?',
    answer:
      'They are guidelines, not commitments. Earnings quality, customer concentration, capital needs, transition requirements and other business-specific factors all influence fit.',
  },
  {
    question: 'Is Hyperboards a broker or adviser?',
    answer:
      'No. Hyperboards is the prospective buyer. We do not represent sellers, run an auction or market businesses to third-party acquirers. On selected transactions, we may work with aligned capital partners while remaining directly accountable to the owner.',
  },
] as const;

export const ebitdaOptions = [
  { value: 'under-750k', label: 'Under $750K' },
  { value: '750k-1m', label: '$750K–$1M' },
  { value: '1m-2m', label: '$1M–$2M' },
  { value: 'over-2m', label: 'Over $2M' },
  { value: 'not-sure', label: 'Not sure / prefer to discuss' },
] as const;

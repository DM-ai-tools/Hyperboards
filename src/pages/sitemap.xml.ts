import type { APIRoute } from 'astro';

export const prerender = true;

const publicRoutes = [
  '/',
  '/what-we-acquire',
  '/business-owners',
  '/our-approach',
  '/about',
  '/contact',
  '/investor-relationships',
] as const;

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(import.meta.env.PUBLIC_SITE_URL || 'https://hyperboards.com');
  const urls = publicRoutes
    .map((route) => `  <url><loc>${escapeXml(new URL(route, baseUrl).href)}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

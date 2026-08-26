import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(import.meta.env.PUBLIC_SITE_URL || 'https://hyperboards.com');
  const shouldIndex = import.meta.env.PUBLIC_INDEX_SITE === 'true';
  const body = shouldIndex
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', baseUrl).href}\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

import type { APIRoute } from 'astro';

export const prerender = false;
export const GET: APIRoute = () => Response.json({
  ok: true,
  release: 'premium-showcase-2026-09-11',
  designs: 4,
  inquiryDeliveryConfigured: Boolean(process.env.INQUIRY_WEBHOOK_URL),
}, { headers: { 'Cache-Control': 'no-store' } });

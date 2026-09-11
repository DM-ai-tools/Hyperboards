import type { APIRoute } from 'astro';

export const prerender = false;
export const GET: APIRoute = () => Response.json({
  ok: true,
  release: 'evergreen-and-approver-2026-09-11',
  mode: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 'approver' : 'evergreen',
  designs: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 9 : 1,
  inquiryDeliveryConfigured: Boolean(process.env.INQUIRY_WEBHOOK_URL),
}, { headers: { 'Cache-Control': 'no-store' } });

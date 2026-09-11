import type { APIRoute } from 'astro';

export const prerender = false;
export const GET: APIRoute = () => Response.json({
  ok: true,
  release: 'design-1-finalized-email-2026-09-11',
  selectedDesign: 1,
  contactMode: 'email',
  mode: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 'approver' : 'evergreen',
  designs: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 9 : 1,
  inquiryDeliveryConfigured: Boolean(process.env.INQUIRY_WEBHOOK_URL),
}, { headers: { 'Cache-Control': 'no-store' } });

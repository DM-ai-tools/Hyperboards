import type { APIRoute } from 'astro';

export const prerender = false;
export const GET: APIRoute = () => Response.json({
  ok: true,
  release: 'evergreen-review-2026-09-18',
  selectedDesign: 1,
  contactMode: process.env.INQUIRY_WEBHOOK_URL ? 'form-online' : 'form-email-draft',
  mode: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 'approver' : 'evergreen',
  designs: process.env.HYPERBOARDS_SITE_MODE === 'approver' ? 9 : 1,
  inquiryDeliveryConfigured: Boolean(process.env.INQUIRY_WEBHOOK_URL),
}, { headers: { 'Cache-Control': 'no-store' } });

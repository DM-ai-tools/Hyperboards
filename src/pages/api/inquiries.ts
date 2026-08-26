import type { APIRoute } from 'astro';
import { ebitdaOptions, sectors } from '../../data/site';

export const prerender = false;

const MAX_BODY_BYTES = 32_000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, number[]>();

const industryValues = new Set([...sectors.map((sector) => sector.slug), 'other']);
const ebitdaValues = new Set<string>(ebitdaOptions.map((option) => option.value));
const roleValues = new Set(['owner', 'adviser', 'investor', 'other']);

type Payload = Record<string, unknown>;

function text(value: unknown, max: number): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function validUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function clientKey(request: Request, clientAddress?: string): string {
  return clientAddress
    || request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

function wantsJson(request: Request): boolean {
  return request.headers.get('accept')?.includes('application/json') ?? false;
}

function respond(request: Request, status: number, message: string, redirectStatus?: string): Response {
  if (wantsJson(request)) {
    return Response.json({ ok: status >= 200 && status < 300, message }, { status });
  }

  const location = status >= 200 && status < 300
    ? '/thank-you'
    : `/contact?status=${redirectStatus || 'error'}`;
  return new Response(null, { status: 303, headers: { Location: location } });
}

async function parsePayload(request: Request): Promise<Payload> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
    throw new Error('unsupported-content-type');
  }

  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('body-too-large');
    }
    chunks.push(value);
  }

  const body = new TextDecoder().decode(
    chunks.length === 1
      ? chunks[0]
      : Uint8Array.from(chunks.flatMap((chunk) => Array.from(chunk))),
  );

  if (contentType.includes('application/json')) return JSON.parse(body);
  return Object.fromEntries(new URLSearchParams(body).entries());
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).origin !== new URL(request.url).origin) {
    return respond(request, 403, 'This inquiry must be submitted from the Hyperboards website.');
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return respond(request, 413, 'The inquiry is too large. Please provide a shorter overview.');
  }

  const key = clientKey(request, clientAddress);
  if (rateLimited(key)) {
    return respond(request, 429, 'Too many attempts were received. Please wait before trying again.');
  }

  let raw: Payload;
  try {
    raw = await parsePayload(request);
  } catch (error) {
    if (error instanceof Error && error.message === 'body-too-large') {
      return respond(request, 413, 'The inquiry is too large. Please provide a shorter overview.');
    }
    if (error instanceof SyntaxError) {
      return respond(request, 400, 'The inquiry contained invalid data.');
    }
    return respond(request, 415, 'The inquiry format was not supported.');
  }

  if (text(raw.companyFax, 200)) {
    return respond(request, 200, 'Thank you.');
  }

  const inquiry = {
    fullName: text(raw.fullName, 100),
    email: text(raw.email, 200).toLowerCase(),
    phone: text(raw.phone, 40),
    company: text(raw.company, 120),
    companyWebsite: text(raw.companyWebsite, 240),
    location: text(raw.location, 120),
    industry: text(raw.industry, 80),
    ebitda: text(raw.ebitda, 40),
    role: text(raw.role, 40),
    message: typeof raw.message === 'string' ? raw.message.replace(/\u0000/g, '').trim().slice(0, 4000) : '',
    acknowledgement: raw.acknowledgement === true || raw.acknowledgement === 'true',
  };

  const invalid =
    inquiry.fullName.length < 2
    || !validEmail(inquiry.email)
    || inquiry.company.length < 2
    || inquiry.location.length < 2
    || !industryValues.has(inquiry.industry)
    || !ebitdaValues.has(inquiry.ebitda)
    || !roleValues.has(inquiry.role)
    || inquiry.message.length < 20
    || !inquiry.acknowledgement
    || !validUrl(inquiry.companyWebsite);

  if (invalid) {
    return respond(request, 400, 'Please complete every required field with valid information.');
  }

  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;
  if (!webhookUrl) {
    return respond(
      request,
      503,
      'Online submission is not yet connected. No information was delivered.',
      'configuration',
    );
  }

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (process.env.INQUIRY_WEBHOOK_TOKEN) {
      headers.Authorization = `Bearer ${process.env.INQUIRY_WEBHOOK_TOKEN}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'acquisition-inquiry',
        receivedAt: new Date().toISOString(),
        source: 'hyperboards-website',
        inquiry,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      return respond(request, 502, 'The private inquiry service could not accept this message. No confirmation has been issued.');
    }
  } catch {
    return respond(request, 502, 'The private inquiry service could not be reached. Please try again later.');
  }

  return respond(request, 200, 'Your confidential introduction has been received.');
};

export const ALL: APIRoute = async ({ request }) =>
  respond(request, 405, 'Only POST requests are accepted.');

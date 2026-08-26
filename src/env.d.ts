/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_INDEX_SITE?: string;
  readonly INQUIRY_WEBHOOK_URL?: string;
  readonly INQUIRY_WEBHOOK_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

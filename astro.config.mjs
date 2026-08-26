import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL || 'https://hyperboards.com';

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'never',
  compressHTML: true,
  security: {
    checkOrigin: true,
  },
});

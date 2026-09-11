import home from '../../prototypes/frontpage-concepts-v2/05-evergreen-partner-refined/index.html?raw';
import acquire from '../../prototypes/frontpage-concepts-v2/05-evergreen-partner-refined/what-we-acquire.html?raw';
import contact from '../../prototypes/frontpage-concepts-v2/05-evergreen-partner-refined/sell-your-business.html?raw';

const pages = { home, acquire, contact };
const routes = { home: '/', acquire: '/acquisition-criteria', contact: '/sell-your-business' };

export function liveDesign(page: keyof typeof pages): Response {
  let html = pages[page]
    .replace('Concept study / Evergreen Partner Refined', 'Direct private acquisitions')
    .replace(/<link[^>]+href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, '')
    .replace(/(href|src)="(styles\.css|inner-pages\.css|script\.js|inner-pages\.js)"/g, '$1="/assets/evergreen/$2"')
    .replace(/href="index\.html(#[^"]*)?"/g, 'href="/$1"')
    .replace(/href="what-we-acquire\.html"/g, 'href="/acquisition-criteria"')
    .replace(/href="sell-your-business\.html"/g, 'href="/sell-your-business"')
    .replace('</head>', `<link rel="stylesheet" href="/assets/evergreen/original-fonts.css"><link rel="canonical" href="https://hyperboards.com${routes[page]}"></head>`);
  if (page === 'home') html = html.replace(/<title>[^<]*<\/title>/, '<title>Hyperboards | Private Business Acquisitions</title>');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

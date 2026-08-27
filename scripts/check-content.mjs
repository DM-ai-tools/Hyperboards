import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

export const REQUIRED_FILES = [
  'src/pages/index.astro',
  'src/components/home/LeatherHomepage.astro',
  'src/pages/what-we-acquire.astro',
  'src/pages/business-owners.astro',
  'src/pages/our-approach.astro',
  'src/pages/about.astro',
  'src/pages/contact.astro',
  'src/pages/investor-relationships.astro',
  'src/pages/api/inquiries.ts',
  'src/pages/privacy.astro',
  'src/pages/terms.astro',
  'src/pages/thank-you.astro',
  'src/pages/404.astro',
  'src/pages/robots.txt.ts',
  'src/pages/sitemap.xml.ts',
  'src/layouts/BaseLayout.astro',
  'src/data/site.ts',
  'public/favicon.svg',
  'public/assets/social-card.svg',
];

export const APPROVED_SECTORS = [
  'Building & Construction',
  'Communication & Media',
  'Entertainment & Recreation',
  'Financial Services',
  'Health Care & Fitness',
  'Manufacturing',
  'Online & Technology',
  'Service Businesses',
  'Wholesale & Distributors',
];

export const APPROVED_RANGES = [
  { value: '$750K–$2M', label: 'Target EBITDA' },
  { value: '$2M–$6M', label: 'Typical deal value' },
];

export const BUYER_POSITIONING_REQUIREMENTS = {
  'src/data/site.ts': ['We Buy Established Businesses Directly'],
  'src/components/home/LeatherHomepage.astro': [
    'We buy established, profitable businesses directly from their owners.',
    'Not an investment bank.',
    'Not a broker.',
    'Not an M&A adviser.',
    'Hyperboards is the buyer.',
  ],
  'src/pages/our-approach.astro': ['We are the buyer. We do not represent the seller.'],
};

const SCANNED_EXTENSIONS = new Set(['.astro', '.html', '.js', '.jsx', '.mjs', '.ts', '.tsx']);

const forbiddenContent = [
  {
    code: 'placeholder-copy',
    pattern: /\blorem(?:\s+ipsum)?\b|\b(?:todo|tbd)\b|\[\s*placeholder[^\]]*\]|<\s*placeholder\s*>|\bcoming soon\b/i,
    message: 'Unresolved placeholder copy is present.',
  },
  {
    code: 'unapproved-experience-range',
    pattern: /\$\s*2(?:\.0)?\s*(?:m|million)\s*(?:[-–—]|to)\s*\$?\s*7(?:\.0)?\s*(?:m|million)/i,
    message: 'The unverified $2M–$7M transaction-experience range must not be published.',
  },
  {
    code: 'unsupported-track-record',
    pattern: /\b(?:we|hyperboards|our team)\s+(?:(?:have|has|previously)\s+)?(?:closed|completed|executed|handled|acquired|invested in)\s+(?:deals?|transactions?|acquisitions?|businesses?)\b/i,
    message: 'A transaction-history claim requires substantiation and approval.',
  },
  {
    code: 'unsupported-proof-language',
    pattern: /\b(?:proven track record|assets under management|committed capital|guaranteed funding|fully funded|guaranteed clos(?:e|ing)|permanent capital)\b/i,
    message: 'An unapproved capital, performance or certainty claim is present.',
  },
  {
    code: 'unsupported-transaction-count',
    pattern: /\b\d+\+?\s+(?:closed\s+)?(?:deals?|transactions?|acquisitions?)\b/i,
    message: 'A quantified transaction claim requires substantiation and approval.',
  },
];

const toProjectPath = (root, absolutePath) => path.relative(root, absolutePath).split(path.sep).join('/');

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(absolutePath)));
    } else if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

export function lintText(file, text) {
  const issues = [];

  for (const rule of forbiddenContent) {
    const match = text.match(rule.pattern);
    if (!match) continue;

    const beforeMatch = text.slice(0, match.index);
    const line = beforeMatch.split(/\r?\n/).length;
    issues.push({ file, line, code: rule.code, message: rule.message });
  }

  return issues;
}

export function verifyAcquisitionData(text, file = 'src/data/site.ts') {
  const issues = [];
  const sectorBlock = text.match(/export\s+const\s+sectors[\s\S]*?export\s+const\s+exclusions/);

  if (!sectorBlock) {
    issues.push({ file, line: 1, code: 'sector-data-missing', message: 'The approved sector data block could not be found.' });
  } else {
    const actualSectors = [...sectorBlock[0].matchAll(/\bname:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
    if (JSON.stringify(actualSectors) !== JSON.stringify(APPROVED_SECTORS)) {
      issues.push({
        file,
        line: 1,
        code: 'sector-data-mismatch',
        message: `Sector names or ordering differ from the approved list. Found: ${actualSectors.join(' | ')}`,
      });
    }
  }

  for (const range of APPROVED_RANGES) {
    if (!text.includes(`value: '${range.value}'`) || !text.includes(`label: '${range.label}'`)) {
      issues.push({
        file,
        line: 1,
        code: 'range-data-mismatch',
        message: `Missing approved criterion: ${range.value} ${range.label}.`,
      });
    }
  }

  return issues;
}

export function verifyBuyerPositioning(sourceByFile) {
  const issues = [];

  for (const [file, requiredMessages] of Object.entries(BUYER_POSITIONING_REQUIREMENTS)) {
    const source = sourceByFile[file] || '';
    for (const message of requiredMessages) {
      if (!source.includes(message)) {
        issues.push({
          file,
          line: 1,
          code: 'buyer-positioning-missing',
          message: `Missing required direct-buyer message: ${message}`,
        });
      }
    }
  }

  return issues;
}

export async function runContentCheck(root = PROJECT_ROOT) {
  const issues = [];
  const sourceByFile = {};

  for (const relativePath of REQUIRED_FILES) {
    try {
      await access(path.join(root, relativePath));
    } catch {
      issues.push({ file: relativePath, line: 1, code: 'required-file-missing', message: 'Required source file is missing.' });
    }
  }

  const sourceRoot = path.join(root, 'src');
  try {
    const sourceFiles = await collectSourceFiles(sourceRoot);
    for (const absolutePath of sourceFiles) {
      const relativePath = toProjectPath(root, absolutePath);
      const text = await readFile(absolutePath, 'utf8');
      sourceByFile[relativePath] = text;
      issues.push(...lintText(relativePath, text));
    }
  } catch (error) {
    issues.push({ file: 'src', line: 1, code: 'source-scan-failed', message: `Could not scan source files: ${error.message}` });
  }

  try {
    const dataPath = path.join(root, 'src/data/site.ts');
    const siteData = await readFile(dataPath, 'utf8');
    issues.push(...verifyAcquisitionData(siteData));
  } catch (error) {
    issues.push({ file: 'src/data/site.ts', line: 1, code: 'data-check-failed', message: `Could not verify acquisition data: ${error.message}` });
  }

  issues.push(...verifyBuyerPositioning(sourceByFile));

  return issues;
}

export function formatIssues(issues) {
  return issues.map((issue) => `${issue.file}:${issue.line} [${issue.code}] ${issue.message}`).join('\n');
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const issues = await runContentCheck();
  if (issues.length > 0) {
    console.error(`Content check failed with ${issues.length} issue(s):\n${formatIssues(issues)}`);
    process.exitCode = 1;
  } else {
    console.log('Content check passed: required files, direct-buyer positioning, approved criteria and claims policy verified.');
  }
}

/**
 * Sitemap Generator for Do I Need A Brolly
 *
 * Run with: npx tsx scripts/generateSitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..');

const DOMAIN = 'https://doineedabrolly.co.uk';
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const TODAY = new Date().toISOString().split('T')[0];
const MAX_URLS_PER_SITEMAP = 10000;

interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

// Import locations data
async function loadLocations(): Promise<Location[]> {
  const locationsPath = path.join(FRONTEND_DIR, 'functions/_shared/ukLocations.ts');
  const content = fs.readFileSync(locationsPath, 'utf-8');

  // Extract the array from the file
  const match = content.match(/export const ukLocations: Location\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Could not parse ukLocations');
  }

  return JSON.parse(match[1]);
}

function generateUrlEntry(loc: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${DOMAIN}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemapFile(urls: string[], filename: string): void {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, filename), content);
  console.log(`Generated ${filename} with ${urls.length} URLs`);
}

function generateSitemapIndex(sitemapFiles: string[]): void {
  const entries = sitemapFiles.map(file => `  <sitemap>
    <loc>${DOMAIN}/${file}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`);

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), content);
  console.log(`Generated sitemap.xml with ${sitemapFiles.length} sitemaps`);
}

async function main() {
  const locations = await loadLocations();
  console.log(`Loaded ${locations.length} locations`);

  // Get unique counties
  const counties = new Map<string, string>();
  for (const loc of locations) {
    if (!counties.has(loc.countySlug)) {
      counties.set(loc.countySlug, loc.county);
    }
  }
  console.log(`Found ${counties.size} unique counties`);

  // Static pages
  const staticUrls = [
    generateUrlEntry('/', 'daily', '1.0'),
    generateUrlEntry('/about', 'monthly', '0.3'),
    generateUrlEntry('/privacy', 'monthly', '0.2'),
    generateUrlEntry('/terms', 'monthly', '0.2'),
  ];

  // County URLs
  const countyUrls = Array.from(counties.keys()).map(slug =>
    generateUrlEntry(`/county/${slug}`, 'daily', '0.7')
  );
  console.log(`Generated ${countyUrls.length} county URLs`);

  // Location URLs - using new /weather/countySlug/slug format
  const locationUrls = locations.map(loc =>
    generateUrlEntry(`/weather/${loc.countySlug}/${loc.slug}`, 'hourly', '0.8')
  );

  // Combine all URLs
  const allUrls = [...staticUrls, ...countyUrls, ...locationUrls];

  // Split into multiple sitemaps if needed
  const sitemapFiles: string[] = [];
  let currentBatch: string[] = [];
  let batchNumber = 1;

  for (const url of allUrls) {
    currentBatch.push(url);

    if (currentBatch.length >= MAX_URLS_PER_SITEMAP) {
      const filename = `sitemap-locations-${batchNumber}.xml`;
      generateSitemapFile(currentBatch, filename);
      sitemapFiles.push(filename);
      currentBatch = [];
      batchNumber++;
    }
  }

  // Write remaining URLs
  if (currentBatch.length > 0) {
    const filename = `sitemap-locations-${batchNumber}.xml`;
    generateSitemapFile(currentBatch, filename);
    sitemapFiles.push(filename);
  }

  // Generate sitemap index
  generateSitemapIndex(sitemapFiles);

  console.log(`\nTotal URLs: ${allUrls.length}`);
  console.log('Sitemap generation complete!');
}

main().catch(console.error);

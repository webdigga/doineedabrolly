import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://doineedabrolly.co.uk';
const MAX_URLS_PER_SITEMAP = 10000;

interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

async function generateSitemap() {
  console.log('Loading locations data...');

  // Import locations from functions
  const locationsPath = path.join(__dirname, '../frontend/functions/_shared/ukLocations.ts');
  const locationsContent = fs.readFileSync(locationsPath, 'utf-8');

  // Extract the array from the file
  const match = locationsContent.match(/export const ukLocations: Location\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error('Could not parse locations file');
  }

  const locations: Location[] = JSON.parse(match[1]);
  console.log(`Found ${locations.length} locations`);

  const outputDir = path.join(__dirname, '../frontend/public');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Split locations into chunks
  const chunks: Location[][] = [];
  for (let i = 0; i < locations.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(locations.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  console.log(`Generating ${chunks.length} sitemap files...`);

  const today = new Date().toISOString().split('T')[0];

  // Generate individual sitemaps
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const includeStatic = i === 0; // Only include static pages in first file
    const sitemapContent = generateSitemapXml(chunk, today, includeStatic);
    const filename = `sitemap-locations-${i + 1}.xml`;
    fs.writeFileSync(path.join(outputDir, filename), sitemapContent);
    const urlCount = chunk.length + (includeStatic ? 4 : 0);
    console.log(`Generated ${filename} with ${urlCount} URLs`);
  }

  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex(chunks.length, today);
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex);
  console.log('Generated sitemap.xml (index)');

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);
  console.log('Generated robots.txt');

  console.log('Done!');
}

function generateSitemapXml(locations: Location[], lastmod: string, includeStatic: boolean): string {
  const urls = locations.map(loc => `  <url>
    <loc>${DOMAIN}/weather/${loc.countySlug}/${loc.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  const staticPages = includeStatic ? `  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/about</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${DOMAIN}/privacy</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terms</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages}${urls}
</urlset>`;
}

function generateSitemapIndex(count: number, lastmod: string): string {
  const sitemaps = Array.from({ length: count }, (_, i) => `  <sitemap>
    <loc>${DOMAIN}/sitemap-locations-${i + 1}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

generateSitemap().catch(console.error);

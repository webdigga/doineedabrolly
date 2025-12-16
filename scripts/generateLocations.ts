/**
 * Script to extract UK settlements from OS Open Names dataset
 * and generate the ukLocations.ts data file.
 *
 * Run with: npx tsx scripts/generateLocations.ts
 */

import { createReadStream } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { createInterface } from 'readline';
import { createUnzip } from 'zlib';
import { Parse } from 'unzipper';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

interface RawLocation {
  name: string;
  localType: string;
  easting: number;
  northing: number;
  county: string;
  country: string;
}

interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

// British National Grid to WGS84 conversion
// Based on Ordnance Survey formulas
function osgbToWgs84(easting: number, northing: number): { lat: number; lon: number } {
  // Airy 1830 ellipsoid
  const a = 6377563.396;
  const b = 6356256.909;
  const e2 = (a * a - b * b) / (a * a);

  // National Grid origin
  const N0 = -100000;
  const E0 = 400000;
  const F0 = 0.9996012717;
  const phi0 = (49 * Math.PI) / 180;
  const lambda0 = (-2 * Math.PI) / 180;

  const n = (a - b) / (a + b);
  const n2 = n * n;
  const n3 = n * n * n;

  let phi = phi0;
  let M = 0;

  // Iterate to find phi
  do {
    phi = ((northing - N0 - M) / (a * F0)) + phi;

    const Ma = (1 + n + (5 / 4) * n2 + (5 / 4) * n3) * (phi - phi0);
    const Mb = (3 * n + 3 * n2 + (21 / 8) * n3) * Math.sin(phi - phi0) * Math.cos(phi + phi0);
    const Mc = ((15 / 8) * n2 + (15 / 8) * n3) * Math.sin(2 * (phi - phi0)) * Math.cos(2 * (phi + phi0));
    const Md = (35 / 24) * n3 * Math.sin(3 * (phi - phi0)) * Math.cos(3 * (phi + phi0));

    M = b * F0 * (Ma - Mb + Mc - Md);
  } while (Math.abs(northing - N0 - M) >= 0.00001);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const tanPhi = Math.tan(phi);
  const tan2Phi = tanPhi * tanPhi;
  const tan4Phi = tan2Phi * tan2Phi;
  const tan6Phi = tan4Phi * tan2Phi;

  const secPhi = 1 / cosPhi;
  const nu = a * F0 / Math.sqrt(1 - e2 * sinPhi * sinPhi);
  const rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinPhi * sinPhi, 1.5);
  const eta2 = nu / rho - 1;

  const VII = tanPhi / (2 * rho * nu);
  const VIII = tanPhi / (24 * rho * nu * nu * nu) * (5 + 3 * tan2Phi + eta2 - 9 * tan2Phi * eta2);
  const IX = tanPhi / (720 * rho * Math.pow(nu, 5)) * (61 + 90 * tan2Phi + 45 * tan4Phi);
  const X = secPhi / nu;
  const XI = secPhi / (6 * nu * nu * nu) * (nu / rho + 2 * tan2Phi);
  const XII = secPhi / (120 * Math.pow(nu, 5)) * (5 + 28 * tan2Phi + 24 * tan4Phi);
  const XIIA = secPhi / (5040 * Math.pow(nu, 7)) * (61 + 662 * tan2Phi + 1320 * tan4Phi + 720 * tan6Phi);

  const dE = easting - E0;
  const dE2 = dE * dE;
  const dE3 = dE2 * dE;
  const dE4 = dE3 * dE;
  const dE5 = dE4 * dE;
  const dE6 = dE5 * dE;
  const dE7 = dE6 * dE;

  const phiOsgb = phi - VII * dE2 + VIII * dE4 - IX * dE6;
  const lambdaOsgb = lambda0 + X * dE - XI * dE3 + XII * dE5 - XIIA * dE7;

  // Convert OSGB36 to WGS84 using Helmert transformation
  const latOsgb = phiOsgb;
  const lonOsgb = lambdaOsgb;

  // Helmert transformation parameters (OSGB36 to WGS84)
  const tx = 446.448;
  const ty = -125.157;
  const tz = 542.060;
  const rx = (0.1502 / 3600) * (Math.PI / 180);
  const ry = (0.2470 / 3600) * (Math.PI / 180);
  const rz = (0.8421 / 3600) * (Math.PI / 180);
  const s = -20.4894 / 1e6;

  // Convert to cartesian
  const sinLat = Math.sin(latOsgb);
  const cosLat = Math.cos(latOsgb);
  const sinLon = Math.sin(lonOsgb);
  const cosLon = Math.cos(lonOsgb);

  const nuCart = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const x1 = nuCart * cosLat * cosLon;
  const y1 = nuCart * cosLat * sinLon;
  const z1 = nuCart * (1 - e2) * sinLat;

  // Apply Helmert transformation
  const x2 = tx + (1 + s) * x1 + (-rz) * y1 + ry * z1;
  const y2 = ty + rz * x1 + (1 + s) * y1 + (-rx) * z1;
  const z2 = tz + (-ry) * x1 + rx * y1 + (1 + s) * z1;

  // WGS84 ellipsoid
  const aWgs = 6378137.0;
  const bWgs = 6356752.3142;
  const e2Wgs = (aWgs * aWgs - bWgs * bWgs) / (aWgs * aWgs);

  // Convert back to lat/lon
  const p = Math.sqrt(x2 * x2 + y2 * y2);
  let lat = Math.atan2(z2, p * (1 - e2Wgs));

  for (let i = 0; i < 10; i++) {
    const nuWgs = aWgs / Math.sqrt(1 - e2Wgs * Math.sin(lat) * Math.sin(lat));
    lat = Math.atan2(z2 + e2Wgs * nuWgs * Math.sin(lat), p);
  }

  const lon = Math.atan2(y2, x2);

  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
  };
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Settlement types to include
const SETTLEMENT_TYPES = new Set([
  'City',
  'Town',
  'Village',
  'Hamlet',
  'Suburban Area',
  'Other Settlement',
]);

// Priority for sorting (higher = more important)
const TYPE_PRIORITY: Record<string, number> = {
  'City': 100000,
  'Town': 10000,
  'Suburban Area': 1000,
  'Village': 100,
  'Other Settlement': 10,
  'Hamlet': 1,
};

async function extractLocations(zipPath: string): Promise<RawLocation[]> {
  const locations: RawLocation[] = [];

  console.log('Extracting locations from zip file...');

  await new Promise<void>((resolve, reject) => {
    createReadStream(zipPath)
      .pipe(Parse())
      .on('entry', async (entry) => {
        const fileName = entry.path;

        if (fileName.startsWith('Data/') && fileName.endsWith('.csv')) {
          let csvContent = '';

          entry.on('data', (chunk: Buffer) => {
            csvContent += chunk.toString('utf8');
          });

          entry.on('end', () => {
            const lines = csvContent.split('\n');

            for (const line of lines) {
              if (!line.trim()) continue;

              // Parse CSV (handling quoted fields)
              const fields = parseCSVLine(line);

              if (fields.length < 30) continue;

              const type = fields[6];
              const localType = fields[7];

              if (type !== 'populatedPlace') continue;
              if (!SETTLEMENT_TYPES.has(localType)) continue;

              const name = fields[2];
              const easting = parseFloat(fields[8]);
              const northing = parseFloat(fields[9]);
              const county = fields[24] || '';
              const country = fields[29] || '';

              if (!name || isNaN(easting) || isNaN(northing)) continue;

              // Only include UK locations
              if (!['England', 'Scotland', 'Wales', 'Northern Ireland'].includes(country)) {
                continue;
              }

              locations.push({
                name,
                localType,
                easting,
                northing,
                county,
                country,
              });
            }
          });
        } else {
          entry.autodrain();
        }
      })
      .on('close', resolve)
      .on('error', reject);
  });

  console.log(`Found ${locations.length} settlements`);
  return locations;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function transformLocations(rawLocations: RawLocation[]): Location[] {
  console.log('Converting coordinates and generating slugs...');

  const locations: Location[] = rawLocations.map((raw) => {
    const { lat, lon } = osgbToWgs84(raw.easting, raw.northing);

    return {
      slug: createSlug(raw.name),
      name: raw.name,
      county: raw.county,
      countySlug: createSlug(raw.county),
      lat: Math.round(lat * 10000) / 10000, // 4 decimal places (~11m precision)
      lon: Math.round(lon * 10000) / 10000,
    };
  });

  // Sort by name for consistent output
  locations.sort((a, b) => a.name.localeCompare(b.name));

  return locations;
}

function handleDuplicateSlugs(locations: Location[]): Location[] {
  console.log('Handling duplicate slugs...');

  const slugCounts = new Map<string, number>();
  const slugLocations = new Map<string, Location[]>();

  // Group by slug
  for (const loc of locations) {
    const existing = slugLocations.get(loc.slug) || [];
    existing.push(loc);
    slugLocations.set(loc.slug, existing);
  }

  const result: Location[] = [];

  for (const [slug, locs] of slugLocations) {
    if (locs.length === 1) {
      result.push(locs[0]);
    } else {
      // Multiple locations with same slug - append county
      for (const loc of locs) {
        const uniqueSlug = loc.countySlug
          ? `${slug}-${loc.countySlug}`
          : slug;

        result.push({
          ...loc,
          slug: uniqueSlug,
        });
      }
    }
  }

  return result;
}

async function generateTypeScriptFile(locations: Location[], outputPath: string): Promise<void> {
  console.log(`Generating TypeScript file with ${locations.length} locations...`);

  const header = `// Auto-generated from OS Open Names dataset
// Do not edit manually - run scripts/generateLocations.ts to regenerate

export interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

export const ukLocations: Location[] = `;

  const locationsJson = JSON.stringify(locations, null, 2);

  const footer = `;

// Indexes for fast lookup
export const locationsBySlug = new Map<string, Location>(
  ukLocations.map(loc => [loc.slug, loc])
);

export const locationsByCounty = new Map<string, Location[]>();
for (const loc of ukLocations) {
  const existing = locationsByCounty.get(loc.countySlug) || [];
  existing.push(loc);
  locationsByCounty.set(loc.countySlug, existing);
}

// Simple prefix search for autocomplete
export function searchLocations(query: string, limit = 10): Location[] {
  const normalised = query.toLowerCase().trim();
  if (!normalised) return [];

  return ukLocations
    .filter(loc => loc.name.toLowerCase().startsWith(normalised))
    .slice(0, limit);
}
`;

  await writeFile(outputPath, header + locationsJson + footer, 'utf8');
  console.log(`Written to ${outputPath}`);
}

async function main() {
  const zipPath = process.cwd() + '/opname_csv_gb.zip';
  const outputPath = process.cwd() + '/worker/src/data/ukLocations.ts';

  try {
    const rawLocations = await extractLocations(zipPath);
    const transformedLocations = transformLocations(rawLocations);
    const uniqueLocations = handleDuplicateSlugs(transformedLocations);

    await generateTypeScriptFile(uniqueLocations, outputPath);

    console.log('Done!');
    console.log(`Total locations: ${uniqueLocations.length}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

/**
 * Script to fix missing county data for UK metropolitan areas
 * Run with: npx tsx scripts/fixMissingCounties.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Metropolitan county boundaries (approximate bounding boxes)
// Format: { minLat, maxLat, minLon, maxLon }
const metropolitanCounties: Record<string, { name: string; bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number } }> = {
  'greater-london': {
    name: 'Greater London',
    bounds: { minLat: 51.28, maxLat: 51.69, minLon: -0.51, maxLon: 0.34 }
  },
  'greater-manchester': {
    name: 'Greater Manchester',
    bounds: { minLat: 53.34, maxLat: 53.69, minLon: -2.73, maxLon: -1.91 }
  },
  'merseyside': {
    name: 'Merseyside',
    bounds: { minLat: 53.31, maxLat: 53.70, minLon: -3.25, maxLon: -2.73 }
  },
  'south-yorkshire': {
    name: 'South Yorkshire',
    bounds: { minLat: 53.30, maxLat: 53.66, minLon: -1.85, maxLon: -0.95 }
  },
  'tyne-and-wear': {
    name: 'Tyne and Wear',
    bounds: { minLat: 54.83, maxLat: 55.12, minLon: -1.85, maxLon: -1.35 }
  },
  'west-midlands': {
    name: 'West Midlands',
    bounds: { minLat: 52.28, maxLat: 52.70, minLon: -2.22, maxLon: -1.40 }
  },
  'west-yorkshire': {
    name: 'West Yorkshire',
    bounds: { minLat: 53.55, maxLat: 53.97, minLon: -2.17, maxLon: -1.00 }  // Expanded west for Todmorden/Calderdale
  },
  // Non-metropolitan counties for edge cases
  'county-durham': {
    name: 'County Durham',
    bounds: { minLat: 54.70, maxLat: 54.90, minLon: -1.85, maxLon: -1.35 }  // Southern County Durham near Tyne and Wear
  }
};

function isInBounds(lat: number, lon: number, bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }): boolean {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lon >= bounds.minLon && lon <= bounds.maxLon;
}

function findMetropolitanCounty(lat: number, lon: number): { slug: string; name: string } | null {
  for (const [slug, data] of Object.entries(metropolitanCounties)) {
    if (isInBounds(lat, lon, data.bounds)) {
      return { slug, name: data.name };
    }
  }
  return null;
}

async function main() {
  const filePath = path.join(__dirname, '../functions/_shared/ukLocations.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Parse the locations array from the file
  const locationsMatch = content.match(/export const ukLocations[^=]*=\s*(\[[\s\S]*?\n\]);/);
  if (!locationsMatch) {
    console.error('Could not find ukLocations array');
    return;
  }

  const locationsJson = locationsMatch[1];
  const locations = JSON.parse(locationsJson);

  let fixedCount = 0;
  let unfixedCount = 0;
  const unfixedLocations: string[] = [];

  for (const location of locations) {
    if (!location.county || location.county === '') {
      const metro = findMetropolitanCounty(location.lat, location.lon);
      if (metro) {
        location.county = metro.name;
        location.countySlug = metro.slug;
        fixedCount++;
      } else {
        unfixedCount++;
        if (unfixedLocations.length < 20) {
          unfixedLocations.push(`${location.name} (${location.lat}, ${location.lon})`);
        }
      }
    }
  }

  console.log(`Fixed ${fixedCount} locations`);
  console.log(`Could not fix ${unfixedCount} locations`);
  if (unfixedLocations.length > 0) {
    console.log('Sample unfixed locations:');
    unfixedLocations.forEach(l => console.log(`  - ${l}`));
  }

  // Write updated locations back
  const updatedLocationsJson = JSON.stringify(locations, null, 2);
  const updatedContent = content.replace(
    /export const ukLocations[^=]*=\s*\[[\s\S]*?\n\];/,
    `export const ukLocations: Location[] = ${updatedLocationsJson};`
  );

  fs.writeFileSync(filePath, updatedContent);
  console.log('Updated ukLocations.ts');

  // Also update the locationsByCounty map
  updateLocationsByCounty(locations, filePath);
}

function updateLocationsByCounty(locations: any[], filePath: string) {
  // Group locations by county
  const byCounty = new Map<string, any[]>();
  for (const loc of locations) {
    if (loc.countySlug) {
      if (!byCounty.has(loc.countySlug)) {
        byCounty.set(loc.countySlug, []);
      }
      byCounty.get(loc.countySlug)!.push(loc);
    }
  }

  console.log(`\nCounty distribution (${byCounty.size} counties):`);
  const sorted = Array.from(byCounty.entries()).sort((a, b) => b[1].length - a[1].length);
  sorted.slice(0, 15).forEach(([county, locs]) => {
    console.log(`  ${county}: ${locs.length} locations`);
  });
}

main().catch(console.error);

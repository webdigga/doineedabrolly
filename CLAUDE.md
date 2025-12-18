# Do I Need My Brolly - Architecture & Development Guide

A high-traffic UK weather website delivering plain English weather forecasts for every town and village in the UK. Built with React + Vite frontend hosted on Cloudflare Pages, with Cloudflare Workers handling API caching and data transformation.

**Domain:** doineedabrolly.co.uk

**Purpose:** Generate traffic through SEO-optimised town pages, monetised via Kabooly CRM advertising.

## AI Assistant Restrictions

**CRITICAL: The following actions are STRICTLY FORBIDDEN:**

1. **NO DEPLOYMENTS** - Never deploy to any environment. This includes:
   - `wrangler deploy` / `wrangler publish`
   - `npm run deploy`
   - Any Cloudflare Workers/Pages deployment commands
   - Pushing to any deployment branches

2. **NO GIT COMMITS** - Never commit changes via git. This includes:
   - `git commit`
   - `git push`
   - `git merge`
   - Any git commands that modify the repository history

The user maintains full control over all deployments and version control. You may:
- Write and edit code
- Run tests and linting
- Run the dev server
- Read git status/log/diff for context
- Suggest what should be committed or deployed

But you must NEVER execute deployment or git commit operations yourself.

## Project Overview

### The Differentiator

Unlike BBC Weather or Met Office which show data (14°C, 60% precipitation), this site leads with **plain English summaries**:

- "Dry until mid-afternoon, rain from 3pm"
- "Good morning for the school run, wet by lunch"
- "Saturday looks better than Sunday"
- "You'll need your brolly after 2pm"

### Target Keywords

Primary SEO targets (high volume, location-based):
- "[town] weather tomorrow"
- "[town] weather this weekend"
- "[town] weather today"
- "[town] 7 day forecast"
- "weather [town]"

### Coverage

All UK locations - approximately 40,000+ towns, villages, and localities. Data sourced from ONS (Office for National Statistics) datasets.

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety throughout
- **React Router v7** - Client-side routing
- **CSS Modules** - Scoped component styling
- **PostCSS** - CSS transformations

### Backend / Infrastructure
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare Workers** - API proxy, caching, data transformation
- **Open-Meteo API** - Weather data source (free, no key required)

### No Database

This is a stateless site. All data comes from:
1. Static UK location dataset (built into the app)
2. Open-Meteo API (fetched and cached via Workers)

## Project Structure

```
doineedabrolly/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   └── ComponentName/
│   │   │       ├── ComponentName.tsx
│   │   │       └── ComponentName.module.css
│   │   ├── pages/               # Page components (routed)
│   │   │   └── PageName/
│   │   │       ├── PageName.tsx
│   │   │       └── PageName.module.css
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service layer
│   │   │   ├── weatherService.ts      # Weather API abstraction
│   │   │   └── weatherProviders/
│   │   │       └── openMeteo.ts       # Open-Meteo implementation
│   │   ├── utils/               # Utility functions
│   │   │   ├── plainEnglish.ts        # Weather-to-text rules engine
│   │   │   └── logger.ts
│   │   ├── data/                # Static data
│   │   │   └── ukLocations.ts         # UK towns/villages dataset
│   │   ├── types/               # TypeScript type definitions
│   │   ├── styles/              # Global styles
│   │   │   ├── variables.css          # Design tokens
│   │   │   └── global.css             # Global element styles
│   │   ├── config.ts            # Environment configuration
│   │   ├── App.tsx              # Root routing component
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Main CSS entry point
│   ├── public/
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── worker/                      # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts             # Main entry point, route registration
│   │   ├── routes/
│   │   │   └── weather.ts       # Weather API endpoints
│   │   ├── services/
│   │   │   ├── weatherService.ts
│   │   │   └── providers/
│   │   │       └── openMeteo.ts
│   │   ├── utils/
│   │   │   ├── cache.ts         # Caching logic
│   │   │   ├── response.ts      # Response helpers
│   │   │   └── plainEnglish.ts  # Weather-to-text (shared logic)
│   │   └── types/
│   │       └── index.ts
│   ├── wrangler.toml
│   ├── tsconfig.json
│   └── package.json
│
├── scripts/                     # Utility scripts
│   └── generateLocations.ts     # Process ONS data into location dataset
│
├── CLAUDE.md                    # This file
└── README.md
```

## URL Structure & Routing

### Frontend Routes

**Location Pages (SEO landing pages):**
```
/weather/:town                    # Town page (e.g., /weather/taunton)
/weather/:county                  # County overview (e.g., /weather/somerset)
/weather/:county/:town            # Disambiguation (e.g., /weather/somerset/taunton)
```

**Time-based Views (same page, different sections/tabs):**
```
/weather/taunton                  # Default: today + tomorrow
/weather/taunton/today            # Today detailed
/weather/taunton/tomorrow         # Tomorrow detailed
/weather/taunton/weekend          # Saturday + Sunday
/weather/taunton/7-day            # Week ahead
/weather/taunton/14-day           # Two weeks (if API supports)
```

**Static Pages:**
```
/                                 # Homepage (location search/detect)
/about                            # About the site
/privacy                          # Privacy policy
/terms                            # Terms of service
```

### Worker API Routes

```
GET /api/weather/:lat/:lon        # Weather by coordinates
    ?days=7                       # Number of days (1-14)
    
GET /api/location/search          # Location search
    ?q=taun                       # Search query
    
GET /api/location/:slug           # Get location details by slug
```

## Weather API Abstraction

The weather service is abstracted to allow easy switching between providers.

### Interface

```typescript
// types/weather.ts
interface WeatherProvider {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getForecast(lat: number, lon: number, days: number): Promise<Forecast>;
}

interface CurrentWeather {
  temperature: number;           // Celsius
  feelsLike: number;
  humidity: number;              // Percentage
  windSpeed: number;             // km/h
  windDirection: number;         // Degrees
  uvIndex: number;
  weatherCode: number;           // WMO standard codes
  isDay: boolean;
}

interface ForecastDay {
  date: string;                  // ISO date
  sunrise: string;               // ISO datetime
  sunset: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  precipitationSum: number;      // mm
  weatherCode: number;
  uvIndexMax: number;
  hourly: HourlyForecast[];
}

interface HourlyForecast {
  time: string;                  // ISO datetime
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
}

interface Forecast {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  current: CurrentWeather;
  daily: ForecastDay[];
}
```

### Open-Meteo Implementation

```typescript
// services/weatherProviders/openMeteo.ts
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getForecast(lat: number, lon: number, days: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day',
    daily: 'sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code,uv_index_max',
    timezone: 'Europe/London',
    forecast_days: days.toString(),
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  const data = await response.json();
  
  return transformOpenMeteoResponse(data);
}
```

### Switching Providers

To switch to a different provider (e.g., OpenWeatherMap):

1. Create new file: `services/weatherProviders/openWeatherMap.ts`
2. Implement the same interface
3. Update `services/weatherService.ts` to use new provider
4. No changes needed to components or pages

## Plain English Rules Engine

The core differentiator - converting weather data into human-readable summaries.

### Location

```
/frontend/src/utils/plainEnglish.ts
/worker/src/utils/plainEnglish.ts    # Shared logic, can be identical
```

### Rules Structure

```typescript
interface PlainEnglishSummary {
  headline: string;              // "You'll need your brolly this afternoon"
  today: string;                 // "Dry this morning, rain arriving around 2pm"
  tomorrow: string;              // "A wet start, brightening up by lunchtime"
  weekend: string;               // "Saturday looks better than Sunday"
  bestDay: string | null;        // "Wednesday is your best bet this week"
}

function generateSummary(forecast: Forecast): PlainEnglishSummary {
  // Implementation
}
```

### Example Rules

```typescript
// Rain timing
function describeRainTiming(hourly: HourlyForecast[]): string {
  const rainHours = hourly.filter(h => h.precipitationProbability > 50);
  
  if (rainHours.length === 0) {
    return "Staying dry all day";
  }
  
  const firstRain = rainHours[0];
  const hour = new Date(firstRain.time).getHours();
  
  if (hour < 9) return "A wet start to the day";
  if (hour < 12) return "Rain arriving mid-morning";
  if (hour < 14) return "Rain expected around lunchtime";
  if (hour < 17) return "Rain this afternoon";
  if (hour < 20) return "Rain arriving this evening";
  return "Rain expected overnight";
}

// Temperature feel
function describeTemperature(temp: number): string {
  if (temp < 0) return "freezing";
  if (temp < 5) return "very cold";
  if (temp < 10) return "cold";
  if (temp < 15) return "cool";
  if (temp < 20) return "mild";
  if (temp < 25) return "warm";
  if (temp < 30) return "hot";
  return "very hot";
}

// Headline generation
function generateHeadline(forecast: Forecast): string {
  const today = forecast.daily[0];
  const rainProb = today.precipitationProbability;
  
  if (rainProb > 70) {
    return "You'll definitely need your brolly today";
  }
  if (rainProb > 40) {
    return "Pack your brolly just in case";
  }
  if (rainProb > 20) {
    return "Probably won't need your brolly";
  }
  return "Leave the brolly at home";
}
```

### Weather Codes (WMO Standard)

Open-Meteo uses WMO weather codes. Map these to plain English:

```typescript
const weatherDescriptions: Record<number, string> = {
  0: 'clear skies',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'freezing fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'light showers',
  81: 'showers',
  82: 'heavy showers',
  85: 'light snow showers',
  86: 'snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with hail',
  99: 'severe thunderstorm with hail',
};
```

## Caching Strategy

### Worker-Level Caching

Weather data cached in Cloudflare Workers KV or Cache API.

```typescript
// Cache keys
const cacheKey = `weather:${lat}:${lon}:${days}`;

// Cache duration
const CACHE_TTL = 15 * 60; // 15 minutes

// Implementation
async function getCachedWeather(lat: number, lon: number, days: number, cache: KVNamespace): Promise<Forecast | null> {
  const key = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}`;
  const cached = await cache.get(key, 'json');
  return cached as Forecast | null;
}

async function setCachedWeather(lat: number, lon: number, days: number, data: Forecast, cache: KVNamespace): Promise<void> {
  const key = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}`;
  await cache.put(key, JSON.stringify(data), { expirationTtl: CACHE_TTL });
}
```

### Cache Invalidation

- TTL-based: 15 minutes for weather data
- Coordinates rounded to 2 decimal places (approximately 1km precision) to increase cache hits

### Frontend Caching

- React Query or SWR for client-side caching (optional)
- Service worker for offline support (phase 2)

## UK Locations Data

### Data Source

Office for National Statistics (ONS) provides free datasets:
- OS Open Names
- Index of Place Names

### Data Structure

```typescript
// data/ukLocations.ts
interface Location {
  slug: string;                  // URL-friendly: "taunton"
  name: string;                  // Display: "Taunton"
  county: string;                // "Somerset"
  countySlug: string;            // "somerset"
  lat: number;
  lon: number;
  population?: number;           // For sorting/priority
}

// Export as searchable array
export const ukLocations: Location[] = [
  { slug: 'taunton', name: 'Taunton', county: 'Somerset', countySlug: 'somerset', lat: 51.0147, lon: -3.1029 },
  // ... 40,000+ entries
];

// Indexes for fast lookup
export const locationsBySlug: Map<string, Location> = new Map();
export const locationsByCounty: Map<string, Location[]> = new Map();
```

### Search Implementation

```typescript
// Simple prefix search for autocomplete
function searchLocations(query: string, limit = 10): Location[] {
  const normalised = query.toLowerCase().trim();
  return ukLocations
    .filter(loc => loc.name.toLowerCase().startsWith(normalised))
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit);
}
```

## CSS Architecture

### Mobile-First Approach

**CRITICAL: Always use `min-width` media queries, never `max-width`.**

```css
/* Base styles are mobile */
.container {
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

### Design Tokens

```css
/* styles/variables.css */
:root {
  /* Colors - Light theme (weather sites should be bright/readable) */
  --color-primary: #0066cc;
  --color-primary-dark: #0052a3;
  --color-primary-light: #3399ff;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f7fa;
  --color-bg-tertiary: #e8ecf1;
  
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #4a5568;
  --color-text-tertiary: #718096;
  
  --color-border: #e2e8f0;
  
  /* Weather-specific colors */
  --color-rain: #4a90d9;
  --color-sun: #f6ad55;
  --color-cloud: #a0aec0;
  --color-snow: #e2e8f0;
  --color-thunder: #805ad5;
  
  /* Status */
  --color-success: #48bb78;
  --color-warning: #ed8936;
  --color-danger: #f56565;
  
  /* Spacing (8px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Typography */
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-heading: var(--font-body);
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Breakpoints (for reference - use in media queries) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-overlay: 1000;
  --z-modal: 1001;
  --z-tooltip: 1100;
}
```

### CSS Modules Pattern

Each component has its own `.module.css` file:

```tsx
// components/WeatherCard/WeatherCard.tsx
import styles from './WeatherCard.module.css';

export function WeatherCard({ temperature, description }: WeatherCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.temperature}>{temperature}°</span>
      <span className={styles.description}>{description}</span>
    </div>
  );
}
```

```css
/* components/WeatherCard/WeatherCard.module.css */
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
}

.temperature {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.description {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}
```

## TypeScript Configuration

### Frontend (`frontend/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@data/*": ["src/data/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Worker (`worker/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types"],
    "baseUrl": ".",
    "paths": {
      "@routes/*": ["src/routes/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"]
}
```

## Component Patterns

### Page Component

```tsx
// pages/WeatherPage/WeatherPage.tsx
import { useParams } from 'react-router-dom';
import { useWeather } from '@hooks/useWeather';
import { useLocation } from '@hooks/useLocation';
import { WeatherSummary } from '@components/WeatherSummary/WeatherSummary';
import { HourlyForecast } from '@components/HourlyForecast/HourlyForecast';
import { DailyForecast } from '@components/DailyForecast/DailyForecast';
import { KaboolyBanner } from '@components/KaboolyBanner/KaboolyBanner';
import styles from './WeatherPage.module.css';

export function WeatherPage() {
  const { town } = useParams<{ town: string }>();
  const { location, loading: locationLoading } = useLocation(town);
  const { forecast, loading: weatherLoading, error } = useWeather(location?.lat, location?.lon);

  if (locationLoading || weatherLoading) {
    return <LoadingSpinner />;
  }

  if (error || !location || !forecast) {
    return <ErrorMessage message="Could not load weather data" />;
  }

  return (
    <div className={styles.page}>
      <KaboolyBanner />
      
      <header className={styles.header}>
        <h1>{location.name} Weather</h1>
        <p className={styles.county}>{location.county}</p>
      </header>

      <WeatherSummary forecast={forecast} />
      <HourlyForecast hours={forecast.daily[0].hourly} />
      <DailyForecast days={forecast.daily} />
    </div>
  );
}
```

### Custom Hook

```tsx
// hooks/useWeather.ts
import { useState, useEffect } from 'react';
import { getWeather } from '@services/weatherService';
import type { Forecast } from '@types/weather';

interface UseWeatherResult {
  forecast: Forecast | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(lat?: number, lon?: number): UseWeatherResult {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setLoading(false);
      return;
    }

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeather(lat, lon, 7);
        setForecast(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lon]);

  return { forecast, loading, error };
}
```

### Reusable Component

```tsx
// components/WeatherIcon/WeatherIcon.tsx
import styles from './WeatherIcon.module.css';

interface WeatherIconProps {
  code: number;
  isDay: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function WeatherIcon({ code, isDay, size = 'md' }: WeatherIconProps) {
  const iconName = getIconForCode(code, isDay);
  
  return (
    <span className={`${styles.icon} ${styles[size]}`} aria-hidden="true">
      {iconName}
    </span>
  );
}

function getIconForCode(code: number, isDay: boolean): string {
  // Map WMO codes to icons/emojis
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}
```

## Kabooly Advertising

### Banner Placement

Fixed banner at top of every page, below navigation.

```tsx
// components/KaboolyBanner/KaboolyBanner.tsx
import styles from './KaboolyBanner.module.css';

export function KaboolyBanner() {
  return (
    <a 
      href="https://kabooly.com/crm/how-it-works/?utm_source=doineedabrolly&utm_medium=banner&utm_campaign=weather"
      target="_blank"
      rel="noopener"
      className={styles.banner}
    >
      <span className={styles.text}>
        Need a CRM? Try Kabooly - simple, powerful, and refreshingly easy to use
      </span>
      <span className={styles.cta}>Learn more →</span>
    </a>
  );
}
```

```css
/* components/KaboolyBanner/KaboolyBanner.module.css */
.banner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  font-size: var(--text-sm);
}

.banner:hover {
  background: var(--color-primary-dark);
}

.text {
  flex: 1;
  text-align: center;
}

.cta {
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

@media (min-width: 768px) {
  .banner {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-base);
  }
}
```

### UTM Parameters

All Kabooly links should include tracking:
- `utm_source=doineedabrolly`
- `utm_medium=banner`
- `utm_campaign=weather`

## SEO Considerations

### Page Titles

```
{Town} Weather - Today, Tomorrow & 7 Day Forecast | Do I Need My Brolly
```

### Meta Descriptions

Dynamic based on current weather:
```
{Town} weather: {headline}. Get the plain English forecast for today, tomorrow and the week ahead.
```

### Structured Data

Include JSON-LD for weather:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Taunton Weather Forecast",
  "description": "Plain English weather forecast for Taunton, Somerset",
  "mainEntity": {
    "@type": "Place",
    "name": "Taunton",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.0147,
      "longitude": -3.1029
    }
  }
}
```

### Sitemap

Generate sitemap.xml with all location pages:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://doineedabrolly.co.uk/weather/somerset/taunton</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... all locations -->
</urlset>
```

## Build & Development Commands

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Worker

```bash
cd worker

# Install dependencies
npm install

# Local development
npm run dev

# Type check
npm run typecheck
```

## File Naming Conventions

| Type | Extension | Example |
|------|-----------|---------|
| React components | `.tsx` | `WeatherCard.tsx` |
| Hooks | `.ts` | `useWeather.ts` |
| Utilities | `.ts` | `plainEnglish.ts` |
| Types | `.ts` | `weather.ts` |
| Styles | `.module.css` | `WeatherCard.module.css` |
| Tests | `.test.ts` / `.test.tsx` | `useWeather.test.ts` |

## Development Tips

1. **No database** - Keep it simple, all state from API or static data
2. **Cache aggressively** - Weather doesn't change every second
3. **Mobile-first** - Most weather checks are on phones
4. **Plain English first** - Lead with the summary, details below
5. **Fast loading** - Users want quick answers, optimize bundle size
6. **SEO is king** - This is a traffic play, every page should be optimised

---

**Last Updated:** December 2025

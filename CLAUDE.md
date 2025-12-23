# Do I Need A Brolly - Architecture & Development Guide

A high-traffic UK weather website delivering plain English weather forecasts for every town and village in the UK. Built with React + Vike (SSR) deployed to Cloudflare Workers.

**Domain:** doineedabrolly.co.uk

**Purpose:** Generate traffic through SEO-optimised town pages, monetised via Kabooly CRM advertising.

---

## Architecture Template Reference

This project serves as a **reference architecture** for building high-traffic, SEO-focused sites. The stack can be reused for similar projects (traffic sites, football sites, etc.) by:

1. Copying the project structure
2. Replacing the data layer (locations → teams, routes, etc.)
3. Updating the API integration
4. Customising the UI components

Key architectural decisions that make this reusable:
- **Vike SSR** - Server-side rendering for SEO/AI crawler visibility
- **Cloudflare Workers** - Edge deployment, global performance
- **File-based routing** - Easy to understand URL structure
- **Hono API server** - Lightweight, fast API routes
- **CSS Modules** - Scoped styling, no conflicts
- **TypeScript** - Type safety throughout

---

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

---

## Technology Stack

### Core Framework
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Vike** - SSR framework (file-based routing, server-side data fetching)
- **vike-react** - React integration for Vike
- **vike-photon** - Cloudflare Workers deployment adapter
- **TypeScript** - Type safety throughout

### Server & API
- **Hono** - Lightweight web framework for API routes
- **Cloudflare Workers** - Edge runtime for SSR and API

### Styling
- **CSS Modules** - Scoped component styling
- **CSS Variables** - Design tokens

### Deployment
- **GitHub Actions** - CI/CD pipeline
- **Cloudflare Workers** - Production hosting

### No Database
This is a stateless site. All data comes from:
1. Static dataset (built into the app)
2. External API (fetched and cached server-side)

---

## Project Structure

```
doineedabrolly/
├── frontend/
│   ├── pages/                      # Vike file-based routing
│   │   ├── +config.ts              # Global Vike config
│   │   ├── +Layout.tsx             # Root layout component
│   │   ├── +Head.tsx               # Global head tags (fonts, icons, etc.)
│   │   ├── index/                  # Homepage (/)
│   │   │   ├── +Page.tsx
│   │   │   ├── +Head.tsx
│   │   │   └── +prerender.ts
│   │   ├── about/                  # Static page (/about)
│   │   │   ├── +Page.tsx
│   │   │   ├── +Head.tsx
│   │   │   └── +prerender.ts
│   │   ├── county/
│   │   │   └── @countySlug/        # Dynamic route (/county/:countySlug)
│   │   │       ├── +Page.tsx
│   │   │       ├── +Head.tsx
│   │   │       └── +data.ts        # Server-side data fetching
│   │   ├── weather/
│   │   │   └── @countySlug/
│   │   │       └── @slug/          # Dynamic route (/weather/:countySlug/:slug)
│   │   │           ├── +Page.tsx
│   │   │           ├── +Head.tsx
│   │   │           └── +data.ts
│   │   └── _error/                 # Error page
│   │       ├── +Page.tsx
│   │       └── +Head.tsx
│   │
│   ├── server/                     # Hono API server
│   │   └── index.ts                # API routes + Vike middleware
│   │
│   ├── functions/                  # Shared business logic
│   │   └── _shared/
│   │       ├── types.ts            # TypeScript types
│   │       ├── ukLocations.ts      # Static location data
│   │       ├── weatherService.ts   # Weather API service
│   │       ├── weatherApi.ts       # API client
│   │       ├── plainEnglish.ts     # Data-to-text rules engine
│   │       ├── weatherCodes.ts     # Weather code mappings
│   │       └── cache.ts            # Caching utilities
│   │
│   ├── src/
│   │   ├── components/             # Reusable React components
│   │   │   └── ComponentName/
│   │   │       ├── ComponentName.tsx
│   │   │       └── ComponentName.module.css
│   │   ├── hooks/                  # Client-side React hooks
│   │   │   └── useLocationSearch.ts
│   │   ├── utils/                  # Client-side utilities
│   │   │   └── weather.ts
│   │   ├── pages/                  # CSS modules for pages (legacy)
│   │   │   └── PageName/
│   │   │       └── PageName.module.css
│   │   ├── styles/
│   │   │   ├── variables.css       # Design tokens
│   │   │   └── global.css          # Global styles
│   │   └── index.css               # CSS entry point
│   │
│   ├── public/                     # Static assets
│   │   ├── sitemap.xml
│   │   ├── sitemap-locations-*.xml
│   │   ├── manifest.json
│   │   └── favicon.ico
│   │
│   ├── wrangler.jsonc              # Cloudflare Workers config
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment
│
├── CLAUDE.md                       # This file
└── README.md
```

---

## Vike File-Based Routing

### Route Files

| File | Purpose |
|------|---------|
| `+Page.tsx` | React component for the page |
| `+Head.tsx` | Meta tags, title, Open Graph, etc. |
| `+data.ts` | Server-side data fetching (runs on every request) |
| `+prerender.ts` | Enable static pre-rendering |
| `+guard.ts` | Route guards (redirects, auth) |
| `+config.ts` | Route-specific configuration |
| `+Layout.tsx` | Layout wrapper component |

### Dynamic Routes

Use `@param` syntax for dynamic segments:
```
pages/weather/@countySlug/@slug/+Page.tsx
→ /weather/:countySlug/:slug
→ /weather/somerset/taunton
```

Access params in `+data.ts`:
```typescript
export async function data(pageContext: PageContextServer) {
  const { countySlug, slug } = pageContext.routeParams;
  // Fetch data...
}
```

### Server-Side Data Fetching

```typescript
// pages/weather/@countySlug/@slug/+data.ts
import type { PageContextServer } from 'vike/types';

export interface WeatherPageData {
  location: Location;
  weather: WeatherResponse;
}

export async function data(pageContext: PageContextServer): Promise<WeatherPageData> {
  const { countySlug, slug } = pageContext.routeParams;

  // Fetch from database/API
  const location = await getLocation(countySlug, slug);
  const weather = await getWeather(location.lat, location.lon);

  return { location, weather };
}
```

Use data in page component:
```typescript
// pages/weather/@countySlug/@slug/+Page.tsx
import { useData } from 'vike-react/useData';
import type { WeatherPageData } from './+data';

export default function Page() {
  const { location, weather } = useData<WeatherPageData>();
  return <div>...</div>;
}
```

---

## Hono API Server

The server handles both API routes and Vike SSR:

```typescript
// server/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apply, serve } from '@photonjs/hono';

function startServer() {
  const app = new Hono();

  // CORS for API routes
  app.use('/api/*', cors());

  // API routes
  app.get('/api/location/search', (c) => {
    const query = c.req.query('q');
    // Search logic...
    return c.json({ results });
  });

  app.get('/api/location/:slug', (c) => {
    const slug = c.req.param('slug');
    // Lookup logic...
    return c.json(location);
  });

  // Vike SSR middleware (handles all non-API routes)
  apply(app);

  return serve(app);
}

export default startServer();
```

---

## SEO Implementation

### Meta Tags (+Head.tsx)

Each page has its own `+Head.tsx` for dynamic meta tags:

```typescript
// pages/weather/@countySlug/@slug/+Head.tsx
import { useData } from 'vike-react/useData';
import type { WeatherPageData } from './+data';

export function Head() {
  const { location, weather } = useData<WeatherPageData>();

  const title = `${location.name} Weather - Today & 7 Day Forecast`;
  const description = `${location.name} weather: ${weather.summary.headline}`;
  const url = `https://example.com/weather/${location.countySlug}/${location.slug}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://example.com/og-image.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
```

### JSON-LD Structured Data

Structured data components render `<script type="application/ld+json">`:

```typescript
// src/components/SEO/StructuredData.tsx
export function LocationStructuredData({ location }) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${location.name} Weather`,
      mainEntity: {
        '@type': 'Place',
        name: location.name,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: location.lat,
          longitude: location.lon,
        },
      },
    };
    // Inject into document head...
  }, []);
  return null;
}
```

Types of structured data used:
- `WebPage` - For all pages
- `Place` + `GeoCoordinates` - For location pages
- `Article` - For weather content
- `FAQPage` - For FAQ sections
- `BreadcrumbList` - For navigation
- `Organization` - For site identity
- `HowTo` - For instructional content

### Sitemaps

Static XML sitemaps in `/public/`:
- `sitemap.xml` - Index sitemap
- `sitemap-locations-1.xml` through `sitemap-locations-5.xml` - Location pages

---

## Deployment

### Cloudflare Workers Configuration

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "doineedabrolly",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "virtual:photon:cloudflare:server-entry"
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Build
        working-directory: frontend
        run: npm run build

      - name: Deploy
        working-directory: frontend
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Environment Variables

**Local development (`.dev.vars`):**
```
WEATHER_API_KEY=your_api_key_here
```

**Production (Cloudflare dashboard):**
- Add secrets in Workers & Pages → Settings → Variables and Secrets

Access in code:
```typescript
// In +data.ts (server-side)
async function getApiKey(): Promise<string | undefined> {
  try {
    const cfWorkers = await import('cloudflare:workers');
    if (cfWorkers.env?.WEATHER_API_KEY) {
      return cfWorkers.env.WEATHER_API_KEY;
    }
  } catch {
    // Not in Cloudflare runtime
  }
  return process.env.WEATHER_API_KEY;
}
```

---

## Build & Development Commands

```bash
cd frontend

# Install dependencies
npm install

# Development server (uses wrangler for Workers runtime)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Production build
npm run build

# Generate sitemap
npm run generate:sitemap
```

---

## CSS Architecture

### Mobile-First Approach

**CRITICAL: Always use `min-width` media queries, never `max-width`.**

```css
/* Base styles are mobile */
.container { padding: var(--space-4); }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: var(--space-6); }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: var(--space-8); }
}
```

### Design Tokens

See `src/styles/variables.css` for:
- Colors (primary, background, text, status)
- Spacing scale (4px base)
- Typography (sizes, weights, line heights)
- Border radius
- Shadows
- Z-index scale
- Breakpoints

### CSS Modules Pattern

```tsx
// Component.tsx
import styles from './Component.module.css';
export function Component() {
  return <div className={styles.container}>...</div>;
}
```

---

## Component Patterns

### Page Component (Vike)

```tsx
// pages/weather/@countySlug/@slug/+Page.tsx
import { useData } from 'vike-react/useData';
import type { WeatherPageData } from './+data';
import { WeatherSummary } from '@/components/WeatherSummary/WeatherSummary';

export default function Page() {
  const { location, weather } = useData<WeatherPageData>();

  return (
    <div>
      <h1>{location.name} Weather</h1>
      <WeatherSummary summary={weather.summary} />
    </div>
  );
}
```

### Client-Side Navigation

```tsx
import { navigate } from 'vike/client/router';

function handleClick() {
  navigate('/weather/somerset/taunton');
}
```

### Client-Side Hooks

Hooks that fetch data client-side (e.g., for search):

```tsx
// hooks/useLocationSearch.ts
export function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) return;
    fetch(`/api/location/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data.results));
  }, [query]);

  return { query, setQuery, results };
}
```

---

## File Naming Conventions

| Type | Extension | Example |
|------|-----------|---------|
| Vike pages | `+Page.tsx` | `pages/about/+Page.tsx` |
| Vike head | `+Head.tsx` | `pages/about/+Head.tsx` |
| Vike data | `+data.ts` | `pages/weather/@slug/+data.ts` |
| React components | `.tsx` | `WeatherCard.tsx` |
| Hooks | `.ts` | `useLocationSearch.ts` |
| Utilities | `.ts` | `plainEnglish.ts` |
| Types | `.ts` | `types.ts` |
| Styles | `.module.css` | `WeatherCard.module.css` |

---

## Key Patterns for Reuse

When creating a new project based on this architecture:

1. **Copy the structure** - `pages/`, `server/`, `functions/_shared/`, `src/components/`

2. **Update Vike config** - `pages/+config.ts`:
   ```typescript
   import vikeReact from 'vike-react/config';
   import vikePhoton from 'vike-photon/config';

   export default {
     extends: [vikeReact, vikePhoton],
     ssr: true,
     prerender: false,
     photon: { server: 'server/index.ts' },
   };
   ```

3. **Replace data layer** - Update `functions/_shared/` with your domain data

4. **Update API routes** - Modify `server/index.ts` for your API needs

5. **Create page routes** - Add folders in `pages/` for your URL structure

6. **Update deployment** - Change worker name in `wrangler.jsonc`

---

## Development Tips

1. **SSR-first** - Data fetching happens server-side in `+data.ts`
2. **No client-side routing for SEO pages** - Let Vike handle navigation
3. **Cache aggressively** - Use HTTP cache headers in API responses
4. **Mobile-first CSS** - Always use `min-width` media queries
5. **Plain English first** - Lead with human-readable summaries
6. **SEO is king** - Every page needs proper meta tags and structured data

---

**Last Updated:** December 2025

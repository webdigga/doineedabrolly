# Do I Need My Brolly?

Plain English weather forecasts for every town and village in the UK.

## Setup

```bash
npm run install:all
```

## Development

```bash
npm run dev
```

This starts both the frontend (http://localhost:5173) and worker API (http://localhost:8787).

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build frontend for production
- `npm run typecheck` - Run TypeScript checks
- `npm run generate:sitemap` - Generate sitemap.xml and robots.txt

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **API**: Cloudflare Workers
- **Weather Data**: Open-Meteo (free, no API key required)

## Structure

```
frontend/   - React application
worker/     - Cloudflare Workers API
scripts/    - Build scripts (sitemap, location data)
```

# Do I Need A Brolly?

Plain English weather forecasts for every town and village in the UK.

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript checks
- `npm run generate:sitemap` - Generate sitemaps

## Tech Stack

- **Frontend**: React 19, Vite, Vike (SSR)
- **Server**: Hono, Cloudflare Workers
- **Deployment**: GitHub Actions → Cloudflare Workers

## Structure

```
frontend/
├── pages/           # Vike file-based routing
├── server/          # Hono API server
├── functions/       # Shared business logic
├── src/components/  # React components
└── public/          # Static assets
```

See `CLAUDE.md` for detailed architecture documentation.

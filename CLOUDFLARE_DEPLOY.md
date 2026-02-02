# Cloudflare Pages Functions

## What’s Ready
- `functions/index.ts`: API entry point with routing and CORS
- `functions/api/articles.ts`: Article ingestion (fetch + readability) works
- `functions/api/auth.ts`: Stub for register/login
- `functions/README.md`: Setup instructions

## What’s Missing (TODO)
- Drizzle DB integration for Supabase/PostgreSQL
- Session management for auth
- Highlights/notes endpoints
- Full API parity with server/routes.ts

## Deploy to Cloudflare Pages
1. Push code to GitHub
2. In Cloudflare Pages:
   - Connect repository
   - Build command: `npm run build`
   - Build output directory: `dist/public`
   - Environment variables:
     - `DATABASE_URL`: your Supabase connection string
     - `SESSION_SECRET`: random string
     - `NODE_ENV`: production

## Notes
- Article parsing works without DB
- Client will call `/api/*` which routes to Functions
- CORS enabled for development

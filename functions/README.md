# Production-Ready Cloudflare Functions

## What's Implemented
- ✅ **Articles API**: Full CRUD with Supabase/PostgreSQL via Drizzle
  - POST /api/articles - Ingest and parse articles
  - GET /api/articles - List articles
  - GET /api/articles/:id - Get single article
  - DELETE /api/articles/:id - Delete article

- ✅ **Auth API**: User registration and login
  - POST /api/register - Create user
  - POST /api/login - Authenticate user
  - GET /api/user - Get current user (stub)
  - POST /api/logout - Logout (stub)

- ✅ **Highlights API**: Create and manage highlights
  - GET /api/highlights - List highlights
  - POST /api/highlights - Create highlight
  - DELETE /api/highlights/:id - Delete highlight

- ✅ **Notes API**: Create and manage notes
  - GET /api/articles/:id/notes - List notes for article
  - POST /api/notes - Create note

- ✅ **Database Integration**: Drizzle ORM with your existing Supabase database
- ✅ **CORS**: Enabled for cross-origin requests
- ✅ **Error Handling**: Proper HTTP status codes and JSON responses

## Files Structure
```
functions/
├── [[path]].ts        # Main router
├── db.ts              # Database connection
├── api/
│   ├── articles.ts    # Article endpoints
│   ├── auth.ts        # Auth endpoints
│   ├── highlights.ts  # Highlights endpoints
│   └── notes.ts       # Notes endpoints
└── README.md          # This file
```

## Environment Variables
Set these in Cloudflare Pages dashboard:
- `DATABASE_URL`: Your Supabase connection string
- `SESSION_SECRET`: Random string for sessions
- `NODE_ENV`: production

## TODO for Full Production
1. **Authentication**: Implement JWT/session management
2. **User Library**: Add user-specific article library
3. **Password Hashing**: Use bcrypt or similar
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Strengthen Zod schemas
6. **Testing**: Add unit and integration tests

## Deployment
1. Push code to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: `npm run build`
4. Build output: `dist/public`
5. Add environment variables

The Functions will handle all `/api/*` requests while the static client serves from `dist/public`.

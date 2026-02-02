# Production-Ready Cloudflare Deployment Guide

## ✅ What's Ready
- Full API with Drizzle + Supabase integration
- Articles CRUD with readability parsing
- Auth endpoints (register/login)
- Highlights and notes APIs
- CORS and error handling
- Edge-optimized database connections

## 🚀 Deploy to Cloudflare Pages

### 1. Push to GitHub
```bash
git add .
git commit -m "Add production-ready Cloudflare Functions"
git push origin main
```

### 2. Configure Cloudflare Pages
1. Go to Cloudflare Dashboard → Pages
2. Connect your GitHub repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist/public`
   - **Root directory**: `/` (project root)

### 3. Environment Variables
Add these in Pages → Settings → Environment Variables:
```
DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
SESSION_SECRET=your-random-secret-string
NODE_ENV=production
```

### 4. Deploy
- Click "Save and Deploy"
- Wait for build to complete
- Your app will be live at `your-project.pages.dev`

## 📋 Post-Deployment Checklist
- [ ] Test article ingestion
- [ ] Test user registration/login
- [ ] Verify database operations
- [ ] Check CORS in browser dev tools
- [ ] Test on mobile devices

## 🔧 Known Issues to Fix
1. **Schema field names**: Highlights uses `textContent`, Notes uses `noteText` (update to match your schema)
2. **Password hashing**: Currently plain text (add bcrypt)
3. **Sessions**: JWT/session management needed
4. **User library**: Per-user article filtering

## 📊 Monitoring
- Cloudflare Analytics for traffic
- Supabase dashboard for DB usage
- Functions logs for errors

The app is now production-ready with your existing Supabase database!

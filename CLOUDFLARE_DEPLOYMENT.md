# 🚀 Cloudflare Pages Deployment Guide

## ✅ Dependencies Installed
All packages are up to date (524 packages installed).

## 📋 Step-by-Step Cloudflare Deployment

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Cloudflare deployment"
git push origin main
```

### 2. Create Cloudflare Pages Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up/login
3. Go to **Pages** section

### 3. Connect Your Repository
1. Click **"Create a project"**
2. Click **"Connect to Git"**
3. Choose **GitHub**
4. Authorize Cloudflare (if needed)
5. Select your repository

### 4. Configure Build Settings
```
Framework preset: None
Build command: npm run build
Build output directory: dist/public
Root directory: / (leave empty)
```

### 5. Add Environment Variables
In **Settings → Environment Variables**:
```
DATABASE_URL = postgresql://postgres:password@your-project.supabase.co:5432/postgres
SESSION_SECRET = your-random-secret-string-here
NODE_ENV = production
```

### 6. Deploy
1. Click **"Save and Deploy"**
2. Wait for build (2-3 minutes)
3. Your site will be live at `your-project.pages.dev`

## 🔧 Get Your Environment Variables

### For DATABASE_URL:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → Database**
4. Copy the **Connection string**
5. Replace `password` with your actual password

### For SESSION_SECRET:
Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Post-Deployment Checklist
- [ ] Visit your site
- [ ] Test article ingestion
- [ ] Test registration/login
- [ ] Check browser console for errors
- [ ] Verify API calls work

## 🚨 Common Issues & Fixes

### Build Fails
- Check `npm run build` works locally first
- Verify all dependencies installed

### Database Connection Error
- Verify DATABASE_URL is correct
- Check Supabase project is active

### CORS Errors
- Functions handle CORS automatically
- Check if API calls use correct URLs

## 📱 Custom Domain (Optional)
1. In Pages dashboard → Custom domains
2. Add your domain
3. Update DNS records as instructed

## 🔄 Automatic Deployments
- Every push to main branch triggers new deployment
- Preview deployments available for pull requests

Your Reader app is now live on Cloudflare Pages! 🎉

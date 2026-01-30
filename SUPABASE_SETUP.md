# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `reader` (or any name you prefer)
   - Database password: **Save this password!** You'll need it for the connection string
   - Region: Choose closest to you
5. Click "Create new project" (takes 1-2 minutes)

## Step 2: Get Your Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set when creating the project

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` and paste your Supabase connection string:
   ```
   DATABASE_URL=postgresql://postgres:your-actual-password@your-project-ref.supabase.co:5432/postgres
   ```

3. Generate a session secret (optional but recommended):
   ```powershell
   # In PowerShell, generate a random string:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```
   Add it to `.env`:
   ```
   SESSION_SECRET=your-generated-secret-here
   ```

## Step 4: Create Database Tables

Run the database migration to create all tables:

```powershell
npm run db:push
```

This will create all the necessary tables:
- users
- articles
- user_library
- highlights
- notes

## Step 5: Start the Server

```powershell
npm run dev
```

The app should now be running at `http://localhost:5000`!

## Troubleshooting

- **Connection refused**: Make sure your Supabase project is active and the connection string is correct
- **Authentication failed**: Double-check your database password in the connection string
- **Tables not found**: Run `npm run db:push` again

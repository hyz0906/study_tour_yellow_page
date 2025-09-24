# Quick Supabase Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com and create account
2. Click "New Project"
3. Set project name: `studytour-dev`
4. Choose region closest to you
5. Set strong database password
6. Wait 2-3 minutes for project creation

## 2. Get Credentials
From Supabase Dashboard:
1. Go to **Settings** → **API**
2. Copy **Project URL** (looks like: `https://abcdef.supabase.co`)
3. Copy **anon public** key (long string starting with `eyJ...`)

## 3. Update .env.local
Replace the placeholder values in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 4. Set Up Database
### Option A: Using SQL Editor (Manual)
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run in SQL Editor
4. Copy contents of `supabase/migrations/002_comment_functions.sql`
5. Paste and run in SQL Editor

### Option B: Using Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 5. Enable Authentication
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** authentication
3. Optional: Enable **Google** OAuth with your credentials

## 6. Test Connection
After updating `.env.local`, restart your dev server:
```bash
npm run dev
```

You should see:
- ✅ No "Test Mode" banner
- ✅ Real authentication working
- ✅ Database operations working

## Troubleshooting
- **Still in test mode?** Make sure `.env.local` has correct values and restart dev server
- **Auth not working?** Check Supabase URL configuration in Auth settings
- **Database errors?** Verify migrations were applied correctly
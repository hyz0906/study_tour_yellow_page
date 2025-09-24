# StudyTour Deployment Guide

This guide covers the complete deployment process for the StudyTour Yellow Page application across different environments.

## 🏗️ Architecture Overview

The application consists of three main components:

1. **Frontend (Next.js)** → Deployed on Vercel
2. **Database & Auth (Supabase)** → Managed service
3. **Crawler (Python)** → Runs on GitHub Actions

## 📋 Prerequisites

Before deployment, ensure you have:

- [ ] **Supabase account** and project created
- [ ] **Vercel account** connected to your GitHub repository
- [ ] **GitHub repository** with the code pushed
- [ ] **Environment variables** configured

## 🗄️ Database Deployment (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and enter project details:
   - **Name**: `studytour-production` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2. Configure Database

1. **Get Connection Details**
   ```bash
   # In your Supabase dashboard, go to Settings > Database
   # Copy the connection string and API keys
   ```

2. **Run Database Migrations**

   **Option A: Using Supabase CLI (Recommended)**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref your-project-ref

   # Push database schema
   supabase db push
   ```

   **Option B: Manual SQL Execution**
   ```bash
   # In Supabase Dashboard > SQL Editor
   # Copy and execute the contents of:
   # 1. supabase/migrations/001_initial_schema.sql
   # 2. supabase/migrations/002_comment_functions.sql
   ```

3. **Seed Sample Data (Optional)**
   ```sql
   -- In SQL Editor, run:
   -- Copy contents of supabase/seed.sql
   ```

### 3. Configure Authentication

1. **Enable Providers**
   - Go to Authentication > Providers
   - Enable Email authentication
   - Configure Google OAuth (optional):
     - Add Google Client ID and Secret
     - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

2. **Configure Email Templates**
   - Go to Authentication > Email Templates
   - Customize confirmation and reset password emails
   - Update redirect URLs to your domain

3. **Set Up Row Level Security**
   ```sql
   -- RLS is already configured in migrations
   -- Verify policies are active in Dashboard > Authentication > Policies
   ```

### 4. Configure Storage (for Images)

```sql
-- Create storage bucket for campsite images
INSERT INTO storage.buckets (id, name, public)
VALUES ('campsites', 'campsites', true);

-- Set up storage policies
CREATE POLICY "Campsite images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'campsites');

CREATE POLICY "Authenticated users can upload campsite images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campsites' AND auth.role() = 'authenticated');
```

## 🌐 Frontend Deployment (Vercel)

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
```

### 3. Configure Custom Domain (Optional)

1. In Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase auth redirect URLs

### 4. Deploy

```bash
# Option 1: Automatic deployment (recommended)
git push origin main  # Triggers automatic deployment

# Option 2: Manual deployment via CLI
npm install -g vercel
vercel --prod
```

### 5. Post-Deployment Configuration

1. **Update Supabase Auth URLs**
   ```bash
   # In Supabase Dashboard > Authentication > URL Configuration
   # Site URL: https://your-app.vercel.app
   # Additional redirect URLs: https://your-app.vercel.app/auth/callback
   ```

2. **Test Authentication Flow**
   - Sign up for a new account
   - Verify email confirmation works
   - Test OAuth providers if configured

## 🔄 Crawler Deployment (GitHub Actions)

The crawler runs automatically using GitHub Actions. No additional deployment is needed, but you must configure secrets.

### 1. Configure GitHub Secrets

In GitHub repository > Settings > Secrets and variables > Actions, add:

```env
# Required for crawler
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Required for deployment workflow
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Optional for database migrations
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_DB_URL=postgresql://[user]:[password]@[host]:5432/[database]
```

### 2. Verify Workflow Configuration

1. **Check workflow files are present**:
   - `.github/workflows/crawler-daily.yml`
   - `.github/workflows/test.yml`
   - `.github/workflows/deploy.yml`

2. **Test manual crawler run**:
   - Go to Actions tab in GitHub
   - Find "Manual Crawler Run" workflow
   - Click "Run workflow"
   - Monitor execution and results

### 3. Schedule Configuration

The daily crawler is configured to run at 2 AM UTC. To modify:

```yaml
# In .github/workflows/crawler-daily.yml
on:
  schedule:
    - cron: '0 2 * * *'  # Modify this line
```

## 📊 Monitoring & Observability

### 1. Supabase Monitoring

- **Database Performance**: Dashboard > Reports
- **API Usage**: Dashboard > API
- **Authentication**: Dashboard > Auth > Users
- **Storage Usage**: Dashboard > Storage

### 2. Vercel Analytics

```bash
# Enable Vercel Analytics (optional)
npm install @vercel/analytics

# Add to your app (already configured in layout.tsx)
```

### 3. Error Tracking

**Sentry Integration (Optional)**:
```bash
npm install @sentry/nextjs

# Configure in next.config.js
module.exports = withSentryConfig(nextConfig, sentryOptions);
```

### 4. GitHub Actions Monitoring

- **Workflow Status**: Repository > Actions tab
- **Crawler Results**: Download artifacts from completed runs
- **Failed Runs**: Automatic issue creation for failures

## 🔒 Security Checklist

### Pre-Production Security Review

- [ ] **Environment Variables**: All secrets stored securely
- [ ] **Database Security**: RLS policies active and tested
- [ ] **Authentication**: Email verification required
- [ ] **CORS Configuration**: Restricted to your domain
- [ ] **API Rate Limiting**: Configured in Supabase
- [ ] **Content Security Policy**: Headers configured
- [ ] **HTTPS**: Enforced on all endpoints

### Post-Deployment Security Tasks

- [ ] **Admin Account**: Create first admin user
- [ ] **Database Backups**: Automated backups enabled
- [ ] **Monitoring**: Set up alerts for errors
- [ ] **Access Logs**: Review authentication logs
- [ ] **Vulnerability Scan**: Run security audit

## 🚀 Performance Optimization

### 1. Database Performance

```sql
-- Add database indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campsites_search
ON campsites USING gin(to_tsvector('english', name || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_comments_created_at
ON comments(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM campsites WHERE country = 'UK';
```

### 2. Frontend Performance

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Enable image optimization
# Already configured in next.config.js
```

### 3. CDN Configuration

- **Static Assets**: Automatically handled by Vercel
- **Database Images**: Configure Supabase Storage CDN
- **Caching Headers**: Configure in vercel.json

## 🔄 CI/CD Pipeline

The complete CI/CD pipeline:

1. **Code Push** → Triggers GitHub Actions
2. **Tests Run** → Frontend and crawler tests
3. **Build** → Next.js production build
4. **Deploy** → Automatic deployment to Vercel
5. **Database Migration** → Run on main branch only
6. **Crawler Schedule** → Daily automated crawling

### Pipeline Status Monitoring

```bash
# Check build status
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?app=your-app"

# Check GitHub Actions status
gh run list --limit 10
```

## 🆘 Troubleshooting

### Common Deployment Issues

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Issues**:
```bash
# Test connection
psql "postgresql://[user]:[password]@[host]:5432/[database]" -c "SELECT 1;"
```

**Environment Variable Issues**:
```bash
# Verify variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
```

**Authentication Not Working**:
1. Check Supabase URL configuration
2. Verify redirect URLs match
3. Test with browser dev tools network tab

### Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

## 🎯 Production Checklist

Before going live:

- [ ] **Database migrations** applied successfully
- [ ] **Environment variables** configured correctly
- [ ] **Authentication** working with email verification
- [ ] **Admin dashboard** accessible
- [ ] **Crawler** running successfully
- [ ] **Performance testing** completed
- [ ] **Security review** passed
- [ ] **Monitoring** set up
- [ ] **Backup strategy** implemented
- [ ] **DNS configuration** complete
- [ ] **SSL certificates** active

---

**Your StudyTour application is now ready for production! 🎉**
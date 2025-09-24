# StudyTour Yellow Page - Global Study & Summer Camp Directory

A comprehensive platform for discovering study tours, summer camps, and educational programs worldwide. Built with Next.js, Supabase, and Python web crawling.

## 🚀 Features

### Core Functionality
- **Global Campsite Directory**: Browse and search thousands of study tours and camps
- **Advanced Search & Filtering**: Filter by country, category, age group, ratings, and more
- **User Reviews & Ratings**: Multi-dimensional rating system (quality, safety, facilities)
- **Social Features**: Follow users, like/share programs, comment discussions
- **Real-time Updates**: Live comments and notifications using Supabase Realtime

### Admin & Content Management
- **Admin Dashboard**: Comprehensive admin panel for content moderation
- **Automated Data Collection**: Python web crawler for discovering new programs
- **Content Moderation**: Report system and automated content review
- **Analytics**: Track platform usage and popular destinations

### Technical Features
- **Full-Stack TypeScript**: End-to-end type safety
- **Server-Side Rendering**: SEO-optimized with Next.js App Router
- **Authentication**: Secure auth with email/OAuth via Supabase
- **Real-time Database**: PostgreSQL with real-time subscriptions
- **Automated Testing**: Comprehensive test suite for frontend and backend
- **CI/CD Pipeline**: GitHub Actions for testing and deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management with validation
- **React Query** - Data fetching and caching
- **Framer Motion** - Animations and transitions

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - File storage
  - Edge functions

### Data Collection
- **Python 3.11+** - Web crawler
- **BeautifulSoup** - HTML parsing
- **Playwright** - Browser automation & screenshots
- **Requests** - HTTP client
- **Supabase Python SDK** - Database integration

### DevOps
- **Vercel** - Frontend deployment
- **GitHub Actions** - CI/CD automation
- **Jest** - JavaScript testing
- **Pytest** - Python testing

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm
- **Python 3.11+** and pip
- **Git** for version control
- **Supabase account** for database and auth
- **Vercel account** for deployment (optional)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/study-tour-yellow-page.git
cd study-tour-yellow-page

# Install frontend dependencies
npm install

# Install crawler dependencies
cd crawler
pip install -r requirements.txt
playwright install chromium
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Copy crawler environment template
cp crawler/.env.example crawler/.env
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Edit `crawler/.env` with your crawler settings:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

```bash
# Run database migrations
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Manual SQL execution
# Run the SQL files in supabase/migrations/ in your Supabase dashboard
```

### 4. Development Server

```bash
# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### 5. Run the Crawler (Optional)

```bash
# Test crawler with seed URLs
cd crawler
python -m crawler.main --seed-only

# Crawl specific URLs
echo "https://example-camp.com" > urls.txt
python -m crawler.main --urls urls.txt
```

## 🏗️ Project Structure

```
study-tour-yellow-page/
├── src/                      # Next.js application
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── auth/            # Authentication components
│   │   ├── campsite/        # Campsite-related components
│   │   ├── comments/        # Comment system
│   │   ├── ratings/         # Rating system
│   │   ├── social/          # Social features
│   │   └── admin/           # Admin dashboard
│   ├── lib/                 # Utility libraries
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── __tests__/           # Frontend tests
├── crawler/                 # Python web crawler
│   ├── crawler/             # Crawler core modules
│   ├── tests/               # Crawler tests
│   └── requirements.txt     # Python dependencies
├── supabase/                # Database configuration
│   ├── migrations/          # SQL migration files
│   └── seed.sql            # Sample data
├── .github/workflows/       # GitHub Actions
└── public/                  # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and authentication
- **campsites** - Study tour/camp listings
- **comments** - User reviews and discussions
- **ratings** - Multi-dimensional rating system
- **follows** - Social follow relationships
- **reports** - Content moderation system

### Key Relationships
- Users can comment on and rate campsites
- Users can follow other users
- Comments support threading and reactions
- Comprehensive audit trail for admin actions

## 🧪 Testing

### Frontend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Crawler Tests
```bash
cd crawler
pytest tests/ -v --cov=crawler
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or use Vercel CLI: `npx vercel --prod`

### Database Deployment (Supabase)

1. **Create Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **Run Migrations**
   ```bash
   # Using Supabase CLI
   supabase db push --db-url "your-connection-string"

   # Or copy/paste SQL from supabase/migrations/
   ```

3. **Configure Authentication**
   - Enable email authentication
   - Configure OAuth providers (Google, GitHub, etc.)
   - Set up RLS policies

### Crawler Deployment (GitHub Actions)

The crawler runs automatically via GitHub Actions:

- **Daily crawl**: Runs at 2 AM UTC daily
- **Manual trigger**: Can be triggered manually from Actions tab
- **Results**: Stored as artifacts and in database

## 🔐 Security Considerations

### Authentication & Authorization
- JWT-based authentication via Supabase
- Row Level Security (RLS) on all tables
- Role-based permissions (user, organizer, admin)

### Content Security
- Input validation and sanitization
- XSS protection via React's built-in escaping
- CSRF protection via SameSite cookies
- Rate limiting on API endpoints

### Data Privacy
- GDPR-compliant data handling
- User data export/deletion capabilities
- Secure credential storage

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for your changes
5. **Run the test suite**
   ```bash
   npm test
   cd crawler && pytest
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🚀**
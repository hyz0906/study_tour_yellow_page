-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
CREATE TYPE campsite_category AS ENUM ('summer', 'winter', 'study', 'online');
CREATE TYPE comment_status AS ENUM ('published', 'pending', 'hidden', 'deleted');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Campsites table
CREATE TABLE public.campsites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  country TEXT,
  category campsite_category DEFAULT 'summer',
  description TEXT,
  thumbnail_url TEXT,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campsites ENABLE ROW LEVEL SECURITY;

-- Campsites policies
CREATE POLICY "Campsites are viewable by everyone" ON public.campsites
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert campsites" ON public.campsites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update campsites" ON public.campsites
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Comments table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campsite_id UUID REFERENCES public.campsites(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  status comment_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Published comments are viewable by everyone" ON public.comments
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any comment" ON public.comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Ratings table
CREATE TABLE public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campsite_id UUID REFERENCES public.campsites(id) ON DELETE CASCADE,
  score_quality INTEGER CHECK (score_quality BETWEEN 1 AND 5),
  score_facility INTEGER CHECK (score_facility BETWEEN 1 AND 5),
  score_safety INTEGER CHECK (score_safety BETWEEN 1 AND 5),
  score_overall INTEGER CHECK (score_overall BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, campsite_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Follows table
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

-- Reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for better performance
CREATE INDEX idx_campsites_country ON public.campsites(country);
CREATE INDEX idx_campsites_category ON public.campsites(category);
CREATE INDEX idx_comments_campsite_id ON public.comments(campsite_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_ratings_campsite_id ON public.ratings(campsite_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campsites_updated_at BEFORE UPDATE ON public.campsites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update campsite average rating
CREATE OR REPLACE FUNCTION update_campsite_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campsites
  SET avg_rating = (
    SELECT COALESCE(AVG(score_overall), 0)
    FROM public.ratings
    WHERE campsite_id = COALESCE(NEW.campsite_id, OLD.campsite_id)
  )
  WHERE id = COALESCE(NEW.campsite_id, OLD.campsite_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for rating updates
CREATE TRIGGER update_rating_avg AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_campsite_avg_rating();
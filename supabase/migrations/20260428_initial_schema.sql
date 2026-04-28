-- 1. SCHEMAS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  region text,
  role text DEFAULT 'member' CHECK (role IN ('member', 'expert', 'moderator', 'admin')),
  points int DEFAULT 0,
  level int DEFAULT 1,
  is_verified bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  description text,
  sort_order int DEFAULT 0,
  is_active bool DEFAULT true
);

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  thumbnail_url text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id int REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  is_featured bool DEFAULT false,
  is_pinned bool DEFAULT false,
  view_count int DEFAULT 0,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  upvotes int DEFAULT 0,
  is_hidden bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  image_urls text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  expert_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Answers
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_best_answer bool DEFAULT false,
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Likes (Toggle)
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Saves (Toggle)
CREATE TABLE IF NOT EXISTS public.saves (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- 3. ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self update
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON categories ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Posts: Public read (published), auth write (own), admin write (all)
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view their own posts" ON posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admin can do everything with posts" ON posts ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments: Public read, auth write (own)
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Questions: Public read, auth write (own)
CREATE POLICY "Questions are viewable by everyone" ON questions FOR SELECT USING (true);
CREATE POLICY "Auth users can insert questions" ON questions FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Answers: Public read, auth write (own)
CREATE POLICY "Answers are viewable by everyone" ON answers FOR SELECT USING (true);
CREATE POLICY "Auth users can insert answers" ON answers FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Likes: Auth users can manage own likes
CREATE POLICY "Users can manage own likes" ON likes ALL USING (auth.uid() = user_id);

-- Saves: Auth users can manage own saves
CREATE POLICY "Users can manage own saves" ON saves ALL USING (auth.uid() = user_id);

-- 4. FUNCTIONS & TRIGGERS (Auto-sync profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

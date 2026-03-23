-- ============================================
-- Tinder Telegram WebApp — Full Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ==================
-- 1. ENUMS
-- ==================

DO $$ BEGIN
  CREATE TYPE swipe_type AS ENUM ('like', 'dislike', 'superlike');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_reason AS ENUM (
    'fake_profile', 'inappropriate_photos', 'harassment',
    'spam', 'underage', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ==================
-- 2. TABLES
-- ==================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  looking_for TEXT CHECK (looking_for IN ('male', 'female', 'everyone')) DEFAULT 'everyone',
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  is_onboarded BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles (telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (is_active, is_banned, is_onboarded);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles (gender);

-- Photos
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_profile ON public.photos (profile_id, position);

-- Swipes
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction swipe_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (swiper_id, swiped_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes (swiper_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON public.swipes (swiped_id, direction);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches (user1_id, is_active);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches (user2_id, is_active);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON public.messages (match_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages (match_id, is_read) WHERE is_read = false;

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT DEFAULT '',
  status report_status DEFAULT 'pending',
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);


-- ==================
-- 3. ROW LEVEL SECURITY
-- ==================
-- NOTE: API routes use service_role key which bypasses RLS.
-- RLS is enabled as a safety net for direct client access.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (already default, but explicit)
-- For anon/authenticated: read-only where appropriate

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "photos_select" ON public.photos;
CREATE POLICY "photos_select" ON public.photos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "photos_all" ON public.photos;
CREATE POLICY "photos_all" ON public.photos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "photos_delete" ON public.photos;
CREATE POLICY "photos_delete" ON public.photos
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "swipes_insert" ON public.swipes;
CREATE POLICY "swipes_insert" ON public.swipes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "swipes_select" ON public.swipes;
CREATE POLICY "swipes_select" ON public.swipes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "matches_select" ON public.matches;
CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "matches_insert" ON public.matches;
CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "reports_select" ON public.reports;
CREATE POLICY "reports_select" ON public.reports
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reports_update" ON public.reports;
CREATE POLICY "reports_update" ON public.reports
  FOR UPDATE USING (true);


-- ==================
-- 4. FUNCTIONS & TRIGGERS
-- ==================

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create match on mutual like/superlike
CREATE OR REPLACE FUNCTION public.handle_new_swipe()
RETURNS TRIGGER AS $$
DECLARE
  _match_user1 UUID;
  _match_user2 UUID;
BEGIN
  IF NEW.direction = 'like'::swipe_type OR NEW.direction = 'superlike'::swipe_type THEN
    -- Check if the other person already liked/superliked us
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND (direction = 'like'::swipe_type OR direction = 'superlike'::swipe_type)
    ) THEN
      -- Canonical ordering: smaller UUID first
      IF NEW.swiper_id < NEW.swiped_id THEN
        _match_user1 := NEW.swiper_id;
        _match_user2 := NEW.swiped_id;
      ELSE
        _match_user1 := NEW.swiped_id;
        _match_user2 := NEW.swiper_id;
      END IF;

      INSERT INTO public.matches (user1_id, user2_id)
      VALUES (_match_user1, _match_user2)
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_swipe ON public.swipes;
CREATE TRIGGER on_new_swipe
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_swipe();

-- Discovery: get profiles the user hasn't swiped on yet
CREATE OR REPLACE FUNCTION public.get_discovery_profiles(
  _user_id UUID,
  _looking_for TEXT,
  _limit INT DEFAULT 10
)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.id != _user_id
    AND p.is_active = true
    AND p.is_banned = false
    AND p.is_onboarded = true
    AND (_looking_for = 'everyone' OR p.gender = _looking_for)
    AND NOT EXISTS (
      SELECT 1 FROM public.swipes s
      WHERE s.swiper_id = _user_id AND s.swiped_id = p.id
    )
  ORDER BY p.last_active_at DESC
  LIMIT _limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_users', (SELECT count(*) FROM public.profiles WHERE is_active = true AND is_banned = false),
    'total_matches', (SELECT count(*) FROM public.matches WHERE is_active = true),
    'total_messages', (SELECT count(*) FROM public.messages),
    'pending_reports', (SELECT count(*) FROM public.reports WHERE status = 'pending'::report_status),
    'users_today', (SELECT count(*) FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'matches_today', (SELECT count(*) FROM public.matches WHERE created_at >= CURRENT_DATE)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==================
-- 5. REALTIME
-- ==================

-- Enable realtime for chat messages and new matches
-- (supabase_realtime publication exists by default in Supabase)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ==================
-- 6. STORAGE BUCKET
-- ==================
-- Run this separately if it fails (some Supabase versions don't allow this via SQL):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to photos bucket
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
CREATE POLICY "Public read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Allow authenticated uploads to photos bucket
DROP POLICY IF EXISTS "Allow uploads to photos" ON storage.objects;
CREATE POLICY "Allow uploads to photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Allow delete own photos
DROP POLICY IF EXISTS "Allow delete photos" ON storage.objects;
CREATE POLICY "Allow delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos');

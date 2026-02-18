-- GamePilot Database Schema
-- Note: auth.users table is managed by Supabase - we cannot modify it directly
-- RLS policies for auth.users will be configured through Supabase dashboard

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.gaming_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  subscription_end_date TIMESTAMPTZ,
  rawg_api_calls_today INTEGER DEFAULT 0,
  rawg_api_calls_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gaming_sessions table
CREATE TABLE public.gaming_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  mood_tags TEXT[],
  genre_tags TEXT[],
  session_length INTEGER NOT NULL, -- minutes
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('mood', 'genre', 'ai', 'trending', 'similar')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  was_clicked BOOLEAN DEFAULT FALSE,
  was_purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emotional_profiles table for gaming coach
CREATE TABLE public.emotional_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Core emotional metrics (1-10 scale)
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  cognitive_load INTEGER NOT NULL CHECK (cognitive_load >= 1 AND cognitive_load <= 10),
  tolerance_level INTEGER NOT NULL CHECK (tolerance_level >= 1 AND tolerance_level <= 10),

  -- Social preferences
  social_appetite TEXT NOT NULL CHECK (social_appetite IN ('solo', 'co-op', 'competitive', 'social')),

  -- Emotional needs (array of selected needs)
  emotional_needs TEXT[] NOT NULL,

  -- Time context
  available_time INTEGER NOT NULL, -- minutes available
  session_type TEXT NOT NULL CHECK (session_type IN ('quick', 'focused', 'immersive', 'marathon'))
);

-- Create game_design_patterns table for emotional alignment mapping
CREATE TABLE public.game_design_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  game_name TEXT NOT NULL,

  -- Design pattern scores (0-10 scale)
  pacing INTEGER NOT NULL CHECK (pacing >= 0 AND pacing <= 10),
  friction_level INTEGER NOT NULL CHECK (friction_level >= 0 AND friction_level <= 10),
  narrative_density INTEGER NOT NULL CHECK (narrative_density >= 0 AND narrative_density <= 10),
  mechanical_complexity INTEGER NOT NULL CHECK (mechanical_complexity >= 0 AND mechanical_complexity <= 10),
  reward_cadence INTEGER NOT NULL CHECK (reward_cadence >= 0 AND reward_cadence <= 10),
  agency_level INTEGER NOT NULL CHECK (agency_level >= 0 AND agency_level <= 10),
  sensory_intensity INTEGER NOT NULL CHECK (sensory_intensity >= 0 AND sensory_intensity <= 10),
  time_to_fun INTEGER NOT NULL, -- minutes to first enjoyable moment

  -- Emotional alignments (0-10 scale)
  comfort_alignment INTEGER NOT NULL CHECK (comfort_alignment >= 0 AND comfort_alignment <= 10),
  escape_alignment INTEGER NOT NULL CHECK (escape_alignment >= 0 AND escape_alignment <= 10),
  mastery_alignment INTEGER NOT NULL CHECK (mastery_alignment >= 0 AND mastery_alignment <= 10),
  chaos_alignment INTEGER NOT NULL CHECK (chaos_alignment >= 0 AND chaos_alignment <= 10),
  novelty_alignment INTEGER NOT NULL CHECK (novelty_alignment >= 0 AND novelty_alignment <= 10),
  story_flow_alignment INTEGER NOT NULL CHECK (story_flow_alignment >= 0 AND story_flow_alignment <= 10),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_game_library table for tracking owned games
CREATE TABLE public.user_game_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Game metadata
  genres TEXT[],
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
  avg_playtime INTEGER, -- minutes

  -- Ownership status
  ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'wishlist', 'previously_owned')),

  -- User ratings and notes
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 10),
  user_notes TEXT,

  UNIQUE(user_id, game_id)
);

-- Add indexes for user_game_library
CREATE INDEX idx_user_game_library_user_id ON public.user_game_library(user_id);
CREATE INDEX idx_user_game_library_game_id ON public.user_game_library(game_id);
CREATE INDEX idx_user_game_library_added_at ON public.user_game_library(added_at);

-- Enable RLS on user_game_library
ALTER TABLE public.user_game_library ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_game_library
CREATE POLICY "Users can view own game library" ON public.user_game_library
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own game library entries" ON public.user_game_library
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own game library entries" ON public.user_game_library
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own game library entries" ON public.user_game_library
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Create indexes for performance
CREATE INDEX idx_gaming_sessions_user_id ON public.gaming_sessions(user_id);
CREATE INDEX idx_gaming_sessions_started_at ON public.gaming_sessions(started_at);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_created_at ON public.recommendations(created_at);

-- Indexes for emotional profiling system
CREATE INDEX idx_emotional_profiles_user_id ON public.emotional_profiles(user_id);
CREATE INDEX idx_emotional_profiles_created_at ON public.emotional_profiles(created_at);
CREATE INDEX idx_game_design_patterns_game_id ON public.game_design_patterns(game_id);
CREATE INDEX idx_coaching_sessions_user_id ON public.coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_emotional_profile_id ON public.coaching_sessions(emotional_profile_id);
CREATE INDEX idx_coaching_sessions_created_at ON public.coaching_sessions(created_at);
CREATE INDEX idx_coaching_sessions_total_score ON public.coaching_sessions(total_score DESC);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_design_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Gaming sessions: Users can only see and manage their own sessions
CREATE POLICY "Users can view own gaming sessions" ON public.gaming_sessions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own gaming sessions" ON public.gaming_sessions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own gaming sessions" ON public.gaming_sessions
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Recommendations: Users can only see and manage their own recommendations
CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.recommendations
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own recommendations" ON public.recommendations
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Emotional profiles: Users can only see and manage their own emotional data
CREATE POLICY "Users can view own emotional profiles" ON public.emotional_profiles
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own emotional profiles" ON public.emotional_profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own emotional profiles" ON public.emotional_profiles
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Game design patterns: Read-only for all authenticated users (needed for algorithm)
CREATE POLICY "Authenticated users can view game design patterns" ON public.game_design_patterns
  FOR SELECT USING ((select auth.role()) = 'authenticated');

-- Coaching sessions: Users can only see and manage their own coaching data
CREATE POLICY "Users can view own coaching sessions" ON public.coaching_sessions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own coaching sessions" ON public.coaching_sessions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own coaching sessions" ON public.coaching_sessions
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$;

-- Note: Trigger creation will be done through Supabase dashboard
-- due to permissions restrictions on auth.users table

-- Create function to reset daily API call limits
CREATE OR REPLACE FUNCTION public.reset_daily_api_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.profiles
  SET rawg_api_calls_today = 0, rawg_api_calls_reset = CURRENT_DATE
  WHERE rawg_api_calls_reset < CURRENT_DATE;
END;
$$;

-- Create function to check API call limits
CREATE OR REPLACE FUNCTION public.can_make_api_call(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_tier TEXT;
  current_calls INTEGER;
  reset_date DATE;
BEGIN
  -- Reset limits if needed
  PERFORM public.reset_daily_api_limits();

  -- Get user data
  SELECT subscription_tier, rawg_api_calls_today, rawg_api_calls_reset
  INTO user_tier, current_calls, reset_date
  FROM public.profiles
  WHERE id = user_id;

  -- Premium users have unlimited calls
  IF user_tier = 'premium' THEN
    RETURN TRUE;
  END IF;

  -- Free users have 50 calls per day
  RETURN current_calls < 50;
END;
$$;

-- Create function to increment API call count
CREATE OR REPLACE FUNCTION public.increment_api_calls(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Reset limits if needed
  PERFORM public.reset_daily_api_limits();

  -- Increment counter
  UPDATE public.profiles
  SET rawg_api_calls_today = rawg_api_calls_today + 1
  WHERE id = user_id;
END;
$$;

-- Create function for gaming analytics
CREATE OR REPLACE FUNCTION public.get_gaming_analytics(user_id UUID, days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'total_hours', COALESCE(SUM(session_length) / 60.0, 0),
    'avg_session_length', COALESCE(AVG(session_length), 0),
    'favorite_genres', (
      SELECT json_agg(genre_info)
      FROM (
        SELECT genre, COUNT(*) as count
        FROM (
          SELECT unnest(genre_tags) as genre
          FROM public.gaming_sessions
          WHERE gaming_sessions.user_id = get_gaming_analytics.user_id
          AND started_at >= NOW() - INTERVAL '1 day' * days_back
        ) t
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 5
      ) genre_info
    ),
    'mood_distribution', (
      SELECT json_agg(mood_info)
      FROM (
        SELECT mood, COUNT(*) as count
        FROM (
          SELECT unnest(mood_tags) as mood
          FROM public.gaming_sessions
          WHERE gaming_sessions.user_id = get_gaming_analytics.user_id
          AND started_at >= NOW() - INTERVAL '1 day' * days_back
        ) t
        GROUP BY mood
        ORDER BY count DESC
      ) mood_info
    ),
    'current_streak', (
      SELECT COUNT(*)::INTEGER
      FROM (
        SELECT DISTINCT DATE(started_at)
        FROM public.gaming_sessions
        WHERE gaming_sessions.user_id = get_gaming_analytics.user_id
        AND started_at >= NOW() - INTERVAL '30 day'
        ORDER BY DATE(started_at) DESC
      ) dates
      WHERE DATE(started_at) >= (
        SELECT MIN(d) FROM (
          SELECT generate_series(
            (SELECT MAX(DATE(started_at)) FROM public.gaming_sessions WHERE user_id = get_gaming_analytics.user_id),
            (SELECT MAX(DATE(started_at)) FROM public.gaming_sessions WHERE user_id = get_gaming_analytics.user_id) - INTERVAL '30 day',
            INTERVAL '-1 day'
          )::DATE as d
          EXCEPT
          SELECT DISTINCT DATE(started_at)
          FROM public.gaming_sessions
          WHERE user_id = get_gaming_analytics.user_id
        ) missing_dates
      )
    )
  ) INTO result
  FROM public.gaming_sessions
  WHERE gaming_sessions.user_id = get_gaming_analytics.user_id
  AND started_at >= NOW() - INTERVAL '1 day' * days_back;

  RETURN result;
END;
$$;

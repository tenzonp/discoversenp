-- Create table for tracking user mistake patterns over time
CREATE TABLE public.mistake_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mistake_type TEXT NOT NULL, -- grammar, vocabulary, pronunciation, fluency
  mistake_text TEXT NOT NULL,
  correction TEXT,
  frequency INTEGER DEFAULT 1,
  context TEXT, -- IELTS topic or conversation context
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user emotional/learning preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  learning_style TEXT DEFAULT 'balanced', -- visual, auditory, kinesthetic, balanced
  preferred_pace TEXT DEFAULT 'normal', -- slow, normal, fast
  encouragement_level TEXT DEFAULT 'moderate', -- minimal, moderate, high
  ai_personality TEXT DEFAULT 'professional', -- professional, friendly, strict, playful
  detected_mood_preference TEXT, -- auto-detected from interactions
  study_goals JSONB DEFAULT '[]'::jsonb,
  weak_areas JSONB DEFAULT '[]'::jsonb,
  strong_areas JSONB DEFAULT '[]'::jsonb,
  total_sessions INTEGER DEFAULT 0,
  average_session_minutes NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for study buddy matching
CREATE TABLE public.study_buddies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_id UUID NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, ended
  match_reason TEXT, -- why they were matched
  compatibility_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_buddy_pair UNIQUE (user_id, partner_id)
);

-- Create table for mood/emotion tracking during sessions
CREATE TABLE public.session_emotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- ielts_voice, chat, loksewa
  detected_emotion TEXT, -- confident, stressed, frustrated, excited, tired
  confidence_level NUMERIC, -- 0-1
  energy_level NUMERIC, -- 0-1 (detected from voice/text patterns)
  message_text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mistake_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_emotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mistake_patterns
CREATE POLICY "Users can view their own mistake patterns" 
ON public.mistake_patterns FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistake patterns" 
ON public.mistake_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mistake patterns" 
ON public.mistake_patterns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistake patterns" 
ON public.mistake_patterns FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for study_buddies
CREATE POLICY "Users can view their buddy relationships" 
ON public.study_buddies FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create buddy requests" 
ON public.study_buddies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their buddy relationships" 
ON public.study_buddies FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- RLS Policies for session_emotions
CREATE POLICY "Users can view their own emotions" 
ON public.session_emotions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotions" 
ON public.session_emotions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_mistake_patterns_user ON public.mistake_patterns(user_id);
CREATE INDEX idx_mistake_patterns_type ON public.mistake_patterns(mistake_type);
CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX idx_study_buddies_user ON public.study_buddies(user_id);
CREATE INDEX idx_study_buddies_partner ON public.study_buddies(partner_id);
CREATE INDEX idx_session_emotions_user ON public.session_emotions(user_id);

-- Trigger for updating timestamps
CREATE TRIGGER update_mistake_patterns_updated_at
BEFORE UPDATE ON public.mistake_patterns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
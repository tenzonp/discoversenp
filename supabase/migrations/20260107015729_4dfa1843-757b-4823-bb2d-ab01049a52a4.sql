-- Create voice_sessions table to store session history
CREATE TABLE public.voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'ielts',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  messages JSONB NOT NULL DEFAULT '[]',
  emotion_summary JSONB DEFAULT NULL,
  ai_feedback TEXT DEFAULT NULL,
  band_score_estimate DECIMAL(2,1) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own voice sessions"
ON public.voice_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions"
ON public.voice_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions"
ON public.voice_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice sessions"
ON public.voice_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_created_at ON public.voice_sessions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_voice_sessions_updated_at
BEFORE UPDATE ON public.voice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add user behavior tracking columns to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS flirt_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS energy_level integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS expertise_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS mood_tendency text DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS communication_style text DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS current_focus text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conversation_depth integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS humor_appreciation integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS emotional_openness integer DEFAULT 50;

-- Add RLS policy for UPDATE on user_subscriptions (needed for upgrades)
CREATE POLICY "Users can update own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
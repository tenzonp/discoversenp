-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat images
CREATE POLICY "Users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Table to track image generation usage
CREATE TABLE public.image_generation_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prompt TEXT,
  image_url TEXT
);

-- Enable RLS
ALTER TABLE public.image_generation_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see and insert their own usage
CREATE POLICY "Users can view own image usage"
ON public.image_generation_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image usage"
ON public.image_generation_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_image_generation_user_date 
ON public.image_generation_usage(user_id, generated_at DESC);
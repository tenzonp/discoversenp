-- Create homework-images storage bucket for student mode
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homework-images', 'homework-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for homework-images
CREATE POLICY "Users can upload homework images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'homework-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view homework images"
ON storage.objects FOR SELECT
USING (bucket_id = 'homework-images');

CREATE POLICY "Users can delete own homework images"
ON storage.objects FOR DELETE
USING (bucket_id = 'homework-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to manage subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscriptions" 
ON public.user_subscriptions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all voice usage
CREATE POLICY "Admins can view all voice usage" 
ON public.voice_session_usage 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all conversations
CREATE POLICY "Admins can view all conversations" 
ON public.conversations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all streaks
CREATE POLICY "Admins can view all streaks" 
ON public.user_streaks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all messages
CREATE POLICY "Admins can view all messages" 
ON public.messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));
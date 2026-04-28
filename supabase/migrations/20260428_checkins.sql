-- Add checkins table for daily attendance
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_at date DEFAULT CURRENT_DATE,
  points_earned int DEFAULT 5,
  UNIQUE(user_id, checked_at)
);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage own checkins" ON public.checkins FOR ALL USING (auth.uid() = user_id);

-- Migration: User Approval & Upload Quota System
-- Run this in Supabase SQL Editor

-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended')),
  ADD COLUMN IF NOT EXISTS monthly_upload_limit int NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS uploads_used int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uploads_reset_at timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id);

-- 2. Mark existing users as approved (they were already using the system)
UPDATE public.profiles SET status = 'approved', approved_at = now() WHERE status = 'pending';

-- 3. Admin gets unlimited uploads (0 = unlimited)
UPDATE public.profiles SET monthly_upload_limit = 0 WHERE role = 'admin';

-- 4. Admin notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'new_user',
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_email text NOT NULL DEFAULT 'nickdispatch@gmail.com',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx
  ON public.admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON public.admin_notifications(is_read) WHERE is_read = false;

-- 5. RLS for admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notifications"
  ON public.admin_notifications FOR ALL
  USING (public.is_admin());

-- 6. Trigger: notify admin on new user signup
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, user_id, message)
  VALUES (
    'new_user',
    NEW.id,
    'New user registered: ' || NEW.email || '. Awaiting approval.'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_user();

-- 7. Atomic increment function (called by server after successful extraction)
CREATE OR REPLACE FUNCTION public.increment_uploads(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET uploads_used = uploads_used + 1
  WHERE id = user_id_param;
END;
$$;

-- 8. Function to reset monthly upload counts (call via cron or manually)
CREATE OR REPLACE FUNCTION public.reset_monthly_uploads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET uploads_used = 0,
      uploads_reset_at = date_trunc('month', now())
  WHERE uploads_reset_at < date_trunc('month', now());
END;
$$;

-- ================================================
-- FAMILY HUB v2 — SQL Update
-- Supabase > SQL Editor > New query > Run
-- ================================================

-- Messages jadvaliga yangi ustunlar
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type text DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions jsonb DEFAULT '{}';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_content text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_name text;

-- Messages uchun delete policy (o'z xabarini o'chirish)
CREATE POLICY IF NOT EXISTS "messages_delete" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- Admin ham o'chira olsin
CREATE POLICY IF NOT EXISTS "admin_delete_messages" ON public.messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles: admin boshqalarni o'chira olsin
CREATE POLICY IF NOT EXISTS "admin_delete_profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin profil rolini o'zgartira olsin
CREATE POLICY IF NOT EXISTS "admin_update_profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- chat-media storage bucket
INSERT INTO storage.buckets (id, name, public)
  VALUES ('chat-media', 'chat-media', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "chat_media_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-media');

CREATE POLICY IF NOT EXISTS "chat_media_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- Admin qilish (waxriyorsteam@gmail.com)
UPDATE public.profiles SET role = 'admin' WHERE email = 'waxriyorsteam@gmail.com';

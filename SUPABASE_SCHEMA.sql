-- ================================================
-- FAMILY HUB — SQL Schema
-- Supabase > SQL Editor > New query > paste > Run
-- ================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'Boshqa',
  avatar_url text,
  fcm_token text,
  is_online boolean default false,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. MESSAGES
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- 3. RLS yoqish
alter table public.profiles enable row level security;
alter table public.messages enable row level security;

-- 4. Profiles policies
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- 5. Messages policies
create policy "messages_select" on public.messages
  for select using (auth.role() = 'authenticated');

create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = user_id);

-- 6. Storage bucket (avatars)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatars_select" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- 7. Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;

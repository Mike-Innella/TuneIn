-- Supabase Auth Setup - Run in SQL Editor
-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "profiles_insert_self" on public.profiles
for insert with check (auth.uid() = id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Auto-create profile on new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Extra guardrails for duplicates
create extension if not exists citext;

alter table public.profiles
  alter column email type citext;

create unique index if not exists profiles_email_unique on public.profiles(email);

-- OPTIONAL: gmail normalization (dot/alias collapse)
alter table public.profiles
  add column if not exists normalized_email text generated always as (
    case
      when email ilike '%@gmail.com' or email ilike '%@googlemail.com'
      then regexp_replace(split_part(lower(email),'@',1), '\.', '', 'g') || '@gmail.com'
      else lower(email)
    end
  ) stored;

create unique index if not exists profiles_normalized_email_unique
  on public.profiles(normalized_email);
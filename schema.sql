-- TuneIn Database Schema
-- Run this in Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Profiles (one per auth user)
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Interactions: require login (no anonymous writes)
create table if not exists interactions (
  id bigserial primary key,
  user_id uuid not null references profiles(user_id) on delete cascade,
  track_provider text check (track_provider in ('youtube','internal')) default 'youtube',
  track_provider_id text not null,
  event text check (event in ('play','skip','like','dislike','complete','add_to_playlist')) not null,
  mood text,
  session_id text,
  at timestamptz default now()
);

create index if not exists idx_interactions_user_at on interactions(user_id, at desc);
create index if not exists idx_interactions_provider on interactions(track_provider, track_provider_id);

-- RLS
alter table profiles enable row level security;
alter table interactions enable row level security;

-- Policies: only the owner can read/insert
create policy "profiles: read self"
on profiles for select using (auth.uid() = user_id);

create policy "profiles: insert self"
on profiles for insert with check (auth.uid() = user_id);

create policy "interactions: insert own only"
on interactions for insert to authenticated
with check (user_id = auth.uid());

create policy "interactions: read own"
on interactions for select to authenticated
using (user_id = auth.uid());
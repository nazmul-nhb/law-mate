-- LawMate Supabase Database Schema
-- Paste this script into your Supabase Dashboard SQL Editor (https://supabase.com) to initialize your database.

-- 1. Clean up existing policies, triggers, and functions if they already exist
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Admins can insert profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;
drop policy if exists "Users can view their own notes if active" on public.notes;
drop policy if exists "Users can insert their own notes if active" on public.notes;
drop policy if exists "Users can update their own notes if active" on public.notes;
drop policy if exists "Users can delete their own notes if active" on public.notes;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

-- 2. Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 3. Create the Profiles table (handles User status & Admin role)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    email text not null,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('admin', 'user')),
    status text not null default 'active' check (status in ('active', 'blocked', 'deleted')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Security Definer helper function to avoid RLS recursion when checking admin status
create or replace function public.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
end;
$$ language plpgsql security definer;

-- Profiles RLS Policies
create policy "Users can view all profiles" 
    on public.profiles for select 
    using (true);

create policy "Users can update their own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

create policy "Admins can insert profiles" 
    on public.profiles for insert 
    with check (public.is_admin());

create policy "Admins can update profiles" 
    on public.profiles for update 
    using (public.is_admin());

create policy "Admins can delete profiles" 
    on public.profiles for delete 
    using (public.is_admin());

-- 3. Create the Notes table (for bi-directional sync)
create table if not exists public.notes (
    id uuid primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    deleted_at timestamp with time zone,
    last_synced_at timestamp with time zone,
    version integer not null default 1
);

-- Enable RLS for notes
alter table public.notes enable row level security;

-- Notes RLS Policies (Deny access if user is blocked)
create policy "Users can view their own notes if active"
    on public.notes for select
    using (
        auth.uid() = user_id 
        and exists (
            select 1 from public.profiles 
            where id = auth.uid() and status = 'active'
        )
    );

create policy "Users can insert their own notes if active"
    on public.notes for insert
    with check (
        auth.uid() = user_id 
        and exists (
            select 1 from public.profiles 
            where id = auth.uid() and status = 'active'
        )
    );

create policy "Users can update their own notes if active"
    on public.notes for update
    using (
        auth.uid() = user_id 
        and exists (
            select 1 from public.profiles 
            where id = auth.uid() and status = 'active'
        )
    );

create policy "Users can delete their own notes if active"
    on public.notes for delete
    using (
        auth.uid() = user_id 
        and exists (
            select 1 from public.profiles 
            where id = auth.uid() and status = 'active'
        )
    );

-- 4. Create trigger to automatically insert a profile row on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url, role, status)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        'user',
        'active'
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 5. Backfill profiles for existing users who registered before the trigger was created
insert into public.profiles (id, email, full_name, avatar_url, role, status)
select 
    id, 
    email, 
    coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
    coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
    'user',
    'active'
from auth.users
on conflict (id) do nothing;

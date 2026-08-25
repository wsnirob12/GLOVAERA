-- GLOVAERA Website Editor setup
-- Run this ONCE in Supabase SQL Editor after the main supabase_schema.sql.
-- This enables the Admin -> 🎨 Website Editor to save changes for the live website.

create table if not exists public.site_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;

-- Visitors need to read the public website settings.
create policy if not exists "Public can read website settings"
on public.site_settings
for select
to anon, authenticated
using (id = 'global');

-- Only GLOVAERA admins can create/change website settings.
create policy if not exists "Admins can manage website settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Public media bucket used by the Website Editor for logo, hero,
-- gallery and featured-combo images.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

create policy if not exists "Public can read site media"
on storage.objects
for select
to public
using (bucket_id = 'site-media');

create policy if not exists "Admins can upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

create policy if not exists "Admins can update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
)
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

create policy if not exists "Admins can delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
);

-- Create the global settings row if it does not exist yet.
insert into public.site_settings (id, settings)
values ('global', '{}'::jsonb)
on conflict (id) do nothing;

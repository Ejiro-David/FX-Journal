-- FX Journal cloud sync schema
-- Run this in Supabase SQL Editor

create table if not exists public.journal_trades (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  trade jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists journal_trades_user_updated_idx
  on public.journal_trades (user_id, updated_at);

create table if not exists public.journal_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.journal_trades enable row level security;
alter table public.journal_settings enable row level security;

drop policy if exists "journal_trades_owner_all" on public.journal_trades;
create policy "journal_trades_owner_all"
  on public.journal_trades
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "journal_settings_owner_all" on public.journal_settings;
create policy "journal_settings_owner_all"
  on public.journal_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('trade-images', 'trade-images', false)
on conflict (id) do nothing;

drop policy if exists "trade_images_select_own" on storage.objects;
create policy "trade_images_select_own"
  on storage.objects
  for select
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "trade_images_insert_own" on storage.objects;
create policy "trade_images_insert_own"
  on storage.objects
  for insert
  with check (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "trade_images_update_own" on storage.objects;
create policy "trade_images_update_own"
  on storage.objects
  for update
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "trade_images_delete_own" on storage.objects;
create policy "trade_images_delete_own"
  on storage.objects
  for delete
  using (
    bucket_id = 'trade-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

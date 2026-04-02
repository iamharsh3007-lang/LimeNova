-- FORMULAB Supabase Schema
-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/kqjaaumzufuthidfhcwd/sql/new

-- ─────────────────────────────────────────────
-- 1. USER PROFILES (one row per device)
-- ─────────────────────────────────────────────
create table if not exists user_profiles (
  id         uuid primary key default gen_random_uuid(),
  device_id  text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast device lookups
create index if not exists user_profiles_device_id_idx on user_profiles(device_id);

-- ─────────────────────────────────────────────
-- 2. FORMULAS (generated formulations)
-- ─────────────────────────────────────────────
create table if not exists formulas (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null,
  product_type text not null check (product_type in ('deodorant', 'shower_gel')),
  product_name text not null,
  tagline      text not null default '',
  data         jsonb not null,         -- full Formulation object
  created_at   timestamptz not null default now()
);

create index if not exists formulas_device_id_idx on formulas(device_id);
create index if not exists formulas_created_at_idx on formulas(created_at desc);

-- ─────────────────────────────────────────────
-- 3. ORDERS
-- ─────────────────────────────────────────────
create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  formula_id  uuid references formulas(id) on delete set null,
  device_id   text not null,
  status      text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_price numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

create index if not exists orders_device_id_idx on orders(device_id);
create index if not exists orders_formula_id_idx on orders(formula_id);

-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (anonymous access via anon key)
-- ─────────────────────────────────────────────
alter table user_profiles enable row level security;
alter table formulas enable row level security;
alter table orders enable row level security;

-- Allow anon users full access (device_id is the identity)
create policy "anon_all_user_profiles" on user_profiles for all using (true) with check (true);
create policy "anon_all_formulas" on formulas for all using (true) with check (true);
create policy "anon_all_orders" on orders for all using (true) with check (true);

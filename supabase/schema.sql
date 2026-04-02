create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'new','pricing','awaiting_payment','in_progress','review','revisions','delivered','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'client',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  base_price numeric(10,2),
  turnaround_hours integer not null default 72,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  title text not null,
  description text,
  size text,
  style text,
  price numeric(10,2),
  status public.order_status not null default 'new',
  deadline_at timestamptz,
  delivery_link text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  bucket_name text not null default 'order-files',
  file_path text not null,
  file_name text not null,
  content_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null,
  provider text,
  provider_reference text,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  delivery_link text,
  note text,
  delivered_by uuid references public.profiles(id) on delete set null,
  delivered_at timestamptz
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.order_files enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles select own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "services public read" on public.services for select using (true);
create policy "services admin manage" on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy "orders client read own or admin" on public.orders for select using (client_id = auth.uid() or public.is_admin());
create policy "orders client insert own or admin" on public.orders for insert with check (client_id = auth.uid() or public.is_admin());
create policy "orders client update or admin" on public.orders for update using (client_id = auth.uid() or public.is_admin()) with check (client_id = auth.uid() or public.is_admin());

create policy "order_files own order or admin read" on public.order_files for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.client_id = auth.uid() or public.is_admin()))
);
create policy "order_files own order or admin insert" on public.order_files for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.client_id = auth.uid() or public.is_admin()))
);

create policy "payments own order or admin read" on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.client_id = auth.uid() or public.is_admin()))
);
create policy "payments admin manage" on public.payments for all using (public.is_admin()) with check (public.is_admin());

create policy "deliveries own order or admin read" on public.deliveries for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.client_id = auth.uid() or public.is_admin()))
);
create policy "deliveries admin manage" on public.deliveries for all using (public.is_admin()) with check (public.is_admin());

create policy "activity own order or admin read" on public.activity_logs for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.client_id = auth.uid() or public.is_admin()))
);
create policy "activity admin insert" on public.activity_logs for insert with check (public.is_admin());

insert into public.services (name, slug, base_price, turnaround_hours, is_active)
values
  ('تصميم بوست', 'social-post', 180, 72, true),
  ('تصميم ستوري', 'story-design', 120, 48, true),
  ('مونتاج إعلان', 'ad-editing', 450, 72, true),
  ('هوية بصرية', 'brand-identity', 900, 72, true)
on conflict (slug) do nothing;

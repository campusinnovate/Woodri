-- Woodri content platform. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_woodri_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_woodri_admin() from public;
grant execute on function public.is_woodri_admin() to anon, authenticated;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, image text,
  category text not null, materials text, specs text, description text,
  is_published boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), name text not null, logo text,
  quote text not null, is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(), name text not null, logo text,
  is_published boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), title text not null,
  category text, image text, excerpt text, content text,
  is_published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key, value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  discount numeric not null default 10 check (discount >= 0 and discount <= 100),
  expires_on date, is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), name text not null,
  email text not null, company text, whatsapp text, source text not null default 'gift planner',
  event text, material text, quantity text, needed_on date, details text,
  voucher_code text, consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.testimonials enable row level security;
alter table public.partners enable row level security;
alter table public.posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.vouchers enable row level security;
alter table public.leads enable row level security;

create policy "admins manage admin users" on public.admin_users for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads published products" on public.products for select to anon, authenticated using (is_published or public.is_woodri_admin());
create policy "admins manage products" on public.products for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads published testimonials" on public.testimonials for select to anon, authenticated using (is_published or public.is_woodri_admin());
create policy "admins manage testimonials" on public.testimonials for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads published partners" on public.partners for select to anon, authenticated using (is_published or public.is_woodri_admin());
create policy "admins manage partners" on public.partners for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads published posts" on public.posts for select to anon, authenticated using (is_published or public.is_woodri_admin());
create policy "admins manage posts" on public.posts for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admins manage site settings" on public.site_settings for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public reads active vouchers" on public.vouchers for select to anon, authenticated using (is_active and (expires_on is null or expires_on >= current_date) or public.is_woodri_admin());
create policy "admins manage vouchers" on public.vouchers for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());
create policy "public submits consented leads" on public.leads for insert to anon, authenticated with check (consent = true);
create policy "admins read and manage leads" on public.leads for all to authenticated using (public.is_woodri_admin()) with check (public.is_woodri_admin());

grant select on public.products, public.testimonials, public.partners, public.posts, public.site_settings, public.vouchers to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant all on public.products, public.testimonials, public.partners, public.posts, public.site_settings, public.vouchers, public.leads, public.admin_users to authenticated;

insert into public.site_settings(key,value) values
('promo', '{"banner":"Hadiah yang bermakna, dibuat dengan niat baik","cta":"Konsultasi proyek custom gratis"}'::jsonb),
('copy', '{}'::jsonb)
on conflict (key) do nothing;

-- Create your admin account first under Authentication → Users, then run:
-- insert into public.admin_users(user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';

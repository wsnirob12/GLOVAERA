-- GLOVAERA Supabase schema
-- 1) Create your Auth user first in Supabase Dashboard -> Authentication -> Users.
-- 2) After you know the user's UUID, insert it into public.admins using the SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  description text,
  material text,
  color text,
  featured boolean not null default false,
  is_new boolean not null default false,
  combo boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  district text not null,
  area text,
  address text not null,
  note text,
  payment_method text not null default 'COD',
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'new' check (status in ('new','confirmed','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  unit_price numeric(10,2) not null,
  qty integer not null check (qty > 0),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public storefront access
create policy if not exists "Public can read categories" on public.categories
  for select to anon, authenticated using (true);

create policy if not exists "Public can read active products" on public.products
  for select to anon, authenticated using (active = true or public.is_admin());

-- Admin management
create policy if not exists "Admins can manage categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy if not exists "Admins can manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy if not exists "Admins can read admins table" on public.admins
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy if not exists "Admins can read orders" on public.orders
  for select to authenticated using (public.is_admin());

create policy if not exists "Admins can update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy if not exists "Admins can read order items" on public.order_items
  for select to authenticated using (public.is_admin());

-- Safe public order submission. The browser sends product IDs and quantities only;
-- this function reads live prices and stock from the database so customers cannot
-- change prices in the browser.
create or replace function public.submit_order(
  p_customer_name text,
  p_phone text,
  p_district text,
  p_area text,
  p_address text,
  p_note text,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_payment_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  item jsonb;
  prod public.products%rowtype;
  unit numeric(10,2);
  calc_subtotal numeric(10,2) := 0;
  qty integer;
begin
  if jsonb_array_length(p_items) < 1 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders(customer_name, phone, district, area, address, note, payment_method, subtotal, delivery_fee, total)
  values (trim(p_customer_name), trim(p_phone), trim(p_district), trim(p_area), trim(p_address), trim(p_note), 'COD', 0, greatest(coalesce(p_delivery_fee,0),0), 0)
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    qty := greatest(1, (item->>'qty')::integer);
    select * into prod from public.products where id = (item->>'id')::uuid and active = true for update;
    if not found then
      raise exception 'A product in your cart is unavailable';
    end if;
    if prod.stock < qty then
      raise exception 'Not enough stock for %', prod.name;
    end if;
    unit := coalesce(prod.sale_price, prod.price);
    calc_subtotal := calc_subtotal + unit * qty;
    insert into public.order_items(order_id, product_id, product_name, unit_price, qty, image_url)
    values (new_order_id, prod.id, prod.name, unit, qty, prod.image_url);
    update public.products set stock = stock - qty where id = prod.id;
  end loop;

  update public.orders
  set subtotal = calc_subtotal,
      delivery_fee = greatest(coalesce(p_delivery_fee,0),0),
      total = calc_subtotal + greatest(coalesce(p_delivery_fee,0),0)
  where id = new_order_id;

  return new_order_id;
exception when others then
  raise;
end;
$$;

revoke all on function public.submit_order(text,text,text,text,text,text,numeric,numeric,numeric,text,jsonb) from public;
grant execute on function public.submit_order(text,text,text,text,text,text,numeric,numeric,numeric,text,jsonb) to anon, authenticated;

-- Storage bucket for product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy if not exists "Public read product images" on storage.objects
  for select to public using (bucket_id = 'product-images');

create policy if not exists "Admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());

create policy if not exists "Admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());

create policy if not exists "Admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- Starter categories
insert into public.categories(name, slug, image_url) values
('Earrings','earrings','logo.png'),
('Jhumka','jhumka','logo.png'),
('Rings','rings','logo.png'),
('Necklaces','necklaces','logo.png'),
('Hijab Pins','hijab-pins','logo.png'),
('Combos','combos','logo.png')
on conflict (slug) do nothing;

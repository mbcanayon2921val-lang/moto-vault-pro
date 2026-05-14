
-- Roles enum + table
create type public.app_role as enum ('user', 'admin', 'superadmin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  stock integer not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cart items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  motorcycle_model text not null,
  service_type text not null,
  preferred_date date not null,
  preferred_time text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.bookings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles policies
create policy "Profiles viewable by owner or admin" on public.profiles
  for select to authenticated using (
    auth.uid() = id or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- User roles policies
create policy "Users view own roles" on public.user_roles
  for select to authenticated using (
    auth.uid() = user_id or public.has_role(auth.uid(), 'superadmin')
  );
create policy "Superadmin manages roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'superadmin'))
  with check (public.has_role(auth.uid(), 'superadmin'));

-- Products policies (public read)
create policy "Products are public" on public.products for select using (true);
create policy "Admin manages products" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin'));

-- Cart policies
create policy "Users manage own cart" on public.cart_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookings policies
create policy "Users view own bookings or admin views all" on public.bookings
  for select to authenticated using (
    auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );
create policy "Users create own bookings" on public.bookings
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own bookings, admin updates any" on public.bookings
  for update to authenticated using (
    auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );
create policy "Admin deletes bookings" on public.bookings
  for delete to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );

-- Orders policies
create policy "Users view own orders or admin all" on public.orders
  for select to authenticated using (
    auth.uid() = user_id or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );
create policy "Users create own orders" on public.orders
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admin updates orders" on public.orders
  for update to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin')
  );

create policy "Order items follow order access" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'superadmin'))
    )
  );
create policy "Users insert order items for own order" on public.order_items
  for insert to authenticated with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

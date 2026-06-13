-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  company jsonb not null default '{}',
  carrier jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  load_number text not null default '',
  broker_name text not null default '',
  pickup_date text not null default '',
  gross_amount numeric not null default 0,
  origin_city text not null default '',
  origin_state text not null default '',
  destination_city text not null default '',
  destination_state text not null default '',
  source text not null default 'extract' check (source in ('extract', 'manual')),
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_number text not null,
  invoice_date text not null,
  week_label text not null,
  dispatch_percentage numeric not null,
  total_gross_revenue numeric not null,
  dispatch_fee numeric not null,
  company_snapshot jsonb not null,
  carrier_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table public.invoice_loads (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  load_number text not null default '',
  broker_name text not null default '',
  pickup_date text not null default '',
  gross_amount numeric not null default 0,
  origin_city text not null default '',
  origin_state text not null default '',
  destination_city text not null default '',
  destination_state text not null default ''
);

create index loads_user_id_idx on public.loads(user_id);
create index invoices_user_id_idx on public.invoices(user_id);
create index invoice_loads_invoice_id_idx on public.invoice_loads(invoice_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: check admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_disabled = false
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.loads enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_loads enable row level security;

-- Profiles policies
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id and is_disabled = false);

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins update profiles"
  on public.profiles for update
  using (public.is_admin());

-- User settings policies
create policy "Users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id and not exists (
    select 1 from public.profiles where id = auth.uid() and is_disabled = true
  ));

create policy "Admins read all settings"
  on public.user_settings for select
  using (public.is_admin());

-- Loads policies
create policy "Users manage own loads"
  on public.loads for all
  using (auth.uid() = user_id and not exists (
    select 1 from public.profiles where id = auth.uid() and is_disabled = true
  ));

create policy "Admins read all loads"
  on public.loads for select
  using (public.is_admin());

-- Invoices policies
create policy "Users manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id and not exists (
    select 1 from public.profiles where id = auth.uid() and is_disabled = true
  ));

create policy "Admins read all invoices"
  on public.invoices for select
  using (public.is_admin());

-- Invoice loads policies
create policy "Users manage own invoice loads"
  on public.invoice_loads for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
    and not exists (
      select 1 from public.profiles where id = auth.uid() and is_disabled = true
    )
  );

create policy "Admins read all invoice loads"
  on public.invoice_loads for select
  using (public.is_admin());

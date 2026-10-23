-- ============================================================================
-- Discord clone — Supabase schema
--
-- Run this once in the Supabase SQL Editor: Dashboard → SQL Editor → New query.
-- Every table has Row Level Security enabled; the policies below describe who
-- may read and write each row.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per authenticated user. `id` mirrors auth.users.id.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  custom_status text,
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers (id) on delete cascade,
  name text not null,
  type text not null check (type in ('text', 'voice')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (length(btrim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists servers_owner_id_idx on public.servers (owner_id);
create index if not exists channels_server_id_idx on public.channels (server_id);
create index if not exists messages_channel_created_idx
  on public.messages (channel_id, created_at desc);
create index if not exists messages_user_id_idx on public.messages (user_id);


-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Used by the channel policies: "is the current user the owner of this server?"
create or replace function public.is_server_owner(target_server_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.servers
    where id = target_server_id
      and owner_id = auth.uid()
  );
$$;


-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;

-- profiles: readable by any signed-in user, writable only by its owner.
drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- servers: everyone signed in can browse, only the owner can change them.
drop policy if exists "Servers are readable by authenticated users" on public.servers;
create policy "Servers are readable by authenticated users"
  on public.servers for select
  to authenticated
  using (true);

drop policy if exists "Users can create servers they own" on public.servers;
create policy "Users can create servers they own"
  on public.servers for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their servers" on public.servers;
create policy "Owners can update their servers"
  on public.servers for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their servers" on public.servers;
create policy "Owners can delete their servers"
  on public.servers for delete
  to authenticated
  using (auth.uid() = owner_id);

-- channels: readable by everyone signed in, managed by the server owner.
drop policy if exists "Channels are readable by authenticated users" on public.channels;
create policy "Channels are readable by authenticated users"
  on public.channels for select
  to authenticated
  using (true);

drop policy if exists "Owners can create channels" on public.channels;
create policy "Owners can create channels"
  on public.channels for insert
  to authenticated
  with check (public.is_server_owner(server_id));

drop policy if exists "Owners can update channels" on public.channels;
create policy "Owners can update channels"
  on public.channels for update
  to authenticated
  using (public.is_server_owner(server_id))
  with check (public.is_server_owner(server_id));

drop policy if exists "Owners can delete channels" on public.channels;
create policy "Owners can delete channels"
  on public.channels for delete
  to authenticated
  using (public.is_server_owner(server_id));

-- messages: readable by everyone signed in, writable only by their author.
drop policy if exists "Messages are readable by authenticated users" on public.messages;
create policy "Messages are readable by authenticated users"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "Users can post messages as themselves" on public.messages;
create policy "Users can post messages as themselves"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Authors can update their own messages" on public.messages;
create policy "Authors can update their own messages"
  on public.messages for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authors can delete their own messages" on public.messages;
create policy "Authors can delete their own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Automatically create a profile for every new sign-up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- Realtime: stream new messages to connected clients
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

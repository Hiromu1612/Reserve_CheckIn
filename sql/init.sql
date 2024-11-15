-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  password text not null, -- パスワードを必須に
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reservations table
create table if not exists reservations (
  id uuid default uuid_generate_v4() primary key,
  chair_id integer not null,
  user_id uuid references auth.users(id),
  user_name text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  duration integer not null,
  people integer not null default 1,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists reservations_chair_id_idx on reservations(chair_id);
create index if not exists reservations_user_id_idx on reservations(user_id);
create index if not exists reservations_start_time_idx on reservations(start_time);

-- Enable RLS
alter table profiles enable row level security;
alter table reservations enable row level security;

-- Profiles policies
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using ( auth.role() = 'authenticated' );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Reservations policies
create policy "Authenticated users can view all reservations"
  on reservations for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can create reservations"
  on reservations for insert
  with check ( 
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

create policy "Users can update own reservations"
  on reservations for update
  using ( auth.uid() = user_id );

create policy "Users can delete own reservations"
  on reservations for delete
  using ( auth.uid() = user_id );
-- Drop existing policies
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Authenticated users can view all reservations" on reservations;
drop policy if exists "Authenticated users can create reservations" on reservations;
drop policy if exists "Users can update own reservations" on reservations;
drop policy if exists "Users can delete own reservations" on reservations;

-- Recreate policies
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
-- WorkSpot: user-submitted cafe requests for admin review.
-- Run in the Supabase dashboard SQL editor after 0007.
-- Users insert + read their own rows; the admin page reads all rows
-- server-side with the service-role key (bypasses RLS).

create table if not exists cafe_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  address text,
  neighborhood text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table cafe_requests enable row level security;

drop policy if exists "own read" on cafe_requests;
create policy "own read" on cafe_requests
  for select using (auth.uid() = user_id);

drop policy if exists "own insert" on cafe_requests;
create policy "own insert" on cafe_requests
  for insert with check (auth.uid() = user_id);

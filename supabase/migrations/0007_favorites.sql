-- WorkSpot: user favorites (starred cafes).
-- Run in the Supabase dashboard SQL editor after 0006.
-- Users are managed by Supabase Auth; this table only stores (user, cafe) pairs.

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  cafe_id text not null references cafes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cafe_id)
);

alter table favorites enable row level security;

drop policy if exists "own read" on favorites;
create policy "own read" on favorites
  for select using (auth.uid() = user_id);

drop policy if exists "own insert" on favorites;
create policy "own insert" on favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "own delete" on favorites;
create policy "own delete" on favorites
  for delete using (auth.uid() = user_id);

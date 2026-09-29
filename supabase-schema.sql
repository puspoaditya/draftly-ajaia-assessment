create table if not exists public.documents (
  id uuid primary key,
  title text not null default 'Untitled document',
  content text not null default '<p></p>',
  owner_id text not null check (owner_id in ('user-puspo', 'user-reviewer')),
  shared_with jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

-- No public policies are defined. The application server uses a service-role key,
-- which bypasses RLS, and enforces the seeded-user access rules in the API.

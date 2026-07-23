-- ============================================
-- Email support: get_emails RPC + email_queue
-- ============================================

-- RPC to get emails from auth.users (client-safe)
create or replace function get_emails(user_ids uuid[])
returns table(id uuid, email text)
language sql
security definer
set search_path = ''
as $$
  select id, email from auth.users where id = any(user_ids);
$$;

-- Queue table for email notifications
create table if not exists email_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  subject text not null,
  html_content text not null,
  sent boolean default false,
  created_at timestamptz default now()
);

alter table email_queue enable row level security;
create policy "System can insert queue" on email_queue for insert with check (true);
create policy "System can read queue" on email_queue for select using (true);

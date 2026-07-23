-- ============================================
-- Activity Log System
-- ============================================

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_activity_logs_user_id on activity_logs(user_id);
create index if not exists idx_activity_logs_entity_type on activity_logs(entity_type);
create index if not exists idx_activity_logs_created_at on activity_logs(created_at desc);

alter table activity_logs enable row level security;

create policy "Dokter can view all logs"
  on activity_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  );

create policy "System can insert logs"
  on activity_logs for insert
  with check (true);

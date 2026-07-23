-- ============================================
-- AI MEDICATION ASSISTANT - FULL DATABASE SCHEMA
-- Jalankan 1x di Supabase SQL Editor
-- ============================================

-- DROP EXISTING (untuk fresh start)
drop policy if exists "Dokter can view all logs" on activity_logs;
drop policy if exists "System can insert logs" on activity_logs;
drop policy if exists "Dokter can view all consultations" on consultations;
drop policy if exists "Patients can view own consultations" on consultations;
drop policy if exists "Patients can create consultations" on consultations;
drop policy if exists "Dokter can update consultations" on consultations;
drop policy if exists "Dokter can view all messages" on consultation_messages;
drop policy if exists "Patients can view own messages" on consultation_messages;
drop policy if exists "Anyone involved can insert messages" on consultation_messages;
drop policy if exists "Medications viewable by family" on medications;
drop policy if exists "Medications manageable by dokter only" on medications;
drop policy if exists "Medications updatable by dokter only" on medications;
drop policy if exists "Medications deletable by dokter only" on medications;
drop policy if exists "Journals viewable by family" on journals;
drop policy if exists "Journals insertable by family" on journals;
drop policy if exists "Patients viewable by family" on patients;
drop policy if exists "Patients manageable by dokter" on patients;
drop policy if exists "Family members can manage patients" on patients;
drop policy if exists "Patients can view own data" on patients;
drop policy if exists "Admin can manage family" on families;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Family members can upload images" on storage.objects;
drop policy if exists "Anyone can view images" on storage.objects;

drop table if exists consultation_messages cascade;
drop table if exists consultations cascade;
drop table if exists activity_logs cascade;
drop table if exists journals cascade;
drop table if exists medications cascade;
drop table if exists patients cascade;
drop table if exists profiles cascade;
drop table if exists families cascade;

-- ======================== 1. TABLES ========================

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'dokter' check (role in ('dokter', 'keluarga', 'pasien')),
  family_id uuid references families(id) on delete set null,
  avatar_url text,
  created_at timestamptz default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

create table medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  nama_obat text not null,
  dosis text not null default '',
  frekuensi text not null default '',
  instruksi_khusus text default '',
  status_bpom text default 'pending' check (status_bpom in ('valid', 'kurang_dapat_dipercaya', 'perlu_verifikasi', 'pending')),
  nomor_bpom text default '',
  image_url text default '',
  last_taken_at timestamptz
);

create table journals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  keluhan_teks text not null,
  analisis_ai text default ''
);

create table consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  message text not null,
  created_at timestamptz default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ======================== 2. INDEXES ========================

create index idx_profiles_family_id on profiles(family_id);
create index idx_patients_family_id on patients(family_id);
create index idx_patients_user_id on patients(user_id);
create index idx_medications_patient_id on medications(patient_id);
create index idx_medications_created_by on medications(created_by);
create index idx_journals_patient_id on journals(patient_id);
create index idx_journals_created_by on journals(created_by);
create index idx_consultations_patient_id on consultations(patient_id);
create index idx_consultations_doctor_id on consultations(doctor_id);
create index idx_consultations_status on consultations(status);
create index idx_messages_consultation_id on consultation_messages(consultation_id);
create index idx_activity_logs_user_id on activity_logs(user_id);
create index idx_activity_logs_entity_type on activity_logs(entity_type);
create index idx_activity_logs_created_at on activity_logs(created_at desc);

-- ======================== 3. STORAGE ========================

insert into storage.buckets (id, name, public)
values ('medicine-images', 'medicine-images', true)
on conflict (id) do nothing;

-- ======================== 4. TRIGGERS ========================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.raw_user_meta_data ->> 'role', 'dokter'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ======================== 5. ROW LEVEL SECURITY ========================

alter table families enable row level security;
alter table profiles enable row level security;
alter table patients enable row level security;
alter table medications enable row level security;
alter table journals enable row level security;
alter table consultations enable row level security;
alter table consultation_messages enable row level security;
alter table activity_logs enable row level security;

-- FAMILIES
create policy "Family admin can manage"
  on families for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Family members can view"
  on families for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.family_id = families.id)
  );

-- PROFILES
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- PATIENTS (RLS: semua role di family bisa lihat, dokter bisa manage)
create policy "Patients viewable by family"
  on patients for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.family_id = patients.family_id
      and profiles.role in ('dokter', 'keluarga', 'pasien')
    )
  );

create policy "Patients manageable by dokter"
  on patients for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  );

create policy "Patients updatable by dokter"
  on patients for update
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  )
  with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

create policy "Patients deletable by dokter"
  on patients for delete
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

-- MEDICATIONS (semua lihat, dokter yang manage)
create policy "Medications viewable by family"
  on medications for select
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
    )
  );

create policy "Medications manageable by dokter"
  on medications for insert
  with check (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  );

create policy "Medications updatable by dokter"
  on medications for update
  using (
    exists (
      select 1 from patients join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id and profiles.id = auth.uid() and profiles.role = 'dokter'
    )
  )
  with check (
    exists (
      select 1 from patients join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id and profiles.id = auth.uid() and profiles.role = 'dokter'
    )
  );

create policy "Medications deletable by dokter"
  on medications for delete
  using (
    exists (
      select 1 from patients join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id and profiles.id = auth.uid() and profiles.role = 'dokter'
    )
  );

-- JOURNALS (semua lihat, semua insert, own update)
create policy "Journals viewable by family"
  on journals for select
  using (
    exists (
      select 1 from patients join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id and profiles.id = auth.uid()
    )
  );

create policy "Journals insertable by family"
  on journals for insert
  with check (
    exists (
      select 1 from patients join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id and profiles.id = auth.uid()
    )
  );

-- CONSULTATIONS
create policy "Dokter can view all consultations"
  on consultations for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

create policy "Patients can view own consultations"
  on consultations for select
  using (
    exists (
      select 1 from patients
      where patients.id = consultations.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Patients can create consultations"
  on consultations for insert
  with check (
    exists (
      select 1 from patients
      where patients.id = consultations.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Dokter can update consultations"
  on consultations for update
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  )
  with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

-- MESSAGES
create policy "Dokter can view all messages"
  on consultation_messages for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

create policy "Patients can view own messages"
  on consultation_messages for select
  using (
    exists (
      select 1 from consultations join patients on patients.id = consultations.patient_id
      where consultations.id = consultation_messages.consultation_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Involved can insert messages"
  on consultation_messages for insert
  with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
    or
    exists (
      select 1 from consultations join patients on patients.id = consultations.patient_id
      where consultations.id = consultation_messages.consultation_id
      and patients.user_id = auth.uid()
    )
  );

-- ACTIVITY LOGS
create policy "Dokter can view all logs"
  on activity_logs for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

create policy "System can insert logs"
  on activity_logs for insert
  with check (true);

-- STORAGE
create policy "Family members can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'medicine-images'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('dokter', 'keluarga')
    )
  );

create policy "Anyone can view images"
  on storage.objects for select
  using (bucket_id = 'medicine-images');

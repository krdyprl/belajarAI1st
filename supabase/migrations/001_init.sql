-- ============================================
-- AI Medication Assistant - Database Migration
-- ============================================

-- 1. TABLES

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'admin' check (role in ('admin', 'keluarga', 'pasien')),
  family_id uuid references families(id) on delete set null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

create table if not exists medications (
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
  image_url text default ''
);

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  keluhan_teks text not null,
  analisis_ai text default ''
);

-- 2. INDEXES

create index if not exists idx_profiles_family_id on profiles(family_id);
create index if not exists idx_patients_family_id on patients(family_id);
create index if not exists idx_medications_patient_id on medications(patient_id);
create index if not exists idx_medications_created_by on medications(created_by);
create index if not exists idx_journals_patient_id on journals(patient_id);
create index if not exists idx_journals_created_by on journals(created_by);

-- 3. AUTO-CREATE PROFILE ON SIGNUP

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.raw_user_meta_data ->> 'role', 'admin'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. ROW LEVEL SECURITY

alter table families enable row level security;
alter table profiles enable row level security;
alter table patients enable row level security;
alter table medications enable row level security;
alter table journals enable row level security;

-- families
create policy "Admin can manage family"
  on families for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- profiles
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- patients
create policy "Family members can manage patients"
  on patients for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.family_id = patients.family_id
      and profiles.role in ('admin', 'keluarga')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.family_id = patients.family_id
      and profiles.role in ('admin', 'keluarga')
    )
  );

-- medications
create policy "Family members can manage medications"
  on medications for all
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role in ('admin', 'keluarga')
    )
  )
  with check (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role in ('admin', 'keluarga')
    )
  );

-- journals
create policy "Family members can manage journals"
  on journals for all
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id
      and profiles.id = auth.uid()
      and profiles.role in ('admin', 'keluarga')
    )
  )
  with check (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id
      and profiles.id = auth.uid()
      and profiles.role in ('admin', 'keluarga')
    )
  );

-- 5. STORAGE BUCKET

insert into storage.buckets (id, name, public)
values ('medicine-images', 'medicine-images', true)
on conflict (id) do nothing;

create policy "Family members can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'medicine-images'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'keluarga')
    )
  );

create policy "Anyone can view images"
  on storage.objects for select
  using (bucket_id = 'medicine-images');

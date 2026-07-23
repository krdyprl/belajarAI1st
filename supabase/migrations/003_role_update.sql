-- ============================================
-- Role Update: admin -> dokter + RLS
-- ============================================

-- 1. Update existing admin profiles to dokter
update profiles set role = 'dokter' where role = 'admin';

-- 2. Update check constraint
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('dokter', 'keluarga', 'pasien'));

-- 3. Update trigger default
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

-- 4. Update RLS for medications: only dokter can insert/update/delete
drop policy if exists "Family members can manage medications" on medications;

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

create policy "Medications manageable by dokter only"
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

create policy "Medications updatable by dokter only"
  on medications for update
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  )
  with check (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  );

create policy "Medications deletable by dokter only"
  on medications for delete
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = medications.patient_id
      and profiles.id = auth.uid()
      and profiles.role = 'dokter'
    )
  );

-- 5. Update journals RLS: semua bisa insert/view
drop policy if exists "Family members can manage journals" on journals;

create policy "Journals viewable by family"
  on journals for select
  using (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id
      and profiles.id = auth.uid()
    )
  );

create policy "Journals insertable by family"
  on journals for insert
  with check (
    exists (
      select 1 from patients
      join profiles on profiles.family_id = patients.family_id
      where patients.id = journals.patient_id
      and profiles.id = auth.uid()
    )
  );

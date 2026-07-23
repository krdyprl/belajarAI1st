-- ============================================
-- Chat Konsultasi (Ticket-based)
-- ============================================

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists consultation_messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_consultations_patient_id on consultations(patient_id);
create index if not exists idx_consultations_doctor_id on consultations(doctor_id);
create index if not exists idx_consultations_status on consultations(status);
create index if not exists idx_consultation_messages_consultation_id on consultation_messages(consultation_id);

-- RLS
alter table consultations enable row level security;
alter table consultation_messages enable row level security;

-- Consultations: dokter lihat semua, pasien lihat miliknya
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

-- Messages: dokter lihat semua, pasien lihat miliknya
create policy "Dokter can view all messages"
  on consultation_messages for select
  using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter')
  );

create policy "Patients can view own messages"
  on consultation_messages for select
  using (
    exists (
      select 1 from consultations
      join patients on patients.id = consultations.patient_id
      where consultations.id = consultation_messages.consultation_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Anyone involved can insert messages"
  on consultation_messages for insert
  with check (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'dokter'
    )
    or
    exists (
      select 1 from consultations
      join patients on patients.id = consultations.patient_id
      where consultations.id = consultation_messages.consultation_id
      and patients.user_id = auth.uid()
    )
  );

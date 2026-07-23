-- ============================================
-- SETUP ALL: Fix role + seed data + dummy
-- GANTI 4 EMAIL di bawah
-- ============================================
-- CARA: Copy semua, paste ke SQL Editor, RUN
-- ============================================

do $$
declare
  v_dokter_id uuid;
  v_keluarga_id uuid;
  v_pasien_id uuid;
  v_family_id uuid;
  v_patient_id uuid;
  v_consult_id uuid;
begin
  -- ======================== GANTI EMAIL ========================
  select id into v_dokter_id from auth.users where email = 'prlkdy@gmail.com';
  select id into v_keluarga_id from auth.users where email = 'keluarga@gmail.com';
  select id into v_pasien_id from auth.users where email = 'pasien@gmail.com';

  if v_dokter_id is null then
    raise notice 'ERROR: Email dokter tidak ditemukan. Cek email di auth.users.';
    return;
  end if;

  -- ======================== 1. PROFILES ========================
  update profiles set full_name = 'Kardynan Parulian', role = 'dokter' where id = v_dokter_id;
  update profiles set full_name = 'Anggota Keluarga', role = 'keluarga' where id = v_keluarga_id;
  update profiles set full_name = 'Pasien', role = 'pasien' where id = v_pasien_id;

  -- ======================== 2. FAMILY ========================
  insert into families (name, created_by)
  select 'Keluarga Saya', v_dokter_id
  where not exists (select 1 from families)
  returning id into v_family_id;

  if v_family_id is null then select id into v_family_id from families limit 1; end if;

  update profiles set family_id = v_family_id where id in (v_dokter_id, v_keluarga_id, v_pasien_id);

  -- ======================== 3. PATIENTS ========================
  select id into v_patient_id from patients where user_id = v_pasien_id;
  if v_patient_id is null then
    insert into patients (family_id, name, user_id, created_by)
    values (v_family_id, 'Pasien', v_pasien_id, v_dokter_id)
    returning id into v_patient_id;
  end if;

  -- ======================== 4. MEDICATIONS ========================
  delete from medications where patient_id = v_patient_id;
  insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom, nomor_bpom, last_taken_at)
  values
    (v_patient_id, v_dokter_id, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid', 'DBL9424502004A1', null),
    (v_patient_id, v_dokter_id, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi', '', null),
    (v_patient_id, v_dokter_id, 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid', '', null),
    (v_patient_id, v_dokter_id, 'Bodrex', '200mg', '2x sehari', 'Sesudah makan', 'kurang_dapat_dipercaya', '', null),
    (v_patient_id, v_dokter_id, 'Antasida DOEN', '1 sachet', '3x sehari', 'Saat gejala', 'pending', '', null);

  -- ======================== 5. JOURNALS ========================
  delete from journals where patient_id = v_patient_id;
  insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
  values
    (v_patient_id, v_pasien_id, 'Batuk sejak pagi dan tenggorokan sakit', 'Istirahat cukup dan minum air hangat.'),
    (v_patient_id, v_pasien_id, 'Pusing setelah kerja di depan komputer', 'Coba istirahatkan mata setiap 20 menit.'),
    (v_patient_id, v_keluarga_id, 'Ibu mengeluh perut kembung setelah makan', 'Makan perlahan dan hindari makanan berminyak.');

  -- ======================== 6. ACTIVITY LOGS ========================
  delete from activity_logs;
  insert into activity_logs (user_id, action, entity_type, entity_id, metadata)
  values
    (v_dokter_id, 'login', 'profile', v_dokter_id, null),
    (v_dokter_id, 'create', 'medication', gen_random_uuid(), '{"nama_obat": "Panadol Extra"}'),
    (v_pasien_id, 'journal', 'journal', gen_random_uuid(), '{"keluhan": "Batuk sejak pagi"}'),
    (v_dokter_id, 'scan', 'medication', gen_random_uuid(), '{"nama_obat": "Vit C"}'),
    (v_keluarga_id, 'taken', 'medication', gen_random_uuid(), null);

  -- ======================== 7. CONSULTATIONS ========================
  delete from consultation_messages;
  delete from consultations;

  -- Selesai
  insert into consultations (patient_id, doctor_id, title, status, created_at, updated_at)
  values (v_patient_id, v_dokter_id, 'Batuk tidak kunjung sembuh', 'resolved',
          now() - interval '2 days', now() - interval '1 day')
  returning id into v_consult_id;
  insert into consultation_messages (consultation_id, sender_id, message)
  values
    (v_consult_id, v_pasien_id, 'Dok, saya sudah minum obat 3 hari tapi belum sembuh.'),
    (v_consult_id, v_dokter_id, 'Coba hentikan dulu obatnya. Minum Panadol 3x1 dan banyak minum.'),
    (v_consult_id, v_pasien_id, 'Baik dok, terima kasih.');

  -- Berjalan
  insert into consultations (patient_id, doctor_id, title, status, created_at, updated_at)
  values (v_patient_id, v_dokter_id, 'Perut terasa perih setelah makan', 'in_progress',
          now() - interval '1 day', now())
  returning id into v_consult_id;
  insert into consultation_messages (consultation_id, sender_id, message)
  values
    (v_consult_id, v_pasien_id, 'Setiap habis makan perut saya perih dan mual.'),
    (v_consult_id, v_dokter_id, 'Kemungkinan maag. Minum Antasida saat gejala muncul.');

  -- Baru
  insert into consultations (patient_id, title, status)
  values (v_patient_id, 'Kepala pusing dan tensi naik', 'open');

  raise notice '✅ SETUP BERHASIL! Silakan refresh aplikasi.';
  raise notice 'Dokter: prlkrdy@gmail.com / Keluarga: keluarga@gmail.com / Pasien: pasien@gmail.com';
end $$;

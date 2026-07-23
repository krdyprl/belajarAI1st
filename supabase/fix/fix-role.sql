-- ============================================
-- FIX ROLE + LINK DATA
-- GANTI 3 EMAIL di bawah dengan akun kamu
-- ============================================

do $$
declare
  v_dokter_id uuid;
  v_keluarga_id uuid;
  v_pasien_id uuid;
  v_family_id uuid;
  v_patient_id uuid;
begin
  -- ===== GANTI 3 EMAIL INI =====
  select id into v_dokter_id from auth.users where email = 'kardynan.parulian@gmail.com';
  select id into v_keluarga_id from auth.users where email = 'keluarga@gmail.com';
  select id into v_pasien_id from auth.users where email = 'pasien@gmail.com';

  if v_dokter_id is null then
    raise notice 'ERROR: User dokter tidak ditemukan. Buat dulu di Authentication > Users.';
    return;
  end if;

  -- 1. BUAT KELUARGA JIKA BELUM ADA
  insert into families (name, created_by)
  select 'Keluarga Saya', v_dokter_id
  where not exists (select 1 from families limit 1)
  returning id into v_family_id;

  if v_family_id is null then
    select id into v_family_id from families limit 1;
  end if;

  -- 2. SET ROLE + FAMILY
  update profiles set role = 'dokter', family_id = v_family_id where id = v_dokter_id;
  update profiles set role = 'keluarga', family_id = v_family_id where id = v_keluarga_id;
  update profiles set role = 'pasien', family_id = v_family_id where id = v_pasien_id;

  -- 3. BUAT/LINK PATIENT UNTUK PASIEN
  if v_pasien_id is not null then
    -- Cek apakah sudah punya patient record
    select id into v_patient_id from patients where user_id = v_pasien_id;
    if v_patient_id is null then
      insert into patients (family_id, name, user_id, created_by)
      values (v_family_id, 'Pasien', v_pasien_id, v_dokter_id)
      returning id into v_patient_id;
    end if;

    -- 4. SAMPLE OBAT UNTUK PASIEN (jika belum ada)
    if not exists (select 1 from medications where patient_id = v_patient_id) then
      insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom, nomor_bpom)
      values
        (v_patient_id, v_dokter_id, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid', 'DBL9424502004A1'),
        (v_patient_id, v_dokter_id, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi', ''),
        (v_patient_id, v_dokter_id, 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid', '');
    end if;

    -- 5. SAMPLE JURNAL (jika belum ada)
    if not exists (select 1 from journals where patient_id = v_patient_id) then
      insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
      values
        (v_patient_id, v_pasien_id, 'Batuk sejak pagi dan tenggorokan sakit', 'Istirahat cukup dan minum air hangat.'),
        (v_patient_id, v_pasien_id, 'Pusing setelah kerja di depan komputer', 'Coba istirahatkan mata 5 menit setiap jam.');
    end if;
  end if;

  raise notice '✅ BERHASIL! Role & data sudah diperbaiki.';
  raise notice 'Dokter: %, Keluarga: %, Pasien: %', v_dokter_id, v_keluarga_id, v_pasien_id;
end $$;

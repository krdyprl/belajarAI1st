-- ============================================
-- SEED DATA - AI Medication Assistant
-- CARA PAKAI:
-- 1. Buat 3 akun via Supabase Dashboard > Authentication > Users
-- 2. Klik "Add User", isi email + password, centang "Auto Confirm"
-- 3. Ganti email di bawah sesuai akun yang kamu buat
-- 4. Copy SQL ini ke Supabase SQL Editor, lalu RUN
-- 5. Setelah seed jalan, update role pasien & keluarga via SQL di bawah
-- ============================================

-- BAGIAN 1: CREATE FAMILY & PATIENTS
do $$
declare
  v_dokter_id uuid;
  v_keluarga_id uuid;
  v_pasien_id uuid;
  v_family_id uuid;
  v_patient_id uuid;
begin
  -- GANTI 3 EMAIL INI
  select id into v_dokter_id from auth.users where email = 'kardynan.parulian@gmail.com';
  select id into v_keluarga_id from auth.users where email = 'keluarga@gmail.com';
  select id into v_pasien_id from auth.users where email = 'pasien@gmail.com';

  if v_dokter_id is null then
    raise notice 'User dokter tidak ditemukan. Buat dulu lewat Dashboard.';
    return;
  end if;

  -- 1. Buat keluarga
  insert into families (name, created_by)
  values ('Keluarga Saya', v_dokter_id)
  returning id into v_family_id;

  -- 2. Update profile semua user
  update profiles set family_id = v_family_id, role = 'dokter' where id = v_dokter_id;
  update profiles set family_id = v_family_id, role = 'keluarga' where id = v_keluarga_id;
  update profiles set family_id = v_family_id, role = 'pasien' where id = v_pasien_id;

  -- 3. Buat pasien (link ke user pasien)
  insert into patients (family_id, name, user_id, created_by)
  values (v_family_id, 'Pasien Test', v_pasien_id, v_dokter_id)
  returning id into v_patient_id;

  insert into patients (family_id, name, created_by)
  values (v_family_id, 'Ibu Siti', v_dokter_id);

  -- 4. Sample obat
  insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom, nomor_bpom)
  values
    (v_patient_id, v_dokter_id, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid', 'DBL9424502004A1'),
    (v_patient_id, v_dokter_id, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi', ''),
    (v_patient_id, v_dokter_id, 'Bodrex', '200mg', '2x sehari', 'Sesudah makan', 'kurang_dapat_dipercaya', ''),
    (v_patient_id, v_dokter_id, 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid', ''),
    (v_patient_id, v_dokter_id, 'Antasida DOEN', '1 sachet', '3x sehari', 'Saat gejala muncul', 'pending', '');

  -- 5. Sample jurnal
  insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
  values
    (v_patient_id, v_dokter_id,
     'Batuk sejak pagi dan tenggorokan terasa sakit',
     'Keluhan batuk dan sakit tenggorokan bisa disebabkan oleh iritasi ringan atau infeksi saluran pernapasan atas. Pastikan istirahat cukup, minum air hangat, dan hindari makanan berminyak.'),
    (v_patient_id, v_dokter_id,
     'Pusing setelah seharian bekerja di depan komputer',
     'Keluhan pusing setelah bekerja dengan layar komputer dalam waktu lama bisa menandakan kelelahan mata (digital eye strain). Coba terapkan aturan 20-20-20.'),
    (v_patient_id, v_dokter_id,
     'Perut terasa mual setelah makan siang',
     'Mual setelah makan bisa disebabkan oleh makan terlalu cepat atau porsi terlalu besar. Coba makan dengan porsi lebih kecil tapi lebih sering.');

  raise notice 'Seed berhasil!';
end $$;

-- BAGIAN 2: Jika role masih "dokter" untuk keluarga/pasien, jalankan ini:
-- update profiles set role = 'keluarga' where id = (select id from auth.users where email = 'keluarga@gmail.com');
-- update profiles set role = 'pasien' where id = (select id from auth.users where email = 'pasien@gmail.com');

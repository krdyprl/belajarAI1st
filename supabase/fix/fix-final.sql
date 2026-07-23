-- ============================================
-- FIX FINAL: Perbaiki SEMUA data + link
-- Jalankan semua baris di bawah sekaligus
-- ============================================

-- STEP 1: Cek state saat ini
SELECT '--- SEBELUM FIX ---' as info;
SELECT au.email, p.role, p.family_id, p.full_name FROM profiles p JOIN auth.users au ON au.id = p.id;
SELECT id, family_id, name, user_id IS NOT NULL as has_uid FROM patients;

-- STEP 2: Buat family jika belum ada
INSERT INTO families (name, created_by)
SELECT 'Keluarga Saya', id FROM auth.users WHERE email = 'prlkrdy@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM families LIMIT 1);

-- STEP 3: Set family_id di semua profiles
UPDATE profiles SET family_id = (SELECT id FROM families LIMIT 1)
WHERE family_id IS NULL OR family_id != (SELECT id FROM families LIMIT 1);

-- STEP 4: Set role & full_name
UPDATE profiles SET role = 'dokter', full_name = 'Kardynan Parulian'
WHERE id = (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com');

UPDATE profiles SET role = 'keluarga', full_name = 'Keluarga'
WHERE id = (SELECT id FROM auth.users WHERE email = 'keluarga@gmail.com');

UPDATE profiles SET role = 'pasien', full_name = 'Pasien'
WHERE id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

-- STEP 5: Buat patient untuk pasien (link user_id)
INSERT INTO patients (family_id, name, user_id, created_by)
SELECT 
  (SELECT family_id FROM profiles WHERE role = 'dokter' LIMIT 1),
  'Pasien',
  (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'),
  (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com')
WHERE NOT EXISTS (
  SELECT 1 FROM patients 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com')
);

-- STEP 6: Update existing patients yang tidak punya user_id
UPDATE patients SET 
  user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'),
  family_id = (SELECT family_id FROM profiles WHERE role = 'dokter' LIMIT 1)
WHERE user_id IS NULL;

-- STEP 7: Update obat & jurnal ke patient yang benar
UPDATE medications SET 
  patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') LIMIT 1)
WHERE patient_id IS NULL OR patient_id NOT IN (SELECT id FROM patients);

UPDATE journals SET 
  patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') LIMIT 1)
WHERE patient_id IS NULL OR patient_id NOT IN (SELECT id FROM patients);

-- STEP 8: Insert sample data jika belum ada
INSERT INTO medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom)
SELECT 
  (SELECT id FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com'),
  name, dosis, frekuensi, instruksi, status
FROM (VALUES 
  ('Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid'),
  ('Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi'),
  ('Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid')
) AS t(name, dosis, frekuensi, instruksi, status)
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE nama_obat = t.name);

INSERT INTO journals (patient_id, created_by, keluhan_teks, analisis_ai)
SELECT 
  (SELECT id FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'),
  teks, analisis
FROM (VALUES 
  ('Batuk sejak pagi dan tenggorokan sakit', 'Istirahat cukup dan minum air hangat. Jika demam, periksa ke dokter.'),
  ('Pusing setelah kerja di depan komputer', 'Istirahatkan mata setiap 20 menit. Atur pencahayaan ruangan.')
) AS t(teks, analisis)
WHERE NOT EXISTS (SELECT 1 FROM journals WHERE keluhan_teks = t.teks);

-- STEP 9: Verifikasi hasil
SELECT '--- SESUDAH FIX ---' as info;
SELECT au.email, p.role, p.family_id IS NOT NULL as has_family, p.full_name 
FROM profiles p JOIN auth.users au ON au.id = p.id;
SELECT id, family_id, name, user_id IS NOT NULL as has_uid FROM patients;
SELECT COUNT(*) as total_meds FROM medications;
SELECT COUNT(*) as total_journals FROM journals;

-- ============================================
-- BUAT PATIENT + SAMPLE DATA
-- COPY semua, paste ke SQL Editor, RUN sekali
-- ============================================

-- Step 1: Buat family
INSERT INTO families (name, created_by)
SELECT 'Keluarga Saya', id FROM auth.users WHERE email = 'prlkrdy@gmail.com'
AND NOT EXISTS (SELECT 1 FROM families);
-- (abaikan error "duplicate key" jika family sudah ada)

-- Step 2: Update profiles
UPDATE profiles p SET
  family_id = (SELECT id FROM families LIMIT 1),
  role = CASE
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com') THEN 'dokter'
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'keluarga@gmail.com') THEN 'keluarga'
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') THEN 'pasien'
    ELSE p.role
  END,
  full_name = CASE
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com') THEN 'Kardynan Parulian'
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'keluarga@gmail.com') THEN 'Keluarga'
    WHEN p.id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com') THEN 'Pasien'
    ELSE p.full_name
  END;

-- Step 3: Buat patient (hapus dulu yang lama biar bersih)
DELETE FROM medications;
DELETE FROM journals;
DELETE FROM consultations;
DELETE FROM consultation_messages;
DELETE FROM patients;

INSERT INTO patients (family_id, name, user_id, created_by)
SELECT (SELECT id FROM families LIMIT 1), 'Pasien',
  (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'),
  (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com');

-- Step 4: Sample obat
INSERT INTO medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom)
SELECT id, (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com'), 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid'
FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

INSERT INTO medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom)
SELECT id, (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com'), 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi'
FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

INSERT INTO medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom)
SELECT id, (SELECT id FROM auth.users WHERE email = 'prlkrdy@gmail.com'), 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid'
FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

-- Step 5: Sample jurnal
INSERT INTO journals (patient_id, created_by, keluhan_teks, analisis_ai)
SELECT id, (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'), 'Batuk sejak pagi dan tenggorokan sakit', 'Istirahat cukup dan minum air hangat. Jika demam, periksa ke dokter.'
FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

INSERT INTO journals (patient_id, created_by, keluhan_teks, analisis_ai)
SELECT id, (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com'), 'Pusing setelah kerja di depan komputer', 'Istirahatkan mata setiap 20 menit. Gunakan pencahayaan yang cukup.'
FROM patients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pasien@gmail.com');

-- Step 6: Verifikasi
SELECT 'HASIL FIX:' as info;
SELECT au.email, p.role, p.full_name, p.family_id IS NOT NULL as has_family FROM profiles p JOIN auth.users au ON au.id = p.id;
SELECT id, name, user_id IS NOT NULL as has_uid FROM patients;
SELECT COUNT(*) as total_meds FROM medications;
SELECT COUNT(*) as total_journals FROM journals;

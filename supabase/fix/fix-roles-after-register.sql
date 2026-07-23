-- ============================================
-- FIX ROLE: Set role yang benar setelah register
-- Jalankan SETELAH user daftar dari aplikasi
-- ============================================

UPDATE profiles SET role = 'keluarga', full_name = 'Keluarga'
WHERE id = (SELECT id FROM auth.users WHERE email = 'kiparulian@gmail.com');

UPDATE profiles SET role = 'pasien', full_name = 'Pasien'
WHERE id = (SELECT id FROM auth.users WHERE email = 'nanyardak098@gmail.com');

-- Verifikasi
SELECT au.email, p.role, p.full_name FROM profiles p JOIN auth.users au ON au.id = p.id;

-- ============================================
-- SEED DATA - AI Medication Assistant
-- ============================================
-- CARA PAKAI:
-- 1. Daftar akun dulu lewat aplikasi (Register)
-- 2. Ganti 'email@kamu.com' di bawah dengan email yang kamu daftarkan
-- 3. Copy SQL ini ke Supabase SQL Editor, lalu RUN
-- ============================================

do $$
declare
  v_user_id uuid;
  v_family_id uuid;
  v_patient_id uuid;
begin
  -- GANTI EMAIL INI dengan email yang kamu daftarkan
  select id into v_user_id from auth.users where email = 'email@kamu.com';

  if v_user_id is null then
    raise notice 'User dengan email tersebut tidak ditemukan. Pastikan sudah daftar.';
    return;
  end if;

  -- 1. Buat keluarga
  insert into families (name, created_by)
  values ('Keluarga Saya', v_user_id)
  returning id into v_family_id;

  -- 2. Update profile user jadi admin keluarga ini
  update profiles set family_id = v_family_id where id = v_user_id;

  -- 3. Buat pasien (contoh: orang tua)
  insert into patients (family_id, name, created_by)
  values (v_family_id, 'Ibu Siti', v_user_id)
  returning id into v_patient_id;

  insert into patients (family_id, name, created_by)
  values (v_family_id, 'Bapak Ahmad', v_user_id);

  -- 4. Sample obat
  insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom, nomor_bpom)
  values
    (v_patient_id, v_user_id, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid', 'DBL9424502004A1'),
    (v_patient_id, v_user_id, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi', ''),
    (v_patient_id, v_user_id, 'Bodrex', '200mg', '2x sehari', 'Sesudah makan', 'kurang_dapat_dipercaya', ''),
    (v_patient_id, v_user_id, 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid', ''),
    (v_patient_id, v_user_id, 'Antasida DOEN', '1 sachet', '3x sehari', 'Saat gejala muncul', 'pending', '');

  -- 5. Sample jurnal
  insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
  values
    (v_patient_id, v_user_id,
     'Batuk sejak pagi dan tenggorokan terasa sakit',
     'Keluhan batuk dan sakit tenggorokan bisa disebabkan oleh iritasi ringan atau infeksi saluran pernapasan atas. Pastikan istirahat cukup, minum air hangat, dan hindari makanan berminyak. Jika keluhan berlanjut lebih dari 3 hari, konsultasikan ke dokter.'),
    (v_patient_id, v_user_id,
     'Pusing setelah seharian bekerja di depan komputer',
     'Keluhan pusing setelah bekerja dengan layar komputer dalam waktu lama bisa menandakan kelelahan mata (digital eye strain). Coba terapkan aturan 20-20-20: setiap 20 menit, lihat objek sejauh 20 kaki selama 20 detik. Pastikan pencahayaan ruangan cukup dan posisi duduk ergonomis.'),
    (v_patient_id, v_user_id,
     'Perut terasa mual setelah makan siang',
     'Mual setelah makan bisa disebabkan oleh makan terlalu cepat, porsi terlalu besar, atau makanan yang terlalu berminyak/pedas. Coba makan dengan porsi lebih kecil tapi lebih sering, kunyah makanan perlahan, dan hindari berbaring setelah makan. Jika mual disertai muntah atau demam, segera periksa ke dokter.');

  raise notice 'Seed data berhasil! Keluarga: %, Pasien: 2 orang, Obat: 5, Jurnal: 3', v_family_id;
end $$;

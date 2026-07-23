-- ============================================
-- DUMMY DATA - AI Medication Assistant
-- ============================================
-- CARA PAKAI:
-- 1. Pastikan fix-role.sql sudah dijalankan
-- 2. GANTI 3 EMAIL di bawah
-- 3. Run di Supabase SQL Editor
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
  -- ===== GANTI 3 EMAIL INI =====
  select id into v_dokter_id from auth.users where email = 'kardynan.parulian@gmail.com';
  select id into v_keluarga_id from auth.users where email = 'keluarga@gmail.com';
  select id into v_pasien_id from auth.users where email = 'pasien@gmail.com';

  if v_dokter_id is null or v_pasien_id is null then
    raise notice 'ERROR: User tidak ditemukan. Jalankan fix-role.sql dulu.';
    return;
  end if;

  select id into v_family_id from profiles where id = v_dokter_id limit 1;

  select id into v_patient_id from patients where user_id = v_pasien_id limit 1;
  if v_patient_id is null then
    select id into v_patient_id from patients where family_id = (select family_id from profiles where id = v_dokter_id) limit 1;
  end if;

  -- ==================== 0. SET NAMA PROFIL ====================

  update profiles set full_name = 'Kardynan Parulian' where id = v_dokter_id;
  update profiles set full_name = 'Anggota Keluarga' where id = v_keluarga_id;
  update profiles set full_name = 'Pasien' where id = v_pasien_id;
  update patients set name = 'Pasien' where id = v_patient_id;

  -- ==================== 1. OBAT ====================

  if not exists (select 1 from medications where patient_id = v_patient_id and nama_obat = 'Panadol Extra') then
    insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom, nomor_bpom)
    values
      (v_patient_id, v_dokter_id, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid', 'DBL9424502004A1'),
      (v_patient_id, v_dokter_id, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi', ''),
      (v_patient_id, v_dokter_id, 'Vit C', '500mg', '1x sehari', 'Pagi hari setelah bangun tidur', 'valid', ''),
      (v_patient_id, v_dokter_id, 'Bodrex', '200mg', '2x sehari', 'Sesudah makan', 'kurang_dapat_dipercaya', ''),
      (v_patient_id, v_dokter_id, 'Antasida DOEN', '1 sachet', '3x sehari', 'Saat gejala maag muncul', 'pending', '');
    raise notice '5 obat sample ditambahkan';
  end if;

  -- ==================== 2. JURNAL DARI PASIEN ====================

  if not exists (select 1 from journals where patient_id = v_patient_id and created_by = v_pasien_id) then
    insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
    values
      (v_patient_id, v_pasien_id,
       'Batuk sejak pagi dan tenggorokan terasa sakit. Badan juga terasa meriang.',
       'Keluhan batuk disertai sakit tenggorokan dan meriang bisa menandakan infeksi saluran pernapasan atas (ISPA). Istirahat yang cukup, minum air hangat, dan konsumsi obat sesuai resep dokter. Jika demam tinggi atau sesak napas, segera periksa ke dokter.'),
      (v_patient_id, v_pasien_id,
       'Pusing setelah seharian bekerja di depan komputer. Mata terasa perih.',
       'Gejala pusing dan mata perih setelah bekerja dengan layar dalam waktu lama menandakan digital eye strain atau kelelahan mata. Terapkan aturan 20-20-20: setiap 20 menit, alihkan pandangan ke objek sejauh 20 kaki selama 20 detik.'),
      (v_patient_id, v_keluarga_id,
       'Ibu mengeluh perut kembung dan mual setelah makan siang tadi.',
       'Keluhan kembung dan mual setelah makan bisa disebabkan oleh makan terlalu cepat, intoleransi makanan tertentu, atau produksi asam lambung berlebih. Anjurkan makan perlahan, porsi kecil tapi sering, dan hindari makanan berminyak.'),
      (v_patient_id, v_dokter_id,
       'Pasien melaporkan nyeri sendi di lutut kanan saat bangun tidur.',
       'Nyeri sendi saat pagi hari bisa merupakan tanda osteoarthritis atau radang sendi. Kompres hangat dan istirahatkan sendi. Jika nyeri berlanjut, pertimbangkan pemeriksaan rontgen.');
    raise notice '4 jurnal sample ditambahkan';
  end if;

  -- ==================== 3. LOG AKTIVITAS ====================

  if not exists (select 1 from activity_logs where entity_type = 'medication') then
    insert into activity_logs (user_id, action, entity_type, entity_id, metadata, created_at)
    values
      (v_dokter_id, 'login', 'profile', v_dokter_id, null, now() - interval '7 days'),
      (v_dokter_id, 'create', 'medication', gen_random_uuid(), '{"nama_obat": "Panadol Extra"}', now() - interval '6 days'),
      (v_dokter_id, 'create', 'medication', gen_random_uuid(), '{"nama_obat": "Amoxilin"}', now() - interval '6 days'),
      (v_keluarga_id, 'login', 'profile', v_keluarga_id, null, now() - interval '5 days'),
      (v_pasien_id, 'journal', 'journal', gen_random_uuid(), '{"keluhan": "Batuk sejak pagi"}', now() - interval '4 days'),
      (v_dokter_id, 'scan', 'medication', gen_random_uuid(), '{"nama_obat": "Vit C"}', now() - interval '3 days'),
      (v_keluarga_id, 'taken', 'medication', gen_random_uuid(), null, now() - interval '2 days'),
      (v_dokter_id, 'logout', 'profile', v_dokter_id, null, now() - interval '1 days');
    raise notice '8 log aktivitas ditambahkan';
  end if;

  -- ==================== 4. KONSULTASI ====================

  if not exists (select 1 from consultations where patient_id = v_patient_id) then
    -- Tiket 1: Selesai
    insert into consultations (patient_id, doctor_id, title, status, created_at, updated_at)
    values (v_patient_id, v_dokter_id, 'Batuk tidak kunjung sembuh setelah 3 hari minum obat', 'resolved',
            now() - interval '5 days', now() - interval '4 days')
    returning id into v_consult_id;

    insert into consultation_messages (consultation_id, sender_id, message, created_at)
    values
      (v_consult_id, v_pasien_id, 'Dok, saya sudah minum obat batuk 3 hari tapi belum sembuh. Malah tambah sakit tenggorokan.', now() - interval '5 days'),
      (v_consult_id, v_dokter_id, 'Baik, coba hentikan dulu obat yang sekarang. Saya akan ganti resep. Minum Panadol 3x1 dan banyak minum air hangat. Jika 2 hari tidak ada perubahan, datang ke klinik untuk pemeriksaan langsung.', now() - interval '5 days'),
      (v_consult_id, v_pasien_id, 'Baik dok, terima kasih. Saya coba dulu.', now() - interval '4 days'),
      (v_consult_id, v_dokter_id, 'Sama-sama. Semoga cepat sembuh.', now() - interval '4 days');

    -- Tiket 2: Sedang berjalan
    insert into consultations (patient_id, doctor_id, title, status, created_at, updated_at)
    values (v_patient_id, v_dokter_id, 'Perut terasa perih setelah makan', 'in_progress',
            now() - interval '2 days', now() - interval '1 day')
    returning id into v_consult_id;

    insert into consultation_messages (consultation_id, sender_id, message, created_at)
    values
      (v_consult_id, v_pasien_id, 'Dok, setiap habis makan siang perut saya terasa perih dan mual. Sudah seminggu begini.', now() - interval '2 days'),
      (v_consult_id, v_dokter_id, 'Kemungkinan ada gangguan asam lambung (maag). Coba jangan telat makan, kurangi makanan pedas dan berminyak. Saya akan resepkan Antasida, minum 1 sachet saat gejala muncul.', now() - interval '1 day'),
      (v_consult_id, v_pasien_id, 'Baik dok. Apakah perlu ke klinik?', now() - interval '1 day');

    -- Tiket 3: Masuk (belum dijawab)
    insert into consultations (patient_id, title, status, created_at)
    values (v_patient_id, 'Kepala pusing dan tensi naik', 'open', now() - interval '3 hours');

    raise notice '3 konsultasi + 8 pesan sample ditambahkan';
  end if;

  raise notice '✅ Semua dummy data berhasil ditambahkan!';
end $$;

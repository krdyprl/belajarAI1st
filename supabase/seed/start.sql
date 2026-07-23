-- ============================================
-- SEED DATA - AI Medication Assistant
-- ============================================
-- CARA PAKAI:
-- 1. Buka SQL Editor di Supabase Dashboard
-- 2. Cari & ganti 3 email di bawah
-- 3. RUN
-- ============================================

-- Cari & ganti:
--   __DOKTER__   → email dokter (misal: prlkrdy@gmail.com)
--   __KELUARGA__ → email keluarga (misal: keluarga@gmail.com)
--   __PASIEN__   → email pasien (misal: pasien@gmail.com)

do $$
declare
  v_dokter uuid; v_keluarga uuid; v_pasien uuid;
  v_fam uuid; v_pid uuid;
begin
  select id into v_dokter from auth.users where email = 'prlkrdy@gmail.com';
  select id into v_keluarga from auth.users where email = 'keluarga@gmail.com';
  select id into v_pasien from auth.users where email = 'pasien@gmail.com';

  if v_dokter is null then raise notice 'ERROR: __DOKTER__ tidak ditemukan. Buat akun dulu.'; return; end if;

  insert into families (name, created_by) values ('Keluarga Saya', v_dokter)
  on conflict do nothing returning id into v_fam;
  select id into v_fam from families limit 1;

  update profiles set full_name='Kardynan Parulian', role='dokter', family_id=v_fam where id=v_dokter;
  update profiles set full_name='Keluarga', role='keluarga', family_id=v_fam where id=v_keluarga;
  update profiles set full_name='Pasien', role='pasien', family_id=v_fam where id=v_pasien;

  insert into patients (family_id, name, user_id, created_by)
  values (v_fam, 'Pasien', v_pasien, v_dokter)
  returning id into v_pid;

  insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom)
  select v_pid, v_dokter, name, dosis, freq, instruksi, status
  from (values
    ('Panadol Extra','500mg','3x sehari','Sesudah makan','valid'),
    ('Amoxilin','250mg','3x sehari','Habis makan','perlu_verifikasi'),
    ('Vit C','500mg','1x sehari','Pagi hari','valid')
  ) as t(name,dosis,freq,instruksi,status);

  insert into journals (patient_id, created_by, keluhan_teks, analisis_ai)
  select v_pid, v_pasien, teks, saran
  from (values
    ('Batuk sejak pagi dan tenggorokan sakit','Istirahat cukup dan minum air hangat. Jika demam, periksa ke dokter.'),
    ('Pusing setelah kerja di depan komputer','Istirahatkan mata setiap 20 menit. Atur pencahayaan ruangan.')
  ) as t(teks,saran);

  raise notice 'SELESAI!';
end $$;

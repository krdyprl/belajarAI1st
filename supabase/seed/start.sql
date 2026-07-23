-- ============================================
-- SEED DATA - AI Medication Assistant
-- ============================================
-- CARA PAKAI:
-- 1. Daftar 3 akun dari aplikasi dulu (Register)
-- 2. Copy SQL ini ke Supabase SQL Editor
-- 3. RUN
-- ============================================

do $$
declare
  v_dokter uuid; v_keluarga uuid; v_pasien uuid;
  v_fam uuid; v_pid uuid;
begin
  select id into v_dokter from auth.users where email = 'prlkrdy@gmail.com';
  select id into v_keluarga from auth.users where email = 'kiparulian@gmail.com';
  select id into v_pasien from auth.users where email = 'nanyardak098@gmail.com';

  if v_dokter is null then raise notice 'ERROR: prlkrdy@gmail.com belum terdaftar. Daftar dulu dari aplikasi.'; return; end if;
  if v_keluarga is null then raise notice 'ERROR: kiparulian@gmail.com belum terdaftar. Daftar dulu dari aplikasi.'; return; end if;
  if v_pasien is null then raise notice 'ERROR: nanyardak098@gmail.com belum terdaftar. Daftar dulu dari aplikasi.'; return; end if;

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

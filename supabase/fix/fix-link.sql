-- FIX LINK: Gabungkan semua data
-- GANTI 3 EMAIL di bawah

do $$
declare
  v_doctor uuid; v_kel uuid; v_pas uuid;
  v_fam uuid; v_pid uuid;
begin
  select id into v_doctor from auth.users where email = 'prlkrdy@gmail.com';
  select id into v_kel from auth.users where email = 'keluarga@gmail.com';
  select id into v_pas from auth.users where email = 'pasien@gmail.com';
  if v_doctor is null then raise notice 'ERROR: dokter tidak ditemukan'; return; end if;

  insert into families (name, created_by) select 'Keluarga Saya', v_doctor
  where not exists (select 1 from families) returning id into v_fam;
  if v_fam is null then select id into v_fam from families limit 1; end if;

  update profiles set full_name = 'Kardynan Parulian', role = 'dokter', family_id = v_fam where id = v_doctor;
  update profiles set full_name = 'Keluarga', role = 'keluarga', family_id = v_fam where id = v_kel;
  update profiles set full_name = 'Pasien', role = 'pasien', family_id = v_fam where id = v_pas;

  select id into v_pid from patients where user_id = v_pas;
  if v_pid is null then
    insert into patients (family_id, name, user_id, created_by)
    values (v_fam, 'Pasien', v_pas, v_doctor) returning id into v_pid;
  end if;

  update medications set patient_id = v_pid, created_by = v_doctor;
  update journals set patient_id = v_pid;

  if not exists (select 1 from medications where patient_id = v_pid) then
    insert into medications (patient_id, created_by, nama_obat, dosis, frekuensi, instruksi_khusus, status_bpom) values
      (v_pid, v_doctor, 'Panadol Extra', '500mg', '3x sehari', 'Sesudah makan', 'valid'),
      (v_pid, v_doctor, 'Amoxilin', '250mg', '3x sehari', 'Habis makan', 'perlu_verifikasi'),
      (v_pid, v_doctor, 'Vit C', '500mg', '1x sehari', 'Pagi hari', 'valid'),
      (v_pid, v_doctor, 'Bodrex', '200mg', '2x sehari', 'Sesudah makan', 'kurang_dapat_dipercaya');
  end if;

  if not exists (select 1 from journals where patient_id = v_pid) then
    insert into journals (patient_id, created_by, keluhan_teks, analisis_ai) values
      (v_pid, v_pas, 'Batuk sejak pagi dan tenggorokan sakit', 'Istirahat cukup dan minum air hangat.'),
      (v_pid, v_pas, 'Pusing setelah kerja di depan komputer', 'Istirahatkan mata setiap 20 menit.'),
      (v_pid, v_kel, 'Ibu mengeluh perut kembung setelah makan', 'Makan perlahan dan hindari berminyak.');
  end if;

  raise notice 'SELESAI! Data terlink semua.';
end $$;

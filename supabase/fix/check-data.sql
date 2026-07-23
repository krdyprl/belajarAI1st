-- ============================================
-- DIAGNOSTIC: Cek status data
-- Run ini di Supabase SQL Editor
-- ============================================

SELECT '--- PROFILES ---' as section;
SELECT p.id, au.email, p.full_name, p.role, p.family_id IS NOT NULL as has_family
FROM profiles p
JOIN auth.users au ON au.id = p.id;

SELECT '--- FAMILIES ---' as section;
SELECT id, name, created_by FROM families;

SELECT '--- PATIENTS ---' as section;
SELECT id, family_id, name, user_id IS NOT NULL as has_user_id, created_by FROM patients;

SELECT '--- MEDICATIONS ---' as section;
SELECT id, patient_id, created_by, nama_obat, status_bpom FROM medications;

SELECT '--- JOURNALS ---' as section;
SELECT id, patient_id, created_by, LEFT(keluhan_teks, 30) as keluhan FROM journals;

SELECT '--- CONSULTATIONS ---' as section;
SELECT id, patient_id, doctor_id, title, status FROM consultations;

SELECT '--- CONSULTATION MESSAGES ---' as section;
SELECT COUNT(*) as total_messages FROM consultation_messages;

SELECT '--- ACTIVITY LOGS ---' as section;
SELECT COUNT(*) as total_logs FROM activity_logs;

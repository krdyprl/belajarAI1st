import { supabase } from '../supabase'

export interface Medication {
  id: string
  patient_id: string
  created_by: string
  created_at: string
  nama_obat: string
  dosis: string
  frekuensi: string
  instruksi_khusus: string
  status_bpom: string
  nomor_bpom: string
  image_url: string
  last_taken_at?: string | null
}

export async function getMedications(patientId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Medication[]
}

export async function getFamilyMedications(familyId: string) {
  const { data: patients } = await supabase
    .from('patients')
    .select('id')
    .eq('family_id', familyId)
  if (!patients?.length) return []
  const ids = patients.map((p) => p.id)
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .in('patient_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Medication[]
}

export async function markAsTaken(id: string) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('medications')
    .update({ last_taken_at: now })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Medication
}

export async function createMedication(
  med: Omit<Medication, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('medications')
    .insert(med)
    .select()
    .single()
  if (error) throw error
  return data as Medication
}

export async function updateMedication(
  id: string,
  updates: Partial<Medication>
) {
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Medication
}

export async function deleteMedication(id: string) {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function uploadMedicineImage(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('medicine-images')
    .upload(path, file)
  if (error) throw error
  const { data } = supabase.storage
    .from('medicine-images')
    .getPublicUrl(path)
  return data.publicUrl
}

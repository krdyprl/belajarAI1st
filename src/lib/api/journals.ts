import { supabase } from '../supabase'

export interface Journal {
  id: string
  patient_id: string
  created_by: string
  created_at: string
  keluhan_teks: string
  analisis_ai: string
}

export async function getJournals(patientId: string) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Journal[]
}

export async function getFamilyJournals(familyId: string) {
  const { data: patients } = await supabase
    .from('patients')
    .select('id')
    .eq('family_id', familyId)
  if (!patients?.length) return []
  const ids = patients.map((p) => p.id)
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .in('patient_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Journal[]
}

export async function createJournal(journal: {
  patient_id: string
  created_by: string
  keluhan_teks: string
  analisis_ai: string
}) {
  const { data, error } = await supabase
    .from('journals')
    .insert(journal)
    .select()
    .single()
  if (error) throw error
  return data as Journal
}

import { supabase } from '../supabase'

export async function getPatientId(userId: string, role: string, familyId?: string | null) {
  if (role === 'pasien') {
    const { data } = await supabase.from('patients').select('id').eq('user_id', userId).maybeSingle()
    if (data) return data.id
  }
  if (familyId) {
    const { data } = await supabase.from('patients').select('id').eq('family_id', familyId).limit(1).maybeSingle()
    if (data) return data.id
  }
  const { data } = await supabase.from('patients').select('id').limit(1).maybeSingle()
  return data?.id || null
}

export async function getFamilyPatients(familyId: string) {
  const { data } = await supabase.from('patients').select('id, name').eq('family_id', familyId)
  return data || []
}

export async function getFirstPatientId() {
  const { data } = await supabase.from('patients').select('id').limit(1).maybeSingle()
  return data?.id || null
}

import { supabase } from '../supabase'

export type UserRole = 'dokter' | 'keluarga' | 'pasien'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  family_id: string
  avatar_url: string | null
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

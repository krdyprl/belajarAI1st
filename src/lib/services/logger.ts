import { supabase } from '../supabase'

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    metadata: metadata || null,
  })
  if (error) console.error('Log failed:', error)
}

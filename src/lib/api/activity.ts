import { supabase } from '../supabase'

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  profiles: { full_name: string; role: string } | null
}

export async function getActivityLogs() {
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error

  if (!logs?.length) return [] as ActivityLog[]

  const userIds = [...new Set(logs.map((l: any) => l.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
  return (logs as any[]).map((l) => ({
    ...l,
    profiles: profileMap.get(l.user_id) || null,
  })) as ActivityLog[]
}

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
  if (error) console.error('Failed to log activity:', error)
}

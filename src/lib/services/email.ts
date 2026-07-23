import { supabase } from '../supabase'

export async function getEmails(userIds: string[]): Promise<string[]> {
  if (!userIds.length) return []
  const { data } = await supabase.rpc('get_emails', { user_ids: userIds })
  return (data || []).map((r: any) => r.email).filter(Boolean)
}

export async function sendTakenNotification(
  pasienName: string,
  obatName: string,
  doctorId: string,
  familyMemberIds: string[]
) {
  const ids = [...new Set([doctorId, ...familyMemberIds].filter(Boolean))]
  const emails = await getEmails(ids)
  if (!emails.length) return

  const hour = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const html = `<h2>Obat Diminum</h2>
    <p><strong>${pasienName}</strong> sudah minum <strong>${obatName}</strong> jam ${hour}.</p>
    <p style="color:#666;font-size:12px;">MedCare - AI Medication Assistant</p>`

  await supabase.from('email_queue').insert({
    recipient_email: emails.join(','),
    subject: `${pasienName} sudah minum ${obatName} - MedCare`,
    html_content: html,
  })
}

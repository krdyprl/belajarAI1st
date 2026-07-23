import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

Deno.serve(async () => {
  const today = new Date().toDateString()
  const { data: meds, error } = await supabase
    .from('medications')
    .select('id, nama_obat, dosis, frekuensi, last_taken_at, patient_id')
    .is('last_taken_at', null)
    .or(`last_taken_at.lt.${new Date().toISOString().split('T')[0]}T00:00:00Z`)

  if (error || !meds?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }))
  }

  const patientIds = [...new Set(meds.map((m: any) => m.patient_id))]
  const { data: patients } = await supabase
    .from('patients')
    .select('id, family_id, name')
    .in('id', patientIds)

  const familyIds = [...new Set(patients?.map((p: any) => p.family_id) || [])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('family_id', familyIds)
    .in('role', ['dokter', 'keluarga', 'pasien'])

  const { data: authUsers } = await supabase
    .from('auth.users')
    .select('id, email')

  const emailMap = new Map((authUsers || []).map((u: any) => [u.id, u.email]))
  const toEmails = [...new Set((profiles || []).map((p: any) => emailMap.get(p.id)).filter(Boolean))]

  if (!toEmails.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }))
  }

  const listHtml = meds.map((m: any) =>
    `<li><strong>${m.nama_obat}</strong> ${m.dosis ? `(${m.dosis})` : ''} - ${m.frekuensi}</li>`
  ).join('')

  const { data: emailResult } = await resend.emails.send({
    from: 'MedCare <onboarding@resend.dev>',
    to: toEmails,
    subject: 'Pengingat Minum Obat - MedCare',
    html: `<h2>Pengingat Minum Obat</h2>
           <p>Berikut obat yang <strong>belum diminum</strong> hari ini:</p>
           <ul>${listHtml}</ul>
           <p style="color:#666;font-size:12px;">MedCare - AI Medication Assistant</p>`,
  })

  return new Response(JSON.stringify({ ok: true, sent: toEmails.length, emailResult }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

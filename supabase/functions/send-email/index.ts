import { Resend } from 'npm:resend@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

Deno.serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()
    const { data, error } = await resend.emails.send({
      from: 'MedCare <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
    if (error) throw error
    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

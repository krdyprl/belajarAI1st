import { supabase } from '../supabase'

export interface Consultation {
  id: string
  patient_id: string
  doctor_id: string | null
  title: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export interface ConsultationMessage {
  id: string
  consultation_id: string
  sender_id: string
  message: string
  created_at: string
}

export async function getConsultations() {
  const { data, error } = await supabase
    .from('consultations')
    .select('*, patients:patient_id(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as (Consultation & { patients: { name: string } })[]
}

export async function getConsultation(id: string) {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Consultation
}

export async function createConsultation(patientId: string, title: string) {
  const { data, error } = await supabase
    .from('consultations')
    .insert({ patient_id: patientId, title })
    .select()
    .single()
  if (error) throw error
  return data as Consultation
}

export async function takeConsultation(id: string, doctorId: string) {
  const { data, error } = await supabase
    .from('consultations')
    .update({ doctor_id: doctorId, status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Consultation
}

export async function resolveConsultation(id: string) {
  const { data, error } = await supabase
    .from('consultations')
    .update({ status: 'resolved', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Consultation
}

export async function getMessages(consultationId: string) {
  const { data, error } = await supabase
    .from('consultation_messages')
    .select('*, profiles:sender_id(full_name, role)')
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as (ConsultationMessage & { profiles: { full_name: string; role: string } })[]
}

export async function sendMessage(consultationId: string, senderId: string, message: string) {
  const { error } = await supabase
    .from('consultation_messages')
    .insert({ consultation_id: consultationId, sender_id: senderId, message })
  if (error) throw error
}

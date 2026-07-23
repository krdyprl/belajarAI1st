import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MessageSquareText, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getConsultations, createConsultation, getPatientId, getFamilyPatients, logActivity } from '../lib/services'
import Card from '../components/Card'
import Button from '../components/Button'
import type { Consultation } from '../lib/api/consultations'
import toast from 'react-hot-toast'

const statusStyles: Record<string, string> = {
  open: 'bg-warning-bg text-warning',
  in_progress: 'bg-primary-bg text-primary',
  resolved: 'bg-success-bg text-success',
}

const statusLabels: Record<string, string> = {
  open: 'Menunggu',
  in_progress: 'Dijawab',
  resolved: 'Selesai',
}

export default function ConsultationPage() {
  const { user, profile } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const [consultations, setConsultations] = useState<(Consultation & { patients: { name: string } })[]>([])
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) { loadConsultations(); loadPatients() }
  }, [user])

  async function loadPatients() {
    if (profile?.role === 'pasien') {
      const pid = await getPatientId(user!.id, 'pasien')
      if (pid) setPatients([{ id: pid, name: '' }])
    } else if (profile?.role === 'keluarga' && profile?.family_id) {
      setPatients(await getFamilyPatients(profile.family_id))
    }
  }

  async function loadConsultations() {
    setLoading(true)
    try {
      setConsultations(await getConsultations())
    } catch { toast.error('Gagal memuat konsultasi') }
    finally { setLoading(false) }
  }

  async function handleCreate() {
    if (!title.trim()) return
    try {
      let patientId = patients[0]?.id
      if (!patientId && profile?.family_id) {
        const p = await getPatientId(user!.id, profile?.role || 'keluarga', profile?.family_id)
        if (p) patientId = p
      }
      if (!patientId) { toast.error('Profil pasien tidak ditemukan.'); return }
      const c = await createConsultation(patientId, title.trim())
      if (user) logActivity(user.id, 'create', 'consultation', c.id, { title: c.title })
      toast.success('Konsultasi dikirim')
      setShowForm(false); setTitle('')
      loadConsultations()
    } catch { toast.error('Gagal membuat konsultasi') }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Konsultasi</h1>
          <p className="text-body text-text-secondary mt-0.5">
            {isDokter ? 'Antrian konsultasi pasien' : 'Tanya dokter'}
          </p>
        </div>
        {!isDokter && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5" /> Baru
          </Button>
        )}
      </div>

      {loading ? (
        <Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card>
      ) : consultations.length === 0 ? (
        <Card>
          <p className="text-body text-text-secondary text-center py-8 sm:py-12">
            {isDokter ? 'Belum ada konsultasi masuk.' : 'Belum ada konsultasi. Tekan "Baru" untuk bertanya.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {consultations.map((c) => (
            <button key={c.id} onClick={() => navigate(`/consultation/${c.id}`)} className="w-full text-left">
              <Card className="p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.status === 'open' ? 'bg-warning-bg' : c.status === 'in_progress' ? 'bg-primary-bg' : 'bg-success-bg'}`}>
                    <MessageSquareText className={`w-6 h-6 ${c.status === 'open' ? 'text-warning' : c.status === 'in_progress' ? 'text-primary' : 'text-success'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-text text-base truncate">{c.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusStyles[c.status]}`}>{statusLabels[c.status]}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {c.patients?.name || 'Pasien'} · {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-xl font-bold text-text">Konsultasi Baru</h2>
            <textarea value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis keluhan kamu..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 text-lg">Batal</Button>
              <Button onClick={handleCreate} className="flex-1 text-lg">Kirim</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

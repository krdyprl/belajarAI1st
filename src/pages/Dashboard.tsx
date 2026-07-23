import { useState, useEffect } from 'react'
import { Pill, Stethoscope, Activity, TrendingUp, Sparkles, Calendar, Moon, CheckCircle, MessageSquareText, Scan, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getFamilyMedications, getFamilyJournals, getConsultations, markAsTaken, generateSummary, logActivity, sendTakenNotification, supabase } from '../lib/services'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import type { Medication } from '../lib/api/medications'
import type { Journal } from '../lib/api/journals'
import type { Consultation } from '../lib/api/consultations'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const navigate = useNavigate()
  const [meds, setMeds] = useState<Medication[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    if (!profile?.family_id) { setLoading(false); return }
    setLoading(true)
    try {
      const [medData, journalData] = await Promise.all([
        getFamilyMedications(profile.family_id),
        getFamilyJournals(profile.family_id),
      ])
      setMeds(medData)
      setJournals(journalData)
      if (isDokter) {
        try { setConsultations(await getConsultations()) } catch { /* ignore */ }
      }
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  async function handleSummary() {
    if (meds.length === 0 && journals.length === 0) {
      toast.error('Belum cukup data.')
      return
    }
    setSummaryLoading(true)
    try {
      const medText = meds.slice(0, 10).map((m) => `- ${m.nama_obat} (${m.dosis}, ${m.frekuensi})`).join('\n')
      const journalText = journals.slice(0, 10).map((j) => `- ${new Date(j.created_at).toLocaleDateString('id-ID')}: ${j.keluhan_teks}`).join('\n')
      setSummary(await generateSummary(medText || 'Tidak ada obat', journalText || 'Tidak ada catatan'))
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : 'Coba lagi'}`)
    } finally { setSummaryLoading(false) }
  }

  const today = new Date().toDateString()
  const takenToday = meds.filter((m) => m.last_taken_at && new Date(m.last_taken_at).toDateString() === today).length
  const compliance = meds.length > 0 ? Math.round((takenToday / meds.length) * 100) : 0
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const todayIdx = new Date().getDay()
  const pendingMeds = meds.filter((m) => !m.last_taken_at || new Date(m.last_taken_at).toDateString() !== today)
  const openConsultations = consultations.filter((c) => c.status === 'open')

  if (loading) return <Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card>

  return (
    <div className="space-y-4 sm:space-y-5 pt-3">
      {/* stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-2 shadow-sm">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text">{meds.length}</p>
          <p className="text-xs text-text-secondary">Total Obat</p>
        </Card>
        <Card className="p-4 text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text">{compliance}%</p>
          <p className="text-xs text-text-secondary">Diminum</p>
        </Card>
        <Card className="p-4 text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-2">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text">{journals.length}</p>
          <p className="text-xs text-text-secondary">Catatan</p>
        </Card>
        <Card className="p-4 text-center sm:text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text">{meds.length}</p>
          <p className="text-xs text-text-secondary">Obat Aktif</p>
        </Card>
      </div>

      {/* quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {isDokter && (
          <button onClick={() => navigate('/scanner')}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-text">Foto Obat</span>
          </button>
        )}
        <button onClick={() => navigate('/journal')}
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
          <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-warning" />
          </div>
          <span className="text-sm font-semibold text-text">Catat Keluhan</span>
        </button>
        {!isDokter && (
          <button onClick={() => navigate('/consultation')}
            className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquareText className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-text">Konsultasi</span>
          </button>
        )}
      </div>

      {/* calendar widget */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-text text-base">Hari Ini</h2>
        </div>
        <div className="flex justify-between">
          {days.map((d, i) => (
            <div key={d} className={`flex flex-col items-center gap-1 w-10 py-1.5 rounded-xl ${
              i === todayIdx ? 'gradient-primary text-white shadow-sm' : ''
            }`}>
              <span className="text-[10px] font-medium">{d}</span>
              <span className="text-sm font-bold">{new Date().getDate() - todayIdx + i}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* today's medications */}
      {pendingMeds.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text text-base">Obat yang Perlu Diminum</h2>
          </div>
          <div className="space-y-2">
            {pendingMeds.slice(0, 5).map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-text text-sm">{med.nama_obat}</p>
                    <p className="text-xs text-text-secondary">{med.dosis && `${med.dosis} - `}{med.frekuensi}</p>
                  </div>
                </div>
                <Button size="sm" variant="success" onClick={async () => {
                  try {
                    const m = await markAsTaken(med.id)
                    if (user) logActivity(user.id, 'taken', 'medication', med.id)
                    const { data: dr } = await supabase.from('profiles').select('id').eq('role', 'dokter').limit(1).maybeSingle()
                    const { data: fams } = await supabase.from('profiles').select('id').eq('family_id', profile?.family_id).in('role', ['dokter', 'keluarga'])
                    const ids = [...new Set([dr?.id, ...(fams?.map(f => f.id) || [])].filter(Boolean) as string[])]
                    sendTakenNotification(profile?.full_name || 'Pasien', m.nama_obat, dr?.id || '', ids)
                    toast.success(`${med.nama_obat} sudah diminum`)
                    loadData()
                  } catch { toast.error('Gagal') }
                }}>
                  <CheckCircle className="w-4 h-4" /> Diminum
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* consultation queue (dokter only) */}
      {isDokter && openConsultations.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareText className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text text-base">Konsultasi Menunggu</h2>
            <span className="ml-auto bg-warning text-white text-xs font-bold rounded-full px-2 py-0.5">{openConsultations.length}</span>
          </div>
          <div className="space-y-2">
            {openConsultations.slice(0, 3).map((c) => (
              <button key={c.id} onClick={() => navigate(`/consultation/${c.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-warning-bg rounded-xl text-left">
                <MessageSquareText className="w-5 h-5 text-warning shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-sm truncate">{c.title}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* health insight */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-text text-base">Kesehatan</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-text">Kepatuhan Minum Obat</p>
            <p className="text-sm text-text-secondary mt-0.5">
              {takenToday} dari {meds.length} obat sudah diminum hari ini
            </p>
          </div>
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">{compliance}%</span>
          </div>
        </div>
        <div className="mt-3 w-full bg-white/50 rounded-full h-2.5">
          <div className="gradient-primary h-2.5 rounded-full transition-all" style={{ width: `${compliance}%` }} />
        </div>
      </Card>

      {/* ai summary */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text text-base">Ringkasan AI</h2>
          </div>
          {!summary && (
            <Button size="sm" variant="secondary" onClick={handleSummary} loading={summaryLoading}>
              <Sparkles className="w-4 h-4" /> Buat
            </Button>
          )}
        </div>
        {summary ? (
          <div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{summary}</p>
            <Button size="sm" variant="ghost" onClick={() => setSummary(null)} className="mt-2">
              <Sparkles className="w-4 h-4" /> Buat ulang
            </Button>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            {meds.length === 0 && journals.length === 0
              ? 'Belum ada data. Foto obat atau buat catatan untuk memulai.'
              : 'Tekan "Buat" untuk ringkasan kondisi kesehatan.'}
          </p>
        )}
      </Card>

      {/* recent medications */}
      {meds.length > 0 && (
        <Card>
          <h2 className="font-bold text-text text-base mb-3">Obat Terbaru</h2>
          <div className="space-y-2">
            {meds.slice(0, 4).map((med) => (
              <div key={med.id} className="flex items-center gap-3 py-2 border-b border-white/50 last:border-0">
                <Pill className="w-5 h-5 text-primary shrink-0" />
                <span className="flex-1 text-sm font-medium text-text truncate">{med.nama_obat}</span>
                <Badge status={med.status_bpom} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Pill, Stethoscope, Activity, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import type { Medication } from '../lib/api/medications'
import type { Journal } from '../lib/api/journals'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [meds, setMeds] = useState<Medication[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
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
      const { getFamilyMedications } = await import('../lib/api/medications')
      const { getFamilyJournals } = await import('../lib/api/journals')
      const [medData, journalData] = await Promise.all([
        getFamilyMedications(profile.family_id),
        getFamilyJournals(profile.family_id),
      ])
      setMeds(medData)
      setJournals(journalData)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSummary() {
    if (meds.length === 0 && journals.length === 0) {
      toast.error('Belum cukup data. Foto obat atau buat catatan dulu.')
      return
    }
    setSummaryLoading(true)
    try {
      const { generateSummary } = await import('../lib/api/gemini')
      const medText = meds.slice(0, 10).map((m) =>
        `- ${m.nama_obat} (${m.dosis}, ${m.frekuensi})`
      ).join('\n')
      const journalText = journals.slice(0, 10).map((j) =>
        `- ${new Date(j.created_at).toLocaleDateString('id-ID')}: ${j.keluhan_teks}`
      ).join('\n')
      const result = await generateSummary(medText || 'Tidak ada obat', journalText || 'Tidak ada catatan')
      setSummary(result)
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : 'Coba lagi'}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  const today = new Date().toDateString()
  const takenToday = meds.filter((m) => m.last_taken_at && new Date(m.last_taken_at).toDateString() === today).length
  const compliance = meds.length > 0 ? Math.round((takenToday / meds.length) * 100) : 0

  if (loading) {
    return <div className="p-4 sm:p-6"><Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card></div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Ringkasan</h1>
        <p className="text-body text-text-secondary mt-0.5">Kondisi kesehatan keluarga</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-bg rounded-xl flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">{meds.length}</p>
              <p className="text-sm sm:text-base text-text-secondary">Total Obat</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-success-bg rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">{compliance}%</p>
              <p className="text-sm sm:text-base text-text-secondary">Diminum</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-warning-bg rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-warning" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">{journals.length}</p>
              <p className="text-sm sm:text-base text-text-secondary">Catatan</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-bg rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">{meds.length}</p>
              <p className="text-sm sm:text-base text-text-secondary">Obat Aktif</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <Card>
          <h2 className="font-bold text-text text-lg mb-3">Obat Terbaru</h2>
          {meds.length === 0 ? (
            <p className="text-body text-text-secondary">Belum ada obat. Foto kemasan obat untuk memulai.</p>
          ) : (
            <div className="space-y-2">
              {meds.slice(0, 5).map((med) => (
                <div key={med.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <Pill className="w-5 h-5 text-primary shrink-0" />
                  <span className="flex-1 text-base font-medium text-text truncate">{med.nama_obat}</span>
                  <Badge status={med.status_bpom} />
                </div>
              ))}
              {meds.length > 5 && (
                <p className="text-sm text-primary font-semibold mt-1">+{meds.length - 5} lainnya</p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-text text-lg">Ringkasan AI</h2>
            {!summary && (
              <Button size="sm" variant="secondary" onClick={handleSummary} loading={summaryLoading}>
                <Sparkles className="w-4 h-4" /> Buat
              </Button>
            )}
          </div>
          {summary ? (
            <div>
              <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap">{summary}</p>
              <Button size="sm" variant="ghost" onClick={() => setSummary(null)} className="mt-3">
                <Sparkles className="w-4 h-4" /> Buat ulang
              </Button>
            </div>
          ) : (
            <p className="text-body text-text-secondary">
              {meds.length === 0 && journals.length === 0
                ? 'Belum ada data. Foto obat atau buat catatan untuk memulai.'
                : 'Tekan "Buat" untuk ringkasan kondisi kesehatan.'}
            </p>
          )}
        </Card>
      </div>

      {journals.length > 0 && (
        <Card>
          <h2 className="font-bold text-text text-lg mb-3">Catatan Terbaru</h2>
          <div className="space-y-2">
            {journals.slice(0, 5).map((j) => (
              <div key={j.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <Stethoscope className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-base text-text-secondary line-clamp-2">{j.keluhan_teks}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

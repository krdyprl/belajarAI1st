import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Stethoscope, Clock, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import type { Journal } from '../lib/api/journals'
import toast from 'react-hot-toast'

export default function JournalPage() {
  const { user, profile } = useAuth()
  const [journals, setJournals] = useState<Journal[]>([])
  const [keluhan, setKeluhan] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) loadJournals()
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [journals, activeJournal])

  async function loadJournals() {
    setLoading(true)
    try {
      const { getFamilyJournals } = await import('../lib/api/journals')
      if (profile?.family_id) {
        setJournals(await getFamilyJournals(profile.family_id))
      }
    } catch { toast.error('Gagal memuat catatan') }
    finally { setLoading(false) }
  }

  async function handleSend() {
    const text = keluhan.trim()
    if (!text || sending) return
    setSending(true); setKeluhan('')

    setActiveJournal({
      id: 'temp', patient_id: '', created_by: user!.id,
      created_at: new Date().toISOString(), keluhan_teks: text, analisis_ai: '',
    })

    try {
      const { analyzeJournal } = await import('../lib/api/gemini')
      const { createJournal } = await import('../lib/api/journals')
      const { supabase } = await import('../lib/supabase')

      const { data: patients } = await supabase
        .from('patients').select('id').eq('family_id', profile?.family_id).limit(1)
      if (!patients?.length) { toast.error('Belum ada pasien.'); setSending(false); return }

      const response = await analyzeJournal(text)
      const saved = await createJournal({
        patient_id: patients[0].id, created_by: user!.id,
        keluhan_teks: text, analisis_ai: response,
      })
      setActiveJournal(saved)
      setJournals((prev) => [saved, ...prev])
    } catch (err) {
      toast.error(`Gagal: ${err instanceof Error ? err.message : 'Coba lagi'}`)
      setActiveJournal(null)
    } finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 sm:p-6 pb-0">
        <h1 className="text-2xl font-bold text-text">Catatan Kesehatan</h1>
        <p className="text-body text-text-secondary mt-0.5">Tulis keluhan untuk mendapat saran dari AI</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {loading ? (
          <Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card>
        ) : journals.length === 0 && !activeJournal ? (
          <Card>
            <div className="text-center py-10">
              <MessageCircle className="w-10 h-10 text-text-secondary mx-auto mb-3" />
              <p className="text-body text-text-secondary">Tulis keluhan untuk memulai. Contoh: "Batuk sejak pagi"</p>
            </div>
          </Card>
        ) : (
          <>
            {activeJournal && !activeJournal.analisis_ai && (
              <Card>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text text-base">Kamu</p>
                    <p className="text-body text-text-secondary mt-0.5">{activeJournal.keluhan_teks}</p>
                    <p className="text-sm text-primary mt-2 italic font-semibold">Menganalisis...</p>
                  </div>
                </div>
              </Card>
            )}
            {activeJournal?.analisis_ai && (
              <Card className="border-l-4 border-l-primary">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary-bg rounded-full flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary text-base">Saran AI</p>
                      <span className="text-sm text-text-secondary flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(activeJournal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-body text-text-secondary mt-2 leading-relaxed whitespace-pre-wrap">{activeJournal.analisis_ai}</p>
                  </div>
                </div>
              </Card>
            )}
            {journals.slice(activeJournal ? 1 : 0).map((journal) => (
              <button key={journal.id} onClick={() => setActiveJournal(activeJournal?.id === journal.id ? null : journal)}
                className="w-full text-left">
                <Card className={`transition-colors hover:border-gray-300 ${activeJournal?.id === journal.id ? 'border-primary' : ''}`}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-text text-base">Keluhan</p>
                        <span className="text-sm text-text-secondary">
                          {new Date(journal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-body text-text-secondary mt-0.5 line-clamp-2">{journal.keluhan_teks}</p>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-3 sm:p-4">
        <div className="flex gap-2">
          <textarea
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Tulis keluhan, contoh: Batuk sejak pagi..."
            rows={2}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <Button onClick={handleSend} loading={sending} disabled={!keluhan.trim()} className="shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-400 text-center mt-1.5">Tekan Kirim untuk mendapat saran dari AI</p>
      </div>
    </div>
  )
}

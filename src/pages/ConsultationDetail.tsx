import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, Stethoscope, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getConsultation, getMessages, sendMessage, takeConsultation, resolveConsultation, logActivity } from '../lib/services'
import Button from '../components/Button'
import toast from 'react-hot-toast'

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const navigate = useNavigate()
  const [consultation, setConsultation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (id && user) { loadConsultation(); loadMessages() } }, [id, user])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConsultation() {
    try { setConsultation(await getConsultation(id!)) } catch { toast.error('Gagal memuat konsultasi') }
  }

  async function loadMessages() {
    try { setMessages(await getMessages(id!)) } catch { /* ignore */ }
  }

  async function handleTake() {
    try {
      await takeConsultation(id!, user!.id)
      logActivity(user!.id, 'update', 'consultation', id, { status: 'in_progress' })
      loadConsultation(); toast.success('Konsultasi diambil')
    } catch { toast.error('Gagal') }
  }

  async function handleResolve() {
    try {
      await resolveConsultation(id!)
      logActivity(user!.id, 'resolve', 'consultation', id, { status: 'resolved' })
      loadConsultation(); toast.success('Konsultasi selesai')
    } catch { toast.error('Gagal') }
  }

  async function handleSend() {
    const msg = text.trim()
    if (!msg || sending) return
    setSending(true); setText('')
    try {
      await sendMessage(id!, user!.id, msg)
      logActivity(user!.id, 'reply', 'consultation', id)
      loadMessages()
    } catch { toast.error('Gagal kirim') }
    finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 sm:p-6 pb-0 space-y-2">
        <button onClick={() => navigate('/consultation')} className="flex items-center gap-2 text-base text-text-secondary hover:text-text touch-target">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </button>
        {consultation && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text">{consultation.title}</h1>
              <p className="text-sm text-text-secondary">Status: <span className="font-semibold capitalize">{consultation.status === 'open' ? 'Menunggu' : consultation.status === 'in_progress' ? 'Dijawab' : 'Selesai'}</span></p>
            </div>
            {isDokter && consultation.status === 'open' && <Button size="sm" onClick={handleTake}>Ambil</Button>}
            {isDokter && consultation.status === 'in_progress' && <Button size="sm" variant="success" onClick={handleResolve}><CheckCircle className="w-4 h-4" /> Selesai</Button>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user!.id
          const isDokterMsg = msg.profiles?.role === 'dokter'
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDokterMsg ? 'bg-primary-bg' : 'bg-gray-100'}`}>
                {isDokterMsg ? <Stethoscope className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-text-secondary" />}
              </div>
              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                <p className={`text-xs font-medium mb-0.5 ${isMe ? 'text-right' : ''} ${isDokterMsg ? 'text-primary' : 'text-text-secondary'}`}>
                  {msg.profiles?.full_name || (isDokterMsg ? 'Dokter' : 'Pasien')}
                </p>
                <div className={`rounded-2xl px-4 py-2.5 text-base ${isMe ? 'bg-primary text-white' : 'bg-gray-100 text-text'}`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
                <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-3 sm:p-4">
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }} />
          <Button onClick={handleSend} loading={sending} disabled={!text.trim()}><Send className="w-5 h-5" /></Button>
        </div>
      </div>
    </div>
  )
}

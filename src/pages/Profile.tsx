import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getActivityLogs } from '../lib/services'
import Card from '../components/Card'
import Button from '../components/Button'
import { User, Pill, BookOpen, LogIn, LogOut, ScanLine, Edit3, Trash2, CheckCircle, MessageSquareText, Sparkles, Shield } from 'lucide-react'
import type { ActivityLog as LogItem } from '../lib/api/activity'
import { useNavigate } from 'react-router-dom'

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn, logout: LogOut, create: Pill,
  update: Edit3, delete: Trash2, scan: ScanLine,
  journal: BookOpen, reply: MessageSquareText,
  resolve: CheckCircle, taken: CheckCircle, summary: Sparkles,
}

const actionLabels: Record<string, string> = {
  login: 'Login', logout: 'Logout', create: 'Tambah obat',
  update: 'Ubah obat', delete: 'Hapus obat', scan: 'Pindai obat',
  journal: 'Catatan kesehatan', reply: 'Balas konsultasi',
  resolve: 'Selesai konsultasi', taken: 'Minum obat', summary: 'Ringkasan AI',
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isDokter = profile?.role === 'dokter'
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isDokter) loadLogs()
  }, [isDokter])

  async function loadLogs() {
    setLoading(true)
    try {
      setLogs(await getActivityLogs())
    } catch (e) { console.error('Log load error:', e) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 sm:space-y-5 pt-3">
      {/* profile card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text truncate">{profile?.full_name || 'User'}</h1>
            <p className="text-sm text-text-secondary capitalize">{profile?.role || '-'}</p>
            <p className="text-xs text-text-secondary truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* role info */}
      <Card>
        <h2 className="font-bold text-text text-base mb-3">Akses Saya</h2>
        <div className="space-y-2 text-sm">
          {isDokter ? (
            <>
              <Row icon={Pill} text="Tambah, edit, dan hapus obat" />
              <Row icon={MessageSquareText} text="Lihat dan balas konsultasi" />
              <Row icon={Shield} text="Lihat log aktivitas" />
              <Row icon={Sparkles} text="Generate ringkasan AI" />
            </>
          ) : profile?.role === 'keluarga' ? (
            <>
              <Row icon={Pill} text="Lihat jadwal obat" />
              <Row icon={CheckCircle} text="Tandai obat sudah diminum" />
              <Row icon={BookOpen} text="Catat keluhan kesehatan" />
              <Row icon={MessageSquareText} text="Buat konsultasi ke dokter" />
            </>
          ) : (
            <>
              <Row icon={Pill} text="Lihat jadwal obat saya" />
              <Row icon={CheckCircle} text="Tandai obat sudah diminum" />
              <Row icon={BookOpen} text="Catat keluhan kesehatan" />
              <Row icon={MessageSquareText} text="Konsultasi dengan dokter" />
            </>
          )}
        </div>
      </Card>

      {/* activity log (dokter only) */}
      {isDokter && (
        <Card>
          <h2 className="font-bold text-text text-base mb-3">Log Aktivitas</h2>
          {loading ? (
            <p className="text-sm text-text-secondary">Memuat...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-text-secondary">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {logs.slice(0, 50).map((log) => {
                const Icon = actionIcons[log.action] || Shield
                const label = actionLabels[log.action] || log.action
                return (
                  <div key={log.id} className="flex items-center gap-2 py-1.5 border-b border-white/30 last:border-0">
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-text-secondary flex-1 truncate">{label}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* logout */}
      <Card>
        <Button variant="outline" className="w-full" onClick={async () => { await signOut(); navigate('/login') }}>
          Keluar
        </Button>
      </Card>
    </div>
  )
}

function Row({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <span className="text-text-secondary">{text}</span>
    </div>
  )
}

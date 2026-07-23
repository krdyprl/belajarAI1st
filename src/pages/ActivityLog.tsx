import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/Card'
import type { ActivityLog as LogItem } from '../lib/api/activity'
import { User, Pill, BookOpen, MessageSquareText, LogIn, LogOut, ScanLine, Edit3, Trash2, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn, logout: LogOut, create: Pill,
  update: Edit3, delete: Trash2, scan: ScanLine,
  journal: BookOpen, reply: MessageSquareText,
  resolve: CheckCircle, taken: CheckCircle,
  summary: Sparkles,
}

const actionLabels: Record<string, string> = {
  login: 'Masuk', logout: 'Keluar', create: 'Tambah',
  update: 'Ubah', delete: 'Hapus', scan: 'Pindai',
  journal: 'Catatan', reply: 'Balas', resolve: 'Selesai',
  taken: 'Minum', summary: 'Ringkasan',
}

export default function ActivityLogPage() {
  const { user, profile } = useAuth()
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  async function loadLogs() {
    setLoading(true)
    try {
      const { getActivityLogs } = await import('../lib/api/activity')
      setLogs(await getActivityLogs())
    } catch {
      toast.error('Gagal memuat log')
    } finally { setLoading(false) }
  }

  if (profile?.role !== 'dokter') {
    return (
      <div className="p-4 sm:p-6">
        <Card><p className="text-body text-text-secondary text-center py-8">Hanya dokter yang dapat melihat log aktivitas.</p></Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Log Aktivitas</h1>
        <p className="text-body text-text-secondary mt-0.5">Riwayat semua aktivitas pengguna</p>
      </div>

      {loading ? (
        <Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card>
      ) : logs.length === 0 ? (
        <Card><p className="text-body text-text-secondary text-center py-8">Belum ada aktivitas.</p></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = actionIcons[log.action] || User
            const label = actionLabels[log.action] || log.action
            return (
              <Card key={log.id} className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-bg rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-text text-sm truncate">
                        {log.profiles?.full_name || 'User'}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(log.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium capitalize">{label}</span>
                      {' '}{log.entity_type === 'medication' ? 'obat' :
                        log.entity_type === 'journal' ? 'catatan' :
                        log.entity_type === 'consultation' ? 'konsultasi' :
                        log.entity_type === 'profile' ? 'akun' : log.entity_type}
                      {log.metadata && (log.metadata as any).nama_obat && ` - ${(log.metadata as any).nama_obat}`}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

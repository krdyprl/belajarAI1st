import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, CheckCircle, Clock, Pill as PillIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getFamilyMedications, createMedication, updateMedication, deleteMedication, markAsTaken, logActivity } from '../lib/services'
import { supabase } from '../lib/services'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import MedicationForm from '../components/MedicationForm'
import type { Medication } from '../lib/api/medications'
import toast from 'react-hot-toast'

type Tab = 'list' | 'schedule'

export default function MedicationPage() {
  const { user, profile } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const [tab, setTab] = useState<Tab>('list')
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)

  useEffect(() => {
    if (user) loadMedications()
  }, [user])

  async function loadMedications() {
    setLoading(true)
    try {
      if (profile?.family_id) setMedications(await getFamilyMedications(profile.family_id))
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  async function handleSave(data: Partial<Medication>) {
    try {
      if (editing) {
        await updateMedication(editing.id, data)
        logActivity(user!.id, 'update', 'medication', editing.id, data as any)
        toast.success('Obat diperbarui')
      } else {
        const { data: patients } = await supabase
          .from('patients').select('id').eq('family_id', profile?.family_id).limit(1)
        if (!patients?.length) { toast.error('Belum ada pasien.'); return }
        const created = await createMedication({
          patient_id: patients[0].id, created_by: user!.id,
          nama_obat: data.nama_obat || '', dosis: data.dosis || '',
          frekuensi: data.frekuensi || '', instruksi_khusus: data.instruksi_khusus || '',
          status_bpom: 'pending', nomor_bpom: '', image_url: '',
        })
        logActivity(user!.id, 'create', 'medication', created.id, { nama_obat: created.nama_obat })
        toast.success('Obat ditambahkan')
      }
      setShowForm(false); setEditing(null)
      loadMedications()
    } catch { toast.error('Gagal menyimpan') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus obat ini?')) return
    try {
      await deleteMedication(id)
      logActivity(user!.id, 'delete', 'medication', id)
      toast.success('Obat dihapus')
      loadMedications()
    } catch { toast.error('Gagal menghapus') }
  }

  async function handleTaken(id: string) {
    try {
      await markAsTaken(id)
      logActivity(user!.id, 'taken', 'medication', id)
      toast.success('Sudah diminum')
      loadMedications()
    } catch { toast.error('Gagal') }
  }

  const today = new Date().toDateString()
  const schedule = medications.filter((m) =>
    !m.last_taken_at || new Date(m.last_taken_at).toDateString() !== today
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Obat Saya</h1>
          <p className="text-body text-text-secondary mt-0.5">Daftar obat yang diminum</p>
        </div>
        {isDokter && (
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className="w-5 h-5" /> Tambah
          </Button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 text-base">
        <button onClick={() => setTab('list')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${tab === 'list' ? 'bg-white shadow-sm text-text' : 'text-text-secondary'}`}>
          <PillIcon className="w-5 h-5 inline mr-1.5" />Semua Obat
        </button>
        <button onClick={() => setTab('schedule')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors relative ${tab === 'schedule' ? 'bg-white shadow-sm text-text' : 'text-text-secondary'}`}>
          <Clock className="w-5 h-5 inline mr-1.5" />Jadwal
          {schedule.length > 0 && (
            <span className="ml-1.5 bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">{schedule.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <Card><p className="text-body text-text-secondary text-center py-8">Memuat...</p></Card>
      ) : medications.length === 0 ? (
        <Card>
          <p className="text-body text-text-secondary text-center py-8 sm:py-12">
            Belum ada obat.
            {isDokter ? ' Foto kemasan obat atau tekan "Tambah" untuk memulai.' : ' Hubungi dokter untuk menambahkan obat.'}
          </p>
        </Card>
      ) : tab === 'list' ? (
        <div className="space-y-3">
          {medications.map((med) => (
            <Card key={med.id} className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-bg rounded-2xl flex items-center justify-center shrink-0">
                  <PillIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-text text-lg truncate">{med.nama_obat}</h3>
                      <p className="text-base text-text-secondary">{med.dosis && `${med.dosis} - `}{med.frekuensi}</p>
                    </div>
                    <Badge status={med.status_bpom} />
                  </div>
                  {med.instruksi_khusus && (
                    <p className="text-base text-text-secondary mt-1 italic">* {med.instruksi_khusus}</p>
                  )}
                  {isDokter && (
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => { setEditing(med); setShowForm(true) }}
                        className="text-base text-text-secondary hover:text-primary font-semibold flex items-center gap-1.5 touch-target px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(med.id)}
                        className="text-base text-text-secondary hover:text-error font-semibold flex items-center gap-1.5 touch-target px-3 py-1.5 rounded-lg hover:bg-error-bg">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-lg font-bold text-text">Semua obat sudah diminum!</p>
              </div>
            </Card>
          ) : schedule.map((med) => (
            <Card key={med.id} className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-bg rounded-2xl flex items-center justify-center shrink-0">
                  <PillIcon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-lg">{med.nama_obat}</h3>
                  <p className="text-base text-text-secondary">{med.dosis && `${med.dosis} - `}{med.frekuensi}</p>
                  {med.last_taken_at && (
                    <p className="text-sm text-success font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Diminum jam {new Date(med.last_taken_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="success" onClick={() => handleTaken(med.id)} className="shrink-0 text-base">
                  <CheckCircle className="w-5 h-5" /> Diminum
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <MedicationForm medication={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSave={handleSave} />
      )}
    </div>
  )
}

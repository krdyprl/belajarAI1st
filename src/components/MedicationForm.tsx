import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'
import type { Medication } from '../lib/api/medications'

interface Props {
  medication?: Medication | null
  onClose: () => void
  onSave: (data: Partial<Medication>) => Promise<void>
}

export default function MedicationForm({ medication, onClose, onSave }: Props) {
  const [nama_obat, setNamaObat] = useState('')
  const [dosis, setDosis] = useState('')
  const [frekuensi, setFrekuensi] = useState('')
  const [instruksi_khusus, setInstruksiKhusus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (medication) {
      setNamaObat(medication.nama_obat)
      setDosis(medication.dosis)
      setFrekuensi(medication.frekuensi)
      setInstruksiKhusus(medication.instruksi_khusus || '')
    }
  }, [medication])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSave({ nama_obat, dosis, frekuensi, instruksi_khusus })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">
            {medication ? 'Edit Obat' : 'Tambah Obat'}
          </h2>
          <button onClick={onClose} className="touch-target w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Nama Obat</label>
            <input required value={nama_obat} onChange={(e) => setNamaObat(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Contoh: Panadol Extra" />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Dosis</label>
            <input value={dosis} onChange={(e) => setDosis(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Contoh: 500mg" />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Frekuensi</label>
            <input value={frekuensi} onChange={(e) => setFrekuensi(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Contoh: 3x sehari" />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Aturan Minum</label>
            <textarea value={instruksi_khusus} onChange={(e) => setInstruksiKhusus(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Contoh: Sesudah makan" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-lg" size="md">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1 text-lg" size="md">Simpan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { Camera, Upload, ScanLine, ArrowLeft, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { scanMedicine, validateMedicine, createMedication, getPatientId, logActivity, supabase } from '../lib/services'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import type { ScanResult } from '../lib/api/gemini'
import type { BpomStatus, BpomDetailResult } from '../lib/api/bpom'
import toast from 'react-hot-toast'

type BpomState = {
  status: BpomStatus
  loading: boolean
  detail: BpomDetailResult | null
}

export default function Scanner() {
  const { profile } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [bpom, setBpom] = useState<BpomState>({ status: 'pending', loading: false, detail: null })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState<'select' | 'preview'>('select')
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result as string)
      setMode('preview')
    }
    reader.readAsDataURL(file)
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setShowCamera(true)
    } catch {
      toast.error('Kamera tidak tersedia. Gunakan pilih gambar.')
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    stopCamera()
    setImage(canvas.toDataURL('image/jpeg'))
    setMode('preview')
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  async function handleScan() {
    if (!image) return
    setLoading(true)
    try {
      const base64 = image.split(',')[1]
      const scanned = await scanMedicine(base64, 'image/jpeg')
      setResult(scanned)

      if (scanned.nama_obat) {
        setBpom((prev) => ({ ...prev, loading: true }))
        try {
          const bpomResult = await validateMedicine(scanned.nama_obat, scanned.nomor_bpom)
          setBpom({ status: bpomResult.status, loading: false, detail: bpomResult.detail })
        } catch { setBpom({ status: 'pending', loading: false, detail: null }) }
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) logActivity(user.id, 'scan', 'medication', undefined, { nama_obat: scanned.nama_obat })
    } catch (err) {
      toast.error(`Gagal memindai: ${err instanceof Error ? err.message : 'Coba lagi'}`)
    } finally { setLoading(false) }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Silakan masuk dulu.'); return }

      const pid = await getPatientId(user.id, profile?.role || 'dokter', profile?.family_id)
      if (!pid) { toast.error('Belum ada pasien.'); return }

      const created = await createMedication({
        patient_id: pid, created_by: user.id,
        nama_obat: result.nama_obat, dosis: result.dosis,
        frekuensi: result.frekuensi, instruksi_khusus: '',
        status_bpom: bpom.loading ? 'pending' : bpom.status,
        nomor_bpom: result.nomor_bpom, image_url: image || '',
      })
      logActivity(user.id, 'create', 'medication', created.id, { nama_obat: result.nama_obat })
      setSaved(true)
      toast.success('Obat disimpan!')
    } catch {
      toast.error('Gagal menyimpan')
    } finally { setSaving(false) }
  }

  function reset() {
    setImage(null); setResult(null)
    setBpom({ status: 'pending', loading: false, detail: null })
    setSaved(false); setMode('select')
  }

  if (showCamera) {
    return (
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <button onClick={stopCamera} className="flex items-center gap-2 text-base text-text-secondary hover:text-text touch-target">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </button>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border-2 border-gray-200 aspect-video object-cover" />
          <Button onClick={capturePhoto} className="w-full text-lg" size="lg">Ambil Foto</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Foto Obat</h1>
        <p className="text-body text-text-secondary mt-0.5">Foto kemasan obat untuk membaca informasi otomatis</p>
      </div>

      {mode === 'select' && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
          <div className="flex flex-col items-center py-10 sm:py-14 text-center">
            <ScanLine className="w-14 h-14 text-text-secondary mb-4" />
            <p className="text-body text-text-secondary mb-2">Ambil foto kemasan obat</p>
            <p className="text-sm text-gray-400 mb-6">Format: JPG, PNG. Maks 5MB</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="primary" onClick={() => fileRef.current?.click()} className="w-full sm:w-auto text-lg" size="lg">
                <Upload className="w-5 h-5" /> Pilih Gambar
              </Button>
              <Button variant="secondary" onClick={openCamera} className="w-full sm:w-auto text-lg" size="lg">
                <Camera className="w-5 h-5" /> Kamera
              </Button>
            </div>
          </div>
        </Card>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {mode === 'preview' && image && (
        <div className="space-y-4">
          <button onClick={reset} className="flex items-center gap-2 text-base text-text-secondary hover:text-text touch-target">
            <ArrowLeft className="w-5 h-5" /> Pilih ulang
          </button>
          <img src={image} alt="Preview" className="w-full rounded-2xl border-2 border-gray-200" />

          {!result ? (
            <Button onClick={handleScan} loading={loading} className="w-full text-lg" size="lg">
              <ScanLine className="w-5 h-5" /> {loading ? 'Membaca...' : 'Baca Obat'}
            </Button>
          ) : (
            <>
              {bpom.loading ? (
                <Card>
                  <div className="flex items-center gap-3 text-base">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-text-secondary">Memeriksa status BPOM...</span>
                  </div>
                </Card>
              ) : bpom.status !== 'pending' ? (
                <Card className={`border-l-4 ${bpom.status === 'valid' ? 'border-l-success' : bpom.status === 'kurang_dapat_dipercaya' ? 'border-l-error' : 'border-l-warning'}`}>
                  <div className="flex items-start gap-3">
                    {bpom.status === 'valid' ? <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" /> :
                     bpom.status === 'kurang_dapat_dipercaya' ? <XCircle className="w-6 h-6 text-error shrink-0 mt-0.5" /> :
                     <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-base font-semibold text-text">Status Obat: <Badge status={bpom.status} /></p>
                      {bpom.detail && (
                        <p className="text-sm text-text-secondary mt-1">{bpom.detail.product_name}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ) : null}

              <Card>
                <h2 className="font-bold text-text text-lg mb-4">Hasil Bacaan</h2>
                <div className="space-y-3 text-base sm:text-lg">
                  <Field label="Nama Obat" value={result.nama_obat} />
                  <Field label="Dosis" value={result.dosis} />
                  <Field label="Frekuensi" value={result.frekuensi} />
                  <Field label="No. BPOM" value={result.nomor_bpom} />
                  <Field label="Kadaluwarsa" value={result.expired} />
                  <Field label="Produsen" value={result.produsen} />
                </div>

                {isDokter ? (
                  !saved ? (
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <Button onClick={handleSave} loading={saving} className="w-full sm:flex-1 text-lg" size="lg">
                        Simpan Obat
                      </Button>
                      <Button variant="secondary" onClick={reset} className="w-full sm:flex-1 text-lg" size="lg">
                        Foto Lagi
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-5 p-4 bg-success-bg rounded-xl text-center">
                      <p className="text-base font-bold text-success">Obat berhasil disimpan!</p>
                      <Button variant="secondary" onClick={reset} className="mt-3 text-lg" size="md">Foto Lagi</Button>
                    </div>
                  )
                ) : (
                  <div className="mt-5">
                    <Button variant="secondary" onClick={reset} className="w-full text-lg" size="lg">
                      Foto Lagi
                    </Button>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
      <span className="text-text-secondary shrink-0 font-medium">{label}</span>
      <span className="text-text font-semibold text-right break-words max-w-[60%]">{value || '-'}</span>
    </div>
  )
}

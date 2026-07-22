import { X, Scan, Pill, BookOpen, LayoutDashboard } from 'lucide-react'

const guides = [
  {
    icon: Scan,
    title: 'Foto Obat',
    desc: 'Ambil foto kemasan obat. AI akan membaca nama, dosis, dan nomor BPOM secara otomatis.',
  },
  {
    icon: Pill,
    title: 'Obat Saya',
    desc: 'Lihat daftar obat. Tekan "Sudah Diminum" untuk menandai obat yang sudah dikonsumsi.',
  },
  {
    icon: BookOpen,
    title: 'Catatan Kesehatan',
    desc: 'Tulis keluhan seperti "Batuk sejak pagi". AI akan memberikan saran dan menyimpan catatan.',
  },
  {
    icon: LayoutDashboard,
    title: 'Ringkasan',
    desc: 'Lihat statistik dan minta AI membuat ringkasan kondisi kesehatan.',
  },
]

export default function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl transform transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-text">Bantuan</h2>
            <button onClick={onClose} className="touch-target w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-100">
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
          <div className="space-y-4">
            {guides.map((g) => (
              <div key={g.title} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-primary-bg rounded-xl flex items-center justify-center shrink-0">
                  <g.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text text-base">{g.title}</h3>
                  <p className="text-text-secondary text-sm mt-0.5 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-warning-bg rounded-xl">
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-text">Peringatan:</strong> Aplikasi ini hanya untuk membantu pencatatan. Bukan pengganti konsultasi dokter.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

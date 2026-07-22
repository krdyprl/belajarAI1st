import { useState } from 'react'
import { Scan, Pill, BookOpen } from 'lucide-react'
import Button from './Button'

const steps = [
  {
    icon: Scan,
    title: 'Foto Obat',
    desc: 'Ambil foto kemasan obat. AI akan membaca nama, dosis, dan nomor BPOM.',
  },
  {
    icon: Pill,
    title: 'Minum Obat Tepat Waktu',
    desc: 'Lihat jadwal obat harian. Tekan "Sudah Diminum" setiap kali minum obat.',
  },
  {
    icon: BookOpen,
    title: 'Catat Keluhan',
    desc: 'Tulis keluhan seperti "Batuk sejak pagi". AI akan memberikan saran dan menyimpan riwayat.',
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const s = steps[step]

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-primary-bg rounded-2xl flex items-center justify-center mb-6">
          <s.icon className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">{s.title}</h2>
        <p className="text-body text-text-secondary leading-relaxed max-w-sm">{s.desc}</p>

        {/* dots */}
        <div className="flex gap-2 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button
          className="w-full text-lg"
          size="lg"
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1)
            else onDone()
          }}
        >
          {step < steps.length - 1 ? 'Lanjut' : 'Mulai'}
        </Button>
        {step < steps.length - 1 && (
          <button onClick={onDone} className="w-full text-center mt-3 text-text-secondary text-base py-2">
            Lewati
          </button>
        )}
      </div>
    </div>
  )
}

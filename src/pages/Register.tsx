import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pill } from 'lucide-react'
import Button from '../components/Button'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('dokter')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const error = await signUp(email, password, fullName, role)
    setLoading(false)
    if (error) toast.error(error)
    else { toast.success('Akun berhasil dibuat! Silakan cek email.'); navigate('/login') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-md mb-4">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Daftar</h1>
          <p className="text-sm text-text-secondary mt-1">Buat akun baru</p>
        </div>

        <div className="glass-strong rounded-2xl p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Nama Lengkap</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Nama kamu" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="nama@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Kata Sandi</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Min. 6 karakter" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1">Saya sebagai</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="dokter">Dokter / Perawat</option>
                <option value="keluarga">Anggota Keluarga</option>
                <option value="pasien">Pasien</option>
              </select>
            </div>
            <Button type="submit" loading={loading} className="w-full">Daftar</Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}

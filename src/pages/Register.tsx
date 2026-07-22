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
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const error = await signUp(email, password, fullName, role)
    setLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-bg rounded-2xl flex items-center justify-center mb-4">
            <Pill className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Daftar</h1>
          <p className="text-body text-text-secondary mt-1">Buat akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Min. 6 karakter"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-text mb-1.5">Saya sebagai</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="admin">Anggota Keluarga (mengelola obat)</option>
              <option value="pasien">Pasien (melihat jadwal)</option>
            </select>
          </div>
          <Button type="submit" loading={loading} className="w-full text-lg" size="lg">Daftar</Button>
        </form>

        <p className="text-center text-base text-text-secondary">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}

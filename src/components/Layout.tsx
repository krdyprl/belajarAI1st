import { useState } from 'react'
import { useLocation, NavLink, useNavigate } from 'react-router-dom'
import { Scan, Pill, BookOpen, LayoutDashboard, HelpCircle, LogOut, MessageSquareText, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import HelpDrawer from './HelpDrawer'

const baseNav = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/scanner', label: 'Cek Obat', icon: Scan },
  { to: '/medication', label: 'Obat Saya', icon: Pill },
  { to: '/journal', label: 'Catatan', icon: BookOpen },
]

const dokterNav = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/scanner', label: 'Foto Obat', icon: Scan },
  { to: '/medication', label: 'Obat Saya', icon: Pill },
  { to: '/journal', label: 'Catatan', icon: BookOpen },
  { to: '/consultation', label: 'Konsultasi', icon: MessageSquareText },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 10) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth()
  const isDokter = profile?.role === 'dokter'
  const navItems = isDokter ? dokterNav : baseNav
  const navigate = useNavigate()
  const location = useLocation()
  const isProfilePage = location.pathname === '/profile'
  const [helpOpen, setHelpOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* header greeting */}
      <header className={`px-4 sm:px-6 pt-4 sm:pt-6 pb-2 ${isProfilePage ? 'hidden' : ''}`}>
        <div className="max-w-2xl mx-auto">
          <div className="glass-strong rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <button onClick={() => navigate('/profile')} className="flex items-center gap-3 sm:gap-4 text-left flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-md shrink-0">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{getGreeting()}</p>
                <h1 className="text-lg sm:text-xl font-bold text-text truncate max-w-[180px] sm:max-w-[280px]">
                  {profile?.full_name || 'User'}
                </h1>
              </div>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => setHelpOpen(true)}
                className="touch-target w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                title="Bantuan">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
              </button>
              {user && (
                <button onClick={handleLogout}
                  className="touch-target w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                  title="Keluar">
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex-1 overflow-auto pb-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-3">
          <div className="glass-strong rounded-2xl shadow-lg flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[10px] font-semibold transition-colors rounded-xl ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

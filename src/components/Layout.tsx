import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Scan, Pill, BookOpen, LayoutDashboard, HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import HelpDrawer from './HelpDrawer'

const navItems = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/scanner', label: 'Foto Obat', icon: Scan },
  { to: '/medication', label: 'Obat Saya', icon: Pill },
  { to: '/journal', label: 'Catatan', icon: BookOpen },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-bg rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-primary">MedCare</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHelpOpen(true)}
              className="touch-target flex items-center justify-center w-12 h-12 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-xl transition-colors"
              title="Bantuan"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="touch-target flex items-center justify-center w-12 h-12 text-text-secondary hover:text-error hover:bg-error-bg rounded-xl transition-colors"
                title="Keluar"
              >
                <LogOut className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex-1 overflow-auto pb-24">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t-2 border-gray-200 pb-1 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[64px] text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-primary border-t-2 border-primary -mt-[2px]'
                    : 'text-text-secondary'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Medication from './pages/Medication'
import Scanner from './pages/Scanner'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import Consultation from './pages/Consultation'
import ConsultationDetail from './pages/ConsultationDetail'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-body text-text-secondary p-4">Memuat...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-body text-text-secondary p-4">Memuat...</div>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const [onboarding, setOnboarding] = useState(
    () => !localStorage.getItem('medcare_onboarding')
  )

  function handleOnboardingDone() {
    localStorage.setItem('medcare_onboarding', 'done')
    setOnboarding(false)
  }

  return (
    <>
      {onboarding && <Onboarding onDone={handleOnboardingDone} />}
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/medication" element={<ProtectedRoute><Medication /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/consultation" element={<ProtectedRoute><Consultation /></ProtectedRoute>} />
        <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

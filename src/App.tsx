import { useCallback, useEffect, useState } from 'react'
import { getAccessToken, getMyProfile, restoreSession, type AuthProfile } from './services/authService'
import { disconnectAuthSocket, verifySessionWithSocket } from './services/realtimeAuth'
import type { Page } from './types'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import SitesPage from './pages/SitesPage'
import EquipementsPage from './pages/EquipementsPage'
import PlanificationsPage from './pages/PlanificationsPage'
import CalendrierPage from './pages/CalendrierPage'
import RapportsPage from './pages/RapportsPage'
import UtilisateursPage from './pages/UtilisateursPage'
import NotificationsPage from './pages/NotificationsPage'
import DatabasePage from './pages/DatabasePage'
import SettingsPage from './pages/SettingsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

type AppPage = Page | 'login' | 'register' | 'reset-password'

const validPages: AppPage[] = [
  'landing', 'login', 'register', 'reset-password', 'dashboard', 'sites', 'equipements',
  'planifications', 'calendrier', 'rapports', 'utilisateurs',
  'notifications', 'database', 'settings',
]

function getPageFromUrl(): AppPage {
  if (new URLSearchParams(window.location.search).get('auth') === 'reset-password') return 'reset-password'
  const route = window.location.hash.slice(2).split('?')[0]
  return validPages.includes(route as AppPage) ? route as AppPage : 'landing'
}

function updateUrl(page: AppPage) {
  const hash = page === 'landing' ? '#/' : `#/${page}`
  if (window.location.hash !== hash) window.location.hash = hash
}

const isPublicPage = (page: AppPage) =>
  page === 'landing' || page === 'login' || page === 'register' || page === 'reset-password'

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromUrl)
  const [authChecked, setAuthChecked] = useState(false)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const setVerifiedProfile = useCallback((nextProfile: AuthProfile | null) => {
    setProfile(nextProfile)
  }, [])

  useEffect(() => {
    const syncWithUrl = () => setCurrentPage(getPageFromUrl())
    window.addEventListener('hashchange', syncWithUrl)
    return () => window.removeEventListener('hashchange', syncWithUrl)
  }, [])

  const goTo = (page: AppPage) => {
    setCurrentPage(page)
    updateUrl(page)
  }

  // Restore the custom KOROBO session from its HttpOnly refresh cookie on every page load.
  useEffect(() => {
    let disposed = false
    const restore = async () => {
      try {
        const restoredProfile = await restoreSession()
        if (disposed) return
        setVerifiedProfile(restoredProfile)
        setAuthChecked(true)
        if (restoredProfile) {
          const token = getAccessToken()
          if (token) {
            void verifySessionWithSocket(token).catch(() => {
              // HTTP auth remains authoritative if the realtime service is temporarily unavailable.
            })
          }
          const page = getPageFromUrl()
          if (page === 'login' || page === 'register' || page === 'landing') {
            setCurrentPage('dashboard')
            updateUrl('dashboard')
          }
        } else {
          disconnectAuthSocket()
        }
      } catch {
        if (disposed) return
        setVerifiedProfile(null)
        setAuthChecked(true)
        disconnectAuthSocket()
      }
    }
    void restore()
    return () => { disposed = true }
  }, [setVerifiedProfile])

  // Keep authenticated users out of the login route, including direct visits to /#/login.
  // This uses the already verified profile and does not trigger another API request.
  useEffect(() => {
    if (!authChecked || !profile || currentPage !== 'login') return
    setCurrentPage('dashboard')
    updateUrl('dashboard')
  }, [currentPage, authChecked, profile])

  useEffect(() => {
    if (isPublicPage(currentPage)) return
    if (!authChecked) return
    if (!profile) {
      setCurrentPage('login')
      updateUrl('login')
    }
  }, [currentPage, authChecked, profile])

  if (currentPage === 'reset-password') {
    return <ResetPasswordPage onDone={(nextProfile) => {
      if (nextProfile) {
        setVerifiedProfile(nextProfile)
        goTo('dashboard')
      } else {
        goTo('login')
      }
    }} />
  }

  if (!authChecked && !isPublicPage(currentPage)) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f3f6f1] text-sm text-gray-500">Vérification de la session…</div>
  }

  if (currentPage === 'landing') return <LandingPage onEnter={() => goTo('login')} onRegister={() => goTo('register')} />
  if (currentPage === 'login') return <LoginPage onLogin={() => {
    void getMyProfile().then((nextProfile) => {
      setVerifiedProfile(nextProfile)
      const token = getAccessToken()
      if (token) void verifySessionWithSocket(token).catch(() => undefined)
      goTo('dashboard')
    }).catch(() => goTo('login'))
  }} onGoRegister={() => goTo('register')} onBack={() => goTo('landing')} />
  if (currentPage === 'register') return <RegisterPage onRegister={() => {
    void getMyProfile().then((nextProfile) => {
      setVerifiedProfile(nextProfile)
      const token = getAccessToken()
      if (token) void verifySessionWithSocket(token).catch(() => undefined)
      goTo('dashboard')
    }).catch(() => goTo('login'))
  }} onGoLogin={() => goTo('login')} onBack={() => goTo('landing')} />

  const adminPage = currentPage as Page
  return (
    <AdminLayout currentPage={adminPage} onNavigate={(page) => goTo(page)}>
      {adminPage === 'dashboard' && <DashboardPage />}
      {adminPage === 'sites' && <SitesPage />}
      {adminPage === 'equipements' && <EquipementsPage />}
      {adminPage === 'planifications' && <PlanificationsPage />}
      {adminPage === 'calendrier' && <CalendrierPage />}
      {adminPage === 'rapports' && <RapportsPage />}
      {adminPage === 'utilisateurs' && <UtilisateursPage />}
      {adminPage === 'notifications' && <NotificationsPage />}
      {adminPage === 'database' && <DatabasePage />}
      {adminPage === 'settings' && <SettingsPage />}
    </AdminLayout>
  )
}

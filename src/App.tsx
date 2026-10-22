import { useCallback, useEffect, useRef, useState } from 'react'
import { getAccessToken, getMyProfile, type AuthProfile } from './services/authService'
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
const validPages: AppPage[] = ['landing', 'login', 'register', 'reset-password', 'dashboard', 'sites', 'equipements', 'planifications', 'calendrier', 'rapports', 'utilisateurs', 'notifications', 'database', 'settings']
function getPageFromUrl(): AppPage {
  if (new URLSearchParams(window.location.search).get('auth') === 'reset-password') return 'reset-password'
  const route = window.location.hash.slice(2).split('?')[0]
  return validPages.includes(route as AppPage) ? route as AppPage : 'landing'
}
function updateUrl(page: AppPage) {
  const hash = page === 'landing' ? '#/' : `#/${page}`
  if (window.location.hash !== hash) window.location.hash = hash
}
const isPublicPage = (page: AppPage) => page === 'landing' || page === 'login' || page === 'register' || page === 'reset-password'

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromUrl)
  const [authChecked, setAuthChecked] = useState(false)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const authGeneration = useRef(0)
  const setVerifiedProfile = useCallback((value: AuthProfile | null) => setProfile(value), [])

  useEffect(() => {
    const syncUrl = () => setCurrentPage(getPageFromUrl())
    window.addEventListener('hashchange', syncUrl)
    return () => window.removeEventListener('hashchange', syncUrl)
  }, [])

  const goTo = (page: AppPage) => { setCurrentPage(page); updateUrl(page) }

  useEffect(() => {
    let disposed = false
    const generation = ++authGeneration.current
    const verify = async () => {
      const token = getAccessToken()
      if (!token) {
        disconnectAuthSocket()
        setVerifiedProfile(null)
        setAuthChecked(true)
        return
      }
      setAuthChecked(false)
      try {
        const nextProfile = await getMyProfile()
        if (disposed || generation !== authGeneration.current) return
        setVerifiedProfile(nextProfile)
        try { await verifySessionWithSocket(token) } catch { /* HTTP profile verification remains authoritative fallback. */ }
        if (disposed || generation !== authGeneration.current) return
        setAuthChecked(true)
        const page = getPageFromUrl()
        if (page === 'login' || page === 'register' || page === 'landing') {
          setCurrentPage('dashboard')
          updateUrl('dashboard')
        }
      } catch {
        if (disposed || generation !== authGeneration.current) return
        disconnectAuthSocket()
        window.localStorage.removeItem('korobo.access-token')
        window.localStorage.removeItem('korobo.auth-profile')
        setVerifiedProfile(null)
        setAuthChecked(true)
        if (!isPublicPage(getPageFromUrl())) {
          setCurrentPage('login')
          updateUrl('login')
        }
      }
    }
    void verify()
    const onLogout = () => {
      disconnectAuthSocket()
      setVerifiedProfile(null)
      setAuthChecked(true)
    }
    const onAuthChanged = () => {
      setAuthChecked(false)
      void getMyProfile().then(async nextProfile => {
        if (disposed) return
        setVerifiedProfile(nextProfile)
        const token = getAccessToken()
        if (token) { try { await verifySessionWithSocket(token) } catch { /* HTTP verification remains the fallback. */ } }
        if (!disposed) setAuthChecked(true)
      }).catch(() => { if (!disposed) { setVerifiedProfile(null); setAuthChecked(true) } })
    }
    window.addEventListener('korobo:auth-changed', onAuthChanged)
    window.addEventListener('korobo:logout', onLogout)
    return () => {
      disposed = true
      window.removeEventListener('korobo:auth-changed', onAuthChanged)
      window.removeEventListener('korobo:logout', onLogout)
    }
  }, [setVerifiedProfile])

  useEffect(() => {
    if (!authChecked || !profile || currentPage !== 'login') return
    setCurrentPage('dashboard')
    updateUrl('dashboard')
  }, [currentPage, authChecked, profile])

  useEffect(() => {
    if (isPublicPage(currentPage) || !authChecked || profile) return
    setCurrentPage('login')
    updateUrl('login')
  }, [currentPage, authChecked, profile])

  if (currentPage === 'reset-password') return <ResetPasswordPage onDone={() => goTo('login')} />
  if (!authChecked && !isPublicPage(currentPage)) return <div className="min-h-screen flex items-center justify-center bg-[#f3f6f1] text-sm text-gray-500">Vérification de la session…</div>
  if (currentPage === 'landing') return <LandingPage onEnter={() => goTo('login')} onRegister={() => goTo('register')} />
  if (currentPage === 'login') return <LoginPage onLogin={() => goTo('dashboard')} onGoRegister={() => goTo('register')} onBack={() => goTo('landing')} />
  if (currentPage === 'register') return <RegisterPage onRegister={() => goTo('dashboard')} onGoLogin={() => goTo('login')} onBack={() => goTo('landing')} />

  const adminPage = currentPage as Page
  return <AdminLayout currentPage={adminPage} onNavigate={page => goTo(page)}>
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
}

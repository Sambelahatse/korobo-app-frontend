import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getMyProfile, getSupabaseClient, type AuthProfile } from './services/authService'
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
  const authGeneration = useRef(0)
  const profileRef = useRef<AuthProfile | null>(null)

  const setVerifiedProfile = useCallback((nextProfile: AuthProfile | null) => {
    profileRef.current = nextProfile
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

  // Listen to Supabase Auth state changes once. Navigation clicks do not trigger
  // a network request to /auth/me; profile verification happens on session changes.
  useEffect(() => {
    let disposed = false
    let lastVerifiedToken: string | null = null
    let verificationInFlight: string | null = null

    const processSession = async (session: Session | null, forceVerify = false, recoverInitialSession = false) => {
      if (disposed) return
      const generation = ++authGeneration.current

      if (!session?.access_token && recoverInitialSession) {
        // On a hard refresh, wait for Supabase's persisted storage to finish
        // restoring before deciding that the user is signed out.
        let restoredSession: Session | null = null
        let sessionReadFailed = false
        for (let attempt = 0; attempt < 5; attempt += 1) {
          try {
            const result = await supabase.auth.getSession()
            if (result.error) {
              sessionReadFailed = true
            } else {
              restoredSession = result.data.session
            }
          } catch {
            sessionReadFailed = true
          }

          if (disposed || generation !== authGeneration.current) return
          if (restoredSession?.access_token) {
            await processSession(restoredSession, true, false)
            return
          }
          if (attempt < 4) {
            await new Promise<void>((resolve) => window.setTimeout(resolve, 500))
            if (disposed || generation !== authGeneration.current) return
          }
        }

        // A storage/lock error is not proof that the user has signed out.
        // Keep protected routes in a loading state and retry when storage is readable.
        if (sessionReadFailed) {
          setAuthChecked(false)
          window.setTimeout(() => {
            if (!disposed && generation === authGeneration.current) {
              void processSession(null, true, true)
            }
          }, 1500)
          return
        }
      }

      if (!session?.access_token) {
        if (disposed || generation !== authGeneration.current) return
        disconnectAuthSocket()
        lastVerifiedToken = null
        verificationInFlight = null
        setVerifiedProfile(null)
        setAuthChecked(true)
        return
      }

      const token = session.access_token
      if (!forceVerify && token === lastVerifiedToken) {
        setAuthChecked(true)
        return
      }

      if (!forceVerify && token === verificationInFlight) {
        // Another startup/auth event is already verifying this token.
        // Do not mark auth as checked until that verification sets the profile.
        return
      }

      verificationInFlight = token
      setAuthChecked(false)
      try {
        // Supabase callbacks must not await other Supabase operations directly;
        // this function is invoked asynchronously from the listener below.
        let nextProfile: AuthProfile
        try {
          nextProfile = await verifySessionWithSocket(token)
        } catch {
          // Keep the HTTP endpoint as a resilient fallback if WebSocket is temporarily unavailable.
          nextProfile = await getMyProfile()
        }
        if (disposed || generation !== authGeneration.current) return
        lastVerifiedToken = token
        setVerifiedProfile(nextProfile)
        setAuthChecked(true)
        const page = getPageFromUrl()
        if (page === 'login' || page === 'register' || page === 'landing') {
          setCurrentPage('dashboard')
          updateUrl('dashboard')
        }
      } catch {
        if (disposed || generation !== authGeneration.current) return
        lastVerifiedToken = null

        // A failed API/WebSocket check does not prove that the user is signed out.
        // Keep protected routes in the verification state and retry while Supabase
        // still has a session instead of incorrectly redirecting to /login.
        // Keep the session that triggered this verification as a fallback.
        // A transient getSession/storage-lock failure must not be interpreted as
        // a signed-out user and send them to login after a hard refresh.
        let currentSession: Session | null = session
        try {
          const restoredSession = (await supabase.auth.getSession()).data.session
          if (restoredSession?.access_token) currentSession = restoredSession
        } catch {
          // Retain the known session and retry verification below.
        }
        if (disposed || generation !== authGeneration.current) return
        if (currentSession?.access_token) {
          setAuthChecked(false)
          window.setTimeout(() => {
            if (!disposed && generation === authGeneration.current) {
              void processSession(currentSession, true)
            }
          }, 2000)
          return
        }

        setVerifiedProfile(null)
        setAuthChecked(true)
        const page = getPageFromUrl()
        if (!isPublicPage(page)) {
          setCurrentPage('login')
          updateUrl('login')
        }
      } finally {
        if (verificationInFlight === token) verificationInFlight = null
      }
    }

    let supabase: ReturnType<typeof getSupabaseClient>
    try {
      supabase = getSupabaseClient()
    } catch {
      setVerifiedProfile(null)
      setAuthChecked(true)
      return () => { disposed = true }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Defer the API call until Supabase has finished dispatching its event.
        window.setTimeout(() => {
          void processSession(session, event === 'SIGNED_IN', event === 'INITIAL_SESSION')
        }, 0)
      } else if (event === 'SIGNED_OUT') {
        void processSession(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Re-authenticate the realtime connection with the rotated access token.
        window.setTimeout(() => { void processSession(session, true) }, 0)
      } else if (event === 'USER_UPDATED' && session) {
        window.setTimeout(() => { void processSession(session, true) }, 0)
      }
    })

    // Bootstrap from persisted storage explicitly as well as listening for auth events.
    // This avoids depending solely on INITIAL_SESSION, which can arrive before storage
    // restoration is visible in some browser startup / refresh timing scenarios.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (disposed) return
      if (error) {
        setAuthChecked(false)
        window.setTimeout(() => {
          if (!disposed) void processSession(null, true, true)
        }, 0)
        return
      }
      void processSession(data.session, true, !data.session)
    }).catch(() => {
      if (!disposed) {
        setAuthChecked(false)
        window.setTimeout(() => {
          if (!disposed) void processSession(null, true, true)
        }, 0)
      }
    })

    return () => {
      disposed = true
      subscription.unsubscribe()
    }
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
    return <ResetPasswordPage onDone={() => goTo('login')} />
  }

  if (!authChecked && !isPublicPage(currentPage)) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f3f6f1] text-sm text-gray-500">Vérification de la session…</div>
  }

  if (currentPage === 'landing') return <LandingPage onEnter={() => goTo('login')} onRegister={() => goTo('register')} />
  if (currentPage === 'login') return <LoginPage onLogin={() => goTo('dashboard')} onGoRegister={() => goTo('register')} onBack={() => goTo('landing')} />
  if (currentPage === 'register') return <RegisterPage onRegister={() => goTo('dashboard')} onGoLogin={() => goTo('login')} onBack={() => goTo('landing')} />

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

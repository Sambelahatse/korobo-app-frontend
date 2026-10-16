import { useEffect, useState } from 'react'
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

type AppPage = Page | 'login' | 'register'

const validPages: AppPage[] = [
  'landing', 'login', 'register', 'dashboard', 'sites', 'equipements',
  'planifications', 'calendrier', 'rapports', 'utilisateurs',
  'notifications', 'database', 'settings',
]

function getPageFromUrl(): AppPage {
  const route = window.location.hash.slice(2).split('?')[0]
  return validPages.includes(route as AppPage) ? route as AppPage : 'landing'
}

function updateUrl(page: AppPage) {
  const hash = page === 'landing' ? '#/' : `#/${page}`
  if (window.location.hash !== hash) window.location.hash = hash
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromUrl)

  useEffect(() => {
    const syncWithUrl = () => setCurrentPage(getPageFromUrl())
    window.addEventListener('hashchange', syncWithUrl)
    return () => window.removeEventListener('hashchange', syncWithUrl)
  }, [])

  const goTo = (page: AppPage) => {
    setCurrentPage(page)
    updateUrl(page)
  }

  if (currentPage === 'landing') return <LandingPage onEnter={() => goTo('login')} onRegister={() => goTo('register')} />
  if (currentPage === 'login') return <LoginPage onLogin={() => goTo('dashboard')} onGoRegister={() => goTo('register')} onBack={() => goTo('landing')} />
  if (currentPage === 'register') return <RegisterPage onRegister={() => goTo('login')} onGoLogin={() => goTo('login')} onBack={() => goTo('landing')} />

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

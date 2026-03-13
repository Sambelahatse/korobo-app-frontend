import { useState } from 'react'
import type { Page } from './types'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import SitesPage from './pages/SitesPage'
import PlanificationsPage from './pages/PlanificationsPage'
import RapportsPage from './pages/RapportsPage'
import NotificationsPage from './pages/NotificationsPage'
import DatabasePage from './pages/DatabasePage'
import SettingsPage from './pages/SettingsPage'

type AppPage = Page | 'login' | 'register'

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing')

  if (currentPage === 'landing')  return <LandingPage  onEnter={() => setCurrentPage('login')} onRegister={() => setCurrentPage('register')} />
  if (currentPage === 'login')    return <LoginPage    onLogin={() => setCurrentPage('dashboard')} onGoRegister={() => setCurrentPage('register')} onBack={() => setCurrentPage('landing')} />
  if (currentPage === 'register') return <RegisterPage onRegister={() => setCurrentPage('login')} onGoLogin={() => setCurrentPage('login')} onBack={() => setCurrentPage('landing')} />

  const adminPage = currentPage as Page
  return (
    <AdminLayout currentPage={adminPage} onNavigate={(p) => setCurrentPage(p)}>
      {adminPage === 'dashboard'      && <DashboardPage />}
      {adminPage === 'sites'          && <SitesPage />}
      {adminPage === 'planifications' && <PlanificationsPage />}
      {adminPage === 'rapports'       && <RapportsPage />}
      {adminPage === 'notifications'  && <NotificationsPage />}
      {adminPage === 'database'       && <DatabasePage />}
      {adminPage === 'settings'       && <SettingsPage />}
    </AdminLayout>
  )
}

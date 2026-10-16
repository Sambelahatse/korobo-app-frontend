import { useState, type ReactNode } from 'react'
import type { Page } from '../types'
import {
  ClockIcon, GridIcon, SunCogIcon, CalendarIcon,
  BellIcon, DatabaseIcon, SettingsIcon, LogoutIcon, ModernIcon,
} from './Icons'
import ConfirmDialog from './ConfirmDialog'
import { mockNotifications } from '../data/mockData'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface Props {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { icon: <ClockIcon />, page: 'dashboard' as Page, label: 'Dashboard' },
  { icon: <GridIcon />, page: 'sites' as Page, label: 'Sites' },
  { icon: <SunCogIcon />, page: 'equipements' as Page, label: 'Équipements' },
  { icon: <SunCogIcon />, page: 'planifications' as Page, label: 'Planifications' },
  { icon: <CalendarIcon />, page: 'calendrier' as Page, label: 'Calendrier' },
  { icon: <CalendarIcon />, page: 'rapports' as Page, label: 'Rapports' },
  { icon: <GridIcon />, page: 'utilisateurs' as Page, label: 'Utilisateurs & rôles' },
  { icon: <BellIcon />, page: 'notifications' as Page, label: 'Notifications' },
  { icon: <DatabaseIcon />, page: 'database' as Page, label: 'Base de données' },
  { icon: <SettingsIcon />, page: 'settings' as Page, label: 'Paramètres' },
]

const pageMeta: Record<Page, { title: string; icon: ReactNode }> = {
  landing: { title: '', icon: null },
  dashboard: { title: 'DASHBOARD', icon: <ClockIcon /> },
  sites: { title: 'SITES', icon: <GridIcon /> },
  equipements: { title: 'ÉQUIPEMENTS & MATÉRIELS', icon: <SunCogIcon /> },
  planifications: { title: 'PLANIFICATIONS', icon: <SunCogIcon /> },
  calendrier: { title: 'CALENDRIER', icon: <CalendarIcon /> },
  rapports: { title: 'RAPPORTS', icon: <CalendarIcon /> },
  utilisateurs: { title: 'UTILISATEURS & RÔLES', icon: <GridIcon /> },
  notifications: { title: 'NOTIFICATIONS', icon: <BellIcon /> },
  database: { title: 'BASE DE DONNÉES', icon: <DatabaseIcon /> },
  settings: { title: 'PARAMÈTRES', icon: <SettingsIcon /> },
}

export default function AdminLayout({ children, currentPage, onNavigate }: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { title, icon } = pageMeta[currentPage]
  const unreadCount = mockNotifications.filter(n => !n.lu).length
  const handleNavigate = (page: Page) => { onNavigate(page); setMobileMenuOpen(false) }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f4]">
      {mobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed lg:relative z-40 lg:z-auto h-full lg:h-screen flex-shrink-0 bg-[#202720] border-r border-white/10 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-[248px]`}>
        <div className="h-[76px] flex items-center justify-between px-5 border-b border-white/10">
          <button onClick={() => handleNavigate('dashboard')} className="bg-white/5 border border-white/10 text-white text-sm font-bold tracking-[0.16em] px-4 py-2 rounded-lg transition-colors hover:bg-white/10">KOROBO</button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white" aria-label="Fermer le menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <OverlayScrollbarsComponent className="min-h-0 flex-1" options={{ scrollbars: { theme: 'os-theme-korobo', autoHide: 'scroll', autoHideDelay: 700, clickScroll: true } }} defer><nav className="flex flex-col items-stretch gap-1.5 py-5 px-3">
          {navItems.map(item => <button key={item.page} onClick={() => handleNavigate(item.page)} className={['relative flex items-center gap-3 justify-start w-full min-h-11 rounded-lg px-3.5 py-2 transition-colors', currentPage === item.page ? 'bg-[#3f5d39] text-white shadow-sm ring-1 ring-inset ring-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'].join(' ')}>
            <span className="flex-shrink-0">{item.icon}</span><span className="text-left text-sm font-semibold">{item.label}</span>
            {item.page === 'notifications' && unreadCount > 0 && <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>)}
        </nav></OverlayScrollbarsComponent>
        <div className="py-4 flex items-center px-3 border-t border-white/10"><button onClick={() => { setMobileMenuOpen(false); setConfirmLogout(true) }} className="flex items-center gap-3 w-full h-11 px-3.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"><LogoutIcon /><span className="text-sm font-semibold">Déconnexion</span></button></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[64px] lg:h-[76px] flex-shrink-0 bg-white/95 border-b border-gray-100 flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Ouvrir le menu" className="lg:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"><span className="w-5 h-0.5 bg-gray-700 rounded" /><span className="w-5 h-0.5 bg-gray-700 rounded" /><span className="w-5 h-0.5 bg-gray-700 rounded" /></button>
          <div className="flex items-center gap-2 text-[#4A7A3B] min-w-0"><span className="flex-shrink-0">{icon}</span><span className="font-sans font-bold text-sm lg:text-base tracking-wide text-gray-800 truncate">{title}</span></div>
          <button onClick={() => handleNavigate('notifications')} aria-label="Ouvrir les notifications" className="lg:hidden ml-auto relative p-2 text-gray-500 hover:text-[#4A7A3B]"><BellIcon size={20} />{unreadCount > 0 && <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">{unreadCount}</span>}</button>
        </header>
        <main className="flex-1 min-h-0 overflow-hidden bg-[#f6f8f4]"><OverlayScrollbarsComponent className="h-full" options={{ scrollbars: { theme: 'os-theme-korobo', autoHide: 'scroll', autoHideDelay: 700, clickScroll: true } }} defer><div className="min-h-full">
          {children}
          <footer className="border-t border-gray-200/80 bg-white/70 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]">
                  <ModernIcon name="zap" size={21} />
                </div>
                <div>
                  <p className="font-sans text-sm font-bold tracking-wide text-[#202720]">KOROBO<span className="text-[#5C8A42]">.</span></p>
                  <p className="mt-0.5 text-xs text-gray-500">La maintenance solaire, en toute simplicité.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Interface opérationnelle</span>
                <span className="text-gray-300">•</span>
                <span>Version 1.0</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-3 text-[11px] text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} KOROBO. Tous droits réservés.</p>
              <p>Suivi et entretien des installations photovoltaïques</p>
            </div>
          </footer>
          </div></OverlayScrollbarsComponent>
        </main>
        <div className="h-1 flex-shrink-0 bg-gradient-to-r from-[#28402a] via-[#4A7A3B] to-[#8eb86f]" />
      </div>
      {confirmLogout && <ConfirmDialog title="Déconnexion" message="Êtes-vous sûr de vouloir vous déconnecter de KOROBO ?" confirmLabel="Se déconnecter" cancelLabel="Rester connecté" danger={false} onConfirm={() => { setConfirmLogout(false); onNavigate('landing') }} onCancel={() => setConfirmLogout(false)} />}
    </div>
  )
}

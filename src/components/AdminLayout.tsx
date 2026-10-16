import { useState, type ReactNode } from 'react'
import type { Page } from '../types'
import { BellIcon, LogoutIcon, ModernIcon, type ModernIconName } from './Icons'
import ConfirmDialog from './ConfirmDialog'
import { mockNotifications } from '../data/mockData'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface Props {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const pageIcons: Partial<Record<Page, ModernIconName>> = {
  dashboard: 'layout-dashboard',
  sites: 'map-pin',
  equipements: 'wrench',
  planifications: 'calendar-clock',
  calendrier: 'calendar-days',
  rapports: 'clipboard-check',
  utilisateurs: 'users-round',
  notifications: 'bell',
  database: 'database',
  settings: 'sliders-horizontal',
}

const navItems = [
  { page: 'dashboard' as Page, label: 'Dashboard' },
  { page: 'sites' as Page, label: 'Sites' },
  { page: 'equipements' as Page, label: 'Équipements' },
  { page: 'planifications' as Page, label: 'Planifications' },
  { page: 'calendrier' as Page, label: 'Calendrier' },
  { page: 'rapports' as Page, label: 'Rapports' },
  { page: 'utilisateurs' as Page, label: 'Utilisateurs & rôles' },
  { page: 'notifications' as Page, label: 'Notifications' },
  { page: 'database' as Page, label: 'Base de données' },
  { page: 'settings' as Page, label: 'Paramètres' },
]

const pageMeta: Record<Page, { title: string }> = {
  landing: { title: '' },
  dashboard: { title: 'DASHBOARD' },
  sites: { title: 'SITES' },
  equipements: { title: 'ÉQUIPEMENTS & MATÉRIELS' },
  planifications: { title: 'PLANIFICATIONS' },
  calendrier: { title: 'CALENDRIER' },
  rapports: { title: 'RAPPORTS' },
  utilisateurs: { title: 'UTILISATEURS & RÔLES' },
  notifications: { title: 'NOTIFICATIONS' },
  database: { title: 'BASE DE DONNÉES' },
  settings: { title: 'PARAMÈTRES' },
}

export default function AdminLayout({ children, currentPage, onNavigate }: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { title } = pageMeta[currentPage]
  const currentIcon = pageIcons[currentPage]
  const unreadCount = mockNotifications.filter(n => !n.lu).length
  const handleNavigate = (page: Page) => { onNavigate(page); setMobileMenuOpen(false) }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8f4]">
      {mobileMenuOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed lg:relative z-40 lg:z-auto h-full lg:h-screen flex-shrink-0 bg-[#202720] border-r border-white/10 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'lg:w-[76px] w-[248px]' : 'w-[248px]'}`}>
        <div className="h-[76px] flex items-center justify-between px-5 border-b border-white/10">
          <button onClick={() => handleNavigate('dashboard')} aria-label="Retour au dashboard" className={`bg-white/5 border border-white/10 text-white text-sm font-bold tracking-[0.16em] py-2 rounded-lg transition-colors hover:bg-white/10 ${sidebarCollapsed ? "lg:px-2.5 px-4" : "px-4"}`}><span className="lg:hidden">KOROBO</span><span className="hidden lg:inline">{sidebarCollapsed ? "K" : "KOROBO"}</span></button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white" aria-label="Fermer le menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <OverlayScrollbarsComponent className="min-h-0 flex-1" options={{ scrollbars: { theme: 'os-theme-korobo', autoHide: 'scroll', autoHideDelay: 700, clickScroll: true } }} defer><nav className={`flex flex-col items-stretch gap-1.5 py-5 ${sidebarCollapsed ? "lg:px-2" : "px-3"}`}>
          {navItems.map(item => <button key={item.page} onClick={() => handleNavigate(item.page)} title={sidebarCollapsed ? item.label : undefined} className={['group relative flex items-center gap-3 justify-start w-full min-h-12 rounded-xl py-2 transition-all duration-200', sidebarCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3', currentPage === item.page ? 'bg-[#3f5d39] text-white shadow-sm ring-1 ring-inset ring-white/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'].join(' ')}>
            <span className={["flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-current transition-colors", currentPage === item.page ? "bg-white/10" : "bg-white/[0.04] group-hover:bg-white/[0.08]"].join(" ")}><ModernIcon name={pageIcons[item.page]!} size={19} /></span><span className={`text-left text-sm font-semibold ${sidebarCollapsed ? "lg:hidden" : ""}`}>{item.label}</span>
            {item.page === 'notifications' && unreadCount > 0 && <span className={`${sidebarCollapsed ? "lg:absolute lg:right-1 lg:top-1" : "ml-auto"} flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>)}
        </nav></OverlayScrollbarsComponent>
        <div className={`py-4 flex items-center border-t border-white/10 ${sidebarCollapsed ? 'lg:px-2 px-3' : 'px-3'}`}>
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              setConfirmLogout(true)
            }}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
            className={`flex items-center gap-3 w-full h-11 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${sidebarCollapsed ? 'lg:justify-center lg:px-0 px-3.5' : 'px-3.5'}`}
          >
            <LogoutIcon />
            <span className={`text-sm font-semibold ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Déconnexion</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[64px] lg:h-[76px] flex-shrink-0 bg-white/95 border-b border-gray-100 flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => { if (window.matchMedia("(min-width: 1024px)").matches) setSidebarCollapsed(value => !value); else setMobileMenuOpen(true) }} aria-label={sidebarCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"} aria-expanded={!sidebarCollapsed} title={sidebarCollapsed ? "Développer le menu" : "Réduire le menu"} className="flex flex-col justify-center gap-1.5 p-2 rounded-lg text-gray-600 hover:bg-[#edf4e9] hover:text-[#3f5d39] transition-colors flex-shrink-0"><span className="w-5 h-0.5 bg-current rounded" /><span className="w-5 h-0.5 bg-current rounded" /><span className="w-5 h-0.5 bg-current rounded" /></button>
          <div className="flex items-center gap-2 text-[#4A7A3B] min-w-0"><span className="flex-shrink-0">{currentIcon && <ModernIcon name={currentIcon} size={20} />}</span><span className="font-sans font-bold text-sm lg:text-base tracking-wide text-gray-800 truncate">{title}</span></div>
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
      {confirmLogout && <ConfirmDialog title="Déconnexion" message="Êtes-vous sûr de vouloir vous déconnecter de KOROBO ?" confirmLabel="Se déconnecter" cancelLabel="Rester connecté" danger={false} onConfirm={() => { setConfirmLogout(false); sessionStorage.removeItem('korobo.auth.idToken'); sessionStorage.removeItem('korobo.auth.refreshToken'); sessionStorage.removeItem('korobo.auth.user'); onNavigate('landing') }} onCancel={() => setConfirmLogout(false)} />}
    </div>
  )
}

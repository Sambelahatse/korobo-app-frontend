import { useState, type ReactNode } from 'react'
import type { Page } from '../types'
import {
  ClockIcon, GridIcon, SunCogIcon, CalendarIcon,
  BellIcon, DatabaseIcon, SettingsIcon, LogoutIcon,
} from './Icons'
import ConfirmDialog from './ConfirmDialog'
import { mockNotifications } from '../data/mockData'

interface Props {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { icon: <ClockIcon />,    page: 'dashboard'      as Page, label: 'Dashboard'       },
  { icon: <GridIcon />,     page: 'sites'          as Page, label: 'Sites'           },
  { icon: <SunCogIcon />,   page: 'planifications' as Page, label: 'Planifications'  },
  { icon: <CalendarIcon />, page: 'rapports'       as Page, label: 'Rapports'        },
  { icon: <BellIcon />,     page: 'notifications'  as Page, label: 'Notifications'   },
  { icon: <DatabaseIcon />, page: 'database'       as Page, label: 'Base de données' },
  { icon: <SettingsIcon />, page: 'settings'       as Page, label: 'Paramètres'      },
]

const pageMeta: Record<Page, { title: string; icon: ReactNode }> = {
  landing:        { title: '',                icon: null },
  dashboard:      { title: 'DASHBOARD',       icon: <ClockIcon /> },
  sites:          { title: 'SITES',           icon: <GridIcon /> },
  planifications: { title: 'PLANIFICATIONS',  icon: <SunCogIcon /> },
  rapports:       { title: 'RAPPORTS',        icon: <CalendarIcon /> },
  notifications:  { title: 'NOTIFICATIONS',   icon: <BellIcon /> },
  database:       { title: 'BASE DE DONNÉES', icon: <DatabaseIcon /> },
  settings:       { title: 'PARAMÈTRES',      icon: <SettingsIcon /> },
}

export default function AdminLayout({ children, currentPage, onNavigate }: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { title, icon } = pageMeta[currentPage]
  const unreadCount = mockNotifications.filter(n => !n.lu).length

  const handleNavigate = (page: Page) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop: fixed column | mobile: drawer ── */}
      <aside className={`
        fixed lg:relative z-40 lg:z-auto
        h-full lg:h-screen
        flex-shrink-0 bg-[#f5f7f3] border-r border-gray-200 flex flex-col
        transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-[220px] lg:w-[88px]
      `}>
        {/* Top */}
        <div className="h-[70px] flex items-center justify-between lg:justify-center px-4 lg:px-0 border-b border-gray-200">
          <button onClick={() => handleNavigate('dashboard')}
            className="bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-[11px] font-bold font-syne tracking-wide px-3 py-1.5 rounded transition-colors">
            #Admin
          </button>
          {/* Close button mobile */}
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-start lg:items-center gap-1 py-4 px-3 lg:px-0 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.page} onClick={() => handleNavigate(item.page)}
              className={[
                'relative flex items-center gap-3 lg:gap-0 lg:justify-center',
                'w-full lg:w-[52px] h-[44px] lg:h-[52px]',
                'rounded-xl px-3 lg:px-0 transition-all',
                currentPage === item.page
                  ? 'bg-[#3d6b2a] text-white shadow-md'
                  : 'text-gray-500 hover:bg-[#e8f2e3] hover:text-[#3d6b2a]',
              ].join(' ')}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="lg:hidden text-sm font-medium">{item.label}</span>
              {item.page === 'notifications' && unreadCount > 0 && (
                <span className="absolute top-1 left-7 lg:left-auto lg:-top-0.5 lg:-right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="py-4 flex items-center lg:justify-center px-3 lg:px-0 border-t border-gray-200">
          <button onClick={() => { setMobileMenuOpen(false); setConfirmLogout(true) }}
            className="flex items-center gap-3 lg:gap-0 lg:justify-center w-full lg:w-[52px] h-[44px] lg:h-[52px] px-3 lg:px-0 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogoutIcon />
            <span className="lg:hidden text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-[60px] lg:h-[70px] flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-3">
          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
            <span className="w-5 h-0.5 bg-gray-700 rounded" />
            <span className="w-5 h-0.5 bg-gray-700 rounded" />
            <span className="w-5 h-0.5 bg-gray-700 rounded" />
          </button>

          <div className="flex items-center gap-2 text-[#3d6b2a] min-w-0">
            <span className="flex-shrink-0">{icon}</span>
            <span className="font-syne font-bold text-[13px] lg:text-[15px] tracking-widest text-gray-800 truncate">{title}</span>
          </div>

          {/* Mobile notification bell shortcut */}
          <button onClick={() => handleNavigate('notifications')}
            className="lg:hidden ml-auto relative p-2 text-gray-500 hover:text-[#3d6b2a]">
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Footer bar */}
        <div className="h-1.5 lg:h-2 bg-[#3d6b2a] flex-shrink-0" />
      </div>

      {confirmLogout && (
        <ConfirmDialog
          title="Déconnexion"
          message="Êtes-vous sûr de vouloir vous déconnecter de KOROBO ?"
          confirmLabel="Se déconnecter"
          cancelLabel="Rester connecté"
          danger={false}
          onConfirm={() => { setConfirmLogout(false); onNavigate('landing') }}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </div>
  )
}

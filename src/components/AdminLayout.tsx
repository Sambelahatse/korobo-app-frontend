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
  const { title, icon } = pageMeta[currentPage]
  const unreadCount = mockNotifications.filter(n => !n.lu).length

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-[88px] flex-shrink-0 bg-[#f5f7f3] border-r border-gray-200 flex flex-col">
        <div className="h-[70px] flex items-center justify-center border-b border-gray-200">
          <button onClick={() => onNavigate('dashboard')}
            className="bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-[11px] font-bold font-syne tracking-wide px-2 py-1.5 rounded transition-colors">
            #Admin
          </button>
        </div>

        <nav className="flex-1 flex flex-col items-center gap-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.page} title={item.label} onClick={() => onNavigate(item.page)}
              className={[
                'relative w-[52px] h-[52px] flex items-center justify-center rounded-xl transition-all',
                currentPage === item.page ? 'bg-[#3d6b2a] text-white shadow-md' : 'text-gray-500 hover:bg-[#e8f2e3] hover:text-[#3d6b2a]',
              ].join(' ')}>
              {item.icon}
              {/* Notification badge */}
              {item.page === 'notifications' && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="py-4 flex justify-center border-t border-gray-200">
          <button title="Déconnexion" onClick={() => setConfirmLogout(true)}
            className="w-[52px] h-[52px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[70px] flex-shrink-0 bg-white border-b border-gray-200 flex items-center px-8">
          <div className="flex items-center gap-2.5 text-[#3d6b2a]">
            {icon}
            <span className="font-syne font-bold text-[15px] tracking-widest text-gray-800">{title}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
        <div className="h-2 bg-[#3d6b2a] flex-shrink-0" />
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

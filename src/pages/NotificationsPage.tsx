import { useState } from 'react'
import { ModernIcon, type ModernIconName } from '../components/Icons'
import { mockNotifications } from '../data/mockData'
import type { Notification } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

const typeConfig = {
  alerte:        { bg: 'bg-red-50 border-red-200',     icon: 'alert-triangle' as ModernIconName, label: 'bg-red-100 text-red-700'    },
  avertissement: { bg: 'bg-amber-50 border-amber-200', icon: 'siren' as ModernIconName,          label: 'bg-amber-100 text-amber-700' },
  info:          { bg: 'bg-blue-50 border-blue-200',   icon: 'info' as ModernIconName,          label: 'bg-blue-100 text-blue-700'   },
  succès:        { bg: 'bg-green-50 border-green-200', icon: 'check-circle' as ModernIconName,   label: 'bg-green-100 text-green-700' },
} as const

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState<Notification[]>(mockNotifications)
  const [filter,   setFilter]   = useState('toutes')
  const [clearAll, setClearAll] = useState(false)

  const filtered  = notifs.filter(n => filter === 'toutes' || n.type === filter || (filter === 'non-lues' && !n.lu))
  const nonLues   = notifs.filter(n => !n.lu).length

  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n))
  const markAllRead = ()           => setNotifs(p => p.map(n => ({ ...n, lu: true })))
  const deleteNotif = (id: string) => setNotifs(p => p.filter(n => n.id !== id))

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs  = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}min`
    if (hrs  < 24) return `${hrs}h`
    return `${days}j`
  }

  const filterLabels: Record<string, string> = {
    toutes: 'Toutes', 'non-lues': 'Non lues', alerte: 'Alertes',
    avertissement: 'Avert.', info: 'Infos', succès: 'Succès',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-sans font-bold text-xl text-gray-800">Notifications</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            {nonLues > 0
              ? <span className="text-[#4A7A3B] font-semibold">{nonLues} non lue{nonLues > 1 ? 's' : ''}</span>
              : 'Tout est lu ✓'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {nonLues > 0 && (
            <button onClick={markAllRead} className="text-xs sm:text-sm text-[#4A7A3B] hover:underline font-medium whitespace-nowrap">
              <span className="hidden sm:inline">Tout marquer comme lu</span>
              <span className="sm:hidden">Tout lire</span>
            </button>
          )}
          <button onClick={() => setClearAll(true)} className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium whitespace-nowrap">
            <span className="hidden sm:inline">Vider tout</span>
            <span className="sm:hidden">Vider</span>
          </button>
        </div>
      </div>

      {/* Filter tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-thin">
        {Object.entries(filterLabels).map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={'px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-colors ' +
              (filter === f ? 'bg-[#4A7A3B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A7A3B]')}>
            {label}{f === 'non-lues' && nonLues > 0 ? ` (${nonLues})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 max-w-3xl">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-gray-500">Aucune notification</p>
          </div>
        ) : filtered.map(n => {
          const cfg = typeConfig[n.type]
          return (
            <div key={n.id} className={'flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ' + cfg.bg + ' ' + (!n.lu ? 'shadow-sm' : 'opacity-70')}>
              <span className="w-9 h-9 rounded-xl bg-white/80 border border-black/5 flex items-center justify-center mt-0.5 flex-shrink-0 text-gray-600"><ModernIcon name={cfg.icon} size={19} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <p className="font-sans font-bold text-sm text-gray-800 leading-tight">{n.titre}</p>
                    <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded capitalize flex-shrink-0 ' + cfg.label}>{n.type}</span>
                    {!n.lu && <span className="w-2 h-2 bg-[#4A7A3B] rounded-full flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{timeAgo(n.date)}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                {n.siteNom && <p className="text-xs text-gray-400 mt-1">📍 {n.siteNom}</p>}
                <div className="flex items-center gap-4 mt-2">
                  {!n.lu && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-[#4A7A3B] hover:underline font-medium">
                      Marquer comme lu
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {clearAll && (
        <ConfirmDialog title="Vider toutes les notifications ?" danger
          message="Toutes les notifications seront supprimées définitivement."
          confirmLabel="Tout supprimer"
          onConfirm={() => { setNotifs([]); setClearAll(false) }}
          onCancel={() => setClearAll(false)} />
      )}
    </div>
  )
}

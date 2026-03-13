import { useState } from 'react'
import { mockNotifications } from '../data/mockData'
import type { Notification } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

const typeConfig = {
  alerte:         { bg: 'bg-red-50 border-red-200',     icon: '🔴', label: 'bg-red-100 text-red-700'    },
  avertissement:  { bg: 'bg-amber-50 border-amber-200', icon: '🟡', label: 'bg-amber-100 text-amber-700' },
  info:           { bg: 'bg-blue-50 border-blue-200',   icon: 'ℹ️', label: 'bg-blue-100 text-blue-700'   },
  succès:         { bg: 'bg-green-50 border-green-200', icon: '✅', label: 'bg-green-100 text-green-700' },
} as const

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<string>('toutes')
  const [clearAll, setClearAll] = useState(false)

  const filtered = notifs.filter(n => filter === 'toutes' || n.type === filter || (filter === 'non-lues' && !n.lu))
  const nonLues  = notifs.filter(n => !n.lu).length

  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n))
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, lu: true })))
  const deleteNotif = (id: string) => setNotifs(p => p.filter(n => n.id !== id))
  const clearAllFn  = () => { setNotifs([]); setClearAll(false) }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs  = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60)  return `Il y a ${mins} min`
    if (hrs  < 24)  return `Il y a ${hrs}h`
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-bold text-xl text-gray-800">Notifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {nonLues > 0 ? <span className="text-[#3d6b2a] font-semibold">{nonLues} non lue{nonLues > 1 ? 's' : ''}</span> : 'Tout est lu ✓'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {nonLues > 0 && (
            <button onClick={markAllRead} className="text-sm text-[#3d6b2a] hover:underline font-medium">
              Tout marquer comme lu
            </button>
          )}
          <button onClick={() => setClearAll(true)} className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
            Vider tout
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['toutes','non-lues','alerte','avertissement','info','succès'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f ? 'bg-[#3d6b2a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#3d6b2a]'
            }`}>
            {f}{f === 'non-lues' && nonLues > 0 ? ` (${nonLues})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-gray-500">Aucune notification</p>
          </div>
        ) : filtered.map(n => {
          const cfg = typeConfig[n.type]
          return (
            <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${cfg.bg} ${!n.lu ? 'shadow-sm' : 'opacity-70'}`}>
              <span className="text-2xl mt-0.5 flex-shrink-0">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-syne font-bold text-sm text-gray-800 ${!n.lu ? '' : 'font-semibold'}`}>{n.titre}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${cfg.label}`}>{n.type}</span>
                    {!n.lu && <span className="w-2 h-2 bg-[#3d6b2a] rounded-full flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.date)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                {n.siteNom && <p className="text-xs text-gray-400 mt-1">📍 {n.siteNom}</p>}
                <div className="flex items-center gap-4 mt-2.5">
                  {!n.lu && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-[#3d6b2a] hover:underline font-medium">
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
          message="Cette action supprimera définitivement toutes les notifications. Impossible d'annuler."
          confirmLabel="Tout supprimer"
          onConfirm={clearAllFn}
          onCancel={() => setClearAll(false)} />
      )}
    </div>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import { ModernIcon } from '../components/Icons'
import SortableHeader from '../components/SortableHeader'
import type { Site, Planification, Notification } from '../types'
import { listSites } from '../services/siteService'
import { listPlanifications } from '../services/planificationService'
import { listNotifications } from '../services/notificationService'
import { listEquipment } from '../services/equipmentService'

type DashboardEquipment = { id: string; name: string; status: 'Opérationnel' | 'À surveiller' | 'En panne' }

function StatCard({ label, value, sub, color, icon, iconTone, surface }: { label: string; value: string | number; sub: string; color: string; icon: ReactNode; iconTone: string; surface: string }) {
  return (
    <div className={`flex min-w-0 min-h-[142px] flex-col rounded-2xl border p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[150px] sm:p-4 xl:p-4 2xl:p-5 ${surface}`}>
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-xs font-medium leading-4 text-gray-500 sm:text-sm">{label}</p>
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 sm:h-9 sm:w-9 ${iconTone}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-auto min-w-0 break-words font-sans text-2xl font-bold leading-tight tracking-tight sm:text-3xl 2xl:text-4xl ${color}`}>{value}</p>
      <p className="mt-2 min-w-0 text-[11px] leading-4 text-gray-400 sm:text-xs">{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [planifications, setPlanifications] = useState<Planification[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [equipment, setEquipment] = useState<DashboardEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadErrors, setLoadErrors] = useState<string[]>([])

  useEffect(() => {
    let active = true
    async function loadDashboardData() {
      setLoading(true)
      const [sitesResult, planificationsResult, notificationsResult, equipmentResult] = await Promise.allSettled([
        listSites(),
        listPlanifications(),
        listNotifications(),
        listEquipment(),
      ])
      if (!active) return
      const errors: string[] = []
      if (sitesResult.status === 'fulfilled') setSites(sitesResult.value)
      else errors.push('sites')
      if (planificationsResult.status === 'fulfilled') setPlanifications(planificationsResult.value)
      else errors.push('interventions')
      if (notificationsResult.status === 'fulfilled') setNotifications(notificationsResult.value.notifications)
      else errors.push('notifications')
      if (equipmentResult.status === 'fulfilled') {
        setEquipment(equipmentResult.value.data.map(item => ({
          id: item.id,
          name: item.name,
          status: item.status === 'faulty' ? 'En panne' : item.status === 'warning' || item.status === 'under_maintenance' ? 'À surveiller' : 'Opérationnel',
        })))
      } else errors.push('équipements')
      setLoadErrors(errors)
      setLoading(false)
    }
    void loadDashboardData()
    return () => { active = false }
  }, [])
  const actifs      = sites.filter(s => s.statut === 'actif').length
  const maintenance = sites.filter(s => s.statut === 'maintenance').length
  const inactifs    = sites.filter(s => s.statut === 'inactif').length
  const urgences    = planifications.filter(p => p.type === 'urgence' && p.statut !== 'terminée' && p.statut !== 'annulée').length
  const nonLues     = notifications.filter(n => !n.lu).length
  const totalPuissance = sites.reduce((acc, s) => acc + s.puissance, 0)
  const equipmentDown = equipment.filter(item => item.status === 'En panne').length
  const equipmentWatch = equipment.filter(item => item.status === 'À surveiller').length

  const recent = planifications.filter(p => p.statut === 'en cours' || p.statut === 'planifiée').slice(0, 5)
  const [sortKey, setSortKey] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toggleSort = (key: string) => { if (sortKey === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDirection('asc') } }
  const sortedRecent = [...recent].sort((a, b) => {
    const values: Record<string, (item: typeof recent[number]) => string | number> = {
      site: item => item.siteNom, type: item => item.type, priorite: item => ({ basse: 1, moyenne: 2, haute: 3 }[item.priorite]),
      date: item => new Date(item.date).getTime(), technicien: item => item.technicien, statut: item => item.statut,
    }
    const get = values[sortKey] || values.date
    const av = get(a), bv = get(b)
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr', { numeric: true, sensitivity: 'base' })
    return sortDirection === 'asc' ? result : -result
  })

  const statutColor = {
    'planifiée': 'bg-blue-100 text-blue-700',
    'en cours':  'bg-amber-100 text-amber-700',
    'terminée':  'bg-green-100 text-green-700',
    'annulée':   'bg-red-100 text-red-700',
  } as const

  const prioColor = { haute: 'text-red-500', moyenne: 'text-amber-500', basse: 'text-green-500' } as const
  const typeColor = {
    préventive: 'bg-blue-50 text-blue-600',
    corrective: 'bg-orange-50 text-orange-600',
    urgence:    'bg-red-50 text-red-600',
  } as const

  return (
    <div className="min-h-full bg-[#f7f8f6] p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#5C8A42]" /><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5C8A42]">Dashboard</p></div>
          <h2 className="font-sans font-bold text-2xl lg:text-3xl tracking-tight text-[#202720]">Tableau de bord</h2>
        <p className="text-sm text-gray-500 mt-2">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-3.5 py-2 text-xs font-medium text-gray-600 shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" />Vue d’ensemble des installations</div>
      </div>

      {/* Stats — 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        <StatCard label="Sites actifs"   value={actifs}               sub={`sur ${sites.length} total`} color="text-[#4A7A3B]" icon={<ModernIcon name="zap" size={21} />} iconTone="text-[#4A7A3B] bg-emerald-100/80" surface="border-emerald-200 bg-emerald-100/80" />
        <StatCard label="Maintenance"    value={maintenance}          sub="sites à maintenir"                        color="text-amber-600"  icon={<ModernIcon name="wrench" size={21} />} iconTone="text-amber-700 bg-amber-100/80" surface="border-amber-200 bg-amber-100/80" />
        <StatCard label="Inactifs"       value={inactifs}             sub="sites à réactiver"           color="text-red-500"    icon={<ModernIcon name="alert-triangle" size={21} />} iconTone="text-rose-600 bg-rose-100/80" surface="border-rose-200 bg-rose-100/80" />
        <StatCard label="Urgences"       value={urgences}             sub="interventions urgentes"          color="text-red-600"    icon={<ModernIcon name="siren" size={21} />} iconTone="text-red-700 bg-red-100/80" surface="border-red-200 bg-red-100/80" />
        <StatCard label="Notifications"  value={nonLues}              sub="non lues"                        color="text-blue-600"   icon={<ModernIcon name="bell" size={21} />} iconTone="text-blue-700 bg-blue-100/80" surface="border-sky-200 bg-sky-100/80" />
        <StatCard label="Puissance tot." value={`${totalPuissance}kW`} sub="capacité installée"            color="text-[#3d6b2a]"  icon={<ModernIcon name="sun" size={21} />} iconTone="text-teal-700 bg-teal-100/80" surface="border-teal-200 bg-teal-100/80" />
      </div>

      {/* État du parc matériel */}
      {equipment.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Équipements suivis</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{equipment.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-700">À surveiller</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{equipmentWatch}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-rose-700">En panne</p>
            <p className="mt-2 text-2xl font-bold text-rose-700">{equipmentDown}</p>
          </div>
        </div>
      )}

      {/* Middle row — stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Répartition */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200/80">
          <div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f5ed] text-[#4A7A3B]"><ModernIcon name="building" size={19} /></span><div><h3 className="font-sans font-bold text-sm lg:text-base text-[#202720]">Répartition des sites</h3><p className="mt-0.5 text-xs text-gray-400">État actuel du parc</p></div></div>
          <div className="space-y-3">
            {[
              { label: 'Actifs',      count: actifs,      color: 'bg-[#8eb86f]', pct: sites.length ? Math.round(actifs/sites.length*100) : 0 },
              { label: 'Maintenance', count: maintenance, color: 'bg-amber-400', pct: sites.length ? Math.round(maintenance/sites.length*100) : 0 },
              { label: 'Inactifs',    count: inactifs,    color: 'bg-red-400',   pct: sites.length ? Math.round(inactifs/sites.length*100) : 0 },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-xs lg:text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-gray-50">{sites.length} sites total</p>
        </div>

        {/* Types */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200/80">
          <h3 className="font-sans font-bold text-sm lg:text-base text-[#202720] mb-4">Types d'installation</h3>
          {(() => {
            const counts: Record<string, number> = {}
            sites.forEach(s => { counts[s.typeInstallation] = (counts[s.typeInstallation] || 0) + 1 })
            const colors = ['bg-[#4A7A3B]', 'bg-[#6aad46]', 'bg-[#d4e8cb]']
            return Object.entries(counts).map(([type, count], i) => (
              <div key={type} className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${colors[i]} flex-shrink-0`} />
                <span className="text-xs lg:text-sm text-gray-600 flex-1 leading-tight">{type}</span>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            ))
          })()}
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200/80 md:col-span-2 lg:col-span-1">
          <div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f5ed] text-[#4A7A3B]"><ModernIcon name="bell" size={19} /></span><div><h3 className="font-sans font-bold text-sm lg:text-base text-[#202720]">Alertes actives</h3><p className="mt-0.5 text-xs text-gray-400">{nonLues} notifications non lues</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {notifications.filter(n => !n.lu).slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${n.type === 'alerte' ? 'border-red-100 bg-red-50 text-red-600' : n.type === 'avertissement' ? 'border-amber-100 bg-amber-50 text-amber-600' : n.type === 'succès' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-blue-100 bg-blue-50 text-blue-600'}`}><ModernIcon name={n.type === 'alerte' ? 'alert-triangle' : n.type === 'avertissement' ? 'siren' : n.type === 'succès' ? 'check-circle' : 'info'} size={18} /></span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{n.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{n.siteNom || 'Système'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p role="status" className="text-xs text-gray-500">Chargement des données du tableau de bord…</p>}
        {loadErrors.length > 0 && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Certaines données n’ont pas pu être chargées ({loadErrors.join(', ')}). Les sections concernées peuvent être incomplètes ; vérifiez votre connexion puis rechargez la page.
        </div>}
        <p className="text-xs text-gray-400">Sites, interventions, notifications et équipements sont chargés depuis l’API Korobo.</p>
      </div>

      {/* Interventions table — scrollable on mobile */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f5ed] text-[#4A7A3B]"><ModernIcon name="calendar-check" size={19} /></span><div><h3 className="font-sans font-bold text-sm lg:text-base text-[#202720]">Interventions en cours / planifiées</h3><p className="mt-0.5 text-xs text-gray-400">Suivi des opérations de maintenance</p></div></div>
          <span className="text-xs text-gray-400">{recent.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs lg:text-sm min-w-[540px]">
            <thead>
              <tr className="bg-[#f6f8f4] text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide">
                {[
                  { label: 'Site', key: 'site' }, { label: 'Type', key: 'type' },
                  { label: 'Priorité', key: 'priorite' }, { label: 'Date', key: 'date' },
                  { label: 'Technicien', key: 'technicien' }, { label: 'Statut', key: 'statut' },
                ].map(col => <SortableHeader key={col.key} label={col.label} sortKey={col.key} activeKey={sortKey} direction={sortDirection} onSort={toggleSort} className="px-4 lg:px-6 py-2.5 lg:py-3 text-left font-semibold" />)}
              </tr>
            </thead>
            <tbody>
              {!loading && sortedRecent.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Aucune intervention en cours ou planifiée.</td></tr>
              )}
              {sortedRecent.map((p, i) => (
                <tr key={p.id} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 font-medium text-gray-800 whitespace-nowrap">{p.siteNom}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`px-2 py-0.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${typeColor[p.type]}`}>{p.type}</span></td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`text-[10px] font-bold uppercase ${prioColor[p.priorite]}`}>{p.priorite}</span></td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-gray-500 whitespace-nowrap">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-gray-600 whitespace-nowrap">{p.technicien}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`px-2 py-0.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statutColor[p.statut]}`}>{p.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

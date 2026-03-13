import { mockSites, mockPlanifications, mockNotifications } from '../data/mockData'

function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub: string; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs lg:text-sm text-gray-500 font-medium">{label}</p>
          <p className={`font-syne font-bold text-2xl lg:text-3xl mt-1 ${color}`}>{value}</p>
        </div>
        <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-lg lg:text-2xl bg-gray-50 flex-shrink-0">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const actifs      = mockSites.filter(s => s.statut === 'actif').length
  const maintenance = mockSites.filter(s => s.statut === 'maintenance').length
  const inactifs    = mockSites.filter(s => s.statut === 'inactif').length
  const urgences    = mockPlanifications.filter(p => p.type === 'urgence' && p.statut !== 'terminée').length
  const nonLues     = mockNotifications.filter(n => !n.lu).length
  const totalPuissance = mockSites.reduce((acc, s) => acc + s.puissance, 0)

  const recent = mockPlanifications.filter(p => p.statut === 'en cours' || p.statut === 'planifiée').slice(0, 5)

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
      <div>
        <h2 className="font-syne font-bold text-xl lg:text-2xl text-gray-800">Tableau de bord</h2>
        <p className="text-xs lg:text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats — 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        <StatCard label="Sites actifs"   value={actifs}               sub={`sur ${mockSites.length} total`} color="text-[#3d6b2a]" icon="⚡" />
        <StatCard label="Maintenance"    value={maintenance}          sub="en cours"                        color="text-amber-600"  icon="🔧" />
        <StatCard label="Inactifs"       value={inactifs}             sub="nécessitent attention"           color="text-red-500"    icon="⚠️" />
        <StatCard label="Urgences"       value={urgences}             sub="interventions urgentes"          color="text-red-600"    icon="🚨" />
        <StatCard label="Notifications"  value={nonLues}              sub="non lues"                        color="text-blue-600"   icon="🔔" />
        <StatCard label="Puissance tot." value={`${totalPuissance}kW`} sub="capacité installée"            color="text-[#3d6b2a]"  icon="☀️" />
      </div>

      {/* Middle row — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Répartition */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <h3 className="font-syne font-bold text-sm lg:text-base text-gray-800 mb-4">Répartition des sites</h3>
          <div className="space-y-3">
            {[
              { label: 'Actifs',      count: actifs,      color: 'bg-[#6aad46]', pct: Math.round(actifs/mockSites.length*100) },
              { label: 'Maintenance', count: maintenance, color: 'bg-amber-400', pct: Math.round(maintenance/mockSites.length*100) },
              { label: 'Inactifs',    count: inactifs,    color: 'bg-red-400',   pct: Math.round(inactifs/mockSites.length*100) },
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
          <p className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-gray-50">{mockSites.length} sites total</p>
        </div>

        {/* Types */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <h3 className="font-syne font-bold text-sm lg:text-base text-gray-800 mb-4">Types d'installation</h3>
          {(() => {
            const counts: Record<string, number> = {}
            mockSites.forEach(s => { counts[s.typeInstallation] = (counts[s.typeInstallation] || 0) + 1 })
            const colors = ['bg-[#3d6b2a]', 'bg-[#6aad46]', 'bg-[#d4e8cb]']
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
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
          <h3 className="font-syne font-bold text-sm lg:text-base text-gray-800 mb-4">Alertes actives</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {mockNotifications.filter(n => !n.lu).slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                <span className="text-base mt-0.5 flex-shrink-0">
                  {n.type === 'alerte' ? '🔴' : n.type === 'avertissement' ? '🟡' : n.type === 'succès' ? '🟢' : 'ℹ️'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{n.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{n.siteNom || 'Système'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions table — scrollable on mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-syne font-bold text-sm lg:text-base text-gray-800">Interventions en cours / planifiées</h3>
          <span className="text-xs text-gray-400">{recent.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs lg:text-sm min-w-[540px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide">
                {['Site', 'Type', 'Priorité', 'Date', 'Technicien', 'Statut'].map(h => (
                  <th key={h} className="px-4 lg:px-6 py-2.5 lg:py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p, i) => (
                <tr key={p.id} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 font-medium text-gray-800 whitespace-nowrap">{p.siteNom}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${typeColor[p.type]}`}>{p.type}</span></td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`text-[10px] font-bold uppercase ${prioColor[p.priorite]}`}>{p.priorite}</span></td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-gray-500 whitespace-nowrap">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-gray-600 whitespace-nowrap">{p.technicien}</td>
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statutColor[p.statut]}`}>{p.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

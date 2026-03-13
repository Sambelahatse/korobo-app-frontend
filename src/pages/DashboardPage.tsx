import { mockSites, mockPlanifications, mockNotifications } from '../data/mockData'

function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub: string; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`font-syne font-bold text-3xl mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color.replace('text-', 'bg-').replace('[#3d6b2a]','[#e8f2e3]').replace('[#dc2626]','[#fee2e2]').replace('[#d97706]','[#fef3c7]').replace('[#2563eb]','[#dbeafe]')}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const actifs = mockSites.filter(s => s.statut === 'actif').length
  const maintenance = mockSites.filter(s => s.statut === 'maintenance').length
  const inactifs = mockSites.filter(s => s.statut === 'inactif').length
  const urgences = mockPlanifications.filter(p => p.type === 'urgence' && p.statut !== 'terminée').length
  const nonLues = mockNotifications.filter(n => !n.lu).length
  const totalPuissance = mockSites.reduce((acc, s) => acc + s.puissance, 0)

  const recent = mockPlanifications.filter(p => p.statut === 'en cours' || p.statut === 'planifiée').slice(0, 5)

  const statutColor = {
    'planifiée': 'bg-blue-100 text-blue-700',
    'en cours': 'bg-amber-100 text-amber-700',
    'terminée': 'bg-green-100 text-green-700',
    'annulée': 'bg-red-100 text-red-700',
  } as const

  const prioColor = {
    haute: 'text-red-500',
    moyenne: 'text-amber-500',
    basse: 'text-green-500',
  } as const

  const typeColor = {
    préventive: 'bg-blue-50 text-blue-600',
    corrective: 'bg-orange-50 text-orange-600',
    urgence: 'bg-red-50 text-red-600',
  } as const

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="font-syne font-bold text-2xl text-gray-800">Tableau de bord</h2>
        <p className="text-sm text-gray-400 mt-1">Vue d'ensemble de votre parc solaire — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Sites actifs"    value={actifs}       sub={`sur ${mockSites.length} total`}    color="text-[#3d6b2a]"  icon="⚡" />
        <StatCard label="En maintenance"  value={maintenance}  sub="intervention en cours"               color="text-amber-600"   icon="🔧" />
        <StatCard label="Inactifs"        value={inactifs}     sub="nécessitent attention"               color="text-red-500"     icon="⚠️" />
        <StatCard label="Urgences"        value={urgences}     sub="interventions urgentes"              color="text-red-600"     icon="🚨" />
        <StatCard label="Notifications"   value={nonLues}      sub="non lues"                            color="text-blue-600"    icon="🔔" />
        <StatCard label="Puissance tot."  value={`${totalPuissance} kW`} sub="capacité installée"       color="text-[#3d6b2a]"  icon="☀️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition statuts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-syne font-bold text-base text-gray-800 mb-4">Répartition des sites</h3>
          <div className="space-y-3">
            {[
              { label: 'Actifs', count: actifs, color: 'bg-[#6aad46]', pct: Math.round(actifs/mockSites.length*100) },
              { label: 'Maintenance', count: maintenance, color: 'bg-amber-400', pct: Math.round(maintenance/mockSites.length*100) },
              { label: 'Inactifs', count: inactifs, color: 'bg-red-400', pct: Math.round(inactifs/mockSites.length*100) },
            ].map(({ label, count, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 text-center">{mockSites.length} sites au total</p>
          </div>
        </div>

        {/* Types d'installation */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-syne font-bold text-base text-gray-800 mb-4">Types d'installation</h3>
          {(() => {
            const counts: Record<string, number> = {}
            mockSites.forEach(s => { counts[s.typeInstallation] = (counts[s.typeInstallation] || 0) + 1 })
            const colors = ['bg-[#3d6b2a]', 'bg-[#6aad46]', 'bg-[#d4e8cb]']
            return Object.entries(counts).map(([type, count], i) => (
              <div key={type} className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${colors[i]} flex-shrink-0`} />
                <span className="text-sm text-gray-600 flex-1">{type}</span>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            ))
          })()}
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-syne font-bold text-base text-gray-800 mb-4">Alertes actives</h3>
          <div className="space-y-3">
            {mockNotifications.filter(n => !n.lu).slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                <span className="text-base mt-0.5">
                  {n.type === 'alerte' ? '🔴' : n.type === 'avertissement' ? '🟡' : n.type === 'succès' ? '🟢' : 'ℹ️'}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{n.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.siteNom || 'Système'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interventions récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-syne font-bold text-base text-gray-800">Interventions en cours / planifiées</h3>
          <span className="text-xs text-gray-400">{recent.length} interventions</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-semibold">Site</th>
              <th className="px-6 py-3 text-left font-semibold">Type</th>
              <th className="px-6 py-3 text-left font-semibold">Priorité</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Technicien</th>
              <th className="px-6 py-3 text-left font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p, i) => (
              <tr key={p.id} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-3 font-medium text-gray-800">{p.siteNom}</td>
                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-md text-xs font-semibold ${typeColor[p.type]}`}>{p.type}</span></td>
                <td className="px-6 py-3"><span className={`text-xs font-bold uppercase ${prioColor[p.priorite]}`}>▲ {p.priorite}</span></td>
                <td className="px-6 py-3 text-gray-500">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-3 text-gray-600">{p.technicien}</td>
                <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statutColor[p.statut]}`}>{p.statut}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

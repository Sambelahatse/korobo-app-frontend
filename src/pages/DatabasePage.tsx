import { mockSites, mockPlanifications, mockRapports, mockNotifications } from '../data/mockData'

function TablePreview({ title, count, icon, headers, rows }: {
  title: string; count: number; icon: string
  headers: string[]; rows: (string | number)[][]
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md overflow-hidden">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg sm:text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-sans font-bold text-xs sm:text-sm text-gray-800 truncate">{title}</h3>
            <p className="text-xs text-gray-400">{count} enreg.</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-[#e8f2e3] text-[#4A7A3B] text-xs font-bold rounded-full flex-shrink-0">{count}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[360px]">
          <thead>
            <tr className="bg-gray-50">
              {headers.map(h => (
                <th key={h} className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0,4).map((row, i) => (
              <tr key={i} className={'border-t border-gray-50 ' + (i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40')}>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 truncate max-w-[140px]">{cell}</td>
                ))}
              </tr>
            ))}
            {rows.length > 4 && (
              <tr className="border-t border-gray-50">
                <td colSpan={headers.length} className="px-4 py-2.5 text-gray-400 italic text-center">
                  + {rows.length - 4} autres…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DatabasePage() {
  const totalRecords = mockSites.length + mockPlanifications.length + mockRapports.length + mockNotifications.length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <h2 className="font-sans font-bold text-xl text-gray-800">Base de données</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Vue des tables · {totalRecords} enregistrements</p>
      </div>

      {/* Stats — 2×2 mobile, 4 cols md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Sites',          count: mockSites.length,          icon: '🏗️', color: 'bg-[#e8f2e3] text-[#4A7A3B]' },
          { label: 'Planifications', count: mockPlanifications.length, icon: '📅', color: 'bg-blue-50 text-blue-700'     },
          { label: 'Rapports',       count: mockRapports.length,       icon: '📋', color: 'bg-amber-50 text-amber-700'   },
          { label: 'Notifications',  count: mockNotifications.length,  icon: '🔔', color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, count, icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ' + color}>{icon}</div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-lg sm:text-xl text-gray-800">{count}</p>
              <p className="text-xs text-gray-400 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="space-y-4 sm:space-y-5">
        <TablePreview title="TABLE: sites" count={mockSites.length} icon="🏗️"
          headers={['id','nom','localisation','statut','puissance','type']}
          rows={mockSites.map(s => [s.id, s.nom, s.localisation, s.statut, s.puissance+' kW', s.typeInstallation])} />

        <TablePreview title="TABLE: planifications" count={mockPlanifications.length} icon="📅"
          headers={['id','site','type','statut','date','technicien']}
          rows={mockPlanifications.map(p => [p.id, p.siteNom, p.type, p.statut, p.date, p.technicien])} />

        <TablePreview title="TABLE: rapports" count={mockRapports.length} icon="📋"
          headers={['id','site','type','statut','date','technicien']}
          rows={mockRapports.map(r => [r.id, r.siteNom, r.type, r.statut, r.date, r.technicien])} />

        <TablePreview title="TABLE: notifications" count={mockNotifications.length} icon="🔔"
          headers={['id','type','titre','lu','site','date']}
          rows={mockNotifications.map(n => [n.id, n.type, n.titre, n.lu ? 'oui' : 'non', n.siteNom || '-', n.date.split('T')[0]])} />
      </div>
    </div>
  )
}

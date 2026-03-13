import { mockSites, mockPlanifications, mockRapports, mockNotifications } from '../data/mockData'

function TablePreview({ title, count, icon, headers, rows }: {
  title: string; count: number; icon: string
  headers: string[]; rows: (string | number)[][]
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="font-syne font-bold text-sm text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400">{count} enregistrement{count > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#e8f2e3] text-[#3d6b2a] text-xs font-bold rounded-full">{count}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {headers.map(h => <th key={h} className="px-4 py-2.5 text-left text-gray-500 font-semibold uppercase tracking-wide">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 4).map((row, i) => (
              <tr key={i} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                {row.map((cell, j) => <td key={j} className="px-4 py-2.5 text-gray-700 truncate max-w-[160px]">{cell}</td>)}
              </tr>
            ))}
            {rows.length > 4 && (
              <tr className="border-t border-gray-50">
                <td colSpan={headers.length} className="px-4 py-2.5 text-gray-400 italic text-center">
                  + {rows.length - 4} autres enregistrements...
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
    <div className="p-8">
      <div className="mb-6">
        <h2 className="font-syne font-bold text-xl text-gray-800">Base de données</h2>
        <p className="text-sm text-gray-400 mt-0.5">Vue des tables · {totalRecords} enregistrements au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sites',           count: mockSites.length,           icon: '🏗️', color: 'bg-[#e8f2e3] text-[#3d6b2a]' },
          { label: 'Planifications',  count: mockPlanifications.length,  icon: '📅', color: 'bg-blue-50 text-blue-700'     },
          { label: 'Rapports',        count: mockRapports.length,        icon: '📋', color: 'bg-amber-50 text-amber-700'   },
          { label: 'Notifications',   count: mockNotifications.length,   icon: '🔔', color: 'bg-purple-50 text-purple-700' },
        ].map(({ label, count, icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
            <div>
              <p className="font-syne font-bold text-xl text-gray-800">{count}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="space-y-5">
        <TablePreview title="TABLE: sites" count={mockSites.length} icon="🏗️"
          headers={['id', 'nom', 'localisation', 'statut', 'puissance', 'type_installation']}
          rows={mockSites.map(s => [s.id, s.nom, s.localisation, s.statut, `${s.puissance} kW`, s.typeInstallation])} />

        <TablePreview title="TABLE: planifications" count={mockPlanifications.length} icon="📅"
          headers={['id', 'site', 'type', 'statut', 'date', 'technicien']}
          rows={mockPlanifications.map(p => [p.id, p.siteNom, p.type, p.statut, p.date, p.technicien])} />

        <TablePreview title="TABLE: rapports" count={mockRapports.length} icon="📋"
          headers={['id', 'site', 'type', 'statut', 'date', 'technicien']}
          rows={mockRapports.map(r => [r.id, r.siteNom, r.type, r.statut, r.date, r.technicien])} />

        <TablePreview title="TABLE: notifications" count={mockNotifications.length} icon="🔔"
          headers={['id', 'type', 'titre', 'lu', 'site', 'date']}
          rows={mockNotifications.map(n => [n.id, n.type, n.titre, n.lu ? 'oui' : 'non', n.siteNom || '-', n.date.split('T')[0]])} />
      </div>
    </div>
  )
}

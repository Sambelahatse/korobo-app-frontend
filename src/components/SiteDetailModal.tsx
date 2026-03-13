import type { Site } from '../types'

interface Props { site: Site; onClose: () => void; onEdit: () => void }

export default function SiteDetailModal({ site, onClose, onEdit }: Props) {
  const statutStyle = { actif: 'bg-green-100 text-green-700', inactif: 'bg-red-100 text-red-600', maintenance: 'bg-amber-100 text-amber-700' } as const
  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[200px]">{value}</span>
    </div>
  )
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#3d6b2a] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-syne font-bold text-lg text-white">{site.nom}</h2>
            <p className="text-white/70 text-sm mt-0.5">{site.localisation}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statutStyle[site.statut]}`}>{site.statut}</span>
        </div>
        <div className="p-6 space-y-1 max-h-[60vh] overflow-y-auto">
          <Row label="ID" value={site.id} />
          <Row label="Propriétaire" value={site.proprietaire} />
          <Row label="Année installation" value={site.annee} />
          <Row label="Type d'installation" value={site.typeInstallation} />
          <Row label="Puissance installée" value={`${site.puissance} kW`} />
          <Row label="Coordonnées GPS" value={site.gps} />
          <Row label="Contact 1" value={`${site.contact1Nom} — ${site.contact1Tel}`} />
          <Row label="Contact 2" value={`${site.contact2Nom} — ${site.contact2Tel}`} />
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Fermer</button>
          <button onClick={onEdit} className="flex-1 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-lg text-sm font-semibold transition-colors">Modifier</button>
        </div>
      </div>
    </div>
  )
}

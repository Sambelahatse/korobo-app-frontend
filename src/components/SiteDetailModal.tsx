import type { Site } from '../types'

interface Props { site: Site; onClose: () => void; onEdit: () => void }

export default function SiteDetailModal({ site, onClose, onEdit }: Props) {
  const statutStyle = {
    actif: 'bg-green-100 text-green-700',
    inactif: 'bg-red-100 text-red-600',
    maintenance: 'bg-amber-100 text-amber-700',
  } as const

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2.5 border-b border-gray-50 last:border-0 gap-0.5 sm:gap-4">
      <span className="text-xs text-gray-400 font-medium flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 sm:text-right">{value}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-[#3d6b2a] px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-syne font-bold text-base sm:text-lg text-white truncate">{site.nom}</h2>
            <p className="text-white/70 text-xs sm:text-sm mt-0.5 truncate">{site.localisation}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <span className={'px-2.5 py-1 rounded-full text-xs font-bold capitalize ' + statutStyle[site.statut]}>{site.statut}</span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <Row label="Identifiant"          value={site.id} />
          <Row label="Propriétaire"         value={site.proprietaire} />
          <Row label="Année installation"   value={site.annee} />
          <Row label="Type d'installation"  value={site.typeInstallation} />
          <Row label="Puissance installée"  value={site.puissance + ' kW'} />
          <Row label="Coordonnées GPS"      value={site.gps} />
          <Row label="Contact 1"            value={site.contact1Nom + ' — ' + site.contact1Tel} />
          <Row label="Contact 2"            value={site.contact2Nom + ' — ' + site.contact2Tel} />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Fermer</button>
          <button onClick={onEdit}  className="flex-1 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-lg text-sm font-semibold transition-colors">Modifier</button>
        </div>
      </div>
    </div>
  )
}

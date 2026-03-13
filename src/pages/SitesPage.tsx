import { useState } from 'react'
import type { Site } from '../types'
import { mockSites } from '../data/mockData'
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon } from '../components/Icons'
import NewSiteModal from '../components/NewSiteModal'
import SiteDetailModal from '../components/SiteDetailModal'
import ConfirmDialog from '../components/ConfirmDialog'

const ITEMS_PER_PAGE = 8

const statutStyle = {
  actif:        'bg-green-100 text-green-700',
  inactif:      'bg-red-100 text-red-600',
  maintenance:  'bg-amber-100 text-amber-700',
} as const

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
}

export default function SitesPage() {
  const [sites, setSites]           = useState<Site[]>(mockSites)
  const [search, setSearch]         = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [filterType, setFilterType] = useState<string>('tous')
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage]             = useState(1)
  const [showNewModal, setShowNewModal] = useState(false)
  const [viewSite, setViewSite]     = useState<Site | null>(null)
  const [editSite, setEditSite]     = useState<Site | null>(null)
  const [deleteSite, setDeleteSite] = useState<Site | null>(null)

  const filtered = sites.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase()) ||
      s.localisation.toLowerCase().includes(search.toLowerCase()) ||
      s.proprietaire.toLowerCase().includes(search.toLowerCase())
    const matchStatut = filterStatut === 'tous' || s.statut === filterStatut
    const matchType   = filterType   === 'tous' || s.typeInstallation === filterType
    return matchSearch && matchStatut && matchType
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const types = Array.from(new Set(sites.map(s => s.typeInstallation)))

  const handleDelete = () => {
    if (!deleteSite) return
    setSites(prev => prev.filter(s => s.id !== deleteSite.id))
    setDeleteSite(null)
  }

  return (
    <div className="p-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center border-2 border-[#3d6b2a] rounded-md overflow-hidden w-80 bg-white">
            <span className="flex items-center justify-center w-11 h-11 bg-[#3d6b2a] text-white flex-shrink-0"><SearchIcon /></span>
            <input type="text" placeholder="Rechercher sites, localisation, propriétaire..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400" />
            {search && <button onClick={() => setSearch('')} className="pr-3 text-gray-400 hover:text-gray-600 text-lg">×</button>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${showFilter ? 'bg-[#3d6b2a] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-[#3d6b2a] hover:text-[#3d6b2a]'}`}>
              <FilterIcon /> Filtres {filterStatut !== 'tous' || filterType !== 'tous' ? '●' : ''}
            </button>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-medium rounded-md transition-colors">
              <PlusIcon /> New site
            </button>
          </div>
        </div>

        {/* Filter row */}
        {showFilter && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
              <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1) }}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#3d6b2a] bg-white min-w-[140px]">
                <option value="tous">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type installation</label>
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#3d6b2a] bg-white min-w-[200px]">
                <option value="tous">Tous les types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => { setFilterStatut('tous'); setFilterType('tous'); setPage(1) }}
              className="mt-4 text-sm text-[#3d6b2a] hover:underline font-medium">
              Réinitialiser
            </button>
            <div className="ml-auto text-sm text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#5a7a4a]">
              {['#ID', 'Nom du site', 'Localisation', 'Type', 'Puissance', 'Statut', 'Contact', '#Actions'].map(col => (
                <th key={col} className="px-4 py-3.5 text-left text-white font-syne font-semibold text-[12px] tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">Aucun site trouvé</td></tr>
            ) : paginated.map((site, i) => (
              <tr key={site.id} className={`border-b border-gray-50 hover:bg-[#f0f7eb] transition-colors ${i % 2 === 1 ? 'bg-[#f9fbf7]' : 'bg-white'}`}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{site.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{site.nom}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{site.localisation}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{site.typeInstallation}</td>
                <td className="px-4 py-3 text-gray-700 text-xs font-semibold">{site.puissance} kW</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statutStyle[site.statut]}`}>{site.statut}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{site.contact1Tel}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewSite(site)} title="Voir détails"
                      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <EyeIcon size={15} />
                    </button>
                    <button onClick={() => setEditSite(site)} title="Modifier"
                      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-all">
                      <EditIcon />
                    </button>
                    <button onClick={() => setDeleteSite(site)} title="Supprimer"
                      className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Affichage {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="px-3 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">‹ Préc.</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${p === page ? 'bg-[#3d6b2a] text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="px-3 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Suiv. ›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal  && <NewSiteModal onClose={() => setShowNewModal(false)} />}
      {viewSite      && <SiteDetailModal site={viewSite} onClose={() => setViewSite(null)} onEdit={() => { setEditSite(viewSite); setViewSite(null) }} />}
      {editSite      && <NewSiteModal site={editSite} onClose={() => setEditSite(null)} />}
      {deleteSite && (
        <ConfirmDialog
          title="Supprimer ce site ?"
          message={`Vous êtes sur le point de supprimer "${deleteSite.nom}". Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteSite(null)}
        />
      )}
    </div>
  )
}

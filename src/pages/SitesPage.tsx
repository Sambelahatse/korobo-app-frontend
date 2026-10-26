import { useEffect, useState } from 'react'
import type { Site } from '../types'
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon } from '../components/Icons'
import NewSiteModal from '../components/NewSiteModal'
import SiteDetailModal from '../components/SiteDetailModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { showToast } from '../components/ToastViewport'
import SortableHeader from '../components/SortableHeader'
import ActionsMenu from '../components/ActionsMenu'
import { createSite, deleteSite as deleteSiteFromApi, listSites, updateSite } from '../services/siteService'
import { useCompanyRealtime } from '../hooks/useCompanyRealtime'

const ITEMS_PER_PAGE = 8
const STORAGE_KEY = 'korobo.sites.v1'


const statutStyle = {
  actif:       'bg-green-100 text-green-700',
  inactif:     'bg-red-100 text-red-600',
  maintenance: 'bg-amber-100 text-amber-700',
} as const

function EditIcon2() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const refreshSites = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await listSites()
      setSites(data)
      if (data.length > 0) {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* Cache facultatif. */ }
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les sites.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void refreshSites() }, [])
  useCompanyRealtime(['site', 'equipment', 'planification', 'user', 'rapport', 'notification'], () => { void refreshSites() })
  const [search, setSearch]       = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterType,   setFilterType]   = useState('tous')
  const [showFilter,   setShowFilter]   = useState(false)
  const [page,         setPage]         = useState(1)
  const [sortKey, setSortKey] = useState('nom')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toggleSort = (key: string) => { if (sortKey === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDirection('asc') } setPage(1) }
  const [showNewModal, setShowNewModal] = useState(false)
  const [viewSite,     setViewSite]     = useState<Site | null>(null)
  const [editSite,     setEditSite]     = useState<Site | null>(null)
  const [deleteSite,   setDeleteSite]   = useState<Site | null>(null)

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    return (
      (s.nom.toLowerCase().includes(q) || s.localisation.toLowerCase().includes(q) || s.proprietaire.toLowerCase().includes(q)) &&
      (filterStatut === 'tous' || s.statut === filterStatut) &&
      (filterType   === 'tous' || s.typeInstallation === filterType)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const values: Record<string, (site: Site) => string | number> = {
      id: site => site.publicId ?? '', nom: site => site.nom, localisation: site => site.localisation,
      type: site => site.typeInstallation, puissance: site => site.puissance, statut: site => site.statut,
    }
    const get = values[sortKey] || values.nom
    const av = get(a), bv = get(b)
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr', { numeric: true, sensitivity: 'base' })
    return sortDirection === 'asc' ? result : -result
  })
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const paginated  = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const types      = Array.from(new Set(sites.map(s => s.typeInstallation)))

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* ── Toolbar ── */}
      {loadError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError} <button onClick={() => void refreshSites()} className="ml-2 font-semibold underline">Réessayer</button></div>}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="flex items-center border-2 border-[#4A7A3B] rounded-md overflow-hidden flex-1 sm:flex-none sm:w-72 lg:w-80 bg-white min-w-0">
            <span className="flex items-center justify-center w-10 h-10 bg-[#4A7A3B] text-white flex-shrink-0">
              <SearchIcon size={16} />
            </span>
            <input type="text" placeholder="Rechercher..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 px-2 lg:px-3 py-2 text-sm outline-none bg-transparent placeholder-gray-400 min-w-0" />
            {search && <button onClick={() => setSearch('')} className="pr-2 text-gray-400 hover:text-gray-600">×</button>}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setShowFilter(v => !v)}
            className={`flex items-center gap-1.5 px-3 lg:px-5 py-2.5 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${showFilter ? 'bg-[#4A7A3B] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-[#4A7A3B]'}`}>
            <FilterIcon size={14} />
            <span className="hidden sm:inline">Filtres</span>
            {(filterStatut !== 'tous' || filterType !== 'tous') && <span className="text-xs">●</span>}
          </button>

          {/* New site */}
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 lg:px-5 py-2.5 bg-[#4A7A3B] hover:bg-[#5C8A42] text-white text-sm font-medium rounded-md transition-colors flex-shrink-0">
            <PlusIcon size={14} />
            <span className="hidden sm:inline">New site</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
              <select value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(1) }}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#4A7A3B] bg-white w-full sm:w-40">
                <option value="tous">Tous</option>
                <option value="actif">Actif</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-[#4A7A3B] bg-white w-full sm:w-52">
                <option value="tous">Tous les types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => { setFilterStatut('tous'); setFilterType('tous'); setPage(1) }}
              className="text-sm text-[#4A7A3B] hover:underline font-medium">Réinitialiser</button>
            <span className="sm:ml-auto text-xs text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Table (scrollable on mobile) ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[#5a7a4a]">
                {[
                  { label: 'ID', key: 'id' }, { label: 'Nom du site', key: 'nom' },
                  { label: 'Localisation', key: 'localisation' }, { label: 'Type', key: 'type' },
                  { label: 'kW', key: 'puissance' }, { label: 'Statut', key: 'statut' },
                ].map(col => <SortableHeader key={col.key} label={col.label} sortKey={col.key} activeKey={sortKey} direction={sortDirection} onSort={toggleSort} className="px-3 lg:px-4 py-3 text-left text-white font-sans font-semibold text-[11px] lg:text-[12px] tracking-wide whitespace-nowrap" />)}
                <th className="px-3 lg:px-4 py-3 text-left text-white font-sans font-semibold text-[11px] lg:text-[12px] tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">Chargement des sites…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">{loadError ? 'Les sites n’ont pas pu être chargés.' : 'Aucun site trouvé'}</td></tr>
              ) : paginated.map((site, i) => (
                <tr key={site.id} className={`border-b border-gray-50 hover:bg-[#f0f7eb] transition-colors ${i % 2 === 1 ? 'bg-[#f9fbf7]' : 'bg-white'}`}>
                  <td className="px-3 lg:px-4 py-3 font-mono text-xs text-gray-500">{site.publicId ?? '—'}</td>
                  <td className="px-3 lg:px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{site.nom}</td>
                  <td className="px-3 lg:px-4 py-3 text-gray-500 text-xs max-w-[130px] truncate">{site.localisation}</td>
                  <td className="px-3 lg:px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{site.typeInstallation}</td>
                  <td className="px-3 lg:px-4 py-3 text-gray-700 text-xs font-semibold">{site.puissance}</td>
                  <td className="px-3 lg:px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statutStyle[site.statut]}`}>
                      {site.statut}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 py-3">
                    <ActionsMenu>
                      <button onClick={() => setViewSite(site)} title="Voir"
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                        <EyeIcon size={13} />
                      </button>
                      <button onClick={() => setEditSite(site)} title="Modifier"
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all">
                        <EditIcon2 />
                      </button>
                      <button onClick={() => setDeleteSite(site)} title="Supprimer"
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        <TrashIcon />
                      </button>
                    </ActionsMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:justify-between px-4 lg:px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400 order-2 sm:order-1">
              {(currentPage-1)*ITEMS_PER_PAGE+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button onClick={() => setPage(1)} disabled={currentPage===1} className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30">«</button>
              <button onClick={() => setPage(currentPage-1)} disabled={currentPage===1} className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30">‹</button>
              {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>Math.abs(p-currentPage)<=1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${p===currentPage?'bg-[#4A7A3B] text-white':'text-gray-600 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(currentPage+1)} disabled={currentPage===totalPages} className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30">›</button>
              <button onClick={() => setPage(totalPages)} disabled={currentPage===totalPages} className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200 disabled:opacity-30">»</button>
            </div>
          </div>
        )}
      </div>

      {showNewModal && <NewSiteModal onClose={() => setShowNewModal(false)} onSave={async site => { const created = await createSite(site); setSites(current => [created, ...current.filter(item => item.id !== created.id)]); showToast('Site créé avec succès.'); setPage(1) }} />}
      {viewSite      && <SiteDetailModal site={viewSite} onClose={() => setViewSite(null)} onEdit={() => { setEditSite(viewSite); setViewSite(null) }} />}
      {editSite && <NewSiteModal site={editSite} onClose={() => setEditSite(null)} onSave={async updated => { const saved = await updateSite(updated); setSites(current => current.map(item => item.id === saved.id ? saved : item)); setEditSite(null); showToast('Site modifié avec succès.') }} />}
      {deleteSite && (
        <ConfirmDialog title="Supprimer ce site ?" danger
          message={`Supprimer "${deleteSite.nom}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={async () => { try { await deleteSiteFromApi(deleteSite.id); setSites(current => current.filter(s => s.id !== deleteSite.id)); showToast('Site supprimé.'); setPage(1); setDeleteSite(null) } catch (error) { showToast(error instanceof Error ? error.message : 'Impossible de supprimer le site.') } }}
          onCancel={() => setDeleteSite(null)} />
      )}
    </div>
  )
}

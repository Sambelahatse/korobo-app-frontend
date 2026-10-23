import { useEffect, useState } from 'react'
import type { Planification, Site } from '../types'
import { createPlanification, deletePlanification, listPlanificationSites, listPlanificationTechnicians, listPlanifications, updatePlanification } from '../services/planificationService'
import ConfirmDialog from '../components/ConfirmDialog'
import SortableHeader from '../components/SortableHeader'
import ActionsMenu from '../components/ActionsMenu'
import { showToast } from '../components/ToastViewport'

const statutStyle = {
  planifiée:  'bg-blue-100 text-blue-700',
  'en cours': 'bg-amber-100 text-amber-700',
  terminée:   'bg-green-100 text-green-700',
  annulée:    'bg-red-100 text-red-600',
} as const

const typeStyle = {
  préventive: 'bg-blue-50 text-blue-600 border border-blue-200',
  corrective: 'bg-orange-50 text-orange-600 border border-orange-200',
  urgence:    'bg-red-50 text-red-600 border border-red-200',
} as const

const prioStyle = { haute: 'text-red-500', moyenne: 'text-amber-500', basse: 'text-green-500' } as const
const prioIcon  = { haute: '▲▲', moyenne: '▲', basse: '▼' } as const

function PlanifModal({
  planif, sites, technicians, onClose, onSave,
}: {
  planif: Partial<Planification>
  sites: Site[]
  technicians: Array<{ id: string; fullName: string }>
  onClose: () => void
  onSave: (p: Planification) => void
}) {
  const isEdit = !!(planif as Planification)?.id
  const [form, setForm] = useState<Partial<Planification>>(
    Object.keys(planif).length ? planif : {
      type: 'préventive', statut: 'planifiée', priorite: 'moyenne',
      date: new Date().toISOString().split('T')[0],
      siteNom: '', technicien: '', description: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof Planification, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const handleSave = () => {
    const e: Record<string, string> = {}
    if (!form.siteNom?.trim())    e.siteNom   = 'Champ obligatoire'
    if (!form.date)               e.date       = 'Champ obligatoire'
    if (!form.technicien?.trim()) e.technicien = 'Champ obligatoire'
    if (Object.keys(e).length) { setErrors(e); return }
    const selectedSite = sites.find(site => site.id === form.siteId || site.nom === form.siteNom)
    onSave({ ...form, siteId: selectedSite?.id || form.siteId || '', siteNom: selectedSite?.nom || form.siteNom?.trim() || '', id: (form as Planification).id || 'P' + Date.now() } as Planification)
  }

  const inputCls = (err?: string) =>
    'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ' +
    (err ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#4A7A3B]')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="font-sans font-bold text-base sm:text-lg text-[#4A7A3B]">
            {isEdit ? 'Modifier' : 'Nouvelle planification'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Site *</label>
              {sites.length > 0 ? (
                <select className={inputCls(errors.siteNom) + ' bg-white'} value={form.siteId || sites.find(site => site.nom === form.siteNom)?.id || ''} onChange={e => { const site = sites.find(item => item.id === e.target.value); setForm(f => ({ ...f, siteId: site?.id || '', siteNom: site?.nom || '' })); setErrors(errors => ({ ...errors, siteNom: '' })) }}>
                  <option value="">Sélectionner un site</option>
                  {sites.map(site => <option key={site.id} value={site.id}>{site.nom}</option>)}
                </select>
              ) : (
                <input className={inputCls(errors.siteNom)} value={form.siteNom || ''} onChange={e => set('siteNom', e.target.value)} placeholder="Nom du site" />
              )}
              {errors.siteNom && <p className="text-xs text-red-500">{errors.siteNom}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Date *</label>
              <input type="date" className={inputCls(errors.date)} value={form.date || ''} onChange={e => set('date', e.target.value)} />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Type</label>
              <select className={inputCls() + ' appearance-none bg-white'} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="préventive">Préventive</option>
                <option value="corrective">Corrective</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Priorité</label>
              <select className={inputCls() + ' appearance-none bg-white'} value={form.priorite} onChange={e => set('priorite', e.target.value)}>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Statut</label>
              <select className={inputCls() + ' appearance-none bg-white'} value={form.statut} onChange={e => set('statut', e.target.value)}>
                <option value="planifiée">Planifiée</option>
                <option value="en cours">En cours</option>
                <option value="terminée">Terminée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Technicien *</label>
            <select className={inputCls(errors.technicien) + ' bg-white'} value={form.technicien || ''} onChange={e => set('technicien', e.target.value)}>
              <option value="">Sélectionner un technicien</option>
              {technicians.map(technician => <option key={technician.id} value={technician.fullName}>{technician.fullName}</option>)}
            </select>
            {errors.technicien && <p className="text-xs text-red-500">{errors.technicien}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea className={inputCls() + ' resize-none'} rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Décrire l'intervention..." />
          </div>
        </div>
        <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-[#4A7A3B] hover:bg-[#5C8A42] text-white rounded-lg text-sm font-semibold transition-colors">{isEdit ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </div>
    </div>
  )
}

export default function PlanificationsPage() {
  const [items, setItems] = useState<Planification[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [technicians, setTechnicians] = useState<Array<{ id: string; fullName: string }>>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [planifications, availableSites, availableTechnicians] = await Promise.all([listPlanifications(), listPlanificationSites(), listPlanificationTechnicians()])
      setItems(planifications)
      setSites(availableSites)
      setTechnicians(availableTechnicians)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger les planifications.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void refresh() }, [])
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterType,   setFilterType]   = useState('tous')
  const [search,       setSearch]       = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [editItem,     setEditItem]     = useState<Planification | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const editId = params.get('edit')
    if (!editId) return
    const target = items.find(item => item.id === editId)
    if (target) {
      setEditItem(target)
      setShowModal(false)
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/planifications')
  }, [items])
  const [deleteItem,   setDeleteItem]   = useState<Planification | null>(null)
  const [viewMode,     setViewMode]     = useState<'cards'|'list'>('cards')
  const [sortKey, setSortKey] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toggleSort = (key: string) => { if (sortKey === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDirection('asc') } }

  const filtered = items.filter(p => {
    const q = search.toLowerCase()
    return (p.siteNom.toLowerCase().includes(q) || p.technicien.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (filterStatut === 'tous' || p.statut === filterStatut) &&
      (filterType   === 'tous' || p.type   === filterType)
  })

  const sorted = [...filtered].sort((a, b) => {
    const values: Record<string, (item: Planification) => string | number> = {
      site: item => item.siteNom, type: item => item.type, priorite: item => ({ basse: 1, moyenne: 2, haute: 3 }[item.priorite]),
      date: item => new Date(item.date).getTime(), technicien: item => item.technicien, statut: item => item.statut,
    }
    const get = values[sortKey] || values.date
    const av = get(a), bv = get(b)
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr', { numeric: true, sensitivity: 'base' })
    return sortDirection === 'asc' ? result : -result
  })

  const handleSave = async (p: Planification) => {
    try {
      const exists = items.some(x => x.id === p.id)
      const saved = exists ? await updatePlanification(p) : await createPlanification(p)
      setItems(prev => exists ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev])
      showToast(exists ? 'Planification mise à jour.' : 'Planification créée.')
      setShowModal(false); setEditItem(null)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible d’enregistrer la planification.', 'error')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-sans font-bold text-xl text-gray-800">Planifications</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{items.length} interventions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 bg-[#4A7A3B] hover:bg-[#5C8A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex-shrink-0">
          <span>+</span>
          <span className="hidden sm:inline">Nouvelle planification</span>
          <span className="sm:hidden">Nouvelle</span>
        </button>
      </div>

      {loadError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError} <button className="ml-2 font-semibold underline" onClick={() => void refresh()}>Réessayer</button></div>}
      {loading && <div className="mb-4 rounded-lg bg-white px-4 py-3 text-sm text-gray-500">Chargement des planifications…</div>}
      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A7A3B] flex-1 sm:w-48 sm:flex-none" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4A7A3B] bg-white">
            <option value="tous">Tous types</option>
            <option value="préventive">Préventive</option>
            <option value="corrective">Corrective</option>
            <option value="urgence">Urgence</option>
          </select>
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden ml-auto sm:ml-0">
            <button onClick={() => setViewMode('cards')} className={`px-2.5 py-2 transition-colors ${viewMode === 'cards' ? 'bg-[#4A7A3B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`px-2.5 py-2 transition-colors ${viewMode === 'list' ? 'bg-[#4A7A3B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>
        {/* Statut pills — horizontal scroll mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {(['tous','planifiée','en cours','terminée','annulée'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors flex-shrink-0 ' +
                (filterStatut === s ? 'bg-[#4A7A3B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A7A3B]')}>
              {s === 'tous' ? 'Tous' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400"><p className="text-4xl mb-3">📅</p><p className="font-semibold">Aucune planification</p></div>
          ) : sorted.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={'text-xs font-semibold px-2 py-1 rounded-md ' + typeStyle[p.type]}>{p.type}</span>
                  <p className={'text-xs font-bold mt-1.5 ' + prioStyle[p.priorite]}>{prioIcon[p.priorite]} Priorité {p.priorite}</p>
                </div>
                <span className={'px-2 py-1 rounded-full text-[10px] font-semibold ' + statutStyle[p.statut]}>{p.statut}</span>
              </div>
              <h3 className="font-sans font-bold text-sm text-gray-800 mb-1">{p.siteNom}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span>📅 {new Date(p.date).toLocaleDateString('fr-FR')}</span>
                <span className="truncate max-w-[120px]">👷 {p.technicien}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditItem(p)} className="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:border-[#4A7A3B] hover:text-[#4A7A3B] transition-colors">Modifier</button>
                <button onClick={() => setDeleteItem(p)} className="flex-1 py-1.5 text-xs font-medium border border-red-100 rounded-md text-red-500 hover:bg-red-50 transition-colors">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-[#5a7a4a] text-white text-[11px] uppercase tracking-wide">
                  {[
                    { label: 'Site', key: 'site' }, { label: 'Type', key: 'type' },
                    { label: 'Priorité', key: 'priorite' }, { label: 'Date', key: 'date' },
                    { label: 'Technicien', key: 'technicien' }, { label: 'Statut', key: 'statut' },
                  ].map(col => <SortableHeader key={col.key} label={col.label} sortKey={col.key} activeKey={sortKey} direction={sortDirection} onSort={toggleSort} className="px-4 py-3 text-left font-semibold" />)}
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Aucune planification</td></tr>
                ) : sorted.map((p, i) => (
                  <tr key={p.id} className={'border-b border-gray-50 hover:bg-gray-50/80 transition-colors ' + (i % 2 === 1 ? 'bg-gray-50/40' : '')}>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{p.siteNom}</td>
                    <td className="px-4 py-3"><span className={'text-[10px] font-semibold px-2 py-0.5 rounded-md ' + typeStyle[p.type]}>{p.type}</span></td>
                    <td className="px-4 py-3"><span className={'text-[10px] font-bold ' + prioStyle[p.priorite]}>{p.priorite}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{p.technicien}</td>
                    <td className="px-4 py-3"><span className={'px-2 py-0.5 rounded-full text-[10px] font-semibold ' + statutStyle[p.statut]}>{p.statut}</span></td>
                    <td className="px-4 py-3">
                      <ActionsMenu>
                        <button onClick={() => setEditItem(p)} className="px-2.5 py-1 text-[10px] font-medium border border-gray-200 rounded text-gray-600 hover:border-[#4A7A3B] hover:text-[#4A7A3B] transition-colors">Modifier</button>
                        <button onClick={() => setDeleteItem(p)} className="px-2.5 py-1 text-[10px] font-medium border border-red-100 rounded text-red-500 hover:bg-red-50 transition-colors">Suppr.</button>
                      </ActionsMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showModal || editItem) && (
        <PlanifModal planif={editItem ?? {}} sites={sites} technicians={technicians} onClose={() => { setShowModal(false); setEditItem(null) }} onSave={handleSave} />
      )}
      {deleteItem && (
        <ConfirmDialog title="Supprimer cette planification ?" danger
          message={'Supprimer "' + deleteItem.siteNom + '" du ' + new Date(deleteItem.date).toLocaleDateString('fr-FR') + ' ?'}
          confirmLabel="Supprimer"
          onConfirm={async () => { try { await deletePlanification(deleteItem.id); setItems(p => p.filter(x => x.id !== deleteItem.id)); showToast('Planification supprimée.'); setDeleteItem(null) } catch (error) { showToast(error instanceof Error ? error.message : 'Impossible de supprimer la planification.', 'error') } }}
          onCancel={() => setDeleteItem(null)} />
      )}
    </div>
  )
}

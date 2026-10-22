import { useEffect, useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'
import SortableHeader from '../components/SortableHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { mockSites } from '../data/mockData'
import { showToast } from '../components/ToastViewport'
import type { Site } from '../types'

type EquipmentStatus = 'Opérationnel' | 'À surveiller' | 'En panne'
type Equipment = { id: string; name: string; category: string; site: string; serial: string; power: string; status: EquipmentStatus; updated: string }

const initialEquipment: Equipment[] = [
  { id: 'EQ-001', name: 'Onduleur hybride', category: 'Onduleur', site: 'Site Andohalo A', serial: 'INV-AND-001', power: '15 kW', status: 'Opérationnel', updated: '12/10/2026' },
  { id: 'EQ-002', name: 'Banc de batteries lithium', category: 'Batterie', site: 'Site Ampitatafika', serial: 'BAT-AMP-014', power: '10 kWh', status: 'À surveiller', updated: '15/10/2026' },
  { id: 'EQ-003', name: 'Champ photovoltaïque', category: 'Panneau solaire', site: 'Site Analakely B', serial: 'PV-ANA-002', power: '10 kWc', status: 'En panne', updated: '15/10/2026' },
  { id: 'EQ-004', name: 'Contrôleur de charge MPPT', category: 'Contrôleur', site: 'Site Mahamasina', serial: 'MPPT-MAH-013', power: '120 A', status: 'Opérationnel', updated: '10/10/2026' },
  { id: 'EQ-005', name: 'Onduleur réseau', category: 'Onduleur', site: 'Site Ankorondrano', serial: 'INV-ANK-012', power: '25 kW', status: 'Opérationnel', updated: '08/10/2026' },
  { id: 'EQ-006', name: 'Capteur de température', category: 'Capteur', site: 'Site Tsimbazaza', serial: 'TMP-TSI-008', power: '12 V', status: 'À surveiller', updated: '14/10/2026' },
]
const STORAGE_KEY = 'korobo.equipment.v1'

function loadEquipment(): Equipment[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return initialEquipment
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed as Equipment[] : initialEquipment
  } catch {
    return initialEquipment
  }
}

function loadSiteNames(): string[] {
  try {
    const stored = window.localStorage.getItem('korobo.sites.v1')
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const names = (parsed as Site[]).map(item => item.nom).filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        if (names.length) return names
      }
    }
  } catch {
    // Use demonstration sites when local storage is unavailable or invalid.
  }
  return mockSites.map(item => item.nom)
}
const statusStyle: Record<EquipmentStatus, string> = {
  'Opérationnel': 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'À surveiller': 'bg-amber-50 text-amber-700 ring-amber-600/15',
  'En panne': 'bg-rose-50 text-rose-700 ring-rose-600/15',
}
const inputCls = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-[#5C8A42] focus:ring-2 focus:ring-[#5C8A42]/15'

export default function EquipementsPage() {
  const [items, setItems] = useState<Equipment[]>(loadEquipment)
  const [siteOptions] = useState<string[]>(loadSiteNames)
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Impossible de sauvegarder les équipements localement.', error)
    }
  }, [items])
  const [status, setStatus] = useState('Tous')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toggleSort = (key: string) => { if (sortKey === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDirection('asc') } }
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [name, setName] = useState('')
  const [site, setSite] = useState('Site Andohalo A')
  const [category, setCategory] = useState('Onduleur')
  const [power, setPower] = useState('')
  const [serial, setSerial] = useState('')
  const [formStatus, setFormStatus] = useState<EquipmentStatus>('Opérationnel')
  const [formError, setFormError] = useState('')

  const openCreate = () => {
    setEditing(null); setName(''); setSite('Site Andohalo A'); setCategory('Onduleur')
    setPower(''); setSerial(''); setFormStatus('Opérationnel'); setFormError(''); setShowForm(true)
  }
  const openEdit = (item: Equipment) => {
    setEditing(item); setName(item.name); setSite(item.site); setCategory(item.category)
    setPower(item.power); setSerial(item.serial); setFormStatus(item.status); setFormError(''); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setFormError('') }

  const filtered = useMemo(() => items.filter(item =>
    (status === 'Tous' || item.status === status) &&
    [item.name, item.site, item.serial, item.category].some(v => v.toLowerCase().includes(query.toLowerCase()))
  ), [items, query, status])
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const values: Record<string, (item: Equipment) => string | number> = {
      name: item => item.name, site: item => item.site, serial: item => item.serial,
      power: item => Number.parseFloat(item.power) || 0, status: item => item.status,
      updated: item => { const [day, month, year] = item.updated.split('/').map(Number); return new Date(year, month - 1, day).getTime() },
    }
    const get = values[sortKey] || values.name
    const av = get(a), bv = get(b)
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'fr', { numeric: true, sensitivity: 'base' })
    return sortDirection === 'asc' ? result : -result
  }), [filtered, sortKey, sortDirection])
  const operational = items.filter(i => i.status === 'Opérationnel').length
  const watch = items.filter(i => i.status === 'À surveiller').length
  const broken = items.filter(i => i.status === 'En panne').length

  const saveEquipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !serial.trim() || !power.trim()) { setFormError('Renseignez le nom, la référence et la puissance.'); return }
    const values = { name: name.trim(), category, site, serial: serial.trim(), power: power.trim(), status: formStatus, updated: new Date().toLocaleDateString('fr-FR') }
    if (editing) { setItems(prev => prev.map(item => item.id === editing.id ? { ...item, ...values } : item)); showToast('Équipement modifié avec succès.') }
    else { setItems(prev => [{ id: `EQ-${String(Math.max(0, ...prev.map(item => Number(item.id.split('-')[1]) || 0)) + 1).padStart(3, '0')}`, ...values }, ...prev]); showToast('Équipement ajouté avec succès.') }
    closeForm()
  }

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Parc technique</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Équipements & matériels</h1><p className="mt-2 text-sm text-gray-500">Suivez l’état des équipements installés sur vos sites photovoltaïques.</p></div>
      <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A7A3B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d672f]"><span className="text-lg leading-none">+</span> Ajouter un équipement</button>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[{label:'Équipements suivis',value:items.length,tone:'text-gray-900',icon:'database' as const},{label:'Opérationnels',value:operational,tone:'text-emerald-700',icon:'check-circle' as const},{label:'À contrôler / en panne',value:watch+broken,tone:'text-amber-700',icon:'alert-triangle' as const}].map(card=><div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={card.icon} size={22}/></div><div><p className="text-sm text-gray-500">{card.label}</p><p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p></div></div>)}
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-gray-900">Inventaire des équipements</h2><p className="mt-1 text-xs text-gray-500">{filtered.length} résultat(s)</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un équipement…" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42] sm:w-64"/><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option>Tous</option><option>Opérationnel</option><option>À surveiller</option><option>En panne</option></select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500"><tr>{[{label:'Équipement',key:'name'},{label:'Site',key:'site'},{label:'Référence',key:'serial'},{label:'Puissance',key:'power'},{label:'État',key:'status'},{label:'Dernière mise à jour',key:'updated'}].map(col=><SortableHeader key={col.key} label={col.label} sortKey={col.key} activeKey={sortKey} direction={sortDirection} onSort={toggleSort} className="px-5 py-3.5 font-semibold"/>) }<th className="px-5 py-3.5 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{sorted.map(item=><tr key={item.id} className="transition hover:bg-gray-50/70"><td className="px-5 py-4"><div className="font-semibold text-gray-900">{item.name}</div><div className="mt-1 text-xs text-gray-500">{item.category}</div></td><td className="px-5 py-4 text-gray-600">{item.site}</td><td className="px-5 py-4 font-mono text-xs text-gray-500">{item.serial}</td><td className="px-5 py-4 text-gray-700">{item.power}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[item.status]}`}>{item.status}</span></td><td className="px-5 py-4 text-gray-500">{item.updated}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><button onClick={()=>openEdit(item)} title="Modifier l’équipement" className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#5C8A42] hover:text-[#4A7A3B]">Modifier</button><button onClick={()=>setDeleteTarget(item)} title="Supprimer l’équipement" className="rounded-lg border border-rose-100 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50">Supprimer</button></div></td></tr>)}</tbody></table></div>
      {filtered.length===0 && <div className="p-10 text-center text-sm text-gray-500">Aucun équipement ne correspond à votre recherche.</div>}
    </div>
    <p className="text-xs text-gray-400">Données de démonstration : les modifications sont conservées sur cet appareil et ne sont pas synchronisées avec une API.</p>
    {deleteTarget && <ConfirmDialog title="Supprimer cet équipement ?" message={`Voulez-vous vraiment supprimer « ${deleteTarget.name} » ? Cette action est irréversible sur cet appareil.`} confirmLabel="Supprimer" danger onConfirm={() => { setItems(prev => prev.filter(item => item.id !== deleteTarget.id)); showToast('Équipement supprimé.'); setDeleteTarget(null) }} onCancel={() => setDeleteTarget(null)} />}
    {showForm && <Modal title={editing ? 'Modifier un équipement' : 'Ajouter un équipement'} description="Renseignez les informations de l’équipement." onClose={closeForm} size="lg">
      <form onSubmit={saveEquipment} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">Nom de l’équipement<input required value={name} onChange={e=>setName(e.target.value)} className={inputCls} placeholder="Ex. Onduleur hybride"/></label>
          <label className="text-sm font-semibold text-gray-700">Catégorie<select value={category} onChange={e=>setCategory(e.target.value)} className={inputCls}>{['Onduleur','Batterie','Panneau solaire','Contrôleur','Capteur','Autre'].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Site<select value={site} onChange={e=>setSite(e.target.value)} className={inputCls}>{Array.from(new Set([...siteOptions, site])).filter(Boolean).map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Référence / numéro de série<input required value={serial} onChange={e=>setSerial(e.target.value)} className={inputCls} placeholder="EQ-XXX"/></label>
          <label className="text-sm font-semibold text-gray-700">Puissance / capacité<input required value={power} onChange={e=>setPower(e.target.value)} className={inputCls} placeholder="Ex. 10 kW"/></label>
          <label className="text-sm font-semibold text-gray-700">État<select value={formStatus} onChange={e=>setFormStatus(e.target.value as EquipmentStatus)} className={inputCls}><option>Opérationnel</option><option>À surveiller</option><option>En panne</option></select></label>
        </div>
        {formError && <p role="alert" className="text-sm text-rose-600">{formError}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button><button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f]">{editing ? 'Enregistrer les modifications' : 'Ajouter l’équipement'}</button></div>
      </form>
    </Modal>}
  </div>
}

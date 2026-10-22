import { useCallback, useEffect, useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { showToast } from '../components/ToastViewport'
import {
  archiveEquipment, createEquipment, createMaintenance, getEquipmentDetails, getEquipmentLookups,
  listEquipment, recordEquipmentMovement, updateEquipment, updateMaintenance,
  type EquipmentDetails, type EquipmentInput, type EquipmentMaintenance, type EquipmentRecord,
  type EquipmentSite, type EquipmentUser, type EquipmentStatus, type TrackingMode,
} from '../services/equipmentService'

const statusLabels: Record<EquipmentStatus, string> = {
  operational: 'Opérationnel', warning: 'À surveiller', faulty: 'En panne',
  under_maintenance: 'En maintenance', retired: 'Retiré',
}
const statusStyle: Record<EquipmentStatus, string> = {
  operational: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  faulty: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  under_maintenance: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  retired: 'bg-gray-100 text-gray-600 ring-gray-500/15',
}
const inputCls = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-[#5C8A42] focus:ring-2 focus:ring-[#5C8A42]/15'
const buttonCls = 'rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#5C8A42] hover:text-[#4A7A3B]'
const emptyForm = {
  siteId: '', name: '', category: 'Onduleur', brand: '', model: '', serialNumber: '',
  trackingMode: 'individual' as TrackingMode, quantity: 1, unit: 'unité',
  status: 'operational' as EquipmentStatus, assignedToId: '', installedAt: '', nextMaintenanceAt: '', notes: '',
}
type FormValues = typeof emptyForm
type MovementType = 'stock_in' | 'stock_out' | 'assign' | 'unassign' | 'transfer'
const movementLabels: Record<MovementType, string> = {
  stock_in: 'Entrée de stock', stock_out: 'Sortie de stock', assign: 'Affecter', unassign: 'Désaffecter', transfer: 'Transférer vers un autre site',
}
const maintenanceStatus: Record<EquipmentMaintenance['status'], string> = {
  planned: 'Planifiée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée',
}

function dateLabel(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR')
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.'
}

export default function EquipementsPage() {
  const [items, setItems] = useState<EquipmentRecord[]>([])
  const [sites, setSites] = useState<EquipmentSite[]>([])
  const [users, setUsers] = useState<EquipmentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EquipmentRecord | null>(null)
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<EquipmentRecord | null>(null)
  const [movementTarget, setMovementTarget] = useState<EquipmentRecord | null>(null)
  const [movementType, setMovementType] = useState<MovementType>('assign')
  const [movementQuantity, setMovementQuantity] = useState(1)
  const [movementUser, setMovementUser] = useState('')
  const [movementSite, setMovementSite] = useState('')
  const [movementNotes, setMovementNotes] = useState('')
  const [maintenanceTarget, setMaintenanceTarget] = useState<EquipmentRecord | null>(null)
  const [maintenanceTitle, setMaintenanceTitle] = useState('')
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective'>('preventive')
  const [maintenancePriority, setMaintenancePriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [maintenanceAssignedTo, setMaintenanceAssignedTo] = useState('')
  const [details, setDetails] = useState<EquipmentDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const refresh = useCallback(async () => {
    const lookups = await getEquipmentLookups()
    const result = await listEquipment()
    setSites(lookups.sites)
    setUsers(lookups.users)
    setItems(result.data)
    setForm(current => ({ ...current, siteId: current.siteId || lookups.sites[0]?.id || '' }))
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const lookups = await getEquipmentLookups()
        const result = await listEquipment()
        if (!active) return
        setSites(lookups.sites)
        setUsers(lookups.users)
        setItems(result.data)
        setForm(current => ({ ...current, siteId: current.siteId || lookups.sites[0]?.id || '' }))
      } catch (error) {
        if (active) showToast(errorMessage(error), 'error')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    const q = query.trim().toLocaleLowerCase()
    const matchesQuery = !q || [item.name, item.category, item.brand ?? '', item.model ?? '', item.serialNumber ?? '', item.site?.name ?? '']
      .some(value => value.toLocaleLowerCase().includes(q))
    return matchesQuery &&
      (statusFilter === 'all' || item.status === statusFilter) &&
      (modeFilter === 'all' || item.trackingMode === modeFilter) &&
      (siteFilter === 'all' || item.siteId === siteFilter)
  }), [items, query, statusFilter, modeFilter, siteFilter])

  const operational = items.filter(item => item.status === 'operational').length
  const attention = items.filter(item => ['warning', 'faulty', 'under_maintenance'].includes(item.status)).length
  const availableUnits = items.filter(item => item.trackingMode === 'quantity').reduce((sum, item) => sum + item.availableQuantity, 0)
  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, siteId: sites[0]?.id ?? '' })
    setFormOpen(true)
  }
  const openEdit = (item: EquipmentRecord) => {
    setEditing(item)
    setForm({
      siteId: item.siteId, name: item.name, category: item.category, brand: item.brand ?? '', model: item.model ?? '',
      serialNumber: item.serialNumber ?? '', trackingMode: item.trackingMode, quantity: item.quantity, unit: item.unit,
      status: item.status, assignedToId: item.assignedToId ?? '', installedAt: item.installedAt?.slice(0, 10) ?? '',
      nextMaintenanceAt: item.nextMaintenanceAt?.slice(0, 10) ?? '', notes: item.notes ?? '',
    })
    setFormOpen(true)
  }
  const setField = <K extends keyof FormValues,>(key: K, value: FormValues[K]) => setForm(current => ({ ...current, [key]: value }))

  const saveEquipment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.siteId) { showToast('Créez ou synchronisez un site avant d’ajouter un équipement.', 'error'); return }
    if (form.trackingMode === 'individual' && !form.serialNumber.trim()) { showToast('Le numéro de série est obligatoire pour un équipement individuel.', 'error'); return }
    if (form.trackingMode === 'quantity' && form.quantity < 1) { showToast('La quantité doit être supérieure à zéro.', 'error'); return }
    const input: EquipmentInput = {
      siteId: form.siteId, name: form.name.trim(), category: form.category, brand: form.brand.trim() || null,
      model: form.model.trim() || null, serialNumber: form.trackingMode === 'individual' ? form.serialNumber.trim() : null,
      trackingMode: form.trackingMode, quantity: form.trackingMode === 'individual' ? 1 : Number(form.quantity),
      unit: form.unit.trim() || 'unité', status: form.status, assignedToId: form.assignedToId || null,
      installedAt: form.installedAt || null, nextMaintenanceAt: form.nextMaintenanceAt || null, notes: form.notes.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) await updateEquipment(editing.id, input)
      else await createEquipment(input)
      await refresh()
      showToast(editing ? 'Équipement modifié avec succès.' : 'Équipement ajouté avec succès.')
      setFormOpen(false)
    } catch (error) { showToast(errorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const archive = async () => {
    if (!deleteTarget) return
    try {
      await archiveEquipment(deleteTarget.id)
      await refresh()
      showToast('Équipement archivé. Son historique est conservé.')
    } catch (error) { showToast(errorMessage(error), 'error') }
    finally { setDeleteTarget(null) }
  }

  const openMovement = (item: EquipmentRecord) => {
    setMovementTarget(item)
    setMovementType(item.trackingMode === 'individual' ? (item.assignedToId ? 'unassign' : 'assign') : 'stock_in')
    setMovementQuantity(1)
    setMovementUser('')
    setMovementSite(sites.find(site => site.id !== item.siteId)?.id ?? '')
    setMovementNotes('')
  }
  const saveMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!movementTarget) return
    try {
      await recordEquipmentMovement(movementTarget.id, {
        type: movementType, quantity: movementQuantity,
        ...(movementType === 'assign' && movementUser ? { toUserId: movementUser } : {}),
        ...(movementType === 'transfer' && movementSite ? { toSiteId: movementSite } : {}),
        notes: movementNotes.trim() || undefined,
      })
      await refresh()
      showToast('Mouvement enregistré et ajouté à l’historique.')
      setMovementTarget(null)
    } catch (error) { showToast(errorMessage(error), 'error') }
  }

  const openMaintenance = (item: EquipmentRecord) => {
    setMaintenanceTarget(item); setMaintenanceTitle(''); setMaintenanceType('preventive')
    setMaintenancePriority('medium'); setMaintenanceDate(''); setMaintenanceAssignedTo('')
  }
  const saveMaintenance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!maintenanceTarget) return
    try {
      await createMaintenance(maintenanceTarget.id, {
        title: maintenanceTitle.trim(), maintenanceType, priority: maintenancePriority, status: 'planned',
        scheduledAt: maintenanceDate || null, assignedToId: maintenanceAssignedTo || null,
      })
      await refresh()
      showToast('Intervention de maintenance planifiée.')
      setMaintenanceTarget(null)
    } catch (error) { showToast(errorMessage(error), 'error') }
  }
  const openDetails = async (item: EquipmentRecord) => {
    setDetailsLoading(true)
    try { setDetails(await getEquipmentDetails(item.id)) }
    catch (error) { showToast(errorMessage(error), 'error') }
    finally { setDetailsLoading(false) }
  }
  const changeMaintenanceStatus = async (maintenance: EquipmentMaintenance, status: EquipmentMaintenance['status']) => {
    try {
      await updateMaintenance(maintenance.id, { status })
      if (details) setDetails(await getEquipmentDetails(details.id))
      await refresh()
      showToast(status === 'completed' ? 'Maintenance terminée et enregistrée.' : 'Intervention mise à jour.')
    } catch (error) { showToast(errorMessage(error), 'error') }
  }

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Parc technique</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Équipements & matériels</h1>
        <p className="mt-2 text-sm text-gray-500">Inventaire centralisé, affectations, stock et maintenance des sites photovoltaïques.</p>
      </div>
      <button onClick={openCreate} disabled={!sites.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A7A3B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d672f] disabled:cursor-not-allowed disabled:opacity-50">
        <span className="text-lg leading-none">+</span> Ajouter un équipement
      </button>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Équipements suivis', value: items.length, icon: 'database' as const, tone: 'text-gray-900' },
        { label: 'Opérationnels', value: operational, icon: 'check-circle' as const, tone: 'text-emerald-700' },
        { label: 'À contrôler / en panne', value: attention, icon: 'alert-triangle' as const, tone: 'text-amber-700' },
        { label: 'Unités disponibles en stock', value: availableUnits, icon: 'database' as const, tone: 'text-[#4A7A3B]' },
      ].map(card => <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={card.icon} size={22} /></div>
        <div><p className="text-sm text-gray-500">{card.label}</p><p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p></div>
      </div>)}
    </div>

    {!sites.length && !loading && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Aucun site n’est disponible dans la base de données. Ouvrez d’abord le module Sites avec un compte administrateur ou responsable pour synchroniser les sites existants.</div>}

    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div><h2 className="font-bold text-gray-900">Inventaire des équipements</h2><p className="mt-1 text-xs text-gray-500">{filtered.length} résultat(s)</p></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nom, référence, marque…" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]" />
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]">
            <option value="all">Tous les états</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={modeFilter} onChange={event => setModeFilter(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]">
            <option value="all">Tous les modes de suivi</option><option value="individual">Par numéro de série</option><option value="quantity">Par quantité</option>
          </select>
          <select value={siteFilter} onChange={event => setSiteFilter(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]">
            <option value="all">Tous les sites</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500"><tr>
            <th className="px-5 py-3.5 font-semibold">Équipement</th><th className="px-5 py-3.5 font-semibold">Site</th>
            <th className="px-5 py-3.5 font-semibold">Suivi / référence</th><th className="px-5 py-3.5 font-semibold">Stock</th>
            <th className="px-5 py-3.5 font-semibold">État</th><th className="px-5 py-3.5 font-semibold">Responsable</th><th className="px-5 py-3.5 font-semibold">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => <tr key={item.id} className="transition hover:bg-gray-50/70">
              <td className="px-5 py-4"><div className="font-semibold text-gray-900">{item.name}</div><div className="mt-1 text-xs text-gray-500">{item.category}{item.brand ? ` · ${item.brand}` : ''}{item.model ? ` ${item.model}` : ''}</div></td>
              <td className="px-5 py-4 text-gray-600">{item.site?.name ?? sites.find(site => site.id === item.siteId)?.name ?? 'Site inconnu'}</td>
              <td className="px-5 py-4"><div className="text-gray-700">{item.trackingMode === 'individual' ? 'Individuel' : 'Par quantité'}</div><div className="mt-1 font-mono text-xs text-gray-500">{item.serialNumber ?? '—'}</div></td>
              <td className="px-5 py-4"><div className="font-semibold text-gray-900">{item.quantity} {item.unit}</div><div className="mt-1 text-xs text-gray-500">{item.availableQuantity} disponible(s) · {item.assignedQuantity} affecté(s)</div></td>
              <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[item.status]}`}>{statusLabels[item.status]}</span></td>
              <td className="px-5 py-4 text-gray-600">{item.assignedTo?.fullName ?? '—'}</td>
              <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-1.5">
                <button onClick={() => void openDetails(item)} className={buttonCls}>Historique</button>
                <button onClick={() => openMovement(item)} className={buttonCls}>Mouvement</button>
                <button onClick={() => openMaintenance(item)} className={buttonCls}>Maintenance</button>
                <button onClick={() => openEdit(item)} className={buttonCls}>Modifier</button>
                <button onClick={() => setDeleteTarget(item)} className="rounded-xl border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Archiver</button>
              </div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {loading && <div className="p-10 text-center text-sm text-gray-500">Chargement des équipements…</div>}
      {!loading && filtered.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Aucun équipement ne correspond à votre recherche.</div>}
      <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">Les données sont enregistrées dans PostgreSQL. Les archivages conservent l’historique des mouvements.</div>
    </div>

    {formOpen && <Modal title={editing ? 'Modifier un équipement' : 'Ajouter un équipement'} description="Les équipements sérialisés sont suivis individuellement ; les consommables et lots sont suivis par quantité." onClose={() => setFormOpen(false)} size="lg">
      <form onSubmit={saveEquipment} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">Nom de l’équipement<input required value={form.name} onChange={event => setField('name', event.target.value)} className={inputCls} placeholder="Ex. Onduleur hybride" /></label>
          <label className="text-sm font-semibold text-gray-700">Catégorie<select value={form.category} onChange={event => setField('category', event.target.value)} className={inputCls}>{['Onduleur','Batterie','Panneau solaire','Contrôleur','Capteur','Câblage','Protection électrique','Outil','Autre'].map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Site<select required value={form.siteId} onChange={event => setField('siteId', event.target.value)} className={inputCls}><option value="">Sélectionner un site</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Mode de suivi<select disabled={Boolean(editing)} value={form.trackingMode} onChange={event => setField('trackingMode', event.target.value as TrackingMode)} className={inputCls}><option value="individual">Individuel (numéro de série)</option><option value="quantity">Par quantité (stock)</option></select></label>
          {form.trackingMode === 'individual' ? <label className="text-sm font-semibold text-gray-700">Numéro de série<input required value={form.serialNumber} onChange={event => setField('serialNumber', event.target.value)} className={inputCls} placeholder="INV-AND-001" /></label> : <label className="text-sm font-semibold text-gray-700">Quantité initiale<input required type="number" min="1" max="1000000" value={form.quantity} onChange={event => setField('quantity', Number(event.target.value))} className={inputCls} /></label>}
          <label className="text-sm font-semibold text-gray-700">Unité<input required value={form.unit} onChange={event => setField('unit', event.target.value)} className={inputCls} placeholder="unité, mètre, lot…" /></label>
          <label className="text-sm font-semibold text-gray-700">Marque<input value={form.brand} onChange={event => setField('brand', event.target.value)} className={inputCls} /></label>
          <label className="text-sm font-semibold text-gray-700">Modèle<input value={form.model} onChange={event => setField('model', event.target.value)} className={inputCls} /></label>
          <label className="text-sm font-semibold text-gray-700">État<select value={form.status} onChange={event => setField('status', event.target.value as EquipmentStatus)} className={inputCls}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Responsable<select value={form.assignedToId} onChange={event => setField('assignedToId', event.target.value)} className={inputCls}><option value="">Aucun responsable</option>{users.map(user => <option key={user.id} value={user.id}>{user.fullName} · {user.role}</option>)}</select></label>
          <label className="text-sm font-semibold text-gray-700">Date d’installation<input type="date" value={form.installedAt} onChange={event => setField('installedAt', event.target.value)} className={inputCls} /></label>
          <label className="text-sm font-semibold text-gray-700">Prochaine maintenance<input type="date" value={form.nextMaintenanceAt} onChange={event => setField('nextMaintenanceAt', event.target.value)} className={inputCls} /></label>
          <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Notes<textarea value={form.notes} onChange={event => setField('notes', event.target.value)} className={inputCls} rows={3} /></label>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} className={buttonCls}>Annuler</button><button disabled={saving} type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f] disabled:opacity-60">{saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter l’équipement'}</button></div>
      </form>
    </Modal>}

    {movementTarget && <Modal title="Enregistrer un mouvement" description={movementTarget.name} onClose={() => setMovementTarget(null)}>
      <form onSubmit={saveMovement} className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Type de mouvement<select value={movementType} onChange={event => setMovementType(event.target.value as MovementType)} className={inputCls}>
          {(movementTarget.trackingMode === 'quantity' ? ['stock_in','stock_out','assign','unassign','transfer'] as MovementType[] : ['assign','unassign','transfer'] as MovementType[]).map(value => <option key={value} value={value}>{movementLabels[value]}</option>)}
        </select></label>
        {movementTarget.trackingMode === 'quantity' && movementType !== 'transfer' && <label className="block text-sm font-semibold text-gray-700">Quantité<input type="number" min="1" max="1000000" required value={movementQuantity} onChange={event => setMovementQuantity(Number(event.target.value))} className={inputCls} /></label>}
        {movementType === 'assign' && <label className="block text-sm font-semibold text-gray-700">Utilisateur à affecter<select required value={movementUser} onChange={event => setMovementUser(event.target.value)} className={inputCls}><option value="">Sélectionner un utilisateur</option>{users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}</select></label>}
        {movementType === 'transfer' && <label className="block text-sm font-semibold text-gray-700">Site de destination<select required value={movementSite} onChange={event => setMovementSite(event.target.value)} className={inputCls}><option value="">Sélectionner un site</option>{sites.filter(site => site.id !== movementTarget.siteId).map(site => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>}
        <label className="block text-sm font-semibold text-gray-700">Commentaire (facultatif)<textarea value={movementNotes} onChange={event => setMovementNotes(event.target.value)} className={inputCls} rows={3} /></label>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => setMovementTarget(null)} className={buttonCls}>Annuler</button><button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white">Confirmer le mouvement</button></div>
      </form>
    </Modal>}

    {maintenanceTarget && <Modal title="Planifier une maintenance" description={maintenanceTarget.name} onClose={() => setMaintenanceTarget(null)}>
      <form onSubmit={saveMaintenance} className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Titre de l’intervention<input required value={maintenanceTitle} onChange={event => setMaintenanceTitle(event.target.value)} className={inputCls} placeholder="Ex. Inspection annuelle" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">Type<select value={maintenanceType} onChange={event => setMaintenanceType(event.target.value as 'preventive' | 'corrective')} className={inputCls}><option value="preventive">Préventive</option><option value="corrective">Corrective</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Priorité<select value={maintenancePriority} onChange={event => setMaintenancePriority(event.target.value as typeof maintenancePriority)} className={inputCls}><option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="urgent">Urgente</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Date prévue<input type="date" value={maintenanceDate} onChange={event => setMaintenanceDate(event.target.value)} className={inputCls} /></label>
          <label className="text-sm font-semibold text-gray-700">Technicien<select value={maintenanceAssignedTo} onChange={event => setMaintenanceAssignedTo(event.target.value)} className={inputCls}><option value="">Non affecté</option>{users.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}</select></label>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => setMaintenanceTarget(null)} className={buttonCls}>Annuler</button><button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white">Planifier</button></div>
      </form>
    </Modal>}

    {details && <Modal title="Historique et maintenance" description={details.name} onClose={() => setDetails(null)} size="lg">
      {detailsLoading ? <p className="p-6 text-sm text-gray-500">Chargement de l’historique…</p> : <div className="space-y-6">
        <section><h3 className="mb-3 font-bold text-gray-900">Mouvements récents</h3>
          {details.movements.length ? <div className="max-h-64 space-y-3 overflow-y-auto">{details.movements.map(move => <div key={move.id} className="rounded-xl border border-gray-100 p-3"><div className="flex flex-wrap justify-between gap-2"><span className="font-semibold text-gray-800">{({created:'Création',updated:'Modification',assigned:'Affectation',unassigned:'Désaffectation',transfer:'Transfert',stock_in:'Entrée de stock',stock_out:'Sortie de stock',maintenance_started:'Maintenance démarrée',maintenance_completed:'Maintenance terminée',archived:'Archivage',restored:'Restauration'} as Record<string,string>)[move.movement_type] ?? move.movement_type}</span><span className="text-xs text-gray-500">{dateLabel(move.created_at)}</span></div><p className="mt-1 text-sm text-gray-600">{move.notes || '—'}{move.quantity > 1 ? ` · Quantité : ${move.quantity}` : ''}</p><p className="mt-1 text-xs text-gray-400">{move.from_site_name && move.to_site_name && move.from_site_name !== move.to_site_name ? `${move.from_site_name} → ${move.to_site_name}` : ''}{move.created_by_name ? ` · Par ${move.created_by_name}` : ''}</p></div>)}</div> : <p className="text-sm text-gray-500">Aucun mouvement enregistré.</p>}
        </section>
        <section><h3 className="mb-3 font-bold text-gray-900">Interventions de maintenance</h3>
          {details.maintenance.length ? <div className="space-y-3">{details.maintenance.map(maintenance => <div key={maintenance.id} className="rounded-xl border border-gray-100 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-gray-800">{maintenance.title}</span><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{maintenanceStatus[maintenance.status]}</span></div><p className="mt-1 text-xs text-gray-500">{maintenance.maintenance_type === 'preventive' ? 'Préventive' : 'Corrective'} · {dateLabel(maintenance.scheduled_at)} · Priorité {maintenance.priority}</p>{maintenance.status === 'planned' && <button onClick={() => void changeMaintenanceStatus(maintenance, 'in_progress')} className={buttonCls + ' mt-3'}>Démarrer l’intervention</button>}{maintenance.status === 'in_progress' && <button onClick={() => void changeMaintenanceStatus(maintenance, 'completed')} className="mt-3 rounded-xl bg-[#4A7A3B] px-3 py-2 text-xs font-semibold text-white">Marquer comme terminée</button>}</div>)}</div> : <p className="text-sm text-gray-500">Aucune intervention enregistrée.</p>}
        </section>
      </div>}
    </Modal>}

    {deleteTarget && <ConfirmDialog title="Archiver cet équipement ?" message={`« ${deleteTarget.name} » sera masqué de l’inventaire, mais son historique sera conservé.`} confirmLabel="Archiver" danger onConfirm={() => void archive()} onCancel={() => setDeleteTarget(null)} />}
  </div>
}

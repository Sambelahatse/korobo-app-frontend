import { useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'

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
const statusStyle: Record<EquipmentStatus, string> = {
  'Opérationnel': 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'À surveiller': 'bg-amber-50 text-amber-700 ring-amber-600/15',
  'En panne': 'bg-rose-50 text-rose-700 ring-rose-600/15',
}

export default function EquipementsPage() {
  const [items, setItems] = useState(initialEquipment)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Tous')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [site, setSite] = useState('Site Andohalo A')
  const [category, setCategory] = useState('Onduleur')
  const [power, setPower] = useState('')
  const [serial, setSerial] = useState('')
  const [formError, setFormError] = useState('')

  const filtered = useMemo(() => items.filter(item =>
    (status === 'Tous' || item.status === status) &&
    [item.name, item.site, item.serial, item.category].some(v => v.toLowerCase().includes(query.toLowerCase()))
  ), [items, query, status])
  const operational = items.filter(i => i.status === 'Opérationnel').length
  const watch = items.filter(i => i.status === 'À surveiller').length
  const broken = items.filter(i => i.status === 'En panne').length

  const addEquipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !serial.trim() || !power.trim()) { setFormError('Renseignez le nom, la référence et la puissance.'); return }
    setItems(prev => [{ id: `EQ-${String(prev.length + 1).padStart(3, '0')}`, name: name.trim(), category, site, serial: serial.trim(), power: power.trim(), status: 'Opérationnel', updated: new Date().toLocaleDateString('fr-FR') }, ...prev])
    setName(''); setSerial(''); setPower(''); setFormError(''); setShowForm(false)
  }

  return <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Parc technique</p><h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Équipements & matériels</h1><p className="mt-2 text-sm text-gray-500">Suivez l’état des équipements installés sur vos sites photovoltaïques.</p></div>
      <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A7A3B] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d672f]"><span className="text-lg leading-none">+</span> Ajouter un équipement</button>
    </div>
    {showForm && <form onSubmit={addEquipment} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-gray-900">Nouvel équipement</h2><button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-900">Fermer</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">Nom de l’équipement<input value={name} onChange={e=>setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#5C8A42] focus:ring-2 focus:ring-[#5C8A42]/15" placeholder="Ex. Onduleur hybride" /></label>
        <label className="text-sm font-medium text-gray-700">Catégorie<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#5C8A42]">{['Onduleur','Batterie','Panneau solaire','Contrôleur','Capteur','Autre'].map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Site<select value={site} onChange={e=>setSite(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#5C8A42]">{['Site Andohalo A','Site Analakely B','Site Ampitatafika','Site Mahamasina','Site Ankorondrano','Site Tsimbazaza'].map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Référence / numéro de série<input value={serial} onChange={e=>setSerial(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#5C8A42]" placeholder="EQ-XXX" /></label>
        <label className="text-sm font-medium text-gray-700">Puissance / capacité<input value={power} onChange={e=>setPower(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal outline-none focus:border-[#5C8A42]" placeholder="Ex. 10 kW" /></label>
      </div>
      {formError && <p className="mt-3 text-sm text-rose-600">{formError}</p>}
      <div className="mt-4 flex justify-end"><button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f]">Enregistrer</button></div>
    </form>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[{label:'Équipements suivis',value:items.length,tone:'text-gray-900',icon:'database' as const},{label:'Opérationnels',value:operational,tone:'text-emerald-700',icon:'check-circle' as const},{label:'À contrôler / en panne',value:watch+broken,tone:'text-amber-700',icon:'alert-triangle' as const}].map(card=><div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={card.icon} size={22}/></div><div><p className="text-sm text-gray-500">{card.label}</p><p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p></div></div>)}
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-gray-900">Inventaire des équipements</h2><p className="mt-1 text-xs text-gray-500">{filtered.length} résultat(s)</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un équipement…" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42] sm:w-64"/><select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option>Tous</option><option>Opérationnel</option><option>À surveiller</option><option>En panne</option></select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500"><tr>{['Équipement','Site','Référence','Puissance','État','Dernière mise à jour',''].map(h=><th key={h} className="px-5 py-3.5 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(item=><tr key={item.id} className="transition hover:bg-gray-50/70"><td className="px-5 py-4"><div className="font-semibold text-gray-900">{item.name}</div><div className="mt-1 text-xs text-gray-500">{item.category}</div></td><td className="px-5 py-4 text-gray-600">{item.site}</td><td className="px-5 py-4 font-mono text-xs text-gray-500">{item.serial}</td><td className="px-5 py-4 text-gray-700">{item.power}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[item.status]}`}>{item.status}</span></td><td className="px-5 py-4 text-gray-500">{item.updated}</td><td className="px-5 py-4"><button onClick={()=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,status:i.status==='Opérationnel'?'À surveiller':i.status==='À surveiller'?'En panne':'Opérationnel'}:i))} title="Changer l’état" className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#5C8A42] hover:text-[#4A7A3B]">Modifier l’état</button></td></tr>)}</tbody></table></div>
      {filtered.length===0 && <div className="p-10 text-center text-sm text-gray-500">Aucun équipement ne correspond à votre recherche.</div>}
    </div>
    <p className="text-xs text-gray-400">Données de démonstration : les changements sont conservés uniquement dans l’état de cette page et ne sont pas encore synchronisés avec une API.</p>
  </div>
}

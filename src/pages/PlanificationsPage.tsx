import { useState } from 'react'
import type { Planification } from '../types'
import { mockPlanifications } from '../data/mockData'
import ConfirmDialog from '../components/ConfirmDialog'

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

function PlanifModal({ planif, onClose, onSave }: { planif: Partial<Planification> | null; onClose: () => void; onSave: (p: Planification) => void }) {
  const isEdit = !!(planif as Planification)?.id
  const [form, setForm] = useState<Partial<Planification>>(planif || {
    type: 'préventive', statut: 'planifiée', priorite: 'moyenne', date: new Date().toISOString().split('T')[0],
    siteNom: '', technicien: '', description: '',
  })
  const set = (k: keyof Planification, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.siteNom || !form.date || !form.technicien) return
    onSave({ ...form, id: (form as Planification).id || `P${Date.now()}` } as Planification)
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3d6b2a] transition-colors'
  const selectCls = inputCls + ' appearance-none bg-white cursor-pointer'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-syne font-bold text-lg text-[#3d6b2a]">
            {isEdit ? 'Modifier la planification' : 'Nouvelle planification'}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Site *</label>
              <input className={inputCls} value={form.siteNom || ''} onChange={e => set('siteNom', e.target.value)} placeholder="Nom du site" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Date *</label>
              <input type="date" className={inputCls} value={form.date || ''} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Type</label>
              <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="préventive">Préventive</option>
                <option value="corrective">Corrective</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Priorité</label>
              <select className={selectCls} value={form.priorite} onChange={e => set('priorite', e.target.value)}>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Statut</label>
              <select className={selectCls} value={form.statut} onChange={e => set('statut', e.target.value)}>
                <option value="planifiée">Planifiée</option>
                <option value="en cours">En cours</option>
                <option value="terminée">Terminée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Technicien *</label>
            <input className={inputCls} value={form.technicien || ''} onChange={e => set('technicien', e.target.value)} placeholder="Nom du technicien" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Décrire l'intervention..." />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-lg text-sm font-semibold">
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanificationsPage() {
  const [items, setItems] = useState<Planification[]>(mockPlanifications)
  const [filterStatut, setFilterStatut] = useState('tous')
  const [filterType, setFilterType] = useState('tous')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Planification | null>(null)
  const [deleteItem, setDeleteItem] = useState<Planification | null>(null)

  const filtered = items.filter(p => {
    const matchSearch = p.siteNom.toLowerCase().includes(search.toLowerCase()) ||
      p.technicien.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchSearch &&
      (filterStatut === 'tous' || p.statut === filterStatut) &&
      (filterType === 'tous' || p.type === filterType)
  })

  const handleSave = (p: Planification) => {
    setItems(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev])
    setShowModal(false); setEditItem(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-syne font-bold text-xl text-gray-800">Planifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} interventions au total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-lg transition-colors">
          + Nouvelle planification
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#3d6b2a] w-56" />
        {(['tous','planifiée','en cours','terminée','annulée'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatut(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatut === s ? 'bg-[#3d6b2a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#3d6b2a]'}`}>
            {s === 'tous' ? 'Tous' : s}
          </button>
        ))}
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#3d6b2a] bg-white">
          <option value="tous">Tous types</option>
          <option value="préventive">Préventive</option>
          <option value="corrective">Corrective</option>
          <option value="urgence">Urgence</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400">Aucune planification trouvée</div>
        ) : filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${typeStyle[p.type]}`}>{p.type}</span>
                <p className={`text-xs font-bold mt-1.5 ${prioStyle[p.priorite]}`}>{prioIcon[p.priorite]} Priorité {p.priorite}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statutStyle[p.statut]}`}>{p.statut}</span>
            </div>
            <h3 className="font-syne font-bold text-sm text-gray-800 mb-1">{p.siteNom}</h3>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
              <span>📅 {new Date(p.date).toLocaleDateString('fr-FR')}</span>
              <span>👷 {p.technicien}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditItem(p)}
                className="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:border-[#3d6b2a] hover:text-[#3d6b2a] transition-colors">
                Modifier
              </button>
              <button onClick={() => setDeleteItem(p)}
                className="flex-1 py-1.5 text-xs font-medium border border-red-100 rounded-md text-red-500 hover:bg-red-50 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showModal || editItem) && (
        <PlanifModal planif={editItem || {}} onClose={() => { setShowModal(false); setEditItem(null) }} onSave={handleSave} />
      )}
      {deleteItem && (
        <ConfirmDialog title="Supprimer cette planification ?" danger
          message={`Supprimer la planification pour "${deleteItem.siteNom}" du ${new Date(deleteItem.date).toLocaleDateString('fr-FR')} ?`}
          confirmLabel="Supprimer" onConfirm={() => { setItems(p => p.filter(x => x.id !== deleteItem.id)); setDeleteItem(null) }}
          onCancel={() => setDeleteItem(null)} />
      )}
    </div>
  )
}

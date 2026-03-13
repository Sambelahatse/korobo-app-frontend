import { useState } from 'react'
import { mockRapports } from '../data/mockData'
import type { Rapport } from '../types'
import ConfirmDialog from '../components/ConfirmDialog'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function typeStyle(t: string) {
  if (t === 'mensuel')     return 'bg-blue-100 text-blue-700'
  if (t === 'incident')    return 'bg-red-100 text-red-600'
  if (t === 'intervention') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

export default function RapportsPage() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [rapports, setRapports] = useState<Rapport[]>(mockRapports)
  const [selected, setSelected] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<Rapport | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Rapport>>({})

  // Calendar logic
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
  const daysInMonth = lastDay.getDate()
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const rapportsByDate: Record<string, Rapport[]> = {}
  rapports.forEach(r => {
    const d = r.date.split('T')[0]
    if (!rapportsByDate[d]) rapportsByDate[d] = []
    rapportsByDate[d].push(r)
  })

  const dateKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const selectedRapports = selected ? (rapportsByDate[selected] || []) : rapports

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3d6b2a] transition-colors'

  const handleSaveForm = () => {
    if (!form.siteNom || !form.date || !form.technicien) return
    const newR: Rapport = { id: `R${Date.now()}`, siteId: '00', statut: 'brouillon', notes: '', ...form } as Rapport
    setRapports(prev => [newR, ...prev])
    setShowForm(false); setForm({})
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-bold text-xl text-gray-800">Rapports</h2>
          <p className="text-sm text-gray-400 mt-0.5">Vue calendrier des rapports d'intervention</p>
        </div>
        <div className="flex items-center gap-3">
          {selected && <button onClick={() => setSelected(null)} className="text-sm text-[#3d6b2a] hover:underline">← Tous les rapports</button>}
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-lg transition-colors">
            + Nouveau rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">‹</button>
            <h3 className="font-syne font-bold text-base text-gray-800">{MONTHS[month]} {year}</h3>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>)}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const key = dateKey(day)
              const rList = rapportsByDate[key] || []
              const isToday = key === todayKey
              const isSel   = key === selected
              return (
                <button key={i} onClick={() => setSelected(isSel ? null : key)}
                  className={`relative min-h-[56px] p-1.5 rounded-lg text-left transition-all ${
                    isSel   ? 'bg-[#3d6b2a] text-white ring-2 ring-[#3d6b2a]' :
                    isToday ? 'bg-[#e8f2e3] ring-1 ring-[#6aad46]' :
                    rList.length ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50 cursor-default'
                  }`}>
                  <span className={`text-xs font-bold ${isSel ? 'text-white' : isToday ? 'text-[#3d6b2a]' : 'text-gray-700'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {rList.slice(0, 2).map(r => (
                      <div key={r.id} className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${isSel ? 'bg-white/20 text-white' : typeStyle(r.type)}`}>
                        {r.siteNom.replace('Site ', '')}
                      </div>
                    ))}
                    {rList.length > 2 && <div className={`text-[9px] font-bold ${isSel ? 'text-white/70' : 'text-gray-400'}`}>+{rList.length - 2}</div>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-50">
            {[['mensuel','bg-blue-100 text-blue-700'],['incident','bg-red-100 text-red-600'],['intervention','bg-amber-100 text-amber-700']].map(([t,c]) => (
              <div key={t} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${c.split(' ')[0]}`} />
                <span className="text-xs text-gray-500 capitalize">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-y-auto max-h-[600px]">
          <h3 className="font-syne font-bold text-sm text-gray-800 mb-3">
            {selected ? `Rapports du ${new Date(selected).toLocaleDateString('fr-FR')}` : 'Tous les rapports'}
            <span className="ml-2 text-gray-400 font-normal text-xs">({selectedRapports.length})</span>
          </h3>
          <div className="space-y-3">
            {selectedRapports.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucun rapport ce jour</p>
            ) : selectedRapports.map(r => (
              <div key={r.id} className="p-3 rounded-lg border border-gray-100 hover:border-[#d4e8cb] transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${typeStyle(r.type)}`}>{r.type}</span>
                  <span className={`text-[10px] font-semibold ${r.statut === 'validé' ? 'text-green-600' : 'text-amber-500'}`}>
                    {r.statut === 'validé' ? '✓ Validé' : '○ Brouillon'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800">{r.siteNom}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{r.technicien} · {new Date(r.date).toLocaleDateString('fr-FR')}</p>
                {r.notes && <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">{r.notes}</p>}
                <button onClick={() => setDeleteItem(r)} className="mt-2 text-[10px] text-red-400 hover:text-red-600 transition-colors">Supprimer</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New rapport form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <h2 className="font-syne font-bold text-lg text-[#3d6b2a] mb-5">Nouveau rapport</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600">Site *</label>
                  <input className={inputCls} value={form.siteNom||''} onChange={e => setForm(f=>({...f,siteNom:e.target.value}))} placeholder="Nom du site" /></div>
                <div><label className="text-xs font-semibold text-gray-600">Date *</label>
                  <input type="date" className={inputCls} value={form.date||''} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600">Type</label>
                  <select className={inputCls+' appearance-none'} value={form.type||'mensuel'} onChange={e => setForm(f=>({...f,type:e.target.value as any}))}>
                    <option value="mensuel">Mensuel</option>
                    <option value="incident">Incident</option>
                    <option value="intervention">Intervention</option>
                  </select></div>
                <div><label className="text-xs font-semibold text-gray-600">Technicien *</label>
                  <input className={inputCls} value={form.technicien||''} onChange={e => setForm(f=>({...f,technicien:e.target.value}))} placeholder="Nom" /></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600">Notes</label>
                <textarea className={inputCls+' resize-none'} rows={3} value={form.notes||''} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Observations..." /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={handleSaveForm} className="flex-1 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-lg text-sm font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <ConfirmDialog title="Supprimer ce rapport ?" danger
          message={`Supprimer le rapport "${deleteItem.siteNom}" du ${new Date(deleteItem.date).toLocaleDateString('fr-FR')} ?`}
          confirmLabel="Supprimer"
          onConfirm={() => { setRapports(p => p.filter(r => r.id !== deleteItem.id)); setDeleteItem(null) }}
          onCancel={() => setDeleteItem(null)} />
      )}
    </div>
  )
}

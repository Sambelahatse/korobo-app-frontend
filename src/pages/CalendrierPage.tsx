import { useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'
import type { Planification } from '../types'
import { mockPlanifications } from '../data/mockData'

type EventItem = {
  id: string
  date: string
  title: string
  site: string
  kind: 'Préventive' | 'Corrective' | 'Urgence'
  technician: string
  status: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée'
}
const colors: Record<EventItem['kind'], string> = {
  Préventive: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Corrective: 'bg-amber-100 text-amber-800 border-amber-200',
  Urgence: 'bg-rose-100 text-rose-800 border-rose-200',
}
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const weekdayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const kindLabel = (type: Planification['type']): EventItem['kind'] => type === 'urgence' ? 'Urgence' : type === 'corrective' ? 'Corrective' : 'Préventive'
const statusLabel = (status: Planification['statut']): EventItem['status'] => status === 'en cours' ? 'En cours' : status === 'terminée' ? 'Terminée' : status === 'annulée' ? 'Annulée' : 'Planifiée'

function readPlanifications(): Planification[] {
  try {
    const saved = localStorage.getItem('korobo.planifications.v1')
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed as Planification[]
    }
  } catch { /* Fall back to demo data when local storage is unavailable. */ }
  return mockPlanifications
}

export default function CalendrierPage() {
  const [items, setItems] = useState<Planification[]>(readPlanifications)
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selected, setSelected] = useState(() => dateKey(new Date()))
  const [kind, setKind] = useState('Tous')

  // Keep the calendar in sync with edits made on the planifications page in another tab.
  useMemo(() => {
    const sync = () => setItems(readPlanifications())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const events = useMemo<EventItem[]>(() => items.map(item => ({
    id: item.id,
    date: item.date,
    title: item.description.trim() || `Intervention ${kindLabel(item.type).toLowerCase()}`,
    site: item.siteNom,
    kind: kindLabel(item.type),
    technician: item.technicien,
    status: statusLabel(item.statut),
  })), [items])

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day > 0 && day <= days ? new Date(month.getFullYear(), month.getMonth(), day) : null
  })
  const monthEvents = useMemo(
    () => events.filter(e => e.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`) && (kind === 'Tous' || e.kind === kind)),
    [events, month, kind],
  )
  const selectedEvents = monthEvents.filter(e => e.date === selected)
  const moveMonth = (n: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + n, 1)
    setMonth(next)
    setSelected(dateKey(new Date(next.getFullYear(), next.getMonth(), 1)))
  }
  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const openForEdit = (id: string) => { window.location.hash = `#/planifications?edit=${encodeURIComponent(id)}` }

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Organisation</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Calendrier des interventions</h1><p className="mt-2 text-sm text-gray-500">Les interventions affichées proviennent de vos planifications locales.</p></div>
      <div className="flex gap-2">
        <button onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(dateKey(now)) }} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#5C8A42]">Aujourd’hui</button>
        <button onClick={() => window.print()} className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f]">Imprimer</button>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Interventions du mois', value: monthEvents.length, icon: 'calendar-check' as const },
        { label: 'Urgences', value: monthEvents.filter(e => e.kind === 'Urgence' && e.status !== 'Annulée').length, icon: 'alert-triangle' as const },
        { label: 'Terminées', value: monthEvents.filter(e => e.status === 'Terminée').length, icon: 'check-circle' as const },
      ].map(x => <div key={x.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={x.icon} size={21} /></div><div><p className="text-sm text-gray-500">{x.label}</p><p className="text-2xl font-bold text-gray-900">{x.value}</p></div></div>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">{monthNames[month.getMonth()]} {month.getFullYear()}</h2><p className="mt-1 text-xs text-gray-500">Sélectionnez une journée pour consulter les interventions</p></div><div className="flex gap-1"><button onClick={() => moveMonth(-1)} aria-label="Mois précédent" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50">←</button><button onClick={() => moveMonth(1)} aria-label="Mois suivant" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50">→</button></div></div>
        <div className="grid grid-cols-7 gap-1">
          {weekdayNames.map(d => <div key={d} className="py-2 text-center text-[11px] font-bold uppercase text-gray-400 sm:text-xs">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={'empty-' + i} className="min-h-[66px] rounded-lg bg-gray-50/50 sm:min-h-[92px]" />
            const key = dateKey(d)
            const dayEvents = monthEvents.filter(e => e.date === key)
            const active = selected === key
            const today = dateKey(new Date()) === key
            return <button key={key} onClick={() => setSelected(key)} className={`min-h-[66px] rounded-lg border p-1.5 text-left transition sm:min-h-[92px] sm:p-2 ${active ? 'border-[#4A7A3B] bg-[#edf4e9] ring-1 ring-[#4A7A3B]/20' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${today ? 'bg-[#4A7A3B] text-white' : active ? 'text-[#3d672f]' : 'text-gray-700'}`}>{d.getDate()}</span>
              <div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map(e => <div key={e.id} className={`truncate rounded px-1 py-0.5 text-[9px] font-semibold sm:text-[10px] ${e.kind === 'Urgence' ? 'bg-rose-100 text-rose-700' : e.kind === 'Corrective' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{e.title}</div>)}{dayEvents.length > 2 && <p className="text-[9px] text-gray-500">+{dayEvents.length - 2}</p>}</div>
            </button>
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">{Object.entries(colors).map(([label, c]) => <span key={label} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${c}`}>{label}</span>)}</div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#5C8A42]">Planning du jour</p><h2 className="mt-1 text-lg font-bold capitalize text-gray-900">{selected ? formatDate(selected) : 'Choisir une date'}</h2><div className="mt-3"><select value={kind} onChange={e => setKind(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option>Tous</option><option>Préventive</option><option>Corrective</option><option>Urgence</option></select></div></div>
        <div className="space-y-3 p-4">
          {selectedEvents.length ? selectedEvents.map(e => <article key={e.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${colors[e.kind]}`}>{e.kind}</span><span className="text-[11px] text-gray-400">{e.status}</span></div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">{e.title}</h3><p className="mt-1 text-xs text-gray-500">{e.site}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600"><ModernIcon name="user-round" size={15} />{e.technician}</div>
            <button onClick={() => openForEdit(e.id)} className="mt-4 w-full rounded-lg border border-[#4A7A3B]/30 px-3 py-2 text-xs font-semibold text-[#4A7A3B] transition hover:bg-[#edf4e9]">Modifier l’intervention</button>
          </article>) : <div className="rounded-xl border border-dashed border-gray-200 p-7 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400"><ModernIcon name="calendar-check" size={21} /></div><p className="mt-3 text-sm font-semibold text-gray-700">Aucune intervention prévue</p><p className="mt-1 text-xs text-gray-500">Aucune intervention correspondant au filtre pour cette date.</p></div>}
        </div>
        <div className="border-t border-gray-100 p-4"><h3 className="mb-3 text-sm font-bold text-gray-800">Prochaines interventions</h3><div className="space-y-3">{monthEvents.filter(e => e.date >= selected && e.status !== 'Annulée').slice(0, 4).map(e => <button key={e.id} onClick={() => setSelected(e.date)} className="flex w-full items-start gap-3 text-left"><span className="w-10 shrink-0 rounded-lg bg-gray-50 py-2 text-center"><span className="block text-sm font-bold text-gray-800">{new Date(e.date + 'T12:00:00').getDate()}</span><span className="text-[9px] uppercase text-gray-400">{monthNames[month.getMonth()].slice(0, 3)}</span></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-800">{e.title}</span><span className="mt-1 block truncate text-[11px] text-gray-500">{e.site}</span></span></button>)}</div></div>
      </section>
    </div>
    <p className="text-xs text-gray-400">Données sauvegardées localement dans ce navigateur. Elles ne sont pas encore partagées avec les autres utilisateurs.</p>
  </div>
}

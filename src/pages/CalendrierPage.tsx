import { useEffect, useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'
import type { Planification } from '../types'
import { listPlanifications, updatePlanification } from '../services/planificationService'

type EventItem = {
  id: string
  date: string
  startTime: string
  endTime: string
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
const statusDot: Record<EventItem['status'], string> = {
  Planifiée: 'bg-sky-500',
  'En cours': 'bg-amber-500',
  Terminée: 'bg-emerald-500',
  Annulée: 'bg-gray-400',
}

export default function CalendrierPage() {
  const [items, setItems] = useState<Planification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selected, setSelected] = useState(() => dateKey(new Date()))
  const [kind, setKind] = useState('Tous')
  const [technician, setTechnician] = useState('Tous')
  const [view, setView] = useState<'year' | 'month'>('year')
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropError, setDropError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await listPlanifications()
        if (active) setItems(data)
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Impossible de charger le calendrier.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const events = useMemo<EventItem[]>(() => items.map(item => ({
    id: item.id,
    date: item.date,
    startTime: item.startTime || "09:00",
    endTime: item.endTime || "10:00",
    title: item.description.trim() || `Intervention ${kindLabel(item.type).toLowerCase()}`,
    site: item.siteNom,
    kind: kindLabel(item.type),
    technician: item.technicien || 'Non affecté',
    status: statusLabel(item.statut),
  })), [items])

  const technicians = useMemo(() => [...new Set(events.map(event => event.technician).filter(name => name !== 'Non affecté'))].sort((a, b) => a.localeCompare(b, 'fr')), [events])
  const filteredEvents = useMemo(() => events.filter(event =>
    (kind === 'Tous' || event.kind === kind) &&
    (technician === 'Tous' || event.technician === technician)
  ), [events, kind, technician])
  const yearEvents = filteredEvents.filter(event => event.date.startsWith(String(year)))
  const monthEvents = useMemo(
    () => filteredEvents.filter(event => event.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`)),
    [filteredEvents, month],
  )
  const selectedEvents = monthEvents.filter(event => event.date === selected)
  const activeYearCount = yearEvents.filter(event => event.status !== 'Annulée').length
  const overdueCount = filteredEvents.filter(event => event.date < dateKey(new Date()) && !['Terminée', 'Annulée'].includes(event.status)).length

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day > 0 && day <= days ? new Date(month.getFullYear(), month.getMonth(), day) : null
  })
  const moveMonth = (n: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + n, 1)
    setMonth(next)
    setYear(next.getFullYear())
    setSelected(dateKey(new Date(next.getFullYear(), next.getMonth(), 1)))
  }
  const openMonth = (monthIndex: number) => {
    const next = new Date(year, monthIndex, 1)
    setMonth(next)
    setSelected(dateKey(next))
    setView('month')
  }
  const goToday = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelected(dateKey(now))
    setView('month')
  }
  const formatDate = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const openForEdit = (id: string) => { window.location.hash = `#/planifications?edit=${encodeURIComponent(id)}` }
  const handleDrop = async (date: string, eventId: string) => {
    setDropError('')
    setDraggingId(null)
    const current = items.find(item => item.id === eventId)
    if (!current || current.date === date || ['terminée', 'annulée'].includes(current.statut)) return
    try {
      const updated = await updatePlanification({ ...current, date })
      setItems(previous => previous.map(item => item.id === updated.id ? updated : item))
      setSelected(date)
    } catch (error) {
      setDropError(error instanceof Error ? error.message : 'Impossible de déplacer cette intervention.')
    }
  }
  const eventsForMonth = (monthIndex: number) => yearEvents.filter(event => Number(event.date.slice(5, 7)) === monthIndex + 1)
  const monthShortDate = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Organisation</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Calendrier des interventions</h1>
        <p className="mt-2 text-sm text-gray-500">Vue annuelle, disponibilité et suivi des interventions de votre espace.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {view === 'month' && <button onClick={() => setView('year')} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#5C8A42]">← Vue annuelle</button>}
        <button onClick={goToday} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#5C8A42]">Aujourd’hui</button>
        <button onClick={() => window.print()} className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f]">Imprimer</button>
      </div>
    </div>

    {(loadError || dropError) && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError || dropError} <button className="ml-2 font-semibold underline" onClick={() => window.location.reload()}>Réessayer</button></div>}
    {loading && <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">Chargement du calendrier…</div>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: view === 'year' ? 'Interventions de l’année' : 'Interventions du mois', value: view === 'year' ? activeYearCount : monthEvents.filter(event => event.status !== 'Annulée').length, icon: 'calendar-check' as const },
        { label: 'Terminées', value: (view === 'year' ? yearEvents : monthEvents).filter(event => event.status === 'Terminée').length, icon: 'check-circle' as const },
        { label: 'Urgences actives', value: (view === 'year' ? yearEvents : monthEvents).filter(event => event.kind === 'Urgence' && !['Terminée', 'Annulée'].includes(event.status)).length, icon: 'alert-triangle' as const },
        { label: 'En retard', value: overdueCount, icon: 'calendar-clock' as const },
      ].map(card => <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={card.icon} size={21} /></div>
        <div><p className="text-sm text-gray-500">{card.label}</p><p className="text-2xl font-bold text-gray-900">{card.value}</p></div>
      </div>)}
    </div>

    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="font-bold text-gray-900">Filtres du calendrier</h2><p className="mt-1 text-xs text-gray-500">Les filtres s’appliquent aux deux vues.</p></div>
      <div className="grid gap-2 sm:grid-cols-2 sm:min-w-[360px]">
        <select aria-label="Filtrer par type d’intervention" value={kind} onChange={event => setKind(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5C8A42]">
          <option value="Tous">Tous les types</option><option>Préventive</option><option>Corrective</option><option>Urgence</option>
        </select>
        <select aria-label="Filtrer par technicien" value={technician} onChange={event => setTechnician(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5C8A42]">
          <option value="Tous">Tous les techniciens</option>{technicians.map(name => <option key={name}>{name}</option>)}
        </select>
      </div>
    </div>

    {view === 'year' ? <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold text-gray-900">Vue annuelle {year}</h2><p className="mt-1 text-sm text-gray-500">Sélectionnez un mois pour afficher les dates et le planning détaillé.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => setYear(value => value - 1)} aria-label="Année précédente" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 hover:bg-gray-50">←</button><span className="min-w-14 text-center font-semibold text-gray-800">{year}</span><button onClick={() => setYear(value => value + 1)} aria-label="Année suivante" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 hover:bg-gray-50">→</button></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {monthNames.map((name, index) => {
          const monthItems = eventsForMonth(index)
          const activeItems = monthItems.filter(event => event.status !== 'Annulée')
          const completed = monthItems.filter(event => event.status === 'Terminée').length
          const urgent = monthItems.filter(event => event.kind === 'Urgence' && !['Terminée', 'Annulée'].includes(event.status)).length
          const now = new Date()
          const isCurrentMonth = now.getFullYear() === year && now.getMonth() === index
          const count = activeItems.length
          const intensity = count === 0 ? 'bg-gray-100' : count <= 3 ? 'bg-emerald-400' : count <= 8 ? 'bg-amber-400' : 'bg-rose-400'
          return <button key={name} onClick={() => openMonth(index)} className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#8BAA7C] hover:shadow-md ${isCurrentMonth ? 'border-[#4A7A3B] ring-1 ring-[#4A7A3B]/15' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-2"><div><h3 className="text-base font-bold text-gray-900 group-hover:text-[#4A7A3B]">{name}</h3><p className="mt-1 text-xs text-gray-500">{activeItems.length} intervention{activeItems.length > 1 ? 's' : ''}</p></div>{isCurrentMonth && <span className="rounded-full bg-[#edf4e9] px-2 py-1 text-[10px] font-bold text-[#3d672f]">Ce mois</span>}</div>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-gray-100"><span className={`${intensity} rounded-full transition-all`} style={{ width: `${Math.min(100, count * 10)}%` }} /></div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{completed} terminée{completed > 1 ? 's' : ''}</span>{urgent > 0 && <span className="inline-flex items-center gap-1 text-rose-600"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{urgent} urgence{urgent > 1 ? 's' : ''}</span>}</div>
            {monthItems.length > 0 ? <div className="mt-4 flex flex-wrap gap-1">{[...new Set(monthItems.map(event => event.kind))].map(type => <span key={type} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors[type]}`}>{type}</span>)}</div> : <p className="mt-4 text-xs text-gray-400">Aucune intervention enregistrée</p>}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-[#4A7A3B]"><span>Voir les dates</span><span aria-hidden="true">→</span></div>
          </button>
        })}
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500"><span className="font-semibold text-gray-700">Charge estimée</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-300" />Aucune</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Faible</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Moyenne</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Élevée</span><span className="ml-auto text-gray-400">Basée sur le nombre d’interventions</span></div>
    </section> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#5C8A42]">Planning mensuel</p><h2 className="text-xl font-bold text-gray-900">{monthNames[month.getMonth()]} {month.getFullYear()}</h2><p className="mt-1 text-xs text-gray-500">Sélectionnez une journée. Glissez une intervention vers une autre date pour la replanifier.</p></div><div className="flex gap-1"><button onClick={() => moveMonth(-1)} aria-label="Mois précédent" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50">←</button><button onClick={() => moveMonth(1)} aria-label="Mois suivant" className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50">→</button></div></div>
        <div className="grid grid-cols-7 gap-1">
          {weekdayNames.map(day => <div key={day} className="py-2 text-center text-[11px] font-bold uppercase text-gray-400 sm:text-xs">{day}</div>)}
          {cells.map((day, index) => {
            if (!day) return <div key={'empty-' + index} className="min-h-[66px] rounded-lg bg-gray-50/50 sm:min-h-[92px]" />
            const key = dateKey(day)
            const dayEvents = monthEvents.filter(event => event.date === key)
            const active = selected === key
            const today = dateKey(new Date()) === key
            return <button key={key} onClick={() => setSelected(key)} onDragOver={event => { if (draggingId) event.preventDefault() }} onDrop={event => { event.preventDefault(); if (draggingId) void handleDrop(key, draggingId) }} aria-pressed={active} className={`min-h-[66px] rounded-lg border p-1.5 text-left transition sm:min-h-[92px] sm:p-2 ${active ? 'border-[#4A7A3B] bg-[#edf4e9] ring-1 ring-[#4A7A3B]/20' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${today ? 'bg-[#4A7A3B] text-white' : active ? 'text-[#3d672f]' : 'text-gray-700'}`}>{day.getDate()}</span>
              <div className="mt-1 space-y-1">{dayEvents.slice(0, 2).map(event => <div key={event.id} className={`truncate rounded px-1 py-0.5 text-[9px] font-semibold sm:text-[10px] ${event.kind === 'Urgence' ? 'bg-rose-100 text-rose-700' : event.kind === 'Corrective' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{event.title}</div>)}{dayEvents.length > 2 && <p className="text-[9px] text-gray-500">+{dayEvents.length - 2}</p>}</div>
              {dayEvents.length > 0 && <div className="mt-1 flex gap-0.5">{dayEvents.slice(0, 4).map(event => <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${statusDot[event.status]}`} />)}</div>}
            </button>
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">{Object.entries(colors).map(([label, color]) => <span key={label} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>{label}</span>)}</div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">{Object.entries(statusDot).map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#5C8A42]">Détail de la date</p><h2 className="mt-1 text-lg font-bold capitalize text-gray-900">{selected ? formatDate(selected) : 'Choisir une date'}</h2><p className="mt-1 text-xs text-gray-500">{selectedEvents.length} intervention{selectedEvents.length > 1 ? 's' : ''} pour cette date</p></div>
        <div className="space-y-3 p-4">
          {selectedEvents.length ? selectedEvents.map(event => <article key={event.id} draggable={!['Terminée', 'Annulée'].includes(event.status)} onDragStart={drag => { setDraggingId(event.id); drag.dataTransfer.effectAllowed = 'move'; drag.dataTransfer.setData('text/plain', event.id) }} onDragEnd={() => setDraggingId(null)} className={`rounded-xl border border-gray-100 p-4 ${!['Terminée', 'Annulée'].includes(event.status) ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <div className="flex items-start justify-between gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${colors[event.kind]}`}>{event.kind}</span><span className="text-[11px] text-gray-400">{event.status}</span></div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">{event.title}</h3><p className="mt-1 text-xs font-semibold text-[#4A7A3B]">{event.startTime}–{event.endTime}</p><p className="mt-1 text-xs text-gray-500">{event.site}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600"><ModernIcon name="user-round" size={15} />{event.technician}</div>
            <button onClick={() => openForEdit(event.id)} className="mt-4 w-full rounded-lg border border-[#4A7A3B]/30 px-3 py-2 text-xs font-semibold text-[#4A7A3B] transition hover:bg-[#edf4e9]">Modifier l’intervention</button>
          </article>) : <div className="rounded-xl border border-dashed border-gray-200 p-7 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400"><ModernIcon name="calendar-check" size={21} /></div><p className="mt-3 text-sm font-semibold text-gray-700">Aucune intervention prévue</p><p className="mt-1 text-xs text-gray-500">Aucune intervention correspondant aux filtres pour cette date.</p></div>}
        </div>
        <div className="border-t border-gray-100 p-4"><h3 className="mb-3 text-sm font-bold text-gray-800">Prochaines interventions du mois</h3><div className="space-y-3">{monthEvents.filter(event => event.date >= selected && event.status !== 'Annulée').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(event => <button key={event.id} onClick={() => setSelected(event.date)} className="flex w-full items-start gap-3 text-left"><span className="w-12 shrink-0 rounded-lg bg-gray-50 py-2 text-center"><span className="block text-sm font-bold text-gray-800">{monthShortDate(event.date)}</span></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-800">{event.title}</span><span className="mt-1 block truncate text-[11px] text-gray-500">{event.site} · {event.technician}</span></span></button>)}</div></div>
      </section>
    </div>}
    <p className="text-xs text-gray-400">Les interventions affichées sont synchronisées avec l’API de Korobo. Les indicateurs de charge reposent sur le volume d’interventions enregistrées.</p>
  </div>
}

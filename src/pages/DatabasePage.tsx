import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAccessToken } from '../services/authService'
import { ModernIcon, type ModernIconName } from '../components/Icons'

type DatabaseTable = { name: string; label: string; count: number | null; available: boolean }
type DatabaseOverview = { status: string; checkedAt: string; totalRecords: number; tables: DatabaseTable[] }
type TableColumn = { name: string; type: string; nullable: boolean }
type TableDetails = { name: string; label: string; columns: TableColumn[] }

function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}

const tableGroups = [
  { title: 'Données métier', description: 'Entreprises, sites et suivi des opérations', names: ['companies', 'sites', 'equipment', 'planifications', 'rapports', 'notifications'] },
  { title: 'Comptes et sécurité', description: 'Utilisateurs et paramètres de compte', names: ['app_users', 'account_preferences', 'auth_sessions', 'auth_tokens'] }
]

export default function DatabasePage() {
  const [overview, setOverview] = useState<DatabaseOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, TableDetails>>({})
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null)
  const [detailsError, setDetailsError] = useState<Record<string, string>>({})

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Votre session a expiré. Reconnectez-vous.')
      const response = await fetch(`${apiUrl()}/database/overview`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })
      const payload = await response.json().catch(() => ({})) as { data?: DatabaseOverview; error?: { message?: string } }
      if (!response.ok) throw new Error(payload.error?.message || 'Impossible de lire les informations de la base de données.')
      if (!payload.data) throw new Error('La réponse du serveur est incomplète.')
      setOverview(payload.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur inattendue est survenue.')
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadOverview() }, [loadOverview, refreshKey])

  const tableIcon = (name: string): ModernIconName => {
    if (name === 'sites' || name === 'companies') return 'building'
    if (name === 'equipment') return 'wrench'
    if (name === 'planifications') return 'calendar-check'
    if (name === 'rapports') return 'file-text'
    if (name === 'notifications') return 'bell'
    if (name === 'app_users') return 'users-round'
    return 'database'
  }

  const availableTables = useMemo(() => overview?.tables.filter(table => table.available) ?? [], [overview])
  const missingTables = useMemo(() => overview?.tables.filter(table => !table.available) ?? [], [overview])

  const toggleTable = async (table: DatabaseTable) => {
    if (!table.available) return
    if (expandedTable === table.name) {
      setExpandedTable(null)
      return
    }
    setExpandedTable(table.name)
    if (details[table.name]) return

    setDetailsLoading(table.name)
    setDetailsError(previous => ({ ...previous, [table.name]: '' }))
    try {
      const token = getAccessToken()
      if (!token) throw new Error('Votre session a expiré. Reconnectez-vous.')
      const response = await fetch(`${apiUrl()}/database/tables/${encodeURIComponent(table.name)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      })
      const payload = await response.json().catch(() => ({})) as { data?: TableDetails; error?: { message?: string } }
      if (!response.ok) throw new Error(payload.error?.message || 'Impossible de charger la structure de cette table.')
      if (!payload.data) throw new Error('La réponse du serveur est incomplète.')
      setDetails(previous => ({ ...previous, [table.name]: payload.data! }))
    } catch (e) {
      setDetailsError(previous => ({ ...previous, [table.name]: e instanceof Error ? e.message : 'Erreur inattendue.' }))
    } finally {
      setDetailsLoading(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans font-bold text-xl text-gray-800">Base de données</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">État réel du schéma PostgreSQL Neon · données de votre entreprise uniquement</p>
        </div>
        <button type="button" onClick={() => setRefreshKey(value => value + 1)} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
          <ModernIcon name="database" size={16} /> Actualiser
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">Connexion à la base et lecture du schéma…</div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800">Impossible de charger la base de données</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setRefreshKey(value => value + 1)} className="mt-3 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white">Réessayer</button>
        </div>
      )}

      {!loading && !error && overview && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500"><ModernIcon name="database" size={18} /> Connexion</div>
              <p className="mt-2 text-xl font-bold text-emerald-700">Connectée</p>
              <p className="mt-1 text-xs text-gray-400">Neon PostgreSQL</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500"><ModernIcon name="database" size={18} /> Tables attendues présentes</div>
              <p className="mt-2 text-xl font-bold text-gray-800">{availableTables.length} / {overview.tables.length}</p>
              <p className="mt-1 text-xs text-gray-400">Vérification du schéma public</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500"><ModernIcon name="database" size={18} /> Enregistrements</div>
              <p className="mt-2 text-xl font-bold text-gray-800">{overview.totalRecords.toLocaleString('fr-FR')}</p>
              <p className="mt-1 text-xs text-gray-400">Périmètre de votre entreprise</p>
            </div>
          </div>

          <div className="space-y-5">
            {tableGroups.map(group => {
              const groupTables = group.names.map(name => overview.tables.find(table => table.name === name)).filter((table): table is DatabaseTable => Boolean(table))
              return (
                <section key={group.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                    <h3 className="font-bold text-gray-800">{group.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{group.description}</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {groupTables.map(table => {
                      const expanded = expandedTable === table.name
                      return (
                        <div key={table.name}>
                          <button type="button" onClick={() => void toggleTable(table)} disabled={!table.available}
                            aria-expanded={expanded}
                            className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition sm:px-5 ${table.available ? 'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4A7A3B]' : 'cursor-not-allowed opacity-70'}`}>
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-[#4A7A3B]"><ModernIcon name={tableIcon(table.name)} size={18} /></span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-gray-800">{table.label}</span>
                                <span className="block truncate text-xs text-gray-400">{table.name}</span>
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-3">
                              {table.available
                                ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{(table.count ?? 0).toLocaleString('fr-FR')}</span>
                                : <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Absente</span>}
                              <span aria-hidden="true" className="text-gray-400">{expanded ? '−' : '+'}</span>
                            </span>
                          </button>
                          {expanded && (
                            <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-5">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-800">Structure de {table.name}</h4>
                                  <p className="text-xs text-gray-500">Colonnes et types PostgreSQL · aucune donnée personnelle affichée</p>
                                </div>
                                {details[table.name] && <span className="text-xs text-gray-500">{details[table.name].columns.length} colonne(s)</span>}
                              </div>
                              {detailsLoading === table.name && <p className="text-sm text-gray-500">Chargement de la structure…</p>}
                              {detailsError[table.name] && (
                                <div role="alert" className="flex flex-wrap items-center justify-between gap-2 text-sm text-red-700">
                                  <span>{detailsError[table.name]}</span>
                                  <button type="button" onClick={() => { setDetails(previous => { const next = { ...previous }; delete next[table.name]; return next }); void toggleTable(table) }} className="font-semibold underline">Réessayer</button>
                                </div>
                              )}
                              {details[table.name] && (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {details[table.name].columns.map(column => (
                                    <div key={column.name} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                                      <p className="break-all text-sm font-semibold text-gray-800">{column.name}</p>
                                      <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-[#4A7A3B]">{column.type}</span>
                                        <span className="text-xs text-gray-400">{column.nullable ? 'nullable' : 'obligatoire'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>

          {missingTables.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Schéma incomplet détecté</p>
              <p className="mt-1">Ces tables attendues n’existent pas encore dans Neon : {missingTables.map(table => table.name).join(', ')}. Il faudra appliquer une migration contrôlée avant d’activer les fonctions qui en dépendent.</p>
            </div>
          )}
          <p className="mt-4 text-xs text-gray-400">Dernière vérification : {new Date(overview.checkedAt).toLocaleString('fr-FR')}</p>
        </>
      )}
    </div>
  )
}

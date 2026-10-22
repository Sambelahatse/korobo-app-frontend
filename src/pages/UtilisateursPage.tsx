import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ModernIcon } from '../components/Icons'
import Modal from '../components/Modal'
import SortableHeader from '../components/SortableHeader'
import PhoneNumberField from '../components/PhoneNumberField'
import { isValidPhoneNumber } from 'libphonenumber-js'

type ApiRole = 'admin' | 'manager' | 'technician' | 'viewer'
type UserStatus = 'Actif' | 'Invitation en attente' | 'Suspendu'
type TeamUser = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: ApiRole
  isActive: boolean
  hasPassword: boolean
  createdAt: string
  lastSeenAt: string | null
}
type ApiEnvelope<T> = { data: T; message?: string }
const roleLabels: Record<ApiRole, string> = {
  admin: 'Propriétaire / Administrateur',
  manager: 'Gestionnaire',
  technician: 'Technicien',
  viewer: 'Lecteur',
}
const roleDescriptions: Record<ApiRole, string> = {
  admin: 'Accès complet, gestion des utilisateurs et des rôles.',
  manager: 'Gère les sites, équipements, planifications et rapports.',
  technician: 'Consulte les sites et réalise les opérations de maintenance.',
  viewer: 'Consulte uniquement les informations autorisées.',
}
const inviteRoles: ApiRole[] = ['manager', 'technician', 'viewer']
const allRoles: ApiRole[] = ['admin', 'manager', 'technician', 'viewer']
const inputCls = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-[#5C8A42] focus:ring-2 focus:ring-[#5C8A42]/15'
function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem('korobo.access-token')
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(payload.error?.message || 'Une erreur est survenue. Réessayez.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
function userStatus(user: TeamUser): UserStatus {
  if (user.isActive) return 'Actif'
  return user.hasPassword ? 'Suspendu' : 'Invitation en attente'
}
function displayDate(value: string | null) {
  if (!value) return 'Jamais connecté'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('Tous')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TeamUser | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<ApiRole>('technician')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [activationLink, setActivationLink] = useState('')
  const [saving, setSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await request<ApiEnvelope<TeamUser[]>>('/auth/users')
      setUsers(result.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  const filtered = useMemo(() => {
    const matching = users.filter(user =>
      (roleFilter === 'Tous' || user.role === roleFilter) &&
      (statusFilter === 'Tous' || userStatus(user) === statusFilter) &&
      [user.fullName, user.email, user.phone || ''].some(value => value.toLowerCase().includes(query.toLowerCase()))
    )
    const valueFor = (user: TeamUser): string | number => {
      if (sortKey === 'status') return userStatus(user)
      if (sortKey === 'role') return roleLabels[user.role]
      if (sortKey === 'lastSeenAt') return user.lastSeenAt ? new Date(user.lastSeenAt).getTime() : 0
      if (sortKey === 'createdAt') return new Date(user.createdAt).getTime()
      if (sortKey === 'phone') return user.phone || ''
      if (sortKey === 'email') return user.email
      return user.fullName
    }
    return matching.sort((a, b) => {
      const left = valueFor(a), right = valueFor(b)
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'fr', { sensitivity: 'base', numeric: true })
      return sortDirection === 'asc' ? result : -result
    })
  }, [users, roleFilter, statusFilter, query, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDirection(key === 'createdAt' || key === 'lastSeenAt' ? 'desc' : 'asc') }
  }

  const openCreate = () => {
    setEditing(null); setName(''); setEmail(''); setPhone(''); setRole('technician')
    setError(''); setFeedback(''); setActivationLink(''); setShowForm(true)
  }
  const openEdit = (user: TeamUser) => {
    setEditing(user); setName(user.fullName); setEmail(user.email); setPhone(user.phone || '')
    setRole(user.role); setError(''); setFeedback(''); setActivationLink(''); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setError('') }

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (phone.trim() && !isValidPhoneNumber(phone, 'MG')) {
      setError('Veuillez saisir un numéro de téléphone international valide.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const result = await request<ApiEnvelope<TeamUser>>(`/auth/users/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ fullName: name.trim(), email: email.trim(), phone: phone.trim() || null, role }),
        })
        setUsers(previous => previous.map(user => user.id === editing.id ? { ...user, ...result.data } : user))
        setFeedback('Les informations et le rôle ont été mis à jour.')
      } else {
        const result = await request<ApiEnvelope<TeamUser> & { activationLink: string }>('/auth/users', {
          method: 'POST',
          body: JSON.stringify({ fullName: name.trim(), email: email.trim(), phone: phone.trim() || undefined, role }),
        })
        setActivationLink(result.activationLink)
        setFeedback(`Compte créé sans envoi d’e-mail. Copiez le lien d’activation ci-dessous pour le partager à ${email.trim()}.`)
        await loadUsers()
      }
      closeForm()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'L’enregistrement a échoué.')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user: TeamUser) => {
    setFeedback('')
    setError('')
    try {
      const nextActive = !user.isActive
      await request<ApiEnvelope<TeamUser>>(`/auth/users/${user.id}`, {
        method: 'PATCH', body: JSON.stringify({ isActive: nextActive }),
      })
      setFeedback(nextActive ? `Le compte de ${user.fullName} a été réactivé.` : `Le compte de ${user.fullName} a été suspendu et ses sessions ont été révoquées.`)
      await loadUsers()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de modifier le statut.')
    }
  }

  const resendInvitation = async (user: TeamUser) => {
    setError('')
    setFeedback('')
    setActivationLink('')
    try {
      const result = await request<ApiEnvelope<TeamUser> & { activationLink: string; emailSent: boolean }>(`/auth/users/${user.id}/invite`, { method: 'POST' })
      setActivationLink(result.activationLink)
      setFeedback(result.emailSent
        ? `Invitation renvoyée à ${user.email}. Le lien ci-dessous peut également être partagé.`
        : `Le nouveau lien d’activation est prêt, mais l’e-mail n’a pas pu être envoyé. Partagez le lien ci-dessous.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de renvoyer l’invitation.')
    }
  }

  const copyActivationLink = async () => {
    if (!activationLink) return
    try {
      await navigator.clipboard.writeText(activationLink)
      setFeedback('Lien d’activation copié. Vous pouvez le partager à l’utilisateur.')
    } catch {
      setFeedback('Copiez le lien affiché dans le champ ci-dessous.')
    }
  }

  const activeCount = users.filter(user => user.isActive).length
  const pendingCount = users.filter(user => userStatus(user) === 'Invitation en attente').length
  const currentUserId = (() => { try { return (JSON.parse(window.localStorage.getItem('korobo.auth-profile') || 'null') as { id?: string } | null)?.id || null } catch { return null } })()
  const statusClass = (status: UserStatus) => status === 'Actif'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'Invitation en attente' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'

  return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Équipe & accès</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Utilisateurs et rôles</h1><p className="mt-2 text-sm text-gray-500">Gérez les membres, leurs accès et leurs responsabilités dans KOROBO.</p></div>
      <button onClick={openCreate} className="rounded-xl bg-[#4A7A3B] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3d672f]">+ Créer un utilisateur</button>
    </div>
    {feedback && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{feedback}</div>}
    {activationLink && <div className="rounded-xl border border-[#4A7A3B]/20 bg-white p-4 shadow-sm"><label htmlFor="activation-link" className="block text-sm font-semibold text-gray-800">Lien d’activation à partager</label><p className="mt-1 text-xs text-gray-500">Ce lien est valable 72 heures et ne peut être utilisé qu’une seule fois. Vous pouvez générer un nouveau lien tant que le compte n’est pas activé.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input id="activation-link" readOnly value={activationLink} onFocus={event => event.currentTarget.select()} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600" /><button onClick={() => void copyActivationLink()} className="rounded-xl bg-[#4A7A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d672f]">Copier le lien</button></div></div>}
    {error && !showForm && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><div className="flex flex-wrap items-center justify-between gap-3"><span>{error}</span><button onClick={() => void loadUsers()} className="font-semibold underline">Réessayer</button></div></div>}
    <div className="grid gap-3 sm:grid-cols-3">
      {[{ label: 'Membres', value: users.length, icon: 'user-round' as const }, { label: 'Comptes actifs', value: activeCount, icon: 'check-circle' as const }, { label: 'Invitations en attente', value: pendingCount, icon: 'bell' as const }].map(item => <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={item.icon} size={22} /></div><div><p className="text-sm text-gray-500">{item.label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '—' : item.value}</p></div></div>)}
    </div>
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-bold text-gray-900">Membres de l’équipe</h2><p className="mt-1 text-xs text-gray-500">{loading ? 'Chargement…' : `${filtered.length} compte(s)`}</p></div>
            <button onClick={() => { setQuery(''); setRoleFilter('Tous'); setStatusFilter('Tous') }} className="self-start text-xs font-semibold text-[#4A7A3B] hover:underline">Réinitialiser les filtres</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher nom, e-mail ou téléphone" aria-label="Rechercher un utilisateur" className="min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]" />
            <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label="Filtrer par rôle" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option value="Tous">Tous les rôles</option>{allRoles.map(item => <option key={item} value={item}>{roleLabels[item]}</option>)}</select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filtrer par statut" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option value="Tous">Tous les statuts</option><option value="Actif">Actif</option><option value="Invitation en attente">Invitation en attente</option><option value="Suspendu">Suspendu</option></select>
          </div>
        </div>
        {loading ? <div className="p-10 text-center text-sm text-gray-500">Chargement des utilisateurs…</div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <SortableHeader label="Nom" sortKey="fullName" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="E-mail" sortKey="email" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="Téléphone" sortKey="phone" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="Rôle" sortKey="role" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="Statut" sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="Créé le" sortKey="createdAt" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <SortableHeader label="Dernière activité" sortKey="lastSeenAt" activeKey={sortKey} direction={sortDirection} onSort={handleSort} className="px-4 py-3" />
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => {
                const status = userStatus(user)
                return <tr key={user.id} className="align-middle hover:bg-gray-50/70">
                  <td className="px-4 py-3 font-semibold text-gray-900">{user.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                  <td className="px-4 py-3"><span className="inline-block max-w-[190px] rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600">{roleLabels[user.role]}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{status}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(user.createdAt))}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{displayDate(user.lastSeenAt)}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(user)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#5C8A42] hover:text-[#4A7A3B]">Modifier</button>
                    {status === 'Invitation en attente' && <button onClick={() => void resendInvitation(user)} className="whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">Renvoyer l’invitation</button>}
                    {user.id !== currentUserId && <button onClick={() => void toggleStatus(user)} className="whitespace-nowrap rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-rose-200 hover:text-rose-600">{user.isActive ? 'Suspendre' : 'Réactiver'}</button>}
                  </div></td>
                </tr>
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-sm text-gray-500">Aucun utilisateur trouvé.</td></tr>}
            </tbody>
          </table>
        </div>}
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><ModernIcon name="shield-check" size={20} /><h2 className="font-bold text-gray-900">Rôles et permissions</h2></div><p className="mb-4 text-sm leading-6 text-gray-500">Les permissions sont contrôlées côté API. L’interface ne remplace pas les vérifications d’accès du serveur.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{allRoles.map(item => <div key={item} className="rounded-xl border border-gray-100 p-3"><p className="text-sm font-semibold text-gray-800">{roleLabels[item]}</p><p className="mt-1 text-xs leading-5 text-gray-500">{roleDescriptions[item]}</p></div>)}</div><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Un administrateur actif doit toujours être conservé. Un compte suspendu ne peut plus utiliser ses sessions existantes.</div></section>
    </div>
    {showForm && <Modal title={editing ? 'Modifier un utilisateur' : 'Créer un utilisateur'} onClose={closeForm}>
      <form onSubmit={saveUser} className="space-y-4 p-1">
        <label className="block text-sm font-semibold text-gray-700">Nom complet<input required minLength={2} maxLength={160} value={name} onChange={event => setName(event.target.value)} placeholder="Nom et prénom" className={inputCls} /></label>
        <label className="block text-sm font-semibold text-gray-700">Adresse e-mail<input required type="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="nom@entreprise.com" className={inputCls} /></label>
        <label className="block text-sm font-semibold text-gray-700">Téléphone (facultatif)<div className="mt-1.5"><PhoneNumberField value={phone} onChange={setPhone} placeholder="Numéro de téléphone" /></div></label>
        <label className="block text-sm font-semibold text-gray-700">Rôle<select value={role} onChange={event => setRole(event.target.value as ApiRole)} className={inputCls}>{(editing ? allRoles : inviteRoles).map(item => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></label>
        {!editing && <p className="rounded-xl border border-[#4A7A3B]/20 bg-[#f4f8f1] p-3 text-xs leading-5 text-gray-600">Le compte sera créé en attente d’activation. Vous pourrez copier le lien d’activation, le partager vous-même et renvoyer une invitation à tout moment tant que le compte n’est pas activé.</p>}
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button><button disabled={saving} type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f] disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Créer le compte'}</button></div>
      </form>
    </Modal>}
  </div>
}

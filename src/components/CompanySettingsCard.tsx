import { useEffect, useState } from 'react'
import { showToast } from './ToastViewport'
import { getAccessToken } from '../services/authService'

interface CompanyProfile {
  id: string
  name: string
  description: string | null
  sector: string | null
  legalForm: string | null
  taxId: string | null
  statisticalId: string | null
  address: string | null
  city: string | null
  region: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  logoUrl: string | null
}
type CompanyDraft = Omit<CompanyProfile, 'id'> 
const emptyCompany: CompanyDraft = {
  name: '', description: '', sector: '', legalForm: '', taxId: '', statisticalId: '',
  address: '', city: '', region: '', country: 'Madagascar', phone: '', email: '', website: '', logoUrl: ''
}
const inputClass = 'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10'
const fields: Array<{ key: keyof CompanyDraft; label: string; type?: string; wide?: boolean; placeholder?: string }> = [
  { key: 'name', label: 'Nom de l’entreprise', wide: true, placeholder: 'Ex. : KOROBO Énergie' },
  { key: 'sector', label: 'Secteur d’activité', placeholder: 'Ex. : Énergie solaire' },
  { key: 'legalForm', label: 'Forme juridique', placeholder: 'Ex. : SARL, SA…' },
  { key: 'taxId', label: 'Numéro d’identification fiscale (NIF)' },
  { key: 'statisticalId', label: 'Numéro statistique (STAT)' },
  { key: 'phone', label: 'Téléphone professionnel', type: 'tel' },
  { key: 'email', label: 'E-mail professionnel', type: 'email' },
  { key: 'address', label: 'Adresse', wide: true },
  { key: 'city', label: 'Ville' },
  { key: 'region', label: 'Région' },
  { key: 'country', label: 'Pays' },
  { key: 'website', label: 'Site web', type: 'url', wide: true, placeholder: 'https://exemple.mg' },
  { key: 'logoUrl', label: 'URL du logo', type: 'url', wide: true, placeholder: 'https://…' },
]
function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(apiUrl() + path, {
    ...init, cache: 'no-store',
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), Authorization: 'Bearer ' + token, ...init.headers }
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(payload.error?.message || 'Impossible d’enregistrer les informations de l’entreprise.')
  }
  return response.json() as Promise<T>
}
export default function CompanySettingsCard() {
  const [draft, setDraft] = useState<CompanyDraft>(emptyCompany)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const profile = (() => { try { return JSON.parse(window.localStorage.getItem('korobo.auth-profile') || '{}') as { role?: string } } catch { return {} } })()
    setCanEdit(profile.role === 'admin')
    request<{ data: CompanyProfile }>('/company').then(result => {
      if (!active) return
      const { id: _id, ...company } = result.data
      setDraft({ ...emptyCompany, ...company })
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Impossible de charger l’entreprise.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const update = (key: keyof CompanyDraft, value: string) => setDraft(current => ({ ...current, [key]: value }))
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canEdit) return
    if (draft.name.trim().length < 2) { setError('Le nom de l’entreprise doit contenir au moins 2 caractères.'); return }
    setSaving(true); setError('')
    try {
      const result = await request<{ data: CompanyProfile }>('/company', {
        method: 'PATCH',
        body: JSON.stringify(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, typeof value === 'string' ? value.trim() || null : value])))
      })
      const { id: _id, ...company } = result.data
      setDraft({ ...emptyCompany, ...company })
      showToast('Les informations de l’entreprise ont été enregistrées.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'L’enregistrement a échoué.'
      setError(message); showToast(message, 'error')
    } finally { setSaving(false) }
  }
  return <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
      <h3 className="text-sm font-bold text-gray-800">Informations de l’entreprise</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">Ces informations sont propres à votre entreprise et ne sont pas partagées avec les autres espaces KOROBO.</p>
    </div>
    {loading ? <div className="p-6 text-sm text-gray-500">Chargement des informations de l’entreprise…</div> : error && !draft.name ? <div role="alert" className="p-5 text-sm text-red-700">{error}</div> : <form onSubmit={save} className="space-y-5 px-5 py-5 sm:px-6">
      {!canEdit && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Consultation uniquement : seul un administrateur de l’entreprise peut modifier ces informations.</p>}
      {draft.logoUrl && <div className="flex items-center gap-3"><img src={draft.logoUrl} alt="Logo de l’entreprise" className="h-14 w-14 rounded-xl border border-gray-100 object-contain" onError={event => { event.currentTarget.style.display = 'none' }} /><span className="text-xs text-gray-500">Aperçu du logo</span></div>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(field => <label key={field.key} className={'block text-sm font-semibold text-gray-700 ' + (field.wide ? 'sm:col-span-2' : '')}>
          {field.label}
          <input className={inputClass} type={field.type || 'text'} maxLength={field.key === 'description' ? 2000 : 500} value={draft[field.key] || ''} onChange={event => update(field.key, event.target.value)} readOnly={!canEdit} placeholder={field.placeholder} />
        </label>)}
        <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">Description de l’entreprise
          <textarea className={inputClass} rows={3} maxLength={2000} value={draft.description || ''} onChange={event => update('description', event.target.value)} readOnly={!canEdit} placeholder="Présentez brièvement votre activité…" />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {canEdit && <div className="flex justify-end"><button disabled={saving} type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Enregistrement…' : 'Enregistrer les informations'}</button></div>}
    </form>}
  </section>
}

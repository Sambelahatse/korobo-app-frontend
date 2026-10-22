import { useCallback, useEffect, useState } from 'react'
import PhoneNumberField from '../components/PhoneNumberField'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { showToast } from '../components/ToastViewport'
import {
  defaultPreferences, settingsService, type AccountPreferences, type AccountProfile, type AccountSession,
} from '../services/settingsService'

const inputClass = 'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10'
function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-4 sm:px-6"><h3 className="text-sm font-bold text-gray-800">{title}</h3>{description && <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>}</div>
    <div className="space-y-4 px-5 py-5 sm:px-6">{children}</div>
  </section>
}
function Switch({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  const inputId = `preference-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return <div className="flex items-center justify-between gap-4 py-3">
    <div className="min-w-0">
      <label htmlFor={inputId} className="cursor-pointer text-sm font-semibold text-gray-800">{label}</label>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
    <label htmlFor={inputId} className="relative inline-flex flex-shrink-0 cursor-pointer items-center">
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={event => onChange(event.currentTarget.checked)}
        className="peer sr-only"
        aria-label={label}
      />
      <span aria-hidden="true" className="h-6 w-11 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-[#4A7A3B] peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-[#4A7A3B]/20" />
      <span aria-hidden="true" className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
    </label>
  </div>
}
function formatDate(value: string | null) {
  if (!value) return 'Pas encore utilisée'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date inconnue' : date.toLocaleString('fr-FR')
}
function deviceLabel(session: AccountSession) {
  const ua = session.userAgent || ''
  if (/iphone|ipad/i.test(ua)) return 'Appareil Apple'
  if (/android/i.test(ua)) return 'Appareil Android'
  if (/windows/i.test(ua)) return 'Ordinateur Windows'
  if (/macintosh|mac os/i.test(ua)) return 'Ordinateur Mac'
  if (/linux/i.test(ua)) return 'Ordinateur Linux'
  return 'Navigateur ou appareil'
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [preferences, setPreferences] = useState<AccountPreferences>(defaultPreferences)
  const [sessions, setSessions] = useState<AccountSession[]>([])
  const [googleLinked, setGoogleLinked] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [setupPassword, setSetupPassword] = useState('')
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [account, activeSessions] = await Promise.all([settingsService.getAccount(), settingsService.getSessions()])
      setProfile(account.profile)
      setDraftName(account.profile.fullName)
      setDraftPhone(account.profile.phone || '')
      setGoogleLinked(account.googleLinked)
      setPreferences(account.preferences || defaultPreferences)
      setSessions(activeSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les paramètres du compte.')
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => { document.documentElement.dataset.theme = preferences.theme.toLowerCase() }, [preferences.theme])
  useEffect(() => { if (message) showToast(message, 'success') }, [message])
  useEffect(() => { if (error) showToast(error, 'error') }, [error])

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setError(''); setMessage('')
    try { await action(); setMessage(success) }
    catch (err) { setError(err instanceof Error ? err.message : 'L’opération a échoué.') }
    finally { setBusy(false) }
  }
  const saveProfile = () => run(async () => {
    if (draftName.trim().length < 2) throw new Error('Le nom complet doit contenir au moins 2 caractères.')
    if (draftPhone.trim() && !isValidPhoneNumber(draftPhone, 'MG')) throw new Error('Veuillez saisir un numéro de téléphone valide.')
    const updated = await settingsService.updateProfile({ fullName: draftName.trim(), phone: draftPhone.trim() || null })
    setProfile(updated); setDraftName(updated.fullName); setDraftPhone(updated.phone || '')
  }, 'Les informations personnelles ont été enregistrées.')
  const savePreferences = () => run(async () => {
    const saved = await settingsService.savePreferences(preferences)
    setPreferences({ ...defaultPreferences, ...saved, notifications: { ...defaultPreferences.notifications, ...saved.notifications }, security: { ...defaultPreferences.security, ...saved.security } })
    document.documentElement.dataset.theme = saved.theme.toLowerCase()
  }, 'Les préférences et notifications ont été enregistrées.')
  const submitPassword = () => run(async () => {
    if (newPassword.length < 12) throw new Error('Le nouveau mot de passe doit contenir au moins 12 caractères.')
    if (newPassword !== confirmPassword) throw new Error('La confirmation du mot de passe ne correspond pas.')
    await settingsService.changePassword(currentPassword, newPassword)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    await load()
  }, 'Le mot de passe a été modifié.')
  const submitSetupPassword = () => run(async () => {
    if (setupPassword.length < 12) throw new Error('Le mot de passe doit contenir au moins 12 caractères.')
    if (setupPassword !== confirmSetupPassword) throw new Error('La confirmation du mot de passe ne correspond pas.')
    await settingsService.setPassword(setupPassword)
    setHasPassword(true); setSetupPassword(''); setConfirmSetupPassword('')
    await load()
  }, 'Le mot de passe a été configuré.')
  const connectGoogle = () => run(async () => {
    const url = await settingsService.getGoogleLinkUrl()
    window.location.assign(url)
  }, 'Redirection vers Google…')
  const unlinkGoogle = () => run(async () => {
    await settingsService.unlinkGoogle()
    setGoogleLinked(false)
  }, 'Le compte Google a été dissocié.')
  const revokeSession = (session: AccountSession) => run(async () => {
    await settingsService.revokeSession(session.id)
    if (session.current) {
      window.localStorage.removeItem('korobo.access-token')
      window.localStorage.removeItem('korobo.auth-profile')
      window.dispatchEvent(new Event('korobo:logout'))
      window.location.hash = '#/login'
      return
    }
    setSessions(current => current.filter(item => item.id !== session.id))
  }, 'La session a été révoquée.')
  const deleteAccount = () => run(async () => {
    if (!profile) throw new Error('Compte introuvable.')
    if (deleteEmail.trim().toLowerCase() !== profile.email.toLowerCase()) throw new Error('Saisissez exactement votre adresse e-mail pour confirmer.')
    await settingsService.deleteAccount(deleteEmail.trim(), deletePassword || undefined)
    window.location.hash = '#/login'
  }, 'Le compte a été désactivé.')
  const initials = profile?.fullName.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'K'

  if (loading) return <div className="p-8 text-sm text-gray-500">Chargement des paramètres du compte…</div>
  if (!profile && error) return <div className="p-4 sm:p-8"><div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => void load()} className="ml-3 font-semibold underline">Réessayer</button></div></div>

  return <div className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-3xl space-y-5">
    <div className="mb-2"><h2 className="text-xl font-bold text-gray-800">Paramètres du compte</h2><p className="mt-1 text-sm text-gray-500">Gérez vos informations, votre sécurité et vos préférences.</p></div>

    <Card title="Informations personnelles" description="Ces informations sont enregistrées dans votre compte KOROBO.">
      <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4A7A3B] text-lg font-bold text-white">{initials}</div><div><p className="font-semibold text-gray-800">{profile?.fullName}</p><p className="text-xs text-gray-500">{profile?.role}</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Nom complet<input className={inputClass} autoComplete="name" maxLength={160} value={draftName} onChange={e => setDraftName(e.target.value)} /></label>
        <label className="block text-sm font-semibold text-gray-700">Téléphone<div className="mt-1.5"><PhoneNumberField value={draftPhone} onChange={setDraftPhone} /></div></label>
        <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">Adresse e-mail<input className={inputClass + ' bg-gray-50 text-gray-500'} value={profile?.email || ''} readOnly /><span className="mt-1 block text-xs font-normal text-gray-400">L’adresse e-mail est protégée. Sa modification nécessite une procédure de vérification distincte.</span></label>
      </div>
      <button disabled={busy} onClick={() => void saveProfile()} className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Enregistrer le profil</button>
    </Card>

    <Card title="Sécurité et mot de passe" description="Le mot de passe est vérifié et modifié côté serveur.">
      {hasPassword ? <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void submitPassword() }}>
        <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Mot de passe actuel<input className={inputClass} type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label>
        <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe<input className={inputClass} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} required /><span className="mt-1 block text-xs font-normal text-gray-400">12 caractères minimum.</span></label>
        <label className="text-sm font-semibold text-gray-700">Confirmation<input className={inputClass} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label>
        <div className="sm:col-span-2"><button disabled={busy} type="submit" className="rounded-xl border border-[#4A7A3B]/30 px-4 py-2.5 text-sm font-semibold text-[#4A7A3B] disabled:opacity-50">Modifier le mot de passe</button></div>
      </form> : <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void submitSetupPassword() }}>
        <p className="text-sm leading-relaxed text-gray-600 sm:col-span-2">Votre compte n’a pas encore de mot de passe KOROBO. Définissez-en un pour pouvoir dissocier Google et utiliser la connexion par e-mail.</p>
        <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe<input className={inputClass} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={setupPassword} onChange={e => setSetupPassword(e.target.value)} required /></label>
        <label className="text-sm font-semibold text-gray-700">Confirmation<input className={inputClass} type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmSetupPassword} onChange={e => setConfirmSetupPassword(e.target.value)} required /></label>
        <div className="sm:col-span-2"><button disabled={busy} type="submit" className="rounded-xl border border-[#4A7A3B]/30 px-4 py-2.5 text-sm font-semibold text-[#4A7A3B] disabled:opacity-50">Définir un mot de passe</button></div>
      </form>}
    </Card>

    <Card title="Compte Google" description="L’association permet d’utiliser Google pour se connecter à KOROBO.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-gray-800">{googleLinked ? 'Un compte Google est associé' : 'Aucun compte Google associé'}</p><p className="mt-1 text-xs text-gray-500">{googleLinked ? (hasPassword ? 'Vous pouvez dissocier Google.' : 'Définissez un mot de passe KOROBO avant de dissocier Google.') : 'L’association nécessite une authentification Google vérifiée.'}</p></div>
        {googleLinked && hasPassword ? <button disabled={busy} onClick={() => void unlinkGoogle()} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50">Dissocier Google</button> : googleLinked ? <span className="text-xs text-gray-500">Mot de passe requis pour dissocier</span> : <button disabled={busy} onClick={() => void connectGoogle()} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50">Associer Google</button>}</div>
    </Card>

    <Card title="Notifications et préférences" description="Les préférences sont stockées sur votre compte, pas uniquement dans ce navigateur.">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Langue<select className={inputClass} value={preferences.language} onChange={e => setPreferences(p => ({ ...p, language: e.target.value as AccountPreferences['language'] }))}>{['Français','English','Malagasy'].map(x => <option key={x}>{x}</option>)}</select></label><label className="text-sm font-semibold text-gray-700">Thème<select className={inputClass} value={preferences.theme} onChange={e => setPreferences(p => ({ ...p, theme: e.target.value as AccountPreferences['theme'] }))}>{['Clair','Sombre','Système'].map(x => <option key={x}>{x}</option>)}</select></label></div>
      <div className="divide-y divide-gray-100">{([
        ['email','Notifications par e-mail','Recevoir les notifications par e-mail'],
        ['push','Notifications push','Préférence pour les alertes en temps réel'],
        ['outageAlerts','Alertes de panne','Être averti des pannes détectées'],
        ['maintenanceReminders','Rappels de maintenance','Recevoir les rappels d’intervention'],
        ['monthlyReports','Rapports mensuels','Recevoir les rapports de fin de mois'],
      ] as const).map(([key,label,desc]) => <Switch key={key} label={label} description={desc} checked={preferences.notifications[key]} onChange={value => setPreferences(p => ({ ...p, notifications: { ...p.notifications, [key]: value } }))} />)}</div>
      <Switch label="Déconnexion automatique" description="Préférence enregistrée pour la gestion future de l’inactivité." checked={preferences.security.sessionTimeout} onChange={value => setPreferences(p => ({ ...p, security: { ...p.security, sessionTimeout: value } }))} />
      <button disabled={busy} onClick={() => void savePreferences()} className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Enregistrer les préférences</button>
      <p className="text-xs leading-relaxed text-gray-400">Ces réglages enregistrent les préférences. L’envoi réel des e-mails et notifications push dépend encore de l’activation des services de notification.</p>
    </Card>

    <Card title="Sessions actives" description="Révoquez une session pour empêcher son jeton de continuer à être utilisé.">
      {sessions.length === 0 ? <p className="text-sm text-gray-500">Aucune session active enregistrée.</p> : <div className="divide-y divide-gray-100">{sessions.map(session => <div key={session.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-800">{deviceLabel(session)}</p>{session.current && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Session actuelle</span>}</div><p className="mt-1 text-xs text-gray-500">Créée : {formatDate(session.createdAt)}</p><p className="text-xs text-gray-500">Dernière activité : {formatDate(session.lastSeenAt)}{session.ipAddress ? ' · IP ' + session.ipAddress : ''}</p></div><button disabled={busy} onClick={() => void revokeSession(session)} className="self-start rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">{session.current ? 'Déconnecter cette session' : 'Révoquer'}</button></div>)}</div>}
      <button onClick={() => void load()} className="text-sm font-semibold text-[#4A7A3B] underline">Actualiser les sessions</button>
    </Card>

    <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
      <h3 className="text-sm font-bold text-red-800">Zone dangereuse — suppression du compte</h3>
      <p className="mt-1 text-sm leading-relaxed text-red-700">Le compte sera désactivé, les identifiants de connexion seront neutralisés et les sessions révoquées. Les données opérationnelles associées sont conservées pour préserver l’historique des interventions.</p>
      {!showDeleteForm ? <button onClick={() => setShowDeleteForm(true)} className="mt-4 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">Supprimer mon compte…</button> : <form className="mt-4 space-y-3" onSubmit={e => { e.preventDefault(); void deleteAccount() }}>
        <label className="block text-sm font-semibold text-red-900">Saisissez votre adresse e-mail pour confirmer<input className={inputClass} type="email" autoComplete="email" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)} required /></label>
        <label className="block text-sm font-semibold text-red-900">Mot de passe actuel (si configuré)<input className={inputClass} type="password" autoComplete="current-password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} maxLength={128} /></label>
        <div className="flex flex-wrap gap-2"><button disabled={busy} type="submit" className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Confirmer la suppression</button><button type="button" onClick={() => { setShowDeleteForm(false); setDeleteEmail(''); setDeletePassword('') }} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">Annuler</button></div>
      </form>}
    </section>
  </div></div>
}

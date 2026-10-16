import { useEffect, useState } from 'react'
import { ModernIcon, type ModernIconName } from '../components/Icons'
import Modal from '../components/Modal'
import {
  defaultProfile,
  settingsService,
  type AccountPreferences,
  type AccountProfile,
} from '../services/settingsService'

interface ToggleProps {
  label: string
  desc?: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}
function Toggle({ label, desc, value, onChange, disabled = false }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="mt-0.5 text-xs leading-snug text-gray-400">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' + (value ? 'bg-[#4A7A3B]' : 'bg-gray-200')}
      >
        <span className={'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ' + (value ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: ModernIconName; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5 border-b border-gray-50 px-4 py-3 sm:px-6 sm:py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5e8] text-[#4A7A3B]"><ModernIcon name={icon} size={19} /></span>
        <h3 className="font-sans text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50 px-4 sm:px-6">{children}</div>
    </section>
  )
}

const inputCls = 'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10'

export default function SettingsPage() {
  const [profile, setProfile] = useState<AccountProfile>(() => settingsService.getProfile())
  const [preferences, setPreferences] = useState<AccountPreferences>(() => settingsService.getPreferences())
  const [draftProfile, setDraftProfile] = useState<AccountProfile>(profile)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme.toLowerCase()
  }, [preferences.theme])

  const updatePreferences = (patch: Partial<AccountPreferences>) => {
    setPreferences(current => ({ ...current, ...patch }))
    setSaved(false)
    setMessage('')
  }

  const updateNotification = (key: keyof AccountPreferences['notifications'], value: boolean) => {
    setPreferences(current => ({
      ...current,
      notifications: { ...current.notifications, [key]: value },
    }))
    setSaved(false)
    setMessage('')
  }

  const updateSecurity = (key: keyof AccountPreferences['security'], value: boolean) => {
    setPreferences(current => ({
      ...current,
      security: { ...current.security, [key]: value },
    }))
    setSaved(false)
    setMessage('')
  }

  const handleSave = () => {
    try {
      settingsService.saveProfile(profile)
      settingsService.savePreferences(preferences)
      setSaved(true)
      setMessage('Vos préférences ont été enregistrées sur cet appareil.')
      window.setTimeout(() => setSaved(false), 3500)
    } catch {
      setSaved(false)
      setMessage('Impossible d’enregistrer les paramètres dans le navigateur. Vérifiez les autorisations de stockage.')
    }
  }

  const openProfileModal = () => {
    setDraftProfile(profile)
    setShowProfileModal(true)
  }

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = { ...draftProfile, name: draftProfile.name.trim(), email: draftProfile.email.trim() }
    if (!normalized.name || !normalized.email) return
    setProfile(normalized)
    settingsService.saveProfile(normalized)
    setShowProfileModal(false)
    setSaved(true)
    setMessage('Profil enregistré sur cet appareil.')
    window.setTimeout(() => setSaved(false), 3500)
  }

  const initials = profile.name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <div>
            <h2 className="font-sans text-xl font-bold text-gray-800">Paramètres</h2>
            <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">Compte et préférences</p>
          </div>
          {saved && <span className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700">✓ Enregistré</span>}
        </div>

        {message && (
          <div role="status" className={'mb-4 rounded-xl border px-4 py-3 text-sm ' + (message.startsWith('Impossible') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800')}>
            {message}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          <Section title="Profil utilisateur" icon="user-round">
            <div className="py-4">
              <div className="mb-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#4A7A3B] text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">{initials}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">{profile.name}</p>
                  <p className="text-sm text-gray-400">{profile.role}</p>
                  <p className="mt-1 text-xs text-gray-400">Photo de profil : disponible avec le backend</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><p className="text-xs font-medium text-gray-400">E-mail</p><p className="mt-1 break-all font-medium text-gray-800">{profile.email}</p></div>
                  <div><p className="text-xs font-medium text-gray-400">Téléphone</p><p className="mt-1 font-medium text-gray-800">{profile.phone || 'Non renseigné'}</p></div>
                  <div><p className="text-xs font-medium text-gray-400">Rôle</p><p className="mt-1 font-medium text-gray-800">{profile.role}</p></div>
                </div>
                <button type="button" onClick={openProfileModal} className="mt-4 rounded-lg border border-[#4A7A3B]/20 bg-white px-4 py-2 text-sm font-semibold text-[#4A7A3B] transition hover:bg-[#edf5e8]">Modifier le profil</button>
              </div>
            </div>
          </Section>

          <Section title="Préférences d'affichage" icon="palette">
            <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 sm:gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-500">Langue
                <select className={inputCls + ' appearance-none'} value={preferences.language} onChange={event => updatePreferences({ language: event.target.value })}>
                  {['Français', 'English', 'Malagasy'].map(language => <option key={language}>{language}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-500">Thème
                <select className={inputCls + ' appearance-none'} value={preferences.theme} onChange={event => updatePreferences({ theme: event.target.value })}>
                  {['Clair', 'Sombre', 'Système'].map(theme => <option key={theme}>{theme}</option>)}
                </select>
              </label>
              <p className="text-xs leading-relaxed text-gray-400 sm:col-span-2">Les choix sont mémorisés sur cet appareil. La traduction complète de l’application et l’application du thème à toutes les pages restent à intégrer.</p>
            </div>
          </Section>

          <Section title="Notifications" icon="bell">
            <Toggle label="Notifications par e-mail" desc="Préférence pour les alertes envoyées par e-mail" value={preferences.notifications.email} onChange={value => updateNotification('email', value)} />
            <Toggle label="Notifications push" desc="Préférence pour les alertes en temps réel" value={preferences.notifications.push} onChange={value => updateNotification('push', value)} />
            <Toggle label="Alertes de panne" desc="Préférence pour les notifications de panne" value={preferences.notifications.outageAlerts} onChange={value => updateNotification('outageAlerts', value)} />
            <Toggle label="Rappels de maintenance" desc="Préférence pour les rappels avant intervention" value={preferences.notifications.maintenanceReminders} onChange={value => updateNotification('maintenanceReminders', value)} />
            <Toggle label="Rapports mensuels" desc="Préférence pour recevoir les rapports de fin de mois" value={preferences.notifications.monthlyReports} onChange={value => updateNotification('monthlyReports', value)} />
            <p className="pb-4 pt-2 text-xs leading-relaxed text-gray-400">Ces options sont sauvegardées localement. L’envoi effectif des e-mails, notifications push et rapports nécessitera le backend.</p>
          </Section>

          <Section title="Sécurité" icon="shield-check">
            <Toggle label="Authentification à deux facteurs" desc="À activer lorsque le service d’authentification sera connecté" value={preferences.security.twoFactor} onChange={value => updateSecurity('twoFactor', value)} disabled />
            <Toggle label="Déconnexion automatique" desc="Préférence d’expiration après une période d’inactivité" value={preferences.security.sessionTimeout} onChange={value => updateSecurity('sessionTimeout', value)} />
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Changer le mot de passe</p>
                <p className="mt-0.5 text-xs text-gray-400">Nécessite un service d’authentification côté serveur</p>
              </div>
              <button type="button" onClick={() => setShowPasswordModal(true)} className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-[#4A7A3B] hover:text-[#4A7A3B] sm:px-4 sm:text-sm">Détails</button>
            </div>
            <p className="pb-4 pt-2 text-xs leading-relaxed text-amber-700">Les fonctions de sécurité réelles ne doivent pas être simulées dans le navigateur. Elles seront activées avec le backend.</p>
          </Section>

          <button type="button" onClick={handleSave} className="w-full rounded-xl bg-[#4A7A3B] py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#4A7A3B]/20 transition-colors hover:bg-[#5C8A42] active:scale-[0.99] sm:py-3.5">
            Enregistrer les modifications
          </button>

          <div className="rounded-xl border border-red-100 bg-red-50 p-4 sm:p-5">
            <h3 className="mb-1 font-sans text-sm font-bold text-red-700">Zone dangereuse</h3>
            <p className="mb-3 text-xs leading-relaxed text-red-500">La suppression réelle du compte doit être réalisée et vérifiée par le serveur. Aucun compte ne sera supprimé depuis cette version de démonstration.</p>
            <button type="button" onClick={() => setMessage('La suppression du compte sera disponible après la mise en place du backend et d’une vérification d’identité.')} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 sm:px-4 sm:text-sm">À configurer avec le backend</button>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <Modal title="Modifier le profil" description="Les informations sont enregistrées dans le navigateur pour cette version de démonstration." onClose={() => setShowProfileModal(false)}>
          <form onSubmit={saveProfile} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Nom complet
              <input required maxLength={100} className={inputCls} value={draftProfile.name} onChange={event => setDraftProfile(current => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="block text-sm font-semibold text-gray-700">Téléphone
              <input type="tel" maxLength={30} className={inputCls} value={draftProfile.phone} onChange={event => setDraftProfile(current => ({ ...current, phone: event.target.value }))} />
            </label>
            <label className="block text-sm font-semibold text-gray-700">Adresse e-mail
              <input required type="email" maxLength={254} className={inputCls} value={draftProfile.email} onChange={event => setDraftProfile(current => ({ ...current, email: event.target.value }))} />
            </label>
            <div className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">Le rôle « {profile.role} » est en lecture seule ici. Les permissions doivent être validées par le serveur, pas modifiées par l’utilisateur.</div>
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowProfileModal(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600">Annuler</button>
              <button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal title="Sécurité du compte" description="Le changement de mot de passe ne peut pas être sécurisé sans un backend d’authentification." onClose={() => setShowPasswordModal(false)}>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-600">Cette version utilise des données de démonstration côté frontend. Pour éviter de donner une fausse impression de sécurité, aucun mot de passe ne sera demandé ni enregistré dans le navigateur.</p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">À connecter : vérification du mot de passe actuel, validation du nouveau mot de passe côté serveur et invalidation des sessions si nécessaire.</div>
            <div className="flex justify-end"><button type="button" onClick={() => setShowPasswordModal(false)} className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white">Compris</button></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

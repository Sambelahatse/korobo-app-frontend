import { useState } from 'react'

interface ToggleProps { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }
function Toggle({ label, desc, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ' + (value ? 'bg-[#3d6b2a]' : 'bg-gray-200')}>
        <div className={'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (value ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <h3 className="font-syne font-bold text-sm text-gray-800">{title}</h3>
      </div>
      <div className="px-4 sm:px-6 divide-y divide-gray-50">{children}</div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3d6b2a] transition-colors'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [nom,    setNom]    = useState('Rakoto Jean')
  const [email,  setEmail]  = useState('jean.rakoto@korobo.mg')
  const [tel,    setTel]    = useState('+261 34 00 000 01')
  const [role,   setRole]   = useState('Administrateur')
  const [langue, setLangue] = useState('Français')
  const [theme,  setTheme]  = useState('Clair')

  const [notifEmail,   setNotifEmail]   = useState(true)
  const [notifPush,    setNotifPush]    = useState(false)
  const [notifAlerte,  setNotifAlerte]  = useState(true)
  const [notifRappel,  setNotifRappel]  = useState(true)
  const [notifRapport, setNotifRapport] = useState(false)
  const [twoFactor,    setTwoFactor]    = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="font-syne font-bold text-xl text-gray-800">Paramètres</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Compte et préférences</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm font-semibold">
              ✓ <span className="hidden sm:inline">Sauvegardé</span>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Profil */}
          <Section title="Profil utilisateur" icon="👤">
            <div className="py-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 sm:gap-4 mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#3d6b2a] flex items-center justify-center text-white font-syne font-bold text-xl sm:text-2xl flex-shrink-0">
                  {nom.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{nom}</p>
                  <p className="text-sm text-gray-400">{role}</p>
                  <button className="text-xs text-[#3d6b2a] hover:underline mt-0.5">Changer la photo</button>
                </div>
              </div>

              {/* Form fields — stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Nom complet</label>
                  <input className={inputCls} value={nom} onChange={e => setNom(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Téléphone</label>
                  <input className={inputCls} value={tel} onChange={e => setTel(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500">Email</label>
                  <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Rôle</label>
                  <select className={inputCls + ' appearance-none'} value={role} onChange={e => setRole(e.target.value)}>
                    {['Administrateur','Technicien','Responsable site','Superviseur'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Section>

          {/* Préférences */}
          <Section title="Préférences d'affichage" icon="🎨">
            <div className="py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Langue</label>
                  <select className={inputCls + ' appearance-none'} value={langue} onChange={e => setLangue(e.target.value)}>
                    {['Français','English','Malagasy'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Thème</label>
                  <select className={inputCls + ' appearance-none'} value={theme} onChange={e => setTheme(e.target.value)}>
                    {['Clair','Sombre','Système'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon="🔔">
            <Toggle label="Notifications par email"    desc="Alertes sur votre boîte mail"          value={notifEmail}   onChange={setNotifEmail}   />
            <Toggle label="Notifications push"         desc="Alertes en temps réel"                  value={notifPush}    onChange={setNotifPush}    />
            <Toggle label="Alertes de panne"           desc="Notification immédiate en cas de panne" value={notifAlerte}  onChange={setNotifAlerte}  />
            <Toggle label="Rappels de maintenance"     desc="Rappel 24h avant intervention"          value={notifRappel}  onChange={setNotifRappel}  />
            <Toggle label="Rapports mensuels"          desc="Envoi auto en fin de mois"              value={notifRapport} onChange={setNotifRapport} />
          </Section>

          {/* Sécurité */}
          <Section title="Sécurité" icon="🔒">
            <Toggle label="Authentification 2 facteurs" desc="Code SMS à chaque connexion"         value={twoFactor}      onChange={setTwoFactor}      />
            <Toggle label="Déconnexion automatique"     desc="Après 30 min d'inactivité"           value={sessionTimeout} onChange={setSessionTimeout} />
            <div className="flex items-center justify-between py-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Changer le mot de passe</p>
                <p className="text-xs text-gray-400 mt-0.5">Modifié il y a 3 mois</p>
              </div>
              <button className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:border-[#3d6b2a] hover:text-[#3d6b2a] transition-colors flex-shrink-0">
                Modifier
              </button>
            </div>
          </Section>

          {/* Save */}
          <button onClick={handleSave}
            className="w-full py-3 sm:py-3.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-xl font-syne font-bold text-sm tracking-wide transition-colors shadow-lg shadow-[#3d6b2a]/20 active:scale-[0.99]">
            Enregistrer les modifications
          </button>

          {/* Danger zone */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-5">
            <h3 className="font-syne font-bold text-sm text-red-700 mb-1">Zone dangereuse</h3>
            <p className="text-xs text-red-400 mb-3">Ces actions sont irréversibles.</p>
            <button className="px-3 sm:px-4 py-2 border border-red-200 rounded-lg text-xs sm:text-sm font-medium text-red-500 hover:bg-red-100 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

interface ToggleProps { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }
function Toggle({ label, desc, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#3d6b2a]' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <h3 className="font-syne font-bold text-sm text-gray-800">{title}</h3>
      </div>
      <div className="px-6 divide-y divide-gray-50">{children}</div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3d6b2a] transition-colors'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  // Profile
  const [nom, setNom]     = useState('Rakoto Jean')
  const [email, setEmail] = useState('jean.rakoto@korobo.mg')
  const [tel, setTel]     = useState('+261 34 00 000 01')
  const [role, setRole]   = useState('Administrateur')
  const [langue, setLangue] = useState('Français')
  const [theme, setTheme] = useState('Clair')

  // Notifications
  const [notifEmail, setNotifEmail]   = useState(true)
  const [notifPush,  setNotifPush]    = useState(false)
  const [notifAlerte, setNotifAlerte] = useState(true)
  const [notifRappel, setNotifRappel] = useState(true)
  const [notifRapport, setNotifRapport] = useState(false)

  // Sécurité
  const [twoFactor, setTwoFactor]   = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-bold text-xl text-gray-800">Paramètres</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gérez votre compte et vos préférences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
            ✓ Sauvegardé
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Profil */}
        <Section title="Profil utilisateur" icon="👤">
          <div className="py-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-[#3d6b2a] flex items-center justify-center text-white font-syne font-bold text-2xl">
                {nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{nom}</p>
                <p className="text-sm text-gray-400">{role}</p>
                <button className="text-xs text-[#3d6b2a] hover:underline mt-1">Changer la photo</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Nom complet</label>
                <input className={inputCls} value={nom} onChange={e => setNom(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Téléphone</label>
                <input className={inputCls} value={tel} onChange={e => setTel(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
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
            <div className="grid grid-cols-2 gap-4">
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
          <Toggle label="Notifications par email"    desc="Recevoir les alertes sur votre boîte mail"           value={notifEmail}   onChange={setNotifEmail}   />
          <Toggle label="Notifications push"         desc="Alertes en temps réel dans le navigateur"            value={notifPush}    onChange={setNotifPush}    />
          <Toggle label="Alertes de panne"            desc="Notification immédiate en cas de panne détectée"     value={notifAlerte}  onChange={setNotifAlerte}  />
          <Toggle label="Rappels de maintenance"     desc="Rappel 24h avant une intervention planifiée"         value={notifRappel}  onChange={setNotifRappel}  />
          <Toggle label="Rapports mensuels"          desc="Envoi automatique des rapports en fin de mois"       value={notifRapport} onChange={setNotifRapport} />
        </Section>

        {/* Sécurité */}
        <Section title="Sécurité" icon="🔒">
          <Toggle label="Authentification à 2 facteurs" desc="Sécurité renforcée avec code SMS"                  value={twoFactor}       onChange={setTwoFactor}       />
          <Toggle label="Déconnexion automatique"        desc="Se déconnecter après 30 minutes d'inactivité"     value={sessionTimeout}  onChange={setSessionTimeout}  />
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Changer le mot de passe</p>
              <p className="text-xs text-gray-400 mt-0.5">Dernière modification il y a 3 mois</p>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-[#3d6b2a] hover:text-[#3d6b2a] transition-colors">
              Modifier
            </button>
          </div>
        </Section>

        {/* Save button */}
        <button onClick={handleSave}
          className="w-full py-3.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-xl font-syne font-bold text-sm tracking-wide transition-colors shadow-lg shadow-[#3d6b2a]/20 active:scale-[0.99]">
          Enregistrer les modifications
        </button>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <h3 className="font-syne font-bold text-sm text-red-700 mb-1">Zone dangereuse</h3>
          <p className="text-xs text-red-400 mb-3">Ces actions sont irréversibles. Procédez avec précaution.</p>
          <button className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-100 transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}

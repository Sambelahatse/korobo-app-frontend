import { useState } from 'react'

interface Props {
  onRegister: () => void
  onGoLogin: () => void
  onBack: () => void
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum', ok: password.length >= 8 },
    { label: 'Une majuscule',         ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre',            ok: /[0-9]/.test(password) },
    { label: 'Un caractère spécial',  ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length

  const barColor = score <= 1 ? 'bg-red-400' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-yellow-400' : 'bg-[#6aad46]'
  const label    = score <= 1 ? 'Faible' : score === 2 ? 'Moyen' : score === 3 ? 'Bien' : 'Fort'

  if (!password) return null

  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${barColor}`}
               style={{ width: `${(score / 4) * 100}%` }} />
        </div>
        <span className={`text-xs font-semibold ${
          score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-500' : 'text-[#6aad46]'
        }`}>{label}</span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-[#3d6b2a]' : 'text-gray-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${ok ? 'bg-[#3d6b2a] text-white' : 'bg-gray-100'}`}>
              {ok && <CheckIcon />}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

const roles = ['Technicien', 'Responsable site', 'Administrateur', 'Superviseur']

export default function RegisterPage({ onRegister, onGoLogin, onBack }: Props) {
  const [step, setStep]             = useState<1 | 2>(1)
  const [nom, setNom]               = useState('')
  const [prenom, setPrenom]         = useState('')
  const [email, setEmail]           = useState('')
  const [telephone, setTelephone]   = useState('')
  const [role, setRole]             = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [agree, setAgree]           = useState(false)
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!nom.trim())      e.nom = 'Champ requis'
    if (!prenom.trim())   e.prenom = 'Champ requis'
    if (!email.trim())    e.email = 'Champ requis'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide'
    if (!role)            e.role = 'Veuillez choisir un rôle'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (password.length < 8)      e.password = 'Minimum 8 caractères'
    if (password !== confirm)     e.confirm = 'Les mots de passe ne correspondent pas'
    if (!agree)                   e.agree = 'Veuillez accepter les conditions'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    onRegister()
  }

  const inputCls = (field: string) =>
    `w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all placeholder-gray-300 ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#3d6b2a] focus:ring-2 focus:ring-[#3d6b2a]/10'
    }`

  return (
    <div className="min-h-screen flex font-dm">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[45%] bg-[#3d6b2a] flex-col justify-between p-12 relative overflow-hidden">

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),
                              repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)`
          }}
        />

        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute bottom-20 right-[-60px] w-48 h-48 rounded-full bg-[#4e8a35]/50" />

        {/* Logo */}
        <div>
          <button onClick={onBack} className="font-syne font-extrabold text-2xl text-white tracking-widest hover:text-[#6aad46] transition-colors">
            KOROBO
          </button>
        </div>

        {/* Steps indicator */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-[3px] mb-8">Inscription</p>

          <div className="flex flex-col gap-5">
            {[
              { n: 1, title: 'Informations personnelles', desc: 'Nom, email, rôle' },
              { n: 2, title: 'Sécurité du compte',        desc: 'Mot de passe sécurisé' },
            ].map(({ n, title, desc }) => (
              <div key={n} className={`flex items-start gap-4 transition-all ${step === n ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-syne font-bold text-sm flex-shrink-0 transition-colors ${
                  step > n  ? 'bg-[#6aad46] text-white'
                  : step === n ? 'bg-white text-[#3d6b2a]'
                  : 'border-2 border-white/30 text-white'
                }`}>
                  {step > n ? '✓' : n}
                </div>
                <div>
                  <p className="font-syne font-semibold text-white text-[15px]">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs leading-relaxed">
            En créant un compte, vous rejoignez le réseau KOROBO de gestion de maintenance solaire.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <button onClick={onBack} className="lg:hidden font-syne font-extrabold text-xl text-[#3d6b2a] tracking-widest mb-8">
            KOROBO
          </button>

          {/* Mobile step dots */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {[1, 2].map(n => (
              <div key={n} className={`h-1.5 rounded-full transition-all ${step === n ? 'w-8 bg-[#3d6b2a]' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="font-syne font-bold text-3xl text-gray-900 mb-2">
              {step === 1 ? 'Créer un compte' : 'Sécurisez votre compte'}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === 1 ? 'Étape 1 sur 2 — Vos informations' : 'Étape 2 sur 2 — Choisissez un mot de passe fort'}
            </p>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Nom</label>
                  <input type="text" placeholder="Rakoto" value={nom} onChange={e => setNom(e.target.value)} className={inputCls('nom')} />
                  {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Prénom</label>
                  <input type="text" placeholder="Jean" value={prenom} onChange={e => setPrenom(e.target.value)} className={inputCls('prenom')} />
                  {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
                <input type="email" placeholder="jean.rakoto@korobo.mg" value={email} onChange={e => setEmail(e.target.value)} className={inputCls('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Téléphone <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <input type="tel" placeholder="+261 34 00 000 00" value={telephone} onChange={e => setTelephone(e.target.value)} className={inputCls('telephone')} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Rôle</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className={`${inputCls('role')} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Sélectionner un rôle...</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3d6b2a] pointer-events-none">▾</span>
                </div>
                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
              </div>

              <button
                onClick={handleNext}
                className="mt-2 w-full py-3.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded-lg font-syne font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-[#3d6b2a]/20"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputCls('password')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <PasswordStrength password={password} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConf ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={`${inputCls('confirm')} pr-12`}
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon open={showConf} />
                  </button>
                </div>
                {confirm && password === confirm && (
                  <p className="text-xs text-[#3d6b2a] flex items-center gap-1 font-medium">
                    <span className="w-3.5 h-3.5 bg-[#3d6b2a] rounded-full flex items-center justify-center text-white"><CheckIcon /></span>
                    Les mots de passe correspondent
                  </p>
                )}
                {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#3d6b2a] rounded flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  J'accepte les{' '}
                  <button type="button" className="text-[#3d6b2a] font-semibold hover:underline">conditions d'utilisation</button>
                  {' '}et la{' '}
                  <button type="button" className="text-[#3d6b2a] font-semibold hover:underline">politique de confidentialité</button>
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-500 -mt-2">{errors.agree}</p>}

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}) }}
                  className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded-lg font-semibold text-sm transition-all"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-[2] py-3.5 rounded-lg font-syne font-bold text-white text-sm tracking-wide transition-all ${
                    loading ? 'bg-[#3d6b2a]/50 cursor-not-allowed' : 'bg-[#3d6b2a] hover:bg-[#4e8a35] active:scale-[0.98] shadow-lg shadow-[#3d6b2a]/20'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                      </svg>
                      Création...
                    </span>
                  ) : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <button onClick={onGoLogin} className="text-[#3d6b2a] font-semibold hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

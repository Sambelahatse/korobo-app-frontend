import { useState } from 'react'
import { bootstrapOwner } from '../services/authService'

interface Props { onRegister: () => void; onGoLogin: () => void; onBack: () => void }

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
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12 caractères min.', ok: password.length >= 12 },
    { label: 'Une majuscule',      ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre',         ok: /[0-9]/.test(password) },
    { label: 'Char. spécial',      ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const barColor = score <= 1 ? 'bg-red-400' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-yellow-400' : 'bg-[#8eb86f]'
  const lbl      = score <= 1 ? 'Faible' : score === 2 ? 'Moyen' : score === 3 ? 'Bien' : 'Fort'
  if (!password) return null
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={'h-full rounded-full transition-all duration-300 ' + barColor} style={{ width: `${(score/4)*100}%` }} />
        </div>
        <span className={'text-xs font-semibold ' + (score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-500' : 'text-[#8eb86f]')}>{lbl}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, ok }) => (
          <div key={label} className={'flex items-center gap-1.5 text-xs transition-colors ' + (ok ? 'text-[#4A7A3B]' : 'text-gray-400')}>
            <span className={'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ' + (ok ? 'bg-[#4A7A3B] text-white' : 'bg-gray-100')}>
              {ok && <CheckIcon />}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}


export default function RegisterPage({ onRegister, onGoLogin, onBack }: Props) {
  const [step,      setStep]      = useState<1|2>(1)
  const [nom,       setNom]       = useState('')
  const [prenom,    setPrenom]    = useState('')
  const [email,     setEmail]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [agree,     setAgree]     = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<Record<string,string>>({})

  const validate1 = () => {
    const e: Record<string,string> = {}
    if (!nom.trim())    e.nom    = 'Requis'
    if (!prenom.trim()) e.prenom = 'Requis'
    if (!email.trim())  e.email  = 'Requis'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide'
    setErrors(e); return !Object.keys(e).length
  }
  const validate2 = () => {
    const e: Record<string,string> = {}
    if (password.length < 12)  e.password = 'Minimum 12 caractères'
    if (!setupToken.trim())    e.setupToken = 'Code de configuration requis'
    if (password !== confirm)  e.confirm  = 'Ne correspondent pas'
    if (!agree)                e.agree    = 'Accepter les conditions'
    setErrors(e); return !Object.keys(e).length
  }

  const inputCls = (f: string) =>
    'w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all placeholder-gray-300 ' +
    (errors[f] ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate2()) return
    setLoading(true)
    try {
      await bootstrapOwner({
        fullName: `${prenom.trim()} ${nom.trim()}`,
        email: email.trim(),
        password,
        phone: telephone.trim() || undefined,
        setupToken: setupToken.trim(),
      })
      onRegister()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'La création du compte a échoué.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-[#f3f6f1]">

      {/* ── Left panel — hidden below lg ── */}
      <div className="hidden lg:flex w-[42%] xl:w-[45%] bg-gradient-to-br from-[#171a18] via-[#28402a] to-[#4A7A3B] flex-col justify-between p-10 xl:p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px), repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)` }} />
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute bottom-20 right-[-60px] w-48 h-48 rounded-full bg-[#4e8a35]/50" />
        <button onClick={onBack} className="font-sans font-extrabold text-2xl text-white tracking-widest hover:text-[#6aad46] transition-colors relative z-10">KOROBO</button>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-[3px] mb-8">Inscription</p>
          <div className="flex flex-col gap-5">
            {[{n:1,title:'Informations personnelles',desc:'Vos informations personnelles'},{n:2,title:'Sécurité du compte',desc:'Mot de passe sécurisé'}].map(({n,title,desc}) => (
              <div key={n} className={'flex items-start gap-4 transition-all ' + (step === n ? 'opacity-100' : 'opacity-40')}>
                <div className={'w-8 h-8 rounded-full flex items-center justify-center font-syne font-bold text-sm flex-shrink-0 ' +
                  (step > n ? 'bg-[#6aad46] text-white' : step === n ? 'bg-white text-[#3d6b2a]' : 'border-2 border-white/30 text-white')}>
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
        <p className="relative z-10 text-white/40 text-xs leading-relaxed">En créant un compte, vous rejoignez le réseau KOROBO de gestion de maintenance solaire.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 bg-[#f7f9f5] overflow-y-auto">
        <div className="w-full max-w-[460px] rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl shadow-[#171a18]/5 sm:p-9">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button onClick={onBack} className="font-syne font-extrabold text-xl text-[#3d6b2a] tracking-widest">KOROBO</button>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Accueil</button>
          </div>

          {/* Mobile step dots */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            {[1,2].map(n => (
              <div key={n} className={'h-1.5 rounded-full transition-all ' + (step === n ? 'w-8 bg-[#3d6b2a]' : 'w-4 bg-gray-200')} />
            ))}
            <span className="text-xs text-gray-400 ml-1">Étape {step}/2</span>
          </div>

          <div className="mb-6">
            <h1 className="font-syne font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
              {step === 1 ? 'Créer un compte' : 'Sécurisez votre compte'}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === 1 ? 'Étape 1 / 2 — Vos informations' : 'Étape 2 / 2 — Choisissez un mot de passe fort'}
            </p>
          </div>

          <button type="button" onClick={() => window.location.assign((((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '') + '/auth/google?flow=register'))}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.01 13.22l7.98 6.19C11.88 13.72 17.43 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.46-4.13 7.12-10.2 7.12-17.59z"/>
              <path fill="#FBBC05" d="M9.99 28.59A14.4 14.4 0 0 1 9.2 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.57 10.78l7.42-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.65-5.94c-2.13 1.43-4.84 2.28-8.25 2.28-6.57 0-12.13-4.22-14.02-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            S'inscrire avec Google
          </button>
          <div className="flex items-center gap-3 my-4 text-xs text-gray-400"><span className="h-px bg-gray-200 flex-1" /><span>OU PAR E-MAIL</span><span className="h-px bg-gray-200 flex-1" /></div>

          {/* STEP 1 */}
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
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input type="email" placeholder="jean.rakoto@korobo.mg" value={email} onChange={e => setEmail(e.target.value)} className={inputCls('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Téléphone <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <input type="tel" placeholder="+261 34 00 000 00" value={telephone} onChange={e => setTelephone(e.target.value)} className={inputCls('telephone')} />
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#dce8d5] bg-[#f4f8f1] p-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#e3eedc] text-[#4A7A3B]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 19 6v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Vous serez propriétaire de votre espace</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">Votre compte sera créé avec les droits du propriétaire. Vous pourrez ensuite ajouter des utilisateurs et leur attribuer leurs rôles depuis votre espace KOROBO.</p>
                </div>
              </div>
              <button onClick={() => validate1() && setStep(2)}
                className="mt-2 w-full py-3 sm:py-3.5 bg-[#3d6b2a] hover:bg-[#3d6b2a] text-white rounded-lg font-syne font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-[#4A7A3B]/20">
                Continuer →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={inputCls('password') + ' pr-12'} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon open={showPw} /></button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <PasswordStrength password={password} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Confirmer</label>
                <div className="relative">
                  <input type={showConf ? 'text' : 'password'} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls('confirm') + ' pr-12'} />
                  <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><EyeIcon open={showConf} /></button>
                </div>
                {confirm && password === confirm && (
                  <p className="text-xs text-[#3d6b2a] flex items-center gap-1 font-medium">
                    <span className="w-3.5 h-3.5 bg-[#3d6b2a] rounded-full flex items-center justify-center text-white"><CheckIcon /></span>
                    Correspondent ✓
                  </p>
                )}
                {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Code de configuration propriétaire</label>
                <input type="password" autoComplete="off" placeholder="Code fourni par l’administrateur technique"
                  value={setupToken} onChange={e => setSetupToken(e.target.value)} className={inputCls('setupToken')} />
                <p className="text-xs leading-relaxed text-gray-500">Ce code à usage unique autorise la création du premier compte propriétaire. Il sera désactivé après la configuration.</p>
                {errors.setupToken && <p className="text-xs text-red-500">{errors.setupToken}</p>}
              </div>
              {submitError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
              <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#4A7A3B] flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  J'accepte les <button type="button" className="text-[#3d6b2a] font-semibold hover:underline">conditions d'utilisation</button> et la <button type="button" className="text-[#3d6b2a] font-semibold hover:underline">politique de confidentialité</button>
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-500 -mt-2">{errors.agree}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setStep(1); setErrors({}) }}
                  className="flex-1 py-3 sm:py-3.5 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg font-semibold text-sm transition-all">
                  ← Retour
                </button>
                <button type="submit" disabled={loading}
                  className={'flex-[2] py-3 sm:py-3.5 rounded-lg font-syne font-bold text-white text-sm tracking-wide transition-all ' +
                    (loading ? 'bg-[#3d6b2a]/50 cursor-not-allowed' : 'bg-[#3d6b2a] hover:bg-[#4e8a35] active:scale-[0.98] shadow-lg shadow-[#3d6b2a]/20')}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/></svg>
                      Création...
                    </span>
                  ) : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-400 font-medium">ou</span><div className="flex-1 h-px bg-gray-100"/></div>
          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}<button onClick={onGoLogin} className="text-[#3d6b2a] font-semibold hover:underline">Se connecter</button>
          </p>
        </div>
      </div>
    </div>
  )
}

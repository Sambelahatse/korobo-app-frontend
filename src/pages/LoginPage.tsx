import { useState } from 'react'
import { requestPasswordReset, signIn } from '../services/authService'

interface Props { onLogin: () => void; onGoRegister: () => void; onBack: () => void }

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

export default function LoginPage({ onLogin, onGoRegister, onBack }: Props) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setError('')
    setResetMessage('')
    if (!email.trim()) {
      setError('Saisissez votre adresse e-mail pour recevoir le lien de réinitialisation.')
      return
    }
    setResetLoading(true)
    try {
      await requestPasswordReset(email)
      setResetMessage('Si un compte correspond à cette adresse, un lien de réinitialisation va vous être envoyé.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’envoyer le lien de réinitialisation.')
    } finally {
      setResetLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex font-sans bg-[#f3f6f1]">

      {/* ── Left decorative panel — hidden below lg ── */}
      <div className="hidden lg:flex w-[42%] xl:w-[45%] bg-gradient-to-br from-[#171a18] via-[#28402a] to-[#4A7A3B] flex-col justify-between p-10 xl:p-12 relative overflow-hidden flex-shrink-0">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px), repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)` }} />
        {/* Solar decoration */}
        <div className="absolute bottom-[-40px] right-[-40px] w-64 xl:w-72 h-64 xl:h-72 opacity-10">
          <div className="grid grid-cols-3 gap-2 w-full h-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border-2 border-white rounded-md"
                style={{ background: `repeating-linear-gradient(0deg,transparent,transparent 10px,rgba(255,255,255,0.3) 10px,rgba(255,255,255,0.3) 11px), repeating-linear-gradient(90deg,transparent,transparent 10px,rgba(255,255,255,0.3) 10px,rgba(255,255,255,0.3) 11px)` }} />
            ))}
          </div>
        </div>
        <button onClick={onBack} className="font-sans font-extrabold text-2xl text-white tracking-widest hover:text-[#6aad46] transition-colors relative z-10">KOROBO</button>
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium uppercase tracking-[3px] mb-4">Maintenance tracker</p>
          <h2 className="font-syne font-bold text-3xl xl:text-4xl text-white leading-tight mb-4">
            Gérez vos sites<br />solaires en toute<br /><span className="text-[#6aad46]">efficacité.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">Planifiez, suivez et analysez vos interventions de maintenance.</p>
        </div>
        <div className="relative z-10 flex gap-6 xl:gap-8">
          {[['120+','Sites actifs'],['98%','Disponibilité'],['4.9★','Satisfaction']].map(([val,lbl]) => (
            <div key={lbl}>
              <p className="font-syne font-bold text-lg xl:text-xl text-white">{val}</p>
              <p className="text-white/50 text-xs mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 sm:py-10 bg-[#f7f9f5] min-h-screen">
        <div className="w-full max-w-[440px] rounded-3xl border border-gray-100 bg-white p-5 sm:p-8 shadow-xl shadow-[#171a18]/5">

          {/* Mobile logo + back */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <button onClick={onBack} className="font-syne font-extrabold text-xl text-[#4A7A3B] tracking-widest">KOROBO</button>
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Accueil</button>
          </div>

          <div className="mb-6">
            <h1 className="font-syne font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Bon retour 👋</h1>
            <p className="text-gray-500 text-sm">Connectez-vous à votre compte KOROBO</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            {resetMessage && <div role="status" className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{resetMessage}</div>}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
              <input type="email" placeholder="exemple@korobo.mg" value={email} onChange={e => setEmail(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10 transition-all placeholder-gray-300" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <button type="button" onClick={handlePasswordReset} disabled={loading || resetLoading} className="text-xs text-[#3d6b2a] hover:underline font-medium disabled:opacity-50">{resetLoading ? 'Envoi…' : 'Oublié ?'}</button>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3d6b2a] focus:ring-2 focus:ring-[#3d6b2a]/10 transition-all placeholder-gray-300" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#4A7A3B] rounded" />
              <span className="text-sm text-gray-600">Se souvenir de moi</span>
            </label>

            <button type="submit" disabled={loading}
              className={'mt-2 w-full py-3 sm:py-3.5 rounded-lg font-syne font-bold text-white text-sm tracking-wide transition-all ' +
                (loading ? 'bg-[#4A7A3B]/50 cursor-not-allowed' : 'bg-[#3d6b2a] hover:bg-[#3d6b2a] active:scale-[0.98] shadow-lg shadow-[#4A7A3B]/20')}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

<p className="mb-4 text-center text-xs text-gray-400">Connexion sécurisée par l’authentification KOROBO.</p>

          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <button onClick={onGoRegister} className="text-[#3d6b2a] font-semibold hover:underline">S'inscrire</button>
          </p>
        </div>
      </div>
    </div>
  )
}

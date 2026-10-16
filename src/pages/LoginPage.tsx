import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void
        }
      }
    }
  }
}

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
  const [googleError, setGoogleError] = useState('')
  const [googleReady, setGoogleReady] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    if (!clientId || !apiKey || !googleButtonRef.current) return

    let cancelled = false
    const renderGoogleButton = () => {
      if (cancelled || !googleButtonRef.current || !window.google) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setGoogleError('')
          setLoading(true)
          try {
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                postBody: new URLSearchParams({ id_token: credential, providerId: 'google.com' }).toString(),
                requestUri: window.location.origin,
                returnIdpCredential: true,
                returnSecureToken: true,
              }),
            })
            const result = await response.json() as {
              idToken?: string; refreshToken?: string; expiresIn?: string
              localId?: string; email?: string; displayName?: string; photoUrl?: string
              error?: { message?: string }
            }
            if (!response.ok || !result.idToken) {
              throw new Error(result.error?.message || 'La connexion Google a échoué.')
            }
            sessionStorage.setItem('korobo.auth.idToken', result.idToken)
            if (result.refreshToken) sessionStorage.setItem('korobo.auth.refreshToken', result.refreshToken)
            sessionStorage.setItem('korobo.auth.user', JSON.stringify({
              id: result.localId, email: result.email, name: result.displayName, photo: result.photoUrl,
            }))
            onLogin()
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue'
            const code = message.toUpperCase()
            const friendlyMessage =
              code.includes('OPERATION_NOT_ALLOWED')
                ? 'La connexion Google n’est pas activée dans Firebase Authentication.'
                : code.includes('API_KEY_INVALID') || code.includes('INVALID_API_KEY') || code.includes('API_KEY')
                  ? 'La clé API Firebase est invalide. Vérifiez VITE_FIREBASE_API_KEY.'
                  : code.includes('CONFIGURATION_NOT_FOUND')
                    ? 'La configuration du fournisseur Google est introuvable dans Firebase.'
                    : code.includes('UNAUTHORIZED_DOMAIN') || code.includes('INVALID_ORIGIN')
                      ? 'Ce domaine n’est pas autorisé. Ajoutez sambelahatse.github.io aux domaines autorisés dans Firebase Authentication.'
                      : code.includes('INVALID_IDP_RESPONSE') || code.includes('INVALID_ID_TOKEN')
                        ? 'Google a renvoyé un jeton invalide. Vérifiez que le Client ID Google correspond au projet Firebase.'
                        : code.includes('PROJECT_NOT_FOUND')
                          ? 'Projet Firebase introuvable. Vérifiez que la clé API appartient au bon projet.'
                          : code.includes('TOO_MANY_ATTEMPTS_TRY_LATER')
                            ? 'Trop de tentatives. Attendez quelques minutes avant de réessayer.'
                            : `Échec Firebase : ${message}`
            setGoogleError(friendlyMessage)
          } finally {
            setLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'icon', theme: 'outline', size: 'large', shape: 'circle',
        logo_alignment: 'center',
      })
      setGoogleReady(true)
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (window.google) renderGoogleButton()
    else if (existingScript) existingScript.addEventListener('load', renderGoogleButton, { once: true })
    else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentity = 'true'
      script.onload = renderGoogleButton
      script.onerror = () => setGoogleError('Le service de connexion Google est inaccessible. Réessayez plus tard.')
      document.head.appendChild(script)
    }
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    onLogin()
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
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
              <input type="email" placeholder="exemple@korobo.mg" value={email} onChange={e => setEmail(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10 transition-all placeholder-gray-300" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                <button type="button" className="text-xs text-[#3d6b2a] hover:underline font-medium">Oublié ?</button>
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

          <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-400 font-medium">ou</span><div className="flex-1 h-px bg-gray-100"/></div>

          <div className="mt-4 mb-4 flex flex-col items-center gap-2">
            <div ref={googleButtonRef} aria-label="Se connecter avec Google" className="flex min-h-10 w-full justify-center" />
            {!googleReady && !import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-center text-xs text-amber-700">Connexion Google à configurer par l’administrateur.</p>
            )}
            {!googleReady && import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_FIREBASE_API_KEY && (
              <p className="text-center text-xs text-amber-700">Clé API Firebase manquante.</p>
            )}
            {googleError && <p role="alert" className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-600">{googleError}</p>}
          </div>

          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <button onClick={onGoRegister} className="text-[#3d6b2a] font-semibold hover:underline">S'inscrire</button>
          </p>
        </div>
      </div>
    </div>
  )
}

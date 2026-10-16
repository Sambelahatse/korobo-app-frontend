import { useEffect, useState } from 'react'

interface Props {
  onEnter: () => void
  onRegister: () => void
}

const navigation = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export default function LandingPage({ onEnter, onRegister }: Props) {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <main className="min-h-screen bg-[#171a18] text-white" style={{ fontFamily: "'Inter', 'Open Sans', 'Lato', sans-serif" }}>
      <header className="relative z-20 border-b border-white/10 bg-[#171a18]/95 backdrop-blur-sm">
        <nav aria-label="Navigation principale" className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-14">
          <a href="#accueil" onClick={closeMenu} aria-label="KOROBO, accueil" className="shrink-0 text-[25px] font-extrabold tracking-[0.12em] text-[#5c8a42] sm:text-[28px]">
            KOROBO<span className="text-white">.</span>
          </a>

          <div className="hidden items-center gap-7 lg:flex xl:gap-10">
            {navigation.map((item, index) => (
              <a key={item.label} href={item.href} className={"text-sm font-medium transition-colors hover:text-[#8eb86f] " + (index === 0 ? 'text-white' : 'text-white/65')}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button type="button" onClick={onEnter} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white">
              Connexion
            </button>
            <button type="button" onClick={onRegister} className="rounded-lg bg-[#5c8a42] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#5c8a42]/20 transition-all hover:bg-[#6c9c50] focus:outline-none focus:ring-2 focus:ring-[#9bc47f] focus:ring-offset-2 focus:ring-offset-[#171a18]">
              Inscription
            </button>
          </div>

          <button type="button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)} className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15 sm:hidden">
            <span className={"h-0.5 w-5 rounded bg-white transition-transform " + (menuOpen ? 'translate-y-2 rotate-45' : '')} />
            <span className={"h-0.5 w-5 rounded bg-white transition-opacity " + (menuOpen ? 'opacity-0' : '')} />
            <span className={"h-0.5 w-5 rounded bg-white transition-transform " + (menuOpen ? '-translate-y-2 -rotate-45' : '')} />
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#171a18] px-5 pb-5 pt-3 sm:hidden">
            <div className="flex flex-col">
              {navigation.map(item => (
                <a key={item.label} href={item.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { closeMenu(); onEnter() }} className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white">Connexion</button>
              <button type="button" onClick={() => { closeMenu(); onRegister() }} className="rounded-lg bg-[#5c8a42] px-4 py-3 text-sm font-semibold text-white">Inscription</button>
            </div>
          </div>
        )}
      </header>

      <section id="accueil" className="relative isolate flex min-h-[calc(100svh-77px)] items-center overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2400&q=85')" }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#101411]/80" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111612]/95 via-[#111612]/75 to-[#111612]/35" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#171a18]/65 to-transparent" />

        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[48%] opacity-[0.13] lg:block">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(174,207,151,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(174,207,151,.7) 1px, transparent 1px)',
            backgroundSize: '76px 76px',
            maskImage: 'linear-gradient(to left, black, transparent)',
          }} />
        </div>

        <div className={"mx-auto w-full max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28 transition-all duration-700 ease-out " + (visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0')}>
          <div className="max-w-3xl">
            <p className="mb-4 text-base font-semibold uppercase tracking-[0.22em] text-[#b8d5a4] sm:text-lg">Une maintenance plus simple, plus efficace</p>
            <h1 className="text-4xl font-medium leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[84px]">
              Bienvenue sur
              <span className="mt-1 block font-extrabold tracking-[-0.045em] text-[#8eb86f] sm:mt-2">KOROBO</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:mt-8 sm:text-lg sm:leading-9">
              L’application KOROBO vous permet de gérer efficacement la maintenance de vos sites photovoltaïques.
            </p>
            <div className="my-7 h-px w-28 bg-white/35 sm:my-9 sm:w-40" />
            <button type="button" onClick={onRegister} className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-[#5c8a42] px-7 py-4 text-base font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#6c9c50] focus:outline-none focus:ring-2 focus:ring-[#b8d5a4] focus:ring-offset-2 focus:ring-offset-[#171a18] sm:px-9">
              Créer un compte
              <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
            <p className="mt-5 text-sm text-white/60">
              Vous avez déjà un compte ?{' '}
              <button type="button" onClick={onEnter} className="font-semibold text-[#b8d5a4] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white">Connectez-vous</button>
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-7 right-8 hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/45 xl:flex">
          <span className="h-px w-10 bg-[#8eb86f]/70" />
          Maintenance photovoltaïque
        </div>
      </section>
    </main>
  )
}

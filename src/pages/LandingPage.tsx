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

const features = [
  {
    number: '01',
    icon: '⌂',
    title: 'Gestion des sites',
    description: 'Centralisez les informations de vos sites photovoltaïques et retrouvez leurs données essentielles au même endroit.',
    detail: 'Sites & équipements',
  },
  {
    number: '02',
    icon: '▦',
    title: 'Planification de la maintenance',
    description: 'Organisez vos interventions grâce à une vue structurée des opérations de maintenance à planifier et à suivre.',
    detail: 'Organisation & suivi',
  },
  {
    number: '03',
    icon: '▤',
    title: 'Rapports de suivi',
    description: 'Consultez les rapports disponibles pour garder une vision plus claire des activités de maintenance.',
    detail: 'Vue d’ensemble',
  },
  {
    number: '04',
    icon: '◉',
    title: 'Notifications',
    description: 'Retrouvez les notifications de l’application afin de rester informé des éléments qui nécessitent votre attention.',
    detail: 'Informations centralisées',
  },
  {
    number: '05',
    icon: '▧',
    title: 'Données centralisées',
    description: 'Accédez aux données enregistrées dans l’application depuis un espace dédié, sans disperser les informations.',
    detail: 'Données & historique',
  },
  {
    number: '06',
    icon: '✓',
    title: 'Espace de gestion',
    description: 'Retrouvez les principales rubriques dans une interface cohérente, conçue pour faciliter le suivi au quotidien.',
    detail: 'Un espace organisé',
  },
]

const questions = [
  {
    question: 'À quoi sert KOROBO ?',
    answer: 'KOROBO est une application de gestion qui aide à organiser et suivre la maintenance de sites photovoltaïques depuis un espace centralisé.',
  },
  {
    question: 'Puis-je gérer plusieurs sites photovoltaïques ?',
    answer: 'L’application dispose d’une rubrique dédiée aux sites pour centraliser leurs informations. Les possibilités exactes dépendent des données et des accès configurés dans votre espace.',
  },
  {
    question: 'Comment suivre les opérations de maintenance ?',
    answer: 'Utilisez la rubrique Planifications pour organiser les opérations, puis consultez les rapports et les notifications disponibles pour suivre les informations liées à votre activité.',
  },
  {
    question: 'Comment créer un compte ?',
    answer: 'Cliquez sur « Inscription » ou sur « Créer un compte » en haut de la page. Vous serez redirigé vers le formulaire d’inscription de KOROBO.',
  },
  {
    question: 'J’ai déjà un compte : comment me connecter ?',
    answer: 'Cliquez sur « Connexion » ou sur le lien « Connectez-vous » dans la section d’accueil pour accéder à l’écran de connexion.',
  },
]

export default function LandingPage({ onEnter, onRegister }: Props) {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <main className="min-h-screen bg-[#171a18] text-white" style={{ fontFamily: "'Inter', 'Open Sans', 'Lato', sans-serif" }}>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#171a18]/95 backdrop-blur-sm">
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

      {/* Accueil */}
      <section id="accueil" className="relative isolate flex min-h-[calc(100svh-77px)] scroll-mt-20 items-center overflow-hidden">
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

        <div className={"mx-auto w-full max-w-[1440px] scroll-mt-20 px-5 py-20 transition-all duration-700 ease-out sm:px-8 sm:py-24 lg:px-14 lg:py-28 " + (visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0')}>
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

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="scroll-mt-20 border-t border-white/5 bg-[#171a18] px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#8eb86f] sm:text-sm">Pensé pour votre activité</p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">Tout votre suivi, au même endroit.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              Organisez les informations de vos sites photovoltaïques et retrouvez les outils essentiels au suivi de leur maintenance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(feature => (
              <article key={feature.number} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#5c8a42]/60 hover:bg-white/[0.055] sm:p-7">
                <div className="mb-7 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5c8a42]/40 bg-[#5c8a42]/15 text-2xl font-semibold text-[#a8ca91] transition-colors group-hover:bg-[#5c8a42]/25">{feature.icon}</span>
                  <span className="text-sm font-semibold tracking-[0.15em] text-white/25">{feature.number}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-3 min-h-[84px] text-sm leading-7 text-white/60">{feature.description}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a8ca91]">
                  <span className="h-px w-5 bg-[#5c8a42]" />
                  {feature.detail}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#5c8a42]/25 bg-gradient-to-r from-[#5c8a42]/15 to-transparent p-6 sm:mt-16 sm:flex-row sm:p-8">
            <div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">Prêt à découvrir KOROBO ?</h3>
              <p className="mt-2 text-sm leading-6 text-white/60 sm:text-base">Accédez à votre espace pour commencer à organiser votre suivi.</p>
            </div>
            <button type="button" onClick={onRegister} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-[#5c8a42] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#6c9c50]">
              Créer un compte <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-white/5 bg-[#1d211e] px-5 py-20 sm:px-8 sm:py-24 lg:px-14 lg:py-28">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#8eb86f] sm:text-sm">Foire aux questions</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Des réponses à vos questions.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">
              Vous découvrez KOROBO ? Voici quelques informations pour vous aider à commencer.
            </p>
            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-semibold text-white">Encore une question ?</p>
              <p className="mt-2 text-sm leading-6 text-white/60">Connectez-vous ou créez un compte pour accéder à votre espace KOROBO.</p>
              <button type="button" onClick={onEnter} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#a8ca91] transition-colors hover:text-white">
                Accéder à la connexion <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {questions.map((item, index) => {
              const isOpen = openQuestion === index
              const panelId = 'faq-answer-' + index
              return (
                <div key={item.question} className="py-1">
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenQuestion(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6">
                      <span className="text-base font-semibold leading-6 text-white sm:text-lg">{item.question}</span>
                      <span aria-hidden="true" className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg transition-all " + (isOpen ? 'rotate-45 border-[#5c8a42] bg-[#5c8a42]/15 text-[#a8ca91]' : 'border-white/15 text-white/70')}>+</span>
                    </button>
                  </h3>
                  {isOpen && <div id={panelId} className="pb-6 pr-10 text-sm leading-7 text-white/60 sm:text-base">{item.answer}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="scroll-mt-20 border-t border-white/5 bg-[#171a18] px-5 py-16 sm:px-8 sm:py-20 lg:px-14">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-7 rounded-2xl bg-[#5c8a42] p-7 sm:p-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">KOROBO · Maintenance photovoltaïque</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">Organisez votre maintenance avec plus de clarté.</h2>
            <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">Retrouvez vos sites, vos planifications et vos informations de suivi dans un seul espace.</p>
          </div>
          <button type="button" onClick={onRegister} className="inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#315326] transition-colors hover:bg-[#eef5e9]">
            Commencer <span aria-hidden="true">→</span>
          </button>
        </div>
        <footer className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-3 pt-8 text-xs text-white/40 sm:flex-row sm:items-center">
          <a href="#accueil" className="font-extrabold tracking-[0.12em] text-[#8eb86f]">KOROBO</a>
          <p>La gestion de maintenance de vos sites photovoltaïques.</p>
          <a href="#accueil" className="transition-colors hover:text-white/70">Retour en haut ↑</a>
        </footer>
      </section>
    </main>
  )
}

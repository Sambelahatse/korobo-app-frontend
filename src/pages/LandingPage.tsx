import { useEffect, useState } from 'react'

interface Props { onEnter: () => void; onRegister: () => void }

export default function LandingPage({ onEnter, onRegister }: Props) {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="h-[64px] lg:h-[70px] flex items-center justify-between px-5 lg:px-12 bg-[#f0f5ec] border-b border-black/8 relative z-10">
        <span style={{ fontFamily: "'Syne', sans-serif" }} className="font-extrabold text-xl lg:text-[22px] tracking-wider text-gray-900">
          KOROBO
        </span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          {['Home', 'Blogs', 'Options', 'About'].map((item, i) => (
            <a key={item} href="#" className={`text-[15px] font-medium transition-colors ${i === 0 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              {item}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onRegister} className="px-4 lg:px-5 py-2 border-[1.5px] border-gray-900 rounded text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-all">
            Sign Up
          </button>
          <button onClick={onEnter} className="px-4 lg:px-5 py-2 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded text-sm font-semibold transition-colors">
            Login
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(v => !v)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#f0f5ec] border-b border-gray-200 px-5 py-4 space-y-3 z-10 relative">
          {['Home', 'Blogs', 'Options', 'About'].map(item => (
            <a key={item} href="#" className="block text-sm font-medium text-gray-700 hover:text-gray-900 py-1">{item}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={onRegister} className="flex-1 py-2.5 border-[1.5px] border-gray-900 rounded text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-all">
              Sign Up
            </button>
            <button onClick={onEnter} className="flex-1 py-2.5 bg-[#3d6b2a] text-white rounded text-sm font-semibold">
              Login
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="flex-1 flex items-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0 relative overflow-hidden">

        {/* Background pattern — hidden on small screens */}
        <div className={`hidden lg:grid absolute right-28 top-1/2 -translate-y-1/2 w-[420px] h-[420px] grid-cols-3 grid-rows-2 gap-4 transition-opacity duration-[1200ms] ${visible ? 'opacity-[0.10]' : 'opacity-0'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-[#6aad46] rounded-lg" style={{
              background: `repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(106,173,70,0.35) 20px,rgba(106,173,70,0.35) 22px),
                           repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(106,173,70,0.35) 20px,rgba(106,173,70,0.35) 22px)`
            }} />
          ))}
        </div>

        <div className={`w-full max-w-[580px] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#c0c0c0] leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Bienvenue sur
          </p>
          <h1 className="font-extrabold text-[64px] sm:text-[80px] lg:text-[96px] leading-none tracking-tight text-[#6aad46] mb-4 lg:mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            KOROBO
          </h1>
          <p className="text-[14px] lg:text-[15px] font-normal leading-relaxed text-gray-400 max-w-[400px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Assurez vos suivies de maintenance avec efficience et organisation.<br className="hidden sm:block" />
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          </p>
          <div className="w-32 lg:w-48 h-px bg-white/20 my-5 lg:my-7" />
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onEnter} className="px-8 lg:px-9 py-3 lg:py-3.5 border-2 border-[#6aad46] text-[#6aad46] font-bold text-[14px] lg:text-[15px] rounded hover:bg-[#6aad46] hover:text-[#1e1e1e] transition-all tracking-wide text-center">
              Commencer
            </button>
            <button onClick={onRegister} className="sm:hidden px-8 py-3 border border-white/20 text-white/60 font-medium text-[14px] rounded hover:border-white/40 hover:text-white/80 transition-all text-center">
              S'inscrire
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'

interface Props {
  onEnter: () => void
  onRegister: () => void
}

export default function LandingPage({ onEnter, onRegister }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="h-[70px] flex items-center justify-between px-12 bg-[#f0f5ec] border-b border-black/8 relative z-10">
        <span style={{ fontFamily: "'Syne', sans-serif" }} className="font-extrabold text-[22px] tracking-wider text-gray-900">KOROBO</span>
        <div className="flex items-center gap-12">
          {['Home', 'Blogs', 'Options', 'About'].map((item, i) => (
            <a key={item} href="#" style={{ fontFamily: "'DM Sans', sans-serif" }}
              className={`text-[15px] font-medium transition-colors ${i === 0 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onRegister} style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="px-5 py-2 border-[1.5px] border-gray-900 rounded text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-all">
            Sign Up
          </button>
          <button onClick={onEnter} style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="px-5 py-2 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white rounded text-sm font-semibold transition-colors">
            Login
          </button>
        </div>
      </nav>

      <section className="flex-1 flex items-center px-20 relative overflow-hidden">
        <div className={`absolute right-28 top-1/2 -translate-y-1/2 w-[420px] h-[420px] grid grid-cols-3 grid-rows-2 gap-4 transition-opacity duration-[1200ms] ${visible ? 'opacity-[0.10]' : 'opacity-0'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-[#6aad46] rounded-lg" style={{
              background: `repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(106,173,70,0.35) 20px,rgba(106,173,70,0.35) 22px),
                           repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(106,173,70,0.35) 20px,rgba(106,173,70,0.35) 22px)`
            }} />
          ))}
        </div>

        <div className={`max-w-[580px] transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-4xl font-light text-[#c0c0c0] leading-tight">Bienvenue sur</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="font-extrabold text-[96px] leading-none tracking-tight text-[#6aad46] mb-6">KOROBO</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-[15px] font-normal leading-relaxed text-gray-400 max-w-[400px]">
            Assurez vos suivies de maintenance avec efficience et organisation.<br />
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          </p>
          <div className="w-48 h-px bg-white/20 my-7" />
          <button onClick={onEnter} style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="px-9 py-3.5 border-2 border-[#6aad46] text-[#6aad46] font-bold text-[15px] rounded hover:bg-[#6aad46] hover:text-[#1e1e1e] transition-all tracking-wide">
            Commencer
          </button>
        </div>
      </section>
    </div>
  )
}

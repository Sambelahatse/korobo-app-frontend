import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  compact?: boolean
  light?: boolean
}

/** KOROBO identity: traditional storage vessel, sunlight and photovoltaic energy. */
export default function KoroboLogo({ compact = false, light = false, ...props }: Props) {
  const word = light ? '#FFFFFF' : '#12345A'
  return (
    <svg viewBox={compact ? '0 0 320 82' : '0 0 420 150'} role="img" aria-label="KOROBO — La maintenance photovoltaïque, notre priorité" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="korobo-clay" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6E2817"/><stop offset=".55" stopColor="#C85A1B"/><stop offset="1" stopColor="#7B2C16"/></linearGradient>
        <linearGradient id="korobo-solar" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1687C9"/><stop offset="1" stopColor="#06447D"/></linearGradient>
      </defs>
      <g transform={compact ? 'translate(4 7) scale(.43)' : 'translate(28 4) scale(.58)'}>
        <path d="M30 150 Q-3 205 38 255 Q112 309 300 264 L390 208 L365 165 L274 225 L84 230Z" fill="#123F79"/>
        <path d="M235 116 L300 74 L376 95 L416 174 L330 235 L257 217Z" fill="url(#korobo-solar)" stroke="#FFFFFF" strokeWidth="7" strokeLinejoin="round"/>
        <path d="M286 91 L313 146 L388 157 M266 147 L342 159 L365 208 M313 146 L342 159 M330 235 L342 159" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
        <circle cx="300" cy="56" r="39" fill="#FFB000"/>
        <g stroke="#FFB000" strokeWidth="8" strokeLinecap="round"><path d="M300 5V-8"/><path d="M256 17L246 7"/><path d="M344 17L354 7"/><path d="M250 58H236"/><path d="M350 58H364"/></g>
        <path d="M58 88 Q53 73 70 62 L85 45 Q112 27 144 45 L160 62 Q178 73 172 88 L185 115 Q205 140 194 199 Q186 238 146 246 L85 246 Q44 237 36 199 Q25 140 45 115Z" fill="url(#korobo-clay)" stroke="#FFFFFF" strokeWidth="5"/>
        <path d="M65 87 Q112 103 169 87 M43 147 Q112 159 194 147 M37 197 Q112 209 193 197" fill="none" stroke="#F7C16B" strokeWidth="6"/>
        <path d="M40 169 L57 149 L76 169 L95 149 L114 169 L133 149 L152 169 L171 149 L190 169" fill="none" stroke="#F7C16B" strokeWidth="5"/>
        <path d="M52 74 Q112 52 177 74 L164 62 Q112 39 65 62Z" fill="#8D351B" stroke="#FFFFFF" strokeWidth="4"/>
        <path d="M96 44 Q110 23 128 43" fill="none" stroke="#8D351B" strokeWidth="13" strokeLinecap="round"/>
        <path d="M244 231 Q276 193 314 205 Q293 238 256 244Z" fill="#55A747" stroke="#FFFFFF" strokeWidth="4"/>
      </g>
      <g fill={word} fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" letterSpacing="1.4">
        <text x={compact ? 128 : 23} y={compact ? 54 : 105} fontSize={compact ? 32 : 46}>KOROBO</text>
      </g>
      <path d={compact ? 'M270 25l-8 15h8l-4 14 16-20h-9l5-9z' : 'M357 62l-10 18h10l-5 17 20-24h-11l6-11z'} fill="#FFB000"/>
      {!compact && <g textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif"><text x="210" y="129" fontSize="12" fontWeight="700" letterSpacing="3" fill="#E88A17">APP</text><text x="210" y="145" fontSize="7.5" fill={word}>La maintenance photovoltaïque, notre priorité</text></g>}
    </svg>
  )
}

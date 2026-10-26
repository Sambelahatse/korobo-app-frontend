export type AppTheme = 'Clair' | 'Sombre' | 'Système'

let systemMedia: MediaQueryList | null = null
let systemListener: ((event: MediaQueryListEvent) => void) | null = null

function setResolvedTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

export function applyTheme(theme: AppTheme | string | null | undefined) {
  const normalized = theme === 'Sombre' || theme === 'dark' ? 'Sombre' : theme === 'Système' || theme === 'system' ? 'Système' : 'Clair'
  document.documentElement.dataset.themePreference = normalized.toLowerCase()
  if (systemMedia && systemListener) systemMedia.removeEventListener('change', systemListener)
  systemMedia = null
  systemListener = null

  if (normalized === 'Système' && typeof window !== 'undefined' && window.matchMedia) {
    systemMedia = window.matchMedia('(prefers-color-scheme: dark)')
    setResolvedTheme(systemMedia.matches)
    systemListener = event => setResolvedTheme(event.matches)
    systemMedia.addEventListener('change', systemListener)
    return
  }
  setResolvedTheme(normalized === 'Sombre')
}

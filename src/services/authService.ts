export interface AuthProfile {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  phone: string | null
  isActive: boolean
}
type AuthResponse = { data: AuthProfile; accessToken: string; tokenType: 'Bearer'; expiresIn: string }
const TOKEN_KEY = 'korobo.access-token'
const PROFILE_KEY = 'korobo.auth-profile'
function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}
export function getAccessToken(): string | null {
  try { return window.localStorage.getItem(TOKEN_KEY) } catch { return null }
}
function saveSession(result: AuthResponse): AuthProfile {
  window.localStorage.setItem(TOKEN_KEY, result.accessToken)
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(result.data))
  window.dispatchEvent(new Event('korobo:auth-changed'))
  return result.data
}
function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(PROFILE_KEY)
  window.dispatchEvent(new Event('korobo:logout'))
}
async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
  return payload.error?.message || 'Une erreur est survenue. Réessayez.'
}
async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  })
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
export async function getMyProfile(): Promise<AuthProfile> {
  if (!getAccessToken()) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const result = await apiRequest<{ data: AuthProfile }>('/auth/me', {}, true)
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(result.data))
  return result.data
}
export async function signIn(email: string, password: string): Promise<AuthProfile> {
  const result = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  return saveSession(result)
}
export async function signInWithGoogle(): Promise<void> {
  throw new Error('La connexion Google n’est pas disponible dans l’authentification interne actuelle.')
}
export async function bootstrapOwner(input: { fullName: string; email: string; password: string; phone?: string; setupToken: string }): Promise<AuthProfile> {
  const result = await apiRequest<AuthResponse>('/auth/bootstrap-owner', {
    method: 'POST',
    headers: { 'x-owner-bootstrap-token': input.setupToken },
    body: JSON.stringify({ fullName: input.fullName, email: input.email, password: input.password, phone: input.phone })
  })
  return saveSession(result)
}
export async function requestPasswordReset(email: string): Promise<void> {
  if (!email.trim()) throw new Error('Saisissez votre adresse e-mail.')
  await apiRequest('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email: email.trim() }) })
}
export async function updatePassword(password: string): Promise<void> {
  const token = new URLSearchParams(window.location.search).get('token') || new URLSearchParams(window.location.hash.split('?')[1] || '').get('token')
  if (!token) throw new Error('Le lien est incomplet. Demandez une nouvelle invitation ou réinitialisation.')
  await apiRequest('/auth/password/reset', { method: 'POST', body: JSON.stringify({ token, password }) })
  clearSession()
}
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiRequest('/auth/password/change', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }, true)
}
export async function signOut(): Promise<void> {
  try { await apiRequest('/auth/logout', { method: 'POST' }, true) } finally { clearSession() }
}

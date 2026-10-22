import { changePassword as changeAccountPassword, getAccessToken } from './authService'

export interface AccountProfile {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  isActive: boolean
}
export interface AccountPreferences {
  language: 'Français' | 'English' | 'Malagasy'
  theme: 'Clair' | 'Sombre' | 'Système'
  notifications: {
    email: boolean
    push: boolean
    outageAlerts: boolean
    maintenanceReminders: boolean
    monthlyReports: boolean
  }
  security: { twoFactor: boolean; sessionTimeout: boolean }
}
export interface AccountSession {
  id: string
  createdAt: string
  lastSeenAt: string | null
  expiresAt: string
  userAgent: string | null
  ipAddress: string | null
  current: boolean
}
export interface AccountSettings {
  profile: AccountProfile
  googleLinked: boolean
  hasPassword: boolean
  preferences: AccountPreferences | null
}
export const defaultPreferences: AccountPreferences = {
  language: 'Français',
  theme: 'Clair',
  notifications: { email: true, push: false, outageAlerts: true, maintenanceReminders: true, monthlyReports: false },
  security: { twoFactor: false, sessionTimeout: true },
}
function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(payload.error?.message || 'Une erreur est survenue. Réessayez.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
export const settingsService = {
  async getAccount(): Promise<AccountSettings> {
    const result = await request<{ data: AccountSettings }>('/account')
    return { ...result.data, preferences: result.data.preferences ? {
      ...defaultPreferences, ...result.data.preferences,
      notifications: { ...defaultPreferences.notifications, ...result.data.preferences.notifications },
      security: { ...defaultPreferences.security, ...result.data.preferences.security },
    } : null }
  },
  async updateProfile(input: Pick<AccountProfile, 'fullName' | 'phone'>): Promise<AccountProfile> {
    const result = await request<{ data: AccountProfile }>('/account/profile', { method: 'PATCH', body: JSON.stringify(input) })
    return result.data
  },
  async savePreferences(preferences: AccountPreferences): Promise<AccountPreferences> {
    const result = await request<{ data: AccountPreferences }>('/account/preferences', { method: 'PUT', body: JSON.stringify(preferences) })
    return result.data
  },
  async getSessions(): Promise<AccountSession[]> {
    const result = await request<{ data: AccountSession[] }>('/account/sessions')
    return result.data
  },
  async revokeSession(id: string): Promise<void> {
    await request<void>(`/account/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async getGoogleLinkUrl(): Promise<string> {
    const result = await request<{ url: string }>('/auth/google/link-url', { method: 'POST' })
    return result.url
  },
  async unlinkGoogle(): Promise<void> {
    await request('/account/google/unlink', { method: 'POST' })
  },
  async deleteAccount(email: string, currentPassword?: string): Promise<void> {
    await request<void>('/account', { method: 'DELETE', body: JSON.stringify({ email, currentPassword }) })
    window.localStorage.removeItem('korobo.access-token')
    window.localStorage.removeItem('korobo.auth-profile')
    window.dispatchEvent(new Event('korobo:logout'))
  },
  async setPassword(password: string): Promise<void> {\n    await request('/auth/password/set', { method: 'POST', body: JSON.stringify({ password }) })\n  },\n  changePassword: changeAccountPassword,
}

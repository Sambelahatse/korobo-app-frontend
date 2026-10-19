export interface AuthProfile {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  phone: string | null
  isActive: boolean
}

type AuthResponse = {
  data: {
    profile: AuthProfile
    accessToken: string
    expiresIn: number
  }
}
let accessToken: string | null = null
let refreshInFlight: Promise<AuthProfile | null> | null = null

function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}

async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
  return payload.error?.message || 'Une erreur est survenue. Réessayez.'
}

async function post<T>(path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  })
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function applyAuth(result: AuthResponse): AuthProfile {
  accessToken = result.data.accessToken
  return result.data.profile
}

async function refreshSession(): Promise<AuthProfile | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const result = await post<AuthResponse>('/auth/refresh')
      return applyAuth(result)
    } catch {
      accessToken = null
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export function getAccessToken(): string | null {
  return accessToken
}

/** Restore the in-memory access token from the HttpOnly refresh cookie after a page reload. */
export async function restoreSession(): Promise<AuthProfile | null> {
  return refreshSession()
}

export async function getMyProfile(): Promise<AuthProfile> {
  if (!accessToken) {
    const restored = await refreshSession()
    if (!restored) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
    return restored
  }

  let response = await fetch(`${apiUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include'
  })
  if (response.status === 401) {
    const restored = await refreshSession()
    if (!restored || !accessToken) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
    response = await fetch(`${apiUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include'
    })
  }
  if (!response.ok) throw new Error(await readError(response))
  const result = await response.json() as { data: AuthProfile }
  return result.data
}

export async function signIn(email: string, password: string): Promise<AuthProfile> {
  try {
    const result = await post<AuthResponse>('/auth/login', { email: email.trim(), password })
    return applyAuth(result)
  } catch (error) {
    accessToken = null
    throw error
  }
}

export async function signInWithGoogle(): Promise<void> {
  throw new Error("La connexion Google n'est pas disponible avec l'authentification KOROBO personnalisée.")
}

export async function bootstrapOwner(input: {
  fullName: string
  email: string
  password: string
  phone?: string
  setupToken: string
}): Promise<AuthProfile> {
  await post('/auth/bootstrap-owner', {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    phone: input.phone
  }, { 'x-owner-bootstrap-token': input.setupToken })
  return signIn(input.email, input.password)
}

/**
 * Password setup/reset links are currently issued by an administrator because no email
 * delivery provider is configured yet. The token is passed in the URL query string.
 */
export async function requestPasswordReset(_email: string): Promise<void> {
  throw new Error("L'envoi automatique d'e-mails n'est pas encore configuré. Demandez à l'administrateur de générer un lien sécurisé de réinitialisation.")
}

export async function updatePassword(password: string, token: string): Promise<AuthProfile> {
  const result = await post<AuthResponse>('/auth/password/setup', { password, token })
  return applyAuth(result)
}

export async function signOut(): Promise<void> {
  try {
    await post<void>('/auth/logout')
  } finally {
    accessToken = null
  }
}

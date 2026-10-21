import { createClient } from '@supabase/supabase-js'

export interface AuthProfile {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  phone: string | null
  isActive: boolean
}

let client: ReturnType<typeof createClient> | undefined

export function getSupabaseClient() {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  if (!url || !key) {
    throw new Error('La configuration Supabase manque (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).')
  }

  // Supabase's standard browser key is "sb-<project-ref>-auth-token".
  // Older KOROBO sessions may still exist under "<project-ref>-auth-token".
  // Read and migrate that legacy value once instead of silently treating the user as signed out.
  const projectRef = new URL(url).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`
  const legacyStorageKey = `${projectRef}-auth-token`
  const compatibleStorage = {
    getItem(key: string): string | null {
      try {
        const current = window.localStorage.getItem(key)
        if (current !== null || key !== storageKey) return current

        const legacy = window.localStorage.getItem(legacyStorageKey)
        if (legacy === null) return null

        window.localStorage.setItem(storageKey, legacy)
        return legacy
      } catch {
        return null
      }
    },
    setItem(key: string, value: string): void {
      window.localStorage.setItem(key, value)
    },
    removeItem(key: string): void {
      window.localStorage.removeItem(key)
      if (key === storageKey) window.localStorage.removeItem(legacyStorageKey)
    }
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey,
      storage: compatibleStorage
    }
  })
  return client
}

function apiUrl() {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}

async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({})) as {
    error?: { message?: string }
  }
  return payload.error?.message || 'Une erreur est survenue. Réessayez.'
}

export async function getMyProfile(): Promise<AuthProfile> {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')

  const response = await fetch(`${apiUrl()}/auth/me`, {
    // Authentication responses are user-specific and must never be reused from cache.
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  })
  if (!response.ok) throw new Error(await readError(response))
  const result = await response.json() as { data: AuthProfile }
  return result.data
}

export async function signIn(email: string, password: string): Promise<AuthProfile> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  try {
    return await getMyProfile()
  } catch (error) {
    await supabase.auth.signOut()
    throw error
  }
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  if (error) throw new Error(error.message)
}

export async function bootstrapOwner(input: {
  fullName: string
  email: string
  password: string
  phone?: string
  setupToken: string
}): Promise<AuthProfile> {
  const response = await fetch(`${apiUrl()}/auth/bootstrap-owner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-owner-bootstrap-token': input.setupToken
    },
    body: JSON.stringify({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      phone: input.phone
    })
  })
  if (!response.ok) throw new Error(await readError(response))

  // The owner endpoint creates the first confirmed Auth user. Sign in through Supabase,
  // then let the API validate the token and return the server-owned profile and role.
  return signIn(input.email, input.password)
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim()
  if (!normalizedEmail) throw new Error('Saisissez votre adresse e-mail.')
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/?auth=reset-password`
  })
  if (error) throw new Error(error.message)
}

export async function updatePassword(password: string): Promise<void> {
  const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession()
  if (sessionError) throw new Error(sessionError.message)
  if (!session) throw new Error('Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.')
  const { error } = await getSupabaseClient().auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw new Error(error.message)
}

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
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
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
    headers: { Authorization: `Bearer ${session.access_token}` }
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
      password: input.password
    })
  })
  if (!response.ok) throw new Error(await readError(response))

  // The owner endpoint creates the first confirmed Auth user. Sign in through Supabase,
  // then let the API validate the token and return the server-owned profile and role.
  return signIn(input.email, input.password)
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw new Error(error.message)
}


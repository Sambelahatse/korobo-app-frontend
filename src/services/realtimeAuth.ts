import { io, type Socket } from 'socket.io-client'
import type { AuthProfile } from './authService'

type CompanyChangedPayload = {
  resource: 'site' | 'equipment' | 'planification' | 'rapport' | 'notification' | 'dashboard' | 'user'
  action: 'created' | 'updated' | 'deleted'
  entityId?: string
  companyId: string
  actorId: string
  occurredAt: string
}

type ServerToClientEvents = {
  'auth:verified': (payload: { data: AuthProfile }) => void
  'auth:pong': (payload: { timestamp: string }) => void
  'company:changed': (payload: CompanyChangedPayload) => void
}

type ClientToServerEvents = {
  'auth:ping': () => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
let connectedToken: string | null = null
let verifiedProfile: AuthProfile | null = null

function socketUrl(): string {
  return ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
}

/**
 * Opens an authenticated Socket.IO connection and resolves only after the API
 * has validated the API-issued access token and returned the server-owned profile.
 */
export function verifySessionWithSocket(accessToken: string): Promise<AuthProfile> {
  if (socket?.connected && connectedToken === accessToken && verifiedProfile) {
    return Promise.resolve(verifiedProfile)
  }

  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  connectedToken = accessToken
  verifiedProfile = null
  const currentSocket = io(socketUrl(), {
    auth: { accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000
  })
  socket = currentSocket

  return new Promise<AuthProfile>((resolve, reject) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('Le serveur temps réel ne répond pas.'))
    }, 12000)

    currentSocket.on('company:changed', (payload) => {
      window.dispatchEvent(new CustomEvent<CompanyChangedPayload>('korobo:company-changed', { detail: payload }))
    })

    currentSocket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        window.dispatchEvent(new CustomEvent('korobo:session-invalidated'))
      }
    })

    currentSocket.on('auth:verified', ({ data }) => {
      verifiedProfile = data
      if (!settled) {
        settled = true
        window.clearTimeout(timeout)
        resolve(data)
      }
    })

    currentSocket.on('connect_error', (error) => {
      if (!settled) {
        settled = true
        window.clearTimeout(timeout)
        reject(error)
      }
    })

    // Transient network disconnects are handled by Socket.IO's automatic reconnection.
  })
}

export function disconnectAuthSocket(): void {
  socket?.disconnect()
  socket = null
  connectedToken = null
  verifiedProfile = null
}

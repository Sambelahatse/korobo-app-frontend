import { io, type Socket } from 'socket.io-client'
import type { AuthProfile } from './authService'

type ServerToClientEvents = {
  'auth:verified': (payload: { data: AuthProfile }) => void
  'auth:pong': (payload: { timestamp: string }) => void
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
 * has validated the KOROBO access token and returned the server-owned profile.
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

    currentSocket.on('disconnect', () => {
      // Keep the HTTP API as the source of truth if the realtime connection drops.
      // Socket.IO will attempt to reconnect automatically.
    })
  })
}

export function disconnectAuthSocket(): void {
  socket?.disconnect()
  socket = null
  connectedToken = null
  verifiedProfile = null
}

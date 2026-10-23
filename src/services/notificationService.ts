import { getAccessToken } from './authService'
import type { Notification } from '../types'

type ApiNotification = {
  id: string; companyId: string; recipientId: string; type: Notification['type']; title: string;
  message: string; siteName: string | null; link: string | null; isRead: boolean; readAt: string | null; createdAt: string
}
type ListResponse = { data: ApiNotification[]; unreadCount: number }
const apiUrl = () => ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(`${apiUrl()}${path}`, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } })
  if (!response.ok) { const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }; throw new Error(payload.error?.message || 'Impossible de charger les notifications.') }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
const fromApi = (item: ApiNotification): Notification => ({ id: item.id, type: item.type, titre: item.title, message: item.message, date: item.createdAt, lu: item.isRead, siteNom: item.siteName ?? undefined })
export async function listNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const result = await request<ListResponse>('/notifications')
  return { notifications: result.data.map(fromApi), unreadCount: result.unreadCount }
}
export async function markNotificationRead(id: string): Promise<void> { await request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }) }
export async function markAllNotificationsRead(): Promise<void> { await request('/notifications/read-all', { method: 'PATCH' }) }
export async function deleteNotification(id: string): Promise<void> { await request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }) }

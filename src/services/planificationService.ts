import { getAccessToken } from './authService'
import type { Planification, Site } from '../types'
import { listSites } from './siteService'

type ApiUser = { id: string; fullName: string; email?: string; role?: string }
type ApiPlanification = {
  id: string
  siteId: string
  site?: { id: string; name: string }
  title: string
  description: string | null
  maintenanceType: string | null
  scheduledAt: string
  durationMinutes: number | null
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  assignedToId: string | null
  assignedTo?: ApiUser | null
}
type ApiResponse<T> = { data: T }
const apiUrl = () => ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init, cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(payload.error?.message || 'Impossible de traiter la planification. Réessayez.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
const typeFromApi = (type: string | null): Planification['type'] =>
  type === 'emergency' || type === 'urgence' ? 'urgence' : type === 'corrective' ? 'corrective' : 'préventive'
const statusFromApi = (status: ApiPlanification['status']): Planification['statut'] =>
  status === 'in_progress' ? 'en cours' : status === 'completed' ? 'terminée' : status === 'cancelled' ? 'annulée' : 'planifiée'
const statusToApi: Record<Planification['statut'], ApiPlanification['status']> = {
  'planifiée': 'planned', 'en cours': 'in_progress', 'terminée': 'completed', 'annulée': 'cancelled',
}
function fromApi(item: ApiPlanification): Planification {
  return {
    id: item.id,
    siteId: item.siteId,
    siteNom: item.site?.name ?? 'Site',
    type: typeFromApi(item.maintenanceType),
    statut: statusFromApi(item.status),
    date: item.scheduledAt.slice(0, 10),
    technicien: item.assignedTo?.fullName ?? '',
    description: item.description ?? item.title,
    priorite: typeFromApi(item.maintenanceType) === 'urgence' ? 'haute' : typeFromApi(item.maintenanceType) === 'corrective' ? 'moyenne' : 'basse',
  }
}
async function findAssignee(name: string): Promise<string | null> {
  if (!name.trim()) return null
  const result = await request<ApiResponse<{ sites: unknown[]; users: ApiUser[] }>>('/equipment/lookups')
  const match = result.data.users.find(user => user.fullName.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase())
  if (!match) throw new Error('Sélectionnez un technicien existant dans votre entreprise.')
  return match.id
}
async function toApi(item: Planification) {
  const assignedToId = await findAssignee(item.technicien)
  return {
    siteId: item.siteId,
    title: item.description.trim() || `Intervention ${item.type}`,
    description: item.description.trim() || null,
    maintenanceType: item.type === 'urgence' ? 'emergency' : item.type === 'corrective' ? 'corrective' : 'preventive',
    scheduledAt: new Date(`${item.date}T09:00:00`).toISOString(),
    status: statusToApi[item.statut],
    assignedToId,
  }
}
export async function listPlanifications(): Promise<Planification[]> {
  const result = await request<ApiResponse<ApiPlanification[]>>('/planifications')
  return result.data.map(fromApi)
}
export async function createPlanification(item: Planification): Promise<Planification> {
  const payload = await toApi(item)
  const result = await request<ApiResponse<ApiPlanification>>('/planifications', { method: 'POST', body: JSON.stringify(payload) })
  return fromApi(result.data)
}
export async function updatePlanification(item: Planification): Promise<Planification> {
  const payload = await toApi(item)
  const result = await request<ApiResponse<ApiPlanification>>(`/planifications/${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify(payload) })
  return fromApi(result.data)
}
export async function deletePlanification(id: string): Promise<void> {
  await request<void>(`/planifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
export async function listPlanificationSites(): Promise<Site[]> {
  return listSites()
}

export async function listPlanificationTechnicians(): Promise<ApiUser[]> {
  const result = await request<ApiResponse<{ sites: unknown[]; users: ApiUser[] }>>('/equipment/lookups')
  return result.data.users
}

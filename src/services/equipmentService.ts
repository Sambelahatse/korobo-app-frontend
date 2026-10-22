import { getAccessToken, getMyProfile } from './authService'
import { mockSites } from '../data/mockData'

export type EquipmentStatus = 'operational' | 'warning' | 'faulty' | 'under_maintenance' | 'retired'
export type TrackingMode = 'individual' | 'quantity'
export interface EquipmentRecord {
  id: string
  siteId: string
  site?: { id: string; name: string }
  name: string
  category: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  trackingMode: TrackingMode
  quantity: number
  availableQuantity: number
  assignedQuantity: number
  unit: string
  status: EquipmentStatus
  assignedToId: string | null
  assignedTo?: { id: string; fullName: string; email?: string } | null
  installedAt: string | null
  lastMaintenanceAt: string | null
  nextMaintenanceAt: string | null
  specifications: Record<string, unknown>
  notes: string | null
  createdAt: string
  updatedAt: string
}
export interface EquipmentSite { id: string; name: string; location?: string; ownerName?: string }
export interface EquipmentUser { id: string; fullName: string; email: string; role: string }
export interface EquipmentMovement {
  id: string; movement_type: string; quantity: number; from_site_name?: string | null; to_site_name?: string | null
  from_user_name?: string | null; to_user_name?: string | null; notes?: string | null; created_at: string; created_by_name?: string | null
}
export interface EquipmentMaintenance {
  id: string; equipment_id: string; maintenance_type: 'preventive' | 'corrective'; status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'; title: string; description: string | null; diagnosis: string | null
  work_performed: string | null; cost: string | number | null; scheduled_at: string | null; next_due_at: string | null
  assigned_to: string | null; assigned_to_name?: string | null; created_at: string
}
export interface EquipmentDetails extends EquipmentRecord { movements: EquipmentMovement[]; maintenance: EquipmentMaintenance[] }
export interface EquipmentInput {
  siteId: string; name: string; category: string; brand?: string | null; model?: string | null; serialNumber?: string | null
  trackingMode: TrackingMode; quantity: number; unit: string; status: EquipmentStatus; assignedToId?: string | null
  installedAt?: string | null; lastMaintenanceAt?: string | null; nextMaintenanceAt?: string | null
  specifications?: Record<string, unknown>; notes?: string | null
}
type ApiResponse<T> = { data: T; pagination?: { page: number; limit: number; total: number; pages: number } }
const apiUrl = () => ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
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
function toIsoDate(value: string | undefined): string | null {
  if (!value) return null
  return value.length === 10 ? `${value}T00:00:00.000Z` : value
}

async function migrateLocalSites(): Promise<void> {
  let profile
  try { profile = await getMyProfile() } catch { return }
  if (profile.role !== 'admin' && profile.role !== 'manager') return
  let localSites: Array<Record<string, unknown>> = []
  try {
    const raw = window.localStorage.getItem('korobo.sites.v1')
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) localSites = parsed as Array<Record<string, unknown>>
    }
  } catch { return }
  if (!localSites.length) localSites = mockSites as unknown as Array<Record<string, unknown>>
  if (!localSites.length) return
  const response = await request<ApiResponse<EquipmentSite[]>>('/sites')
  const knownNames = new Set(response.data.map(site => site.name.trim().toLocaleLowerCase()))
  for (const site of localSites) {
    const name = String(site.nom ?? '').trim()
    if (!name || knownNames.has(name.toLocaleLowerCase())) continue
    const location = String(site.localisation ?? name).trim() || name
    const ownerName = String(site.proprietaire ?? site.contact1Nom ?? 'À renseigner').trim() || 'À renseigner'
    const year = Number(site.annee)
    const power = Number(site.puissance)
    await request('/sites', {
      method: 'POST',
      body: JSON.stringify({
        name, location, ownerName,
        caseNumber: typeof site.numAffaire === 'string' ? site.numAffaire : null,
        ownerPhone: typeof site.contact1Tel === 'string' ? site.contact1Tel : null,
        ownerEmail: typeof site.contact1Email === 'string' ? site.contact1Email : null,
        installationYear: Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : null,
        installationType: typeof site.typeInstallation === 'string' ? site.typeInstallation : null,
        powerKw: Number.isFinite(power) && power >= 0 ? power : null,
        status: site.statut === 'inactif' ? 'inactive' : site.statut === 'maintenance' ? 'maintenance' : 'active',
      }),
    })
    knownNames.add(name.toLocaleLowerCase())
  }
}
export async function getEquipmentLookups(): Promise<{ sites: EquipmentSite[]; users: EquipmentUser[] }> {
  await migrateLocalSites()
  const result = await request<ApiResponse<{ sites: EquipmentSite[]; users: EquipmentUser[] }>>('/equipment/lookups')
  return result.data
}
export async function listEquipment(filters: { q?: string; status?: string; trackingMode?: string; siteId?: string } = {}): Promise<{ data: EquipmentRecord[]; total: number }> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value) })
  params.set('limit', '100')
  const result = await request<ApiResponse<EquipmentRecord[]>>(`/equipment?${params.toString()}`)
  return { data: result.data, total: result.pagination?.total ?? result.data.length }
}
export async function createEquipment(input: EquipmentInput): Promise<EquipmentRecord> {
  const result = await request<ApiResponse<EquipmentRecord>>('/equipment', { method: 'POST', body: JSON.stringify(input) })
  return result.data
}
export async function updateEquipment(id: string, input: Partial<EquipmentInput>): Promise<EquipmentRecord> {
  const result = await request<ApiResponse<EquipmentRecord>>(`/equipment/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })
  return result.data
}
export async function archiveEquipment(id: string): Promise<void> {
  await request<void>(`/equipment/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
export async function getEquipmentDetails(id: string): Promise<EquipmentDetails> {
  const result = await request<ApiResponse<EquipmentDetails>>(`/equipment/${encodeURIComponent(id)}`)
  return result.data
}
export async function recordEquipmentMovement(id: string, input: { type: 'stock_in' | 'stock_out' | 'assign' | 'unassign' | 'transfer'; quantity?: number; toSiteId?: string; toUserId?: string | null; notes?: string }): Promise<void> {
  await request(`/equipment/${encodeURIComponent(id)}/movements`, { method: 'POST', body: JSON.stringify(input) })
}
export async function createMaintenance(id: string, input: {
  maintenanceType: 'preventive' | 'corrective'; status: 'planned' | 'in_progress' | 'completed' | 'cancelled'; priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string; description?: string | null; diagnosis?: string | null; workPerformed?: string | null; cost?: number | null
  scheduledAt?: string | null; nextDueAt?: string | null; assignedToId?: string | null
}): Promise<EquipmentMaintenance> {
  const result = await request<ApiResponse<EquipmentMaintenance>>(`/equipment/${encodeURIComponent(id)}/maintenance`, { method: 'POST', body: JSON.stringify({
    ...input, scheduledAt: toIsoDate(input.scheduledAt ?? undefined), nextDueAt: toIsoDate(input.nextDueAt ?? undefined)
  }) })
  return result.data
}

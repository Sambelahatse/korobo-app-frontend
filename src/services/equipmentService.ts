import { getAccessToken, getMyProfile } from './authService'

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


async function migrateLocalEquipment(sites: EquipmentSite[]): Promise<void> {
  let profile
  try { profile = await getMyProfile() } catch { return }
  if (profile.role !== 'admin' && profile.role !== 'manager') return
  let localItems: Array<Record<string, unknown>> = []
  try {
    const raw = window.localStorage.getItem('korobo.equipment.v1')
    if (!raw) return
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) localItems = parsed as Array<Record<string, unknown>>
  } catch { return }
  if (!localItems.length) return
  const existing = await request<ApiResponse<EquipmentRecord[]>>('/equipment?limit=100')
  const serials = new Set(existing.data.map(item => item.serialNumber?.trim().toLocaleLowerCase()).filter((value): value is string => Boolean(value)))
  const known = new Set(existing.data.map(item => `${item.name.toLocaleLowerCase()}|${item.siteId}`))
  for (const item of localItems) {
    const name = String(item.name ?? '').trim()
    const siteName = String(item.site ?? '').trim()
    const site = sites.find(value => value.name.trim().toLocaleLowerCase() === siteName.toLocaleLowerCase())
    if (!name || !site) continue
    const serialNumber = String(item.serial ?? '').trim()
    const trackingMode: TrackingMode = serialNumber ? 'individual' : 'quantity'
    if (serialNumber && serials.has(serialNumber.toLocaleLowerCase())) continue
    if (!serialNumber && known.has(`${name.toLocaleLowerCase()}|${site.id}`)) continue
    const oldStatus = String(item.status ?? '')
    const status: EquipmentStatus = oldStatus === 'En panne' ? 'faulty' : oldStatus === 'À surveiller' ? 'warning' : 'operational'
    await request('/equipment', {
      method: 'POST',
      body: JSON.stringify({
        siteId: site.id, name, category: String(item.category ?? 'Autre'), brand: null, model: null,
        serialNumber: serialNumber || null, trackingMode, quantity: trackingMode === 'individual' ? 1 : 1,
        unit: 'unité', status, notes: item.power ? `Puissance / capacité : ${String(item.power)}` : null,
      }),
    })
    if (serialNumber) serials.add(serialNumber.toLocaleLowerCase())
    known.add(`${name.toLocaleLowerCase()}|${site.id}`)
  }
}

export async function getEquipmentLookups(): Promise<{ sites: EquipmentSite[]; users: EquipmentUser[] }> {
  const result = await request<ApiResponse<{ sites: EquipmentSite[]; users: EquipmentUser[] }>>('/equipment/lookups')
  await migrateLocalEquipment(result.data.sites)
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

export async function updateMaintenance(id: string, input: { status?: EquipmentMaintenance['status']; maintenanceType?: 'preventive' | 'corrective'; priority?: EquipmentMaintenance['priority']; title?: string; description?: string | null; diagnosis?: string | null; workPerformed?: string | null; cost?: number | null; scheduledAt?: string | null; nextDueAt?: string | null; assignedToId?: string | null }): Promise<EquipmentMaintenance> {
  const result = await request<ApiResponse<EquipmentMaintenance>>(`/equipment/maintenance/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...input,
      ...(input.scheduledAt !== undefined ? { scheduledAt: toIsoDate(input.scheduledAt ?? undefined) } : {}),
      ...(input.nextDueAt !== undefined ? { nextDueAt: toIsoDate(input.nextDueAt ?? undefined) } : {}),
    }),
  })
  return result.data
}

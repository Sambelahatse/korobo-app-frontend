import { getAccessToken } from './authService'
import type { Planification, Rapport, Site } from '../types'
import { listPlanifications, listPlanificationSites } from './planificationService'

type ApiUser = { id: string; fullName: string; email?: string; role?: string }
type ApiReport = { id: string; siteId: string; site?: { id: string; name: string }; planificationId: string | null; technicianId: string | null; technician?: ApiUser | null; title: string; reportType: Rapport['type']; reportDate: string; status: 'draft' | 'validated'; summary: string | null; findings: unknown[]; actionsTaken: string | null; recommendations: string | null }
type ApiResponse<T> = { data: T }
const apiUrl = () => ((import.meta.env.VITE_API_URL as string | undefined) || 'https://korobo-app-api.onrender.com').replace(/\/$/, '')

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('Votre session a expiré. Connectez-vous à nouveau.')
  const response = await fetch(`${apiUrl()}${path}`, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } })
  if (!response.ok) { const payload = await response.json().catch(() => ({})) as { error?: { message?: string } }; throw new Error(payload.error?.message || 'Impossible de traiter le rapport. Réessayez.') }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function fromApi(item: ApiReport): Rapport { return { id: item.id, siteId: item.siteId, siteNom: item.site?.name ?? 'Site', date: item.reportDate, type: item.reportType, technicien: item.technician?.fullName ?? '', statut: item.status === 'validated' ? 'validé' : 'brouillon', notes: item.summary ?? '', planificationId: item.planificationId ?? undefined } }
async function listTechnicians(): Promise<ApiUser[]> { const result = await request<ApiResponse<{ sites: unknown[]; users: ApiUser[] }>>('/equipment/lookups'); return result.data.users }
async function toApi(item: Partial<Rapport>, technicians: ApiUser[]) {
  if (!item.siteId) throw new Error('Sélectionnez un site.')
  if (!item.date) throw new Error('Choisissez la date du rapport.')
  const technician = technicians.find(user => user.fullName.trim().toLocaleLowerCase() === (item.technicien ?? '').trim().toLocaleLowerCase())
  if (item.technicien?.trim() && !technician) throw new Error('Sélectionnez un technicien actif dans la liste.')
  const type = item.type ?? 'mensuel'
  return { siteId: item.siteId, planificationId: item.planificationId ?? null, technicianId: technician?.id ?? null, title: `${type === 'mensuel' ? 'Rapport mensuel' : type === 'incident' ? 'Rapport d’incident' : 'Rapport d’intervention'} — ${item.siteNom ?? 'Site'}`.slice(0, 180), reportType: type, reportDate: item.date.slice(0, 10), summary: item.notes ?? null, status: item.statut === 'validé' ? 'validated' as const : 'draft' as const }
}
export async function loadReportsData(): Promise<{ rapports: Rapport[]; sites: Site[]; interventions: Planification[]; technicians: ApiUser[] }> {
  const [reportsResult, sites, interventions, technicians] = await Promise.all([request<ApiResponse<ApiReport[]>>('/rapports'), listPlanificationSites(), listPlanifications(), listTechnicians()])
  return { rapports: reportsResult.data.map(fromApi), sites, interventions, technicians }
}
export async function createReport(item: Partial<Rapport>, technicians: ApiUser[]): Promise<Rapport> { const payload = await toApi(item, technicians); const result = await request<ApiResponse<ApiReport>>('/rapports', { method: 'POST', body: JSON.stringify(payload) }); return fromApi(result.data) }
export async function updateReport(item: Rapport, technicians: ApiUser[]): Promise<Rapport> { const payload = await toApi(item, technicians); const result = await request<ApiResponse<ApiReport>>(`/rapports/${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify(payload) }); return fromApi(result.data) }
export async function setReportStatus(item: Rapport, status: Rapport['statut']): Promise<Rapport> { const result = await request<ApiResponse<ApiReport>>(`/rapports/${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify({ status: status === 'validé' ? 'validated' : 'draft' }) }); return fromApi(result.data) }
export async function deleteReport(id: string): Promise<void> { await request<void>(`/rapports/${encodeURIComponent(id)}`, { method: 'DELETE' }) }
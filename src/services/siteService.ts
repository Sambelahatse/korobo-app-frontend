import { getAccessToken, getMyProfile } from './authService'
import type { Site } from '../types'
import { mockSites } from '../data/mockData'

interface ApiSite {
  id: string; publicId?: string; name: string; location: string; ownerName: string; caseNumber?: string | null
  ownerPhone?: string | null; ownerEmail?: string | null; latitude?: string | number | null; longitude?: string | number | null
  installationYear?: number | null; installationType?: string | null; powerKw?: string | number | null
  installerName?: string | null; installerPhone?: string | null; electricalInstallation?: string | null
  batteries?: Site['batteries']; pvTypes?: Site['pvTypes']; mttpTypes?: Site['mttpTypes']; controllers?: Site['controllers']
  generatorInfo?: Record<string, unknown>; savContractFileName?: string | null; status: string; notes?: string | null
}
interface ApiResponse<T> { data: T }
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
    throw new Error(payload.error?.message || 'Impossible de traiter le site. Réessayez.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function fromApi(site: ApiSite): Site {
  const latitude = site.latitude == null ? '' : String(site.latitude)
  const longitude = site.longitude == null ? '' : String(site.longitude)
  return {
    id: site.id, publicId: site.publicId, nom: site.name, localisation: site.location, proprietaire: site.ownerName,
    contact1Nom: site.ownerName, contact1Tel: site.ownerPhone ?? '', contact2Nom: '', contact2Tel: '',
    annee: site.installationYear == null ? '' : String(site.installationYear),
    statut: site.status === 'inactive' || site.status === 'terminated' ? 'inactif' : site.status === 'maintenance' ? 'maintenance' : 'actif',
    typeInstallation: site.installationType ?? '', puissance: Number(site.powerKw ?? 0),
    gps: latitude && longitude ? `${latitude}, ${longitude}` : '', numAffaire: site.caseNumber ?? '',
    installateurNom: site.installerName ?? '', installateurTel: site.installerPhone ?? '',
    installationElectrique: site.electricalInstallation ?? '', batteries: site.batteries ?? [],
    pvTypes: site.pvTypes ?? [], mttpTypes: site.mttpTypes ?? [], controllers: site.controllers ?? [],
    groupeInfo: typeof site.generatorInfo?.information === 'string' ? site.generatorInfo.information : '',
    contratSav: site.savContractFileName ?? '',
  }
}
function toApi(site: Site) {
  const coords = site.gps.split(',').map(value => value.trim())
  const latitude = coords.length === 2 && coords[0] && coords[1] ? Number(coords[0]) : null
  const longitude = coords.length === 2 && coords[0] && coords[1] ? Number(coords[1]) : null
  return {
    name: site.nom.trim(), location: site.localisation.trim(), ownerName: site.proprietaire.trim(),
    caseNumber: site.numAffaire?.trim() || null, ownerPhone: site.contact1Tel?.trim() || null,
    installationYear: Number(site.annee) || null, installationType: site.typeInstallation || null,
    powerKw: Number.isFinite(site.puissance) ? site.puissance : null,
    latitude: latitude != null && Number.isFinite(latitude) ? latitude : null,
    longitude: longitude != null && Number.isFinite(longitude) ? longitude : null,
    installerName: site.installateurNom || null, installerPhone: site.installateurTel || null,
    electricalInstallation: site.installationElectrique || null, batteries: site.batteries ?? [],
    pvTypes: site.pvTypes ?? [], mttpTypes: site.mttpTypes ?? [], controllers: site.controllers ?? [],
    generatorInfo: { information: site.groupeInfo ?? '' }, savContractFileName: site.contratSav || null,
    status: site.statut === 'inactif' ? 'inactive' : site.statut === 'maintenance' ? 'maintenance' : 'active',
  }
}

export async function listSites(): Promise<Site[]> {
  let result = await request<ApiResponse<ApiSite[]>>('/sites')
  if (result.data.length === 0) {
    try {
      const profile = await getMyProfile()
      if (profile.role === 'admin' || profile.role === 'manager') {
        let legacySites: Site[] = []
        try {
          const raw = window.localStorage.getItem('korobo.sites.v1')
          const parsed: unknown = raw ? JSON.parse(raw) : null
          if (Array.isArray(parsed)) legacySites = parsed as Site[]
        } catch { /* Use the initial sample data if the legacy cache is unreadable. */ }
        if (legacySites.length === 0) legacySites = mockSites
        for (const legacySite of legacySites) {
          try { await createSite(legacySite) }
          catch (error) {
            // A concurrent sync or duplicate name should not prevent other sites from migrating.
            if (!(error instanceof Error) || !error.message.toLowerCase().includes('nom')) throw error
          }
        }
        result = await request<ApiResponse<ApiSite[]>>('/sites')
      }
    } catch (error) {
      // If migration fails, surface it instead of pretending the database has been populated.
      throw error
    }
  }
  return result.data.map(fromApi)
}
export async function createSite(site: Site): Promise<Site> {
  const result = await request<ApiResponse<ApiSite>>('/sites', { method: 'POST', body: JSON.stringify(toApi(site)) })
  return fromApi(result.data)
}
export async function updateSite(site: Site): Promise<Site> {
  const result = await request<ApiResponse<ApiSite>>(`/sites/${encodeURIComponent(site.id)}`, { method: 'PATCH', body: JSON.stringify(toApi(site)) })
  return fromApi(result.data)
}
export async function deleteSite(id: string): Promise<void> {
  await request<void>(`/sites/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export type Page =
  | 'landing'
  | 'dashboard'
  | 'sites'
  | 'equipements'
  | 'planifications'
  | 'calendrier'
  | 'rapports'
  | 'utilisateurs'
  | 'notifications'
  | 'database'
  | 'settings'

export interface Site {
  id: string
  nom: string
  localisation: string
  contact1Nom: string
  contact1Tel: string
  contact2Nom: string
  contact2Tel: string
  proprietaire: string
  annee: string
  statut: 'actif' | 'inactif' | 'maintenance'
  typeInstallation: string
  puissance: number
  gps: string
  numAffaire?: string
  installateurNom?: string
  installateurTel?: string
  installationElectrique?: string
  batteries?: ListItem[]
  pvTypes?: ListItem[]
  mttpTypes?: ListItem[]
  controllers?: ListItem[]
  groupeInfo?: string
  contratSav?: string
}

export interface ListItem {
  id: string
  quantity: string
  name: string
}

export interface Planification {
  id: string
  siteId: string
  siteNom: string
  type: 'préventive' | 'corrective' | 'urgence'
  statut: 'planifiée' | 'en cours' | 'terminée' | 'annulée'
  date: string
  technicien: string
  description: string
  priorite: 'haute' | 'moyenne' | 'basse'
}

export interface Notification {
  id: string
  type: 'alerte' | 'info' | 'succès' | 'avertissement'
  titre: string
  message: string
  date: string
  lu: boolean
  siteNom?: string
}

export interface Rapport {
  id: string
  siteId: string
  siteNom: string
  date: string
  type: 'mensuel' | 'incident' | 'intervention'
  technicien: string
  statut: 'brouillon' | 'validé'
  notes: string
  planificationId?: string
}

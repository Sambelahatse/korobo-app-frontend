export interface AccountProfile {
  name: string
  email: string
  phone: string
  role: string
}

export interface AccountPreferences {
  language: string
  theme: string
  notifications: {
    email: boolean
    push: boolean
    outageAlerts: boolean
    maintenanceReminders: boolean
    monthlyReports: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: boolean
  }
}

const PROFILE_KEY = 'korobo.account.profile'
const PREFERENCES_KEY = 'korobo.account.preferences'

export const defaultProfile: AccountProfile = {
  name: 'Rakoto Jean',
  email: 'jean.rakoto@korobo.mg',
  phone: '+261 34 00 000 01',
  role: 'Administrateur',
}

export const defaultPreferences: AccountPreferences = {
  language: 'Français',
  theme: 'Clair',
  notifications: {
    email: true,
    push: false,
    outageAlerts: true,
    maintenanceReminders: true,
    monthlyReports: false,
  },
  security: {
    twoFactor: false,
    sessionTimeout: true,
  },
}

function readValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } as T : fallback
  } catch {
    return fallback
  }
}

export const settingsService = {
  getProfile(): AccountProfile {
    return readValue(PROFILE_KEY, defaultProfile)
  },
  saveProfile(profile: AccountProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  },
  getPreferences(): AccountPreferences {
    const saved = readValue<AccountPreferences>(PREFERENCES_KEY, defaultPreferences)
    return {
      ...defaultPreferences,
      ...saved,
      notifications: { ...defaultPreferences.notifications, ...saved.notifications },
      security: { ...defaultPreferences.security, ...saved.security },
    }
  },
  savePreferences(preferences: AccountPreferences): void {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  },
}

import { useEffect } from 'react'

type CompanyChangedPayload = {
  resource?: string
  action?: 'created' | 'updated' | 'deleted'
  entityId?: string
  companyId?: string
  actorId?: string
  occurredAt?: string
}

/** Subscribe to committed company-wide changes and refresh only the affected module data. */
export function useCompanyRealtime(resources: readonly string[], onChange: () => void): void {
  useEffect(() => {
    const handleChange = (event: Event) => {
      const payload = (event as CustomEvent<CompanyChangedPayload>).detail
      if (!payload?.resource || !resources.includes(payload.resource)) return
      onChange()
    }
    window.addEventListener('korobo:company-changed', handleChange)
    return () => window.removeEventListener('korobo:company-changed', handleChange)
  }, [resources, onChange])
}

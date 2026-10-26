import { useEffect, useRef } from 'react'

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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const resourceKey = resources.join('|')

  useEffect(() => {
    const subscribedResources = new Set(resourceKey.split('|'))
    const handleChange = (event: Event) => {
      const payload = (event as CustomEvent<CompanyChangedPayload>).detail
      if (!payload?.resource || !subscribedResources.has(payload.resource)) return
      onChangeRef.current()
    }
    window.addEventListener('korobo:company-changed', handleChange)
    return () => window.removeEventListener('korobo:company-changed', handleChange)
  }, [resourceKey])
}

import { apiFetch } from '@/services/apiFetch'
import type { AuditLogEntry, ResourceType } from '../types'

interface AuditLogQuery {
  resource_type: ResourceType
  resource_id: string
  limit?: number
}

export async function fetchAuditLogs(query: AuditLogQuery): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams({
    resource_type: query.resource_type,
    resource_id: query.resource_id,
    ...(query.limit != null ? { limit: String(query.limit) } : {}),
  })

  const res = await apiFetch(`/audit-logs?${params}`)
  if (!res.ok) throw new Error('Failed to fetch audit logs')
  const json = await res.json()
  return json.data as AuditLogEntry[]
}

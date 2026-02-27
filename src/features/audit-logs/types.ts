export type AuditLogEntry = {
  id: number
  resource_type: 'item' | 'recipe' | 'file' | 'ticket'
  resource_id: string
  action: 'create' | 'update' | 'delete'
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  actor_discord_id?: string | null
  actor_username: string
  actor_global_name?: string | null
  actor_avatar_url?: string | null
  created_at: string
}

export type ResourceType = AuditLogEntry['resource_type']

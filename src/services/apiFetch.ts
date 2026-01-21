import { loadActor } from '@/features/auth/storage'

export function getActorHeaders(): Record<string, string> {
  const actor = loadActor()
  if (!actor) return {}

  const enc = (v: string) => encodeURIComponent(v)

  const headers: Record<string, string> = {
    'X-Actor-Discord-Id': enc(actor.id),
    'X-Actor-Discord-Username': enc(actor.username),
  }

  if (actor.global_name) headers['X-Actor-Discord-Global-Name'] = enc(actor.global_name)
  if (actor.avatar_url) headers['X-Actor-Discord-Avatar'] = enc(actor.avatar_url)

  return headers
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const base = import.meta.env.VITE_API_URL as string
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`

  const headers = new Headers(init.headers)

  const method = (init.method ?? 'GET').toUpperCase()

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${import.meta.env.VITE_API_KEY}`)
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const actorHeaders = getActorHeaders()
    for (const [k, v] of Object.entries(actorHeaders)) headers.set(k, v)
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, { ...init, headers })
}

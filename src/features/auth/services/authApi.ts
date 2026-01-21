import type { Actor } from '../types'

type LoginResponse = { url: string }
type ExchangeResponse = { user: Actor }

function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    ...(extra ?? {}),
  }
}

export async function getDiscordLoginUrl(): Promise<string> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord/login`, {
    headers: authHeaders(),
  })

  if (!res.ok) throw new Error('Failed to get login url')
  const json = (await res.json()) as LoginResponse
  if (!json?.url) throw new Error('Invalid login url response')
  return json.url
}

export async function exchangeDiscordCode(code: string, state: string): Promise<Actor> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/discord/exchange`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ code, state }),
  })

  if (!res.ok) throw new Error('Failed to exchange code')
  const json = (await res.json()) as ExchangeResponse
  if (!json?.user?.id || !json?.user?.username) throw new Error('Invalid exchange response')
  return json.user
}

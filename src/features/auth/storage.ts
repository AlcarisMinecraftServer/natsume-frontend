import type { Actor } from './types'

const STORAGE_KEY = 'natsume_actor_v1'

export function loadActor(): Actor | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Actor
  } catch {
    return null
  }
}

export function saveActor(actor: Actor) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actor))
}

export function clearActor() {
  localStorage.removeItem(STORAGE_KEY)
}

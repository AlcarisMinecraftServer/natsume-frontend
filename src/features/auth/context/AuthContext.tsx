import { createContext, useContext, useMemo, useState } from 'react'
import type { Actor } from '../types'
import { clearActor, loadActor, saveActor } from '../storage'

type AuthContextValue = {
  actor: Actor | null
  isAuthenticated: boolean
  setActor: (actor: Actor) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [actor, setActorState] = useState<Actor | null>(() => loadActor())

  const value = useMemo<AuthContextValue>(() => {
    return {
      actor,
      isAuthenticated: !!actor,
      setActor: (next) => {
        saveActor(next)
        setActorState(next)
      },
      logout: () => {
        clearActor()
        setActorState(null)
      },
    }
  }, [actor])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

import { useCallback, useEffect, useState } from 'react'
import { loadSession, setSession } from '#/lib/storage'

export type SessionState = 'loading' | 'authenticated' | 'unauthenticated'

export function useSession() {
  const [state, setState] = useState<SessionState>('loading')

  useEffect(() => {
    setState(loadSession() ? 'authenticated' : 'unauthenticated')
  }, [])

  const login = useCallback(() => {
    setSession(true)
    setState('authenticated')
  }, [])

  const logout = useCallback(() => {
    setSession(false)
    setState('unauthenticated')
  }, [])

  return { state, login, logout }
}

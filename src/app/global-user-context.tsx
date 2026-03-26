'use client'

import { trpc } from '@/trpc/client'
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const STORAGE_KEY = 'globalLedger_currentUserId'

type CurrentUser = { id: string; name: string } | null

type GlobalUserContextType = {
  currentUser: CurrentUser
  isLoading: boolean
  setCurrentUser: (user: CurrentUser) => void
  clearCurrentUser: () => void
}

const GlobalUserContext = createContext<GlobalUserContextType | null>(null)

export function useGlobalUser() {
  const ctx = useContext(GlobalUserContext)
  if (!ctx)
    throw new Error(
      'useGlobalUser must be used inside GlobalUserProvider',
    )
  return ctx
}

export function GlobalUserProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CurrentUser
        setCurrentUserState(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const setCurrentUser = (user: CurrentUser) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const clearCurrentUser = () => setCurrentUser(null)

  return (
    <GlobalUserContext.Provider
      value={{ currentUser, isLoading, setCurrentUser, clearCurrentUser }}
    >
      {children}
    </GlobalUserContext.Provider>
  )
}

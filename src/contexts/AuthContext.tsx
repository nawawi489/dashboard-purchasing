import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'

// 12 jam dalam milidetik
const SESSION_DURATION = 12 * 60 * 60 * 1000

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string) => void
  logout: () => void
  user: string | null
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const logoutTimerRef = useRef<number | null>(null)

  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('auth_user')
  }, [])

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
  }, [])

  const logout = useCallback(() => {
    clearLogoutTimer()
    clearAuthStorage()
    setIsAuthenticated(false)
    setUser(null)
  }, [clearAuthStorage, clearLogoutTimer])

  const scheduleLogout = useCallback((delay: number) => {
    clearLogoutTimer()
    logoutTimerRef.current = window.setTimeout(() => {
      logout()
    }, delay)
  }, [clearLogoutTimer, logout])

  const login = useCallback((username: string) => {
    const expiry = Date.now() + SESSION_DURATION
    clearLogoutTimer()
    localStorage.setItem('auth_token', 'dummy-token-' + Date.now())
    localStorage.setItem('auth_expiry', String(expiry))
    localStorage.setItem('auth_user', username)
    setIsAuthenticated(true)
    setUser(username)
    scheduleLogout(SESSION_DURATION)
  }, [clearLogoutTimer, scheduleLogout])

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const expiry = localStorage.getItem('auth_expiry')
    const username = localStorage.getItem('auth_user')

    if (token && expiry && username) {
      const remainingTime = Number(expiry) - Date.now()
      if (remainingTime > 0) {
        setIsAuthenticated(true)
        setUser(username)
        scheduleLogout(remainingTime)
      } else {
        clearLogoutTimer()
        clearAuthStorage()
        setIsAuthenticated(false)
        setUser(null)
      }
    } else {
      clearLogoutTimer()
      setIsAuthenticated(false)
      setUser(null)
    }

    setIsInitialized(true)

    return () => {
      clearLogoutTimer()
    }
  }, [clearAuthStorage, clearLogoutTimer, scheduleLogout])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, isInitialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

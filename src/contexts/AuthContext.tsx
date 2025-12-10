import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string) => void
  logout: () => void
  user: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<string | null>(null)
  
  // 12 jam dalam milidetik
  const SESSION_DURATION = 12 * 60 * 60 * 1000 

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token')
      const expiry = localStorage.getItem('auth_expiry')
      const username = localStorage.getItem('auth_user')

      if (token && expiry && username) {
        const remainingTime = Number(expiry) - Date.now()
        if (remainingTime > 0) {
          setIsAuthenticated(true)
          setUser(username)
          
          // Set timer untuk auto logout saat sesi habis
          const timer = setTimeout(() => {
            logout()
          }, remainingTime)
          
          return () => clearTimeout(timer)
        } else {
          logout()
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    return checkAuth()
  }, [])

  const login = (username: string) => {
    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem('auth_token', 'dummy-token-' + Date.now())
    localStorage.setItem('auth_expiry', String(expiry))
    localStorage.setItem('auth_user', username)
    setIsAuthenticated(true)
    setUser(username)
    
    // Set timer baru
    setTimeout(() => {
      logout()
    }, SESSION_DURATION)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('auth_user')
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

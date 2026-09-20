'use client'

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export interface UserSessionInfo {
  userId: number
  email: string
  peran: 'mahasiswa' | 'dosen'
}

interface AuthContextValue {
  isAuthenticated: boolean
  isReady: boolean
  user: UserSessionInfo | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (
    name: string,
    email: string,
    password: string,
    peran?: 'mahasiswa' | 'dosen',
  ) => Promise<{ success: boolean; message?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserSessionInfo | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Verify server-side HttpOnly session cookie on initial mount
  useEffect(() => {
    let mounted = true

    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            setIsAuthenticated(Boolean(data.isAuthenticated))
            setUser(data.user || null)
          }
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsReady(true)
        }
      }
    }

    checkServerSession()

    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isReady,
      user,
      async signIn(email, password) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await res.json()
          if (res.ok && data.success) {
            setIsAuthenticated(true)
            setUser(data.user)
            return { success: true, message: data.message }
          }
          return { success: false, message: data.message || 'Login gagal.' }
        } catch {
          return { success: false, message: 'Gagal menghubungi server autentikasi.' }
        }
      },
      async register(name, email, password, peran = 'mahasiswa') {
        try {
          // Never store passwords in localStorage - sent securely over HTTPS/HTTP to server for bcrypt hashing
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, peran }),
          })

          const data = await res.json()
          if (res.ok && data.success) {
            return { success: true, message: data.message }
          }
          return { success: false, message: data.message || 'Registrasi gagal.' }
        } catch {
          return { success: false, message: 'Gagal menghubungi server registrasi.' }
        }
      },
      async signOut() {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {
          // Continue local teardown even if network fails
        }
        setIsAuthenticated(false)
        setUser(null)
      },
    }),
    [isAuthenticated, isReady, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.')
  return context
}

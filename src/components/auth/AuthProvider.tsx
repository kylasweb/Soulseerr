'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth-service'

interface AuthUser {
  id: string
  email: string
  username: string | null
  name?: string | null
  displayName?: string | null
  role: 'CLIENT' | 'READER' | 'ADMIN'
  status: string
  clientProfile?: any
  readerProfile?: any
  adminProfile?: any
  wallet?: any
}

interface AuthContextType {
  user: AuthUser | null
  userRole: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { email: string; password: string; username?: string; role: 'CLIENT' | 'READER'; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get current user (this will use the HTTP-only cookie)
        const result = await AuthService.getCurrentUser()
        if (result.success && result.user) {
          setUser(result.user)
          setUserRole(result.user.role)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.login({ email, password })
      
      if (result.success && result.user) {
        setUser(result.user)
        setUserRole(result.user.role)
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (data: { email: string; password: string; username?: string; role: 'CLIENT' | 'READER'; firstName?: string; lastName?: string }) => {
    try {
      const result = await AuthService.register(data)
      
      if (result.success && result.user) {
        // Don't auto-login after registration since email verification is needed
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      const result = await AuthService.logout()
      setUser(null)
      setUserRole(null)
      return result
    } catch (error: any) {
      console.error('Logout error:', error)
      // Clear local state even if API call fails
      setUser(null)
      setUserRole(null)
      return { success: false, error: 'Logout failed' }
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const result = await AuthService.updateProfile(data)
      
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { success: false, error: 'Profile update failed. Please try again.' }
    }
  }

  const refreshUser = async () => {
    try {
      const result = await AuthService.getCurrentUser()
      if (result.success && result.user) {
        setUser(result.user)
        setUserRole(result.user.role)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
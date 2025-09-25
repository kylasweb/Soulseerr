'use client'

import { useAuth } from './EnhancedAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ allowedRoles, children, redirectTo = '/login' }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (!user.role || !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (user.role === 'reader') {
          router.push('/reader/dashboard')
        } else if (user.role === 'client') {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
        return
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
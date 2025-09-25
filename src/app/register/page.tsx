'use client'

import { useRouter } from 'next/navigation'
import { SocialRegisterForm } from '@/components/auth/SocialRegisterForm'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { useEffect } from 'react'

export default function RegisterPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'reader') {
        router.push('/reader/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mystical-pink"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen mystical-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-alex text-4xl md:text-6xl font-bold text-transparent mystical-text-gradient mb-4">
            Join SoulSeer
          </h1>
          <p className="font-playfair text-lg text-gray-300">
            Begin your spiritual journey today
          </p>
        </div>
        <SocialRegisterForm onSuccess={() => {}} />
      </div>
    </div>
  )
}
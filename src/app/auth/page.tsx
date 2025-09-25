'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  if (!loading && user) {
    if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else if (user.role === 'reader') {
      router.push('/reader/dashboard')
    } else {
      router.push('/dashboard')
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mystical-pink"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float animation-delay-4000"></div>
        
        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300 mystical-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Star className="w-2 h-2" />
          </div>
        ))}
      </div>

    {/* Navigation Header */}
      <header className="relative z-20 w-full bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 mystical-glow rounded-full"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-great-vibes text-2xl text-transparent mystical-text-gradient">SoulSeer</span>
            </div>

            {/* Back to Home */}
            <Link href="/">
              <Button variant="ghost" className="font-playfair text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-20">

        {/* Logo and branding */}
        <div className="text-center mb-12 mystical-float">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 mystical-glow rounded-full"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="font-great-vibes text-6xl md:text-7xl font-bold text-transparent mystical-text-gradient mb-4">
            SoulSeer
          </h1>
          
          <p className="font-tangerine text-2xl text-gray-300">
            {isLoginMode ? 'Welcome Back, Seeker' : 'Begin Your Journey'}
          </p>
        </div>

        {/* Auth forms */}
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-full p-1 flex">
              <Button
                variant={isLoginMode ? "default" : "ghost"}
                onClick={() => setIsLoginMode(true)}
                className={`px-8 py-3 rounded-full ${isLoginMode ? 'mystical-button' : 'text-gray-400 hover:text-white'}`}
              >
                <span className="font-playfair">Sign In</span>
              </Button>
              <Button
                variant={!isLoginMode ? "default" : "ghost"}
                onClick={() => setIsLoginMode(false)}
                className={`px-8 py-3 rounded-full ${!isLoginMode ? 'mystical-button' : 'text-gray-400 hover:text-white'}`}
              >
                <span className="font-playfair">Register</span>
              </Button>
            </div>
          </div>

          <Card className="mystical-card backdrop-blur-lg">
            <CardContent className="p-8">
              {isLoginMode ? (
                <LoginForm onSuccess={() => {}} />
              ) : (
                <RegisterForm onSuccess={() => {}} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center max-w-md">
          <div className="mystical-card rounded-xl p-6">
            <h3 className="font-dancing text-xl text-white mb-3">Why Join SoulSeer?</h3>
            <ul className="space-y-2 text-gray-300 font-playfair">
              <li className="flex items-center justify-center">
                <Star className="w-4 h-4 text-mystical-gold mr-2" />
                Connect with verified psychic readers
              </li>
              <li className="flex items-center justify-center">
                <Star className="w-4 h-4 text-mystical-gold mr-2" />
                Real-time guidance and support
              </li>
              <li className="flex items-center justify-center">
                <Star className="w-4 h-4 text-mystical-gold mr-2" />
                Safe and secure platform
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 mystical-glow rounded-full"></div>
                <div className="relative w-6 h-6 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="font-great-vibes text-lg text-transparent mystical-text-gradient">SoulSeer</span>
            </div>
            <p className="font-playfair text-gray-400 text-sm">
              © 2024 SoulSeer. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
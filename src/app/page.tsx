'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Star, Moon, Sun, Eye, Heart, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
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
    <div className="min-h-screen mystical-gradient relative overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob mystical-float animation-delay-4000"></div>
        
        {/* Floating stars */}
        {[...Array(30)].map((_, i) => (
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

        {/* Mystical particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-mystical-pink rounded-full mystical-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          ></div>
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

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="font-playfair text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/#features" className="font-playfair text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/#about" className="font-playfair text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/#testimonials" className="font-playfair text-gray-300 hover:text-white transition-colors">
                Testimonials
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="font-playfair text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="mystical-button font-playfair">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-20">
        {/* Hero section with mystical goddess */}
        <div className="text-center mb-16">
          {/* Logo and branding */}
          <div className="mb-12 mystical-float">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 mystical-glow rounded-full"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="font-great-vibes text-5xl md:text-6xl font-bold text-transparent mystical-text-gradient mb-6 leading-none">
              SoulSeer
            </h1>
            
            <p className="font-tangerine text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
              Where Mystical Wisdom Meets Modern Guidance
            </p>
          </div>

          {/* Mystical goddess hero image */}
          <div className="relative mb-16 mystical-float">
            <div className="absolute inset-0 mystical-shimmer rounded-2xl"></div>
            <div className="relative overflow-hidden rounded-2xl mystical-card p-2">
              <img 
                src="/mystical-goddess.png" 
                alt="Mystical Goddess performing psychic reading"
                className="w-full max-w-2xl mx-auto h-auto rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="font-dancing text-2xl text-white drop-shadow-lg">
                  "The universe speaks through those who listen"
                </p>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/auth">
              <Button size="lg" className="mystical-button font-playfair text-lg px-8 py-4 rounded-full">
                Begin Your Journey
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg" className="font-playfair text-lg px-8 py-4 rounded-full border-mystical-pink text-mystical-pink hover:bg-mystical-pink hover:text-white transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features section with enhanced design */}
        <div id="features" className="w-full max-w-6xl mx-auto mb-20">
          <h2 className="font-great-vibes text-5xl md:text-6xl text-center text-transparent mystical-text-gradient mb-16">
            Discover Your Path
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="mystical-card text-center p-8 transform hover:scale-105 transition-all duration-300">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center mx-auto mystical-glow">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-dancing text-2xl font-semibold text-white">Clairvoyant Insights</h3>
                <p className="font-playfair text-gray-300 text-lg leading-relaxed">
                  Our gifted readers offer profound visions and guidance to illuminate your life's journey
                </p>
              </CardContent>
            </Card>

            <Card className="mystical-card text-center p-8 transform hover:scale-105 transition-all duration-300">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-mystical-gold rounded-full flex items-center justify-center mx-auto mystical-glow">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-dancing text-2xl font-semibold text-white">Heart-Centered</h3>
                <p className="font-playfair text-gray-300 text-lg leading-relaxed">
                  Experience compassionate guidance that nurtures your soul and honors your unique path
                </p>
              </CardContent>
            </Card>

            <Card className="mystical-card text-center p-8 transform hover:scale-105 transition-all duration-300">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-mystical-pink rounded-full flex items-center justify-center mx-auto mystical-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-dancing text-2xl font-semibold text-white">Instant Connection</h3>
                <p className="font-playfair text-gray-300 text-lg leading-relaxed">
                  Real-time sessions via chat, voice, or video for immediate wisdom and support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonial section */}
        <div id="testimonials" className="w-full max-w-4xl mx-auto mb-16">
          <div className="mystical-card rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-mystical-gold to-mystical-pink rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <blockquote className="font-tangerine text-2xl text-white mb-6 leading-relaxed">
              "SoulSeer connected me with an amazing reader who helped me navigate life's challenges with clarity and grace. Truly transformative!"
            </blockquote>
            <cite className="font-playfair text-lg text-gray-300">— Sarah M., Spiritual Seeker</cite>
          </div>
        </div>

        {/* Final call to action */}
        <div className="text-center mb-20">
          <h2 className="font-great-vibes text-4xl md:text-5xl text-transparent mystical-text-gradient mb-8">
            Your Destiny Awaits
          </h2>
          <Link href="/auth">
            <Button size="lg" className="mystical-button font-playfair text-xl px-12 py-6 rounded-full">
              Connect With Your Guide Today
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 mystical-glow rounded-full"></div>
                  <div className="relative w-8 h-8 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="font-great-vibes text-xl text-transparent mystical-text-gradient">SoulSeer</span>
              </div>
              <p className="font-playfair text-gray-300 mb-4 max-w-md">
                Where mystical wisdom meets modern guidance. Connect with gifted spiritual readers and discover your path to enlightenment.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-mystical-pink/20 rounded-full flex items-center justify-center hover:bg-mystical-pink/40 transition-colors cursor-pointer">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-mystical-pink/20 rounded-full flex items-center justify-center hover:bg-mystical-pink/40 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-mystical-pink/20 rounded-full flex items-center justify-center hover:bg-mystical-pink/40 transition-colors cursor-pointer">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-dancing text-xl text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/#testimonials" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-dancing text-xl text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="font-playfair text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="font-playfair text-gray-400">
              © 2024 SoulSeer. All rights reserved. | Made with <Heart className="w-4 h-4 inline text-mystical-pink" /> for spiritual seekers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
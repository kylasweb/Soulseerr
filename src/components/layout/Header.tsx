'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Users,
  Star
} from 'lucide-react'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User'
  }

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'reader':
        return '/reader/dashboard'
      default:
        return '/dashboard'
    }
  }

  const navigationItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Readers', href: '/readers', icon: Users },
    { label: 'Community', href: '/community', icon: MessageSquare },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  ]

  if (user) {
    navigationItems.push(
      { label: 'Dashboard', href: getDashboardLink(), icon: Star },
      { label: 'Sessions', href: '/sessions', icon: Calendar },
    )
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-alex text-2xl font-bold text-transparent mystical-text-gradient hidden sm:block">
              SoulSeer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={getDisplayName()} />
                      <AvatarFallback className="bg-mystical-pink text-white">
                        {getInitials(getDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="w-fit">
                      {user?.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="mystical-button" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="mystical-button justify-start" asChild>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  className?: string
}

export function MainLayout({ children, showSidebar = true, className }: MainLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        {showSidebar && user && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}
        <main className={`flex-1 ${showSidebar && user ? 'lg:ml-64' : ''} ${className}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
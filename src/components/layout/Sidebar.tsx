'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/EnhancedAuthProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Settings,
  Star,
  TrendingUp,
  Wallet,
  FileText,
  Heart,
  Gift,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  BarChart3,
  Package,
  MessageCircle,
  Video,
  Phone,
  MessageSquareText,
  User,
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>([])

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

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Readers',
        href: '/readers',
        icon: Users,
      },
      {
        title: 'Sessions',
        href: '/sessions',
        icon: Calendar,
        children: [
          { title: 'Upcoming', href: '/sessions/upcoming', icon: Calendar },
          { title: 'History', href: '/sessions/history', icon: FileText },
          { title: 'Book Session', href: '/sessions/book', icon: Star },
        ],
      },
      {
        title: 'Community',
        href: '/community',
        icon: MessageSquare,
        children: [
          { title: 'Live Streams', href: '/community/streams', icon: Video },
          { title: 'Forums', href: '/community/forums', icon: MessageCircle },
          { title: 'Messages', href: '/community/messages', icon: MessageSquareText },
        ],
      },
      {
        title: 'Marketplace',
        href: '/marketplace',
        icon: ShoppingBag,
        children: [
          { title: 'Products', href: '/marketplace/products', icon: Package },
          { title: 'Orders', href: '/marketplace/orders', icon: FileText },
          { title: 'Gifts', href: '/marketplace/gifts', icon: Gift },
        ],
      },
      {
        title: 'Wallet',
        href: '/wallet',
        icon: Wallet,
        children: [
          { title: 'Balance', href: '/wallet/balance', icon: CreditCard },
          { title: 'Transactions', href: '/wallet/transactions', icon: TrendingUp },
          { title: 'Add Funds', href: '/wallet/add-funds', icon: CreditCard },
        ],
      },
    ]

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          title: 'Admin',
          href: '/admin',
          icon: Shield,
          children: [
            { title: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
            { title: 'Users', href: '/admin/users', icon: Users },
            { title: 'Readers', href: '/admin/readers', icon: Users },
            { title: 'Finances', href: '/admin/finances', icon: CreditCard },
            { title: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
            { title: 'Community', href: '/admin/community', icon: MessageSquare },
            { title: 'Settings', href: '/admin/settings', icon: Settings },
          ],
        },
      ]
    }

    if (user?.role === 'reader') {
      return [
        ...baseItems,
        {
          title: 'Reader Tools',
          href: '/reader',
          icon: User,
          children: [
            { title: 'Profile', href: '/reader/profile', icon: User },
            { title: 'Schedule', href: '/reader/schedule', icon: Calendar },
            { title: 'Earnings', href: '/reader/earnings', icon: TrendingUp },
            { title: 'Analytics', href: '/reader/analytics', icon: BarChart3 },
            { title: 'Live Stream', href: '/reader/stream', icon: Video },
          ],
        },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = isItemActive(item.href)
    const isOpen = openItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                level > 0 && "pl-8",
                isActive && "bg-mystical-pink/10 text-mystical-pink"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        variant="ghost"
        asChild
        className={cn(
          "w-full justify-start",
          level > 0 && "pl-8",
          isActive && "bg-mystical-pink/10 text-mystical-pink"
        )}
      >
        <Link href={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
        </Link>
      </Button>
    )
  }

  return (
    <div className={cn("pb-12 w-64 bg-black border-r border-gray-800", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-mystical-pink to-mystical-gold rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-alex text-xl font-bold text-transparent mystical-text-gradient">
                  SoulSeer
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {user && !isCollapsed && (
            <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-gray-800">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={getDisplayName()} />
                <AvatarFallback className="bg-mystical-pink text-white">
                  {getInitials(getDisplayName())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {user?.role}
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </div>

          {user && !isCollapsed && (
            <div className="pt-4 mt-4 border-t border-gray-800">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
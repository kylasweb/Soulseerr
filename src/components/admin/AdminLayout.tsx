'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  Search,
  LogOut,
  Shield,
  UserCog,
  UserX,
  CreditCard,
  Package,
  Activity,
  BookOpen,
  Ticket,
  FileText,
  Folder,
  Headphones
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    current: false
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    current: false
  },
  {
    name: 'Reader Management',
    href: '/admin/readers',
    icon: UserCheck,
    current: false
  },
  {
    name: 'Financial Management',
    href: '/admin/finance',
    icon: DollarSign,
    current: false
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    current: false
  },
  {
    name: 'Content Management',
    href: '/admin/content',
    icon: FileText,
    current: false
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
    current: false
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrentPath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentCurrent = (item: any) => {
    if (item.href) return isCurrentPath(item.href);
    if (item.children) {
      return item.children.some((child: any) => isCurrentPath(child.href));
    }
    return false;
  };

  const NavItem = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    if (item.children) {
      return (
        <div className="space-y-1">
          <div className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md',
            isParentCurrent(item)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}>
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </div>
          <div className="ml-6 space-y-1">
            {item.children.map((child: any) => (
              <Link
                key={child.name}
                href={child.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  isCurrentPath(child.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
              >
                <child.icon className="mr-3 h-3 w-3" />
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isCurrentPath(item.href)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
        onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
      >
        <item.icon className="mr-3 h-4 w-4" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">SoulSeer</div>
                <div className="text-xs text-muted-foreground">Admin Panel</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 border rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs text-muted-foreground">admin@soulseer.com</div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col gap-y-5 overflow-y-auto px-6 pb-4">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">SoulSeer</div>
                  <div className="text-xs text-muted-foreground">Admin Panel</div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} mobile />
                ))}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              {/* Search - placeholder for now */}
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="block w-full rounded-md border-0 bg-muted py-1.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
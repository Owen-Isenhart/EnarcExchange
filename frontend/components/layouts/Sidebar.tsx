/**
 * Sidebar Component - Navigation sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/helpers';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Markets',
    href: '/markets',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    label: 'Create Market',
    href: '/markets/create',
    icon: <Plus className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    label: 'Admin Dashboard',
    href: '/admin',
    icon: <BarChart3 className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isSidebarOpen, setSidebarOpen } = useUiStore();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.is_admin
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 px-4 py-6',
          'bg-surface/95 backdrop-blur border-r border-primary/20',
          'overflow-y-auto z-40 transition-all duration-300',
          'transition-transform duration-300 md:translate-x-0',
          !isSidebarOpen && '-translate-x-full md:translate-x-0'
        )}
      >
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white font-medium'
                    : 'text-secondary hover:text-primary hover:bg-primary/10'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

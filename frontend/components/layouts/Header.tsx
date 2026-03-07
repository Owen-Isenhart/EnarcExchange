/**
 * Header Component - Top navigation bar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toggleSidebar, isSidebarOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[#00FF41]"
        >
          <div className="h-8 w-8 rounded-lg bg-[#00FF41] flex items-center justify-center text-[#050505] font-black">
            E
          </div>
          <span className="hidden sm:inline">EnarcExchange</span>
        </Link>

        {/* Center Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/markets"
              className="text-white/70 hover:text-white transition-colors"
            >
              Markets
            </Link>
            <Link
              href="/bets"
              className="text-white/70 hover:text-white transition-colors"
            >
              My Bets
            </Link>
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href={`/profile/${user?.username}`}>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.username}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

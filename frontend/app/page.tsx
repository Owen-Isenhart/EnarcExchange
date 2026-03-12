/**
 * Home Page - Landing page with animated sphere network background
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { NetworkSphereComponent } from '@/components/NetworkSphere';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrendingUp } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Updated Background Container: 
          Now covers 'inset-0' and 'w-full' to span the entire main area
      */}
      <div className="absolute inset-0 w-full pointer-events-none z-0">
        <NetworkSphereComponent />
        {/* Removed the previous gradient overlay that faded out the left side */}
      </div>

      {/* Content overlay */}
      <div className="container-max relative z-20 flex items-center w-full h-full min-h-[calc(100vh-4rem)]">
        <div className="max-w-xl lg:max-w-2xl w-full">
          {/* Glassmorphic card */}
          <div className="glass-dark p-8 md:p-12 rounded-2xl space-y-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 z-0 pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter">
                UTD's Very Own <span style={{ color: 'hsl(var(--color-primary))' }}>Prediction Market</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-lg">
                Trade on anything UTD related using our prediction market platform. Think that the average grade of linear algebra this semester will be an A? Bet on it!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
              {isAuthenticated ? (
                <>
                  <Link href="/markets">
                    <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Explore Markets
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto glass hover:bg-surface-secondary/50 border-white/10">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
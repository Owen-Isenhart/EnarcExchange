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
      {/* Animated sphere network background (positioned to the right) */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-2/3 pointer-events-none z-0">
        <NetworkSphereComponent />
        {/* Gradient fade to seamlessly blend the sphere into the background */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
      </div>

      {/* Content overlay - split layout */}
      <div className="container-max relative z-20 flex items-center w-full h-full min-h-[calc(100vh-4rem)]">
        <div className="max-w-xl lg:max-w-2xl w-full">
          {/* Glassmorphic container to improve readability */}
          <div className="glass-dark p-8 md:p-12 rounded-2xl space-y-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Subtle inner glow for the glass card */}
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 z-0 pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter">
                Predict the
                <span className="gradient-text block mt-2"> Future</span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-lg">
                Trade on real-world outcomes using our advanced prediction market platform powered by LMSR technology
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

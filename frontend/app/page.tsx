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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Animated sphere network background */}
      <NetworkSphereComponent />

      {/* Content overlay - centered */}
      <section className="relative z-10 flex items-center justify-center w-full px-4">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Predict the
              <span className="gradient-text"> Future</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed">
              Trade on real-world outcomes using our advanced prediction market platform powered by LMSR technology
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <>
                <Link href="/markets">
                  <Button size="lg">
                    <TrendingUp className="h-5 w-5" />
                    Explore Markets
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

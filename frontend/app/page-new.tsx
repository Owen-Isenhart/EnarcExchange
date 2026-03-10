/**
 * Home Page - Landing page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="section flex-1 flex items-center">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Predict the
                <span className="gradient-text"> Future</span>
              </h1>
              <p className="text-xl text-white/70">
                Trade on real-world outcomes using our advanced prediction market platform powered by LMSR technology
              </p>
              <div className="flex gap-4">
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

            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-[#154734]/20 to-[#e87500]/20 border border-surface-light flex-center glow">
                <BarChart3 className="h-24 w-24 text-[#154734]/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-surface-secondary">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-center mb-12">Why EnarcExchange?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="glass p-8 rounded-lg space-y-4 hover:bg-surface-secondary transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-[#154734]/20 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="section">
          <div className="container-max">
            <div className="glass-dark p-12 rounded-lg text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to start trading?</h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Join thousands of predictors making informed decisions on real-world events
              </p>
              <Link href="/signup">
                <Button size="lg">
                  <Zap className="h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const features = [
  {
    icon: <TrendingUp className="h-6 w-6 text-[#154734]" />,
    title: 'Real-Time Markets',
    description: 'Trade on hundreds of live prediction markets with real-time pricing',
  },
  {
    icon: <Zap className="h-6 w-6 text-[#e87500]" />,
    title: 'Automated Pricing',
    description: 'Dynamic LMSR-powered pricing ensures optimal liquidity and fair odds',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-blue-400" />,
    title: 'Track Portfolio',
    description: 'Monitor positions, P&L, and detailed statistics across all markets',
  },
];

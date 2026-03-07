/**
 * Dashboard Page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserPositions, useUserStats } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, formatPrice } from '@/utils/formatting';
import { Wallet, TrendingUp, Target, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { positions, isLoading: positionsLoading } = useUserPositions(user?.id);
  const { stats, isLoading: statsLoading } = useUserStats(user?.id || 0);

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-white/70">Please login to view your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section container-max space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.username}!</h1>
        <p className="text-white/70">Track your portfolio and recent market activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-responsive-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Account Balance</span>
              </div>
              <p className="text-2xl font-bold mono">
                {formatCurrency(user.token_balance)}
              </p>
            </div>
          </CardContent>
        </Card>

        {statsLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : stats ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Total Won</span>
                  </div>
                  <p className="text-2xl font-bold mono text-[#00FF41]">
                    {formatCurrency(stats.total_won)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Win Rate</span>
                  </div>
                  <p className="text-2xl font-bold mono">
                    {stats.total_bets > 0
                      ? formatPercent((stats.wins / stats.total_bets) * 100)
                      : '0%'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">ROI</span>
                  </div>
                  <p className={`text-2xl font-bold mono ${stats.roi >= 0 ? 'text-[#00FF41]' : 'text-[#FF8C00]'}`}>
                    {formatPercent(stats.roi)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Open Positions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
        {positionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((position) => (
              <Card key={position.outcome_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{position.market_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">{position.outcome_description}</span>
                    <Badge variant="info">
                      {position.shares} shares
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/50">Current Price</p>
                      <p className="mono font-bold text-[#00FF41]">
                        {formatPrice(position.current_price)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Position Value</p>
                      <p className="mono font-bold">
                        {formatCurrency(position.value)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center space-y-4 py-8">
                <p className="text-white/70">No open positions yet</p>
                <Link href="/markets">
                  <button className="text-[#00FF41] hover:text-[#00ff41]/80 transition-colors">
                    Explore Markets →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard Page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserPositions, useUserStats } from '@/hooks/useUser';
import { useUserBets } from '@/hooks/useBets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, formatPrice, formatDate } from '@/utils/formatting';
import { Wallet, TrendingUp, Target, Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { positions, isLoading: positionsLoading } = useUserPositions(user?.id);
  const { stats, isLoading: statsLoading } = useUserStats(user?.id || 0);
  const { bets, isLoading: betsLoading } = useUserBets(user?.id || 0);

  // Calculate bet status based on is_settled and payout_amount
  const getBetStatus = (bet: any) => {
    if (!bet.is_settled) return 'open';
    if (bet.payout_amount > 0) return 'won';
    return 'lost';
  };

  const betsArray = Array.isArray(bets) ? bets : [];
  const openBets = betsArray.filter((b: any) => getBetStatus(b) === 'open');

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">Please login to view your dashboard</p>
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
        <p className="text-secondary">Track your portfolio and recent market activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-responsive-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Account Balance</span>
              </div>
              <p className="text-2xl font-bold mono text-primary">
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
                  <div className="flex items-center gap-2 text-secondary">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Total Won</span>
                  </div>
                  <p className="text-2xl font-bold mono text-success">
                    {formatCurrency(stats.total_won)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Win Rate</span>
                  </div>
                  <p className="text-2xl font-bold mono text-primary">
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
                  <div className="flex items-center gap-2 text-secondary">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">ROI</span>
                  </div>
                  <p className="text-2xl font-bold mono"
                    style={{ color: 'hsl(var(--color-secondary))' }}>
                    {formatPercent(stats.roi)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>      

      {/* Open Bets */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
        {betsLoading ? (
          <CardSkeleton />
        ) : openBets.length > 0 ? (
          <Card className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-primary/5 border-b border-primary/20 text-xs font-semibold text-secondary">
              <div className="col-span-2">RESULT</div>
              <div className="col-span-5">MARKET</div>
              <div className="col-span-2 text-right">TOTAL TRADED</div>
              <div className="col-span-3 text-right">AMOUNT WON</div>
            </div>

            {/* Table Rows */}
            {openBets.map((bet: any) => {
              const status = getBetStatus(bet);
              const pnl = (bet.payout_amount || 0) - (bet.amount || 0);
              const isWon = status === 'won';
              const isLost = status === 'lost';
              const isOpen = status === 'open';

              return (
                <div key={bet.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-primary/10 items-center hover:bg-primary/5 transition-colors">
                  {/* Result Status */}
                  <div className="col-span-2 flex items-center gap-2">
                    {isWon && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {isLost && <XCircle className="h-5 w-5 text-error" />}
                    {isOpen && <Clock className="h-5 w-5 text-secondary" />}
                    <span className="text-sm font-semibold capitalize">
                      {status}
                    </span>
                  </div>

                  {/* Market Info */}
                  <div className="col-span-5">
                    <p className="font-semibold text-sm text-primary">{bet.outcome_description}</p>
                    <p className="text-xs text-secondary">{bet.market_name}</p>
                  </div>

                  {/* Total Traded */}
                  <div className="col-span-2 text-right">
                    <p className="font-semibold mono text-sm text-primary">{formatCurrency(bet.amount)}</p>
                  </div>

                  {/* Amount Won */}
                  <div className="col-span-3 text-right">
                    {isOpen ? (
                      <p className="text-sm text-secondary">-</p>
                    ) : (
                      <>
                        <p className={`font-semibold mono text-sm ${
                          isWon ? 'text-success' : isLost ? 'text-error' : 'text-secondary'
                        }`}>
                          {isWon ? '+' : ''}{formatCurrency(pnl)}
                        </p>
                        <p className={`text-xs ${
                          isWon ? 'text-success/70' : 'text-error/70'
                        }`}>
                          ({isWon ? '+' : ''}{((pnl / bet.amount) * 100).toFixed(2)}%)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center space-y-4 py-8">
                <p className="text-secondary">No open positions yet</p>
                <Link href="/markets">
                  <button className="text-primary hover:text-primary/80 transition-colors">
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

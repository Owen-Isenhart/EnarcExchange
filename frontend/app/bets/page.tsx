/**
 * My Bets Page
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUserBets } from '@/hooks/useBets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { TrendingUp } from 'lucide-react';

export default function BetsPage() {
  const { user } = useAuth();
  const { bets, isLoading } = useUserBets(user?.id || 0);

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-white/70">Please login to view your bets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const betsArray = Array.isArray(bets) ? bets : [];
  
  // Calculate bet status based on is_settled and payout_amount
  const getBetStatus = (bet: any) => {
    if (!bet.is_settled) return 'open';
    if (bet.payout_amount > 0) return 'won';
    return 'lost';
  };
  
  const openBets = betsArray.filter((b: any) => getBetStatus(b) === 'open').length;
  const wonBets = betsArray.filter((b: any) => getBetStatus(b) === 'won').length;
  const lostBets = betsArray.filter((b: any) => getBetStatus(b) === 'lost').length;

  return (
    <div className="section container-max space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">My Bets</h1>
        <p className="text-white/70">
          {betsArray.length} total bets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-white/50 mb-2">Open</p>
            <p className="text-2xl font-bold mono text-[#00FF41]">{openBets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-white/50 mb-2">Won</p>
            <p className="text-2xl font-bold mono text-green-400">{wonBets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-white/50 mb-2">Lost</p>
            <p className="text-2xl font-bold mono text-red-400">{lostBets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bets List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Bet History</h2>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : betsArray.length > 0 ? (
          <div className="space-y-3">
            {betsArray.map((bet: any) => (
              <Card key={bet.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{bet.outcome_description}</h3>
                      <p className="text-sm text-white/70 mt-1">
                        Market: {bet.market_name}
                      </p>
                      <p className="text-xs text-white/50 mt-2">
                        {formatDate(bet.created_at)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Amount</p>
                        <p className="font-bold mono">{formatCurrency(bet.amount)}</p>
                      </div>
                      <Badge
                        variant={
                          getBetStatus(bet) === 'won'
                            ? 'success'
                            : getBetStatus(bet) === 'lost'
                              ? 'error'
                              : 'default'
                        }
                      >
                        {getBetStatus(bet)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-center text-white/70 py-8">No bets yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
import { TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function BetsPage() {
  const { user } = useAuth();
  const { bets, isLoading } = useUserBets(user?.id || 0);

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">Please login to view your bets</p>
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
        <p className="text-secondary">
          {betsArray.length} total bets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted mb-2">Open</p>
            <p className="text-2xl font-bold mono text-text-primary">{openBets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted mb-2">Won</p>
            <p className="text-2xl font-bold mono text-green-400">{wonBets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted mb-2">Lost</p>
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
          <Card className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-secondary border-b border-surface-light text-xs font-semibold text-secondary">
              <div className="col-span-2">RESULT</div>
              <div className="col-span-5">MARKET</div>
              <div className="col-span-2 text-right">TOTAL TRADED</div>
              <div className="col-span-3 text-right">AMOUNT WON</div>
            </div>

            {/* Table Rows */}
            {betsArray.map((bet: any) => {
              const status = getBetStatus(bet);
              const pnl = (bet.payout_amount || 0) - (bet.amount || 0);
              const isWon = status === 'won';
              const isLost = status === 'lost';
              const isOpen = status === 'open';

              return (
                <div key={bet.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface-light items-center hover:bg-surface-secondary transition-colors">
                  {/* Result Status */}
                  <div className="col-span-2 flex items-center gap-2">
                    {isWon && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {isLost && <XCircle className="h-5 w-5 text-red-400" />}
                    {isOpen && <Clock className="h-5 w-5 text-secondary" />}
                    <span className="text-sm font-semibold capitalize">
                      {status}
                    </span>
                  </div>

                  {/* Market Info */}
                  <div className="col-span-5">
                    <p className="font-semibold text-sm">{bet.outcome_description}</p>
                    <p className="text-xs text-secondary">{bet.market_name}</p>
                  </div>

                  {/* Total Traded */}
                  <div className="col-span-2 text-right">
                    <p className="font-semibold mono text-sm">{formatCurrency(bet.amount)}</p>
                  </div>

                  {/* Amount Won */}
                  <div className="col-span-3 text-right">
                    {isOpen ? (
                      <p className="text-sm text-secondary">-</p>
                    ) : (
                      <>
                        <p className={`font-semibold mono text-sm ${
                          isWon ? 'text-green-400' : isLost ? 'text-red-400' : 'text-secondary'
                        }`}>
                          {isWon ? '+' : ''}{formatCurrency(pnl)}
                        </p>
                        <p className={`text-xs ${
                          isWon ? 'text-green-400/70' : 'text-red-400/70'
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
              <p className="text-center text-secondary py-8">No bets yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

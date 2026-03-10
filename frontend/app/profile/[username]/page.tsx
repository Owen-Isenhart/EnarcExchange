/**
 * User Profile Page
 */

'use client';

import { useParams } from 'next/navigation';
import { useUserByUsername } from '@/hooks/useUser';
import { useUserBets } from '@/hooks/useBets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Wallet, TrendingUp, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  if (!username) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">Invalid username</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, isLoading: userLoading } = useUserByUsername(username);
  const { bets, isLoading: betsLoading } = useUserBets(user?.id);

  if (userLoading) {
    return (
      <div className="section container-max">
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section container-max space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">{user.username}</h1>
                {user.is_admin && (
                  <Badge variant="success" className="mt-2">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-secondary">{user.email}</p>
              <div className="flex items-center gap-2 text-secondary">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-surface-secondary rounded-lg">
                <p className="text-xs text-muted mb-2">Token Balance</p>
                <p className="text-2xl font-bold mono text-accent-primary">
                  {formatCurrency(user.token_balance)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bets */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Bets ({Array.isArray(bets) ? bets.length : 0})</h2>
        </div>

        {betsLoading ? (
          <CardSkeleton />
        ) : Array.isArray(bets) && bets.length > 0 ? (
          <Card className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-secondary border-b border-surface-light text-xs font-semibold text-secondary">
              <div className="col-span-2">RESULT</div>
              <div className="col-span-5">MARKET</div>
              <div className="col-span-2 text-right">TOTAL TRADED</div>
              <div className="col-span-3 text-right">AMOUNT WON</div>
            </div>

            {/* Table Rows */}
            {bets.map((bet: any) => {
              const getBetStatus = (b: any) => {
                if (!b.is_settled) return 'open';
                if (b.payout_amount > 0) return 'won';
                return 'lost';
              };

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

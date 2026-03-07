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
import { Wallet, TrendingUp, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  if (!username) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-white/70">Invalid username</p>
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
            <p className="text-center text-white/70">User not found</p>
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
              <p className="text-white/70">{user.email}</p>
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-xs text-white/50 mb-2">Token Balance</p>
                <p className="text-2xl font-bold mono text-[#00FF41]">
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
          <div className="space-y-3">
            {bets.map((bet: any) => {
              const getBetStatus = (b: any) => {
                if (!b.is_settled) return 'open';
                if (b.payout_amount > 0) return 'won';
                return 'lost';
              };
              return (
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
              );
            })}
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

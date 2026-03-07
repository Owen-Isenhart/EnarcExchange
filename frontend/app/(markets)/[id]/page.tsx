/**
 * Market Detail Page
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMarket, useMarketPrices } from '@/hooks/useMarkets';
import { usePlaceBet } from '@/hooks/useBets';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatPrice, formatCurrency } from '@/utils/formatting';
import { Calendar } from 'lucide-react';

export default function MarketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const marketId = id ? parseInt(id, 10) : NaN;

  // Show error if ID is invalid
  if (!id || isNaN(marketId)) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-white/70">Invalid market ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user } = useAuth();
  const { market, isLoading: marketLoading } = useMarket(marketId);
  const { prices } = useMarketPrices(marketId);
  const placeBet = usePlaceBet();
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState('');

  if (marketLoading) {
    return (
      <div className="section container-max">
        <CardSkeleton />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-white/70">Market not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount) return;

    placeBet.mutate(
      {
        outcome_id: selectedOutcome,
        amount: parseFloat(betAmount),
      },
      {
        onSuccess: () => {
          setSelectedOutcome(null);
          setBetAmount('');
        },
      }
    );
  };

  // Mock outcomes data - in real app, would come from API
  const mockOutcomes = [
    { id: 1, description: 'Yes' },
    { id: 2, description: 'No' },
  ];

  return (
    <div className="section container-max space-y-8">
      {/* Market Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{market.name}</CardTitle>
              <p className="text-white/70">{market.description}</p>
            </div>
            <Badge variant={market.status === 'open' ? 'success' : 'warning'}>
              {market.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/50 mb-1">Created By</p>
              <p className="font-semibold">{market.created_by_username}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">Created</p>
              <p className="font-semibold">{formatDate(market.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">Liquidity Param</p>
              <p className="font-semibold">{market.liquidity_parameter}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">Status</p>
              <Badge variant={market.status === 'open' ? 'success' : 'warning'}>
                {market.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcomes and Betting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Outcomes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Outcomes</h2>
          {mockOutcomes.map((outcome) => {
            const price = prices.find((p: any) => p.outcome_id === outcome.id);
            const isSelected = selectedOutcome === outcome.id;

            return (
              <Card
                key={outcome.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-[#00FF41] bg-[#00FF41]/5' : ''
                }`}
                onClick={() => setSelectedOutcome(outcome.id)}
              >
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{outcome.description}</h3>
                    {price && (
                      <p className="text-white/70 text-sm mt-1">
                        Current odds: <span className="mono font-bold text-[#00FF41]">{formatPrice(price.price)}%</span>
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${
                      isSelected
                        ? 'border-[#00FF41] bg-[#00FF41]/20'
                        : 'border-white/20'
                    }`}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bet Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Place Bet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <p className="text-center text-white/70">Please login to place bets</p>
              ) : market.status !== 'open' ? (
                <p className="text-center text-[#FF8C00]">Market is not open for betting</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-white/70 mb-2">
                      Balance: <span className="mono font-bold">{formatCurrency(user.token_balance)}</span>
                    </p>
                  </div>

                  <Input
                    type="number"
                    placeholder="Bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="0"
                    step="1"
                    disabled={!selectedOutcome}
                  />

                  {selectedOutcome && betAmount && (
                    <div className="space-y-2 p-3 bg-white/5 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Bet Amount</span>
                        <span className="mono font-bold">{formatCurrency(parseFloat(betAmount))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Est. Shares</span>
                        <span className="mono font-bold text-[#00FF41]">
                          ~{(parseFloat(betAmount) * 0.5).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={!selectedOutcome || !betAmount}
                    isLoading={placeBet.isPending}
                    onClick={handlePlaceBet}
                  >
                    Place Bet
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

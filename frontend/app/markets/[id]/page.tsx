/**
 * Market Detail Page
 */

'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useMarket, useMarketPrices, useMarketQuote, useMarketOutcomes } from '@/hooks/useMarkets';
import { useOutcomePriceHistories } from '@/hooks/usePrices';
import { useMarketSocket } from '@/hooks/useMarketSocket';
import { usePlaceBet } from '@/hooks/useBets';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { MultiOutcomePriceChart } from '@/components/MultiOutcomePriceChart';
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
            <p className="text-center text-secondary">Invalid market ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user } = useAuth();
  const { market, isLoading: marketLoading } = useMarket(marketId);
  const { prices } = useMarketPrices(marketId);
  const { outcomes } = useMarketOutcomes(marketId);
  const placeBet = usePlaceBet();
  const { isConnected } = useMarketSocket(marketId);
  
  // Fetch price histories for all outcomes in parallel
  const outcomeIds = useMemo(() => outcomes.map((o) => o.id), [outcomes]);
  const { histories, isLoading: historiesLoading } = useOutcomePriceHistories(outcomeIds);
  
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState('');
  
  // Use quote hook for real estimated shares
  const betAmountNum = betAmount ? parseFloat(betAmount) : null;
  const { quote, isLoading: quoteLoading } = useMarketQuote(marketId, selectedOutcome, betAmountNum);

  // Combine outcomes with their price histories
  const outcomeChartDataWithPrices = useMemo(() => {
    return outcomes.map((outcome, idx) => ({
      id: outcome.id,
      description: outcome.description,
      prices: histories[idx] || [],
    }));
  }, [outcomes, histories]);

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
            <p className="text-center text-secondary">Market not found</p>
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

  return (
    <div className="section container-max space-y-8">
      {/* WebSocket Connection Status */}
      {!isConnected && (
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-600/50 text-yellow-200 text-sm">
          ⚠️ Real-time connection unavailable. Using polling (updates every 30s).
        </div>
      )}

      {/* Market Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{market.name}</CardTitle>
              <p className="text-secondary">{market.description}</p>
            </div>
            <Badge variant={market.status === 'open' ? 'success' : 'warning'}>
              {market.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 border-t border-surface-light">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">Created By</p>
              <p className="font-semibold">{market.created_by_username}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Created</p>
              <p className="font-semibold">{formatDate(market.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Liquidity Param</p>
              <p className="font-semibold">{market.liquidity_parameter}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Status</p>
              <Badge variant={market.status === 'open' ? 'success' : 'warning'}>
                {market.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcomes and Betting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          {/* Multi-Outcome Price Chart */}
          <MultiOutcomePriceChart
            marketName={market.name}
            outcomes={outcomeChartDataWithPrices}
            isLoading={false}
          />
        </div>

        {/* Outcomes & Bet Panel Combined */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Place Bet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <p className="text-center text-secondary text-sm py-4">Please login to place bets</p>
              ) : market.status !== 'open' ? (
                <p className="text-center text-error text-sm py-4">Market is not open for betting</p>
              ) : (
                <>
                  {/* Outcomes Selection */}
                  <div className="space-y-3">
                    {outcomes.map((outcome) => {
                      const price = prices.find((p: any) => p.outcome_id === outcome.id);
                      const isSelected = selectedOutcome === outcome.id;

                      return (
                        <Card
                          key={outcome.id}
                          className={`cursor-pointer transition-all p-3 ${
                            isSelected ? 'border-primary bg-primary/10' : 'bg-surface/50'
                          }`}
                          onClick={() => setSelectedOutcome(outcome.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-tight">{outcome.description}</p>
                              {price && (
                                <p className="text-xs text-secondary mt-1">
                                  Odds: <span className="mono font-bold text-primary">{formatPrice(price.price)}%</span>
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/30'
                                  : 'border-primary/30'
                              }`}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-primary/20" />

                  {/* Balance */}
                  <div className="text-center">
                    <p className="text-xs text-secondary mb-1">Available Balance</p>
                    <p className="text-lg font-bold mono text-primary">{formatCurrency(user.token_balance)}</p>
                  </div>

                  {/* Bet Amount Input */}
                  <Input
                    type="number"
                    placeholder="Bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="0"
                    step="1"
                    disabled={!selectedOutcome}
                    className="text-center"
                  />

                  {/* Quote Details */}
                  {selectedOutcome && betAmount && (
                    <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary">Cost Amount</span>
                        <span className="mono font-bold text-primary">
                          {quote ? formatCurrency(quote.cost_amount) : 'Calculating...'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary">Est. Shares</span>
                        <span className="mono font-bold text-primary">
                          {quoteLoading ? '...' : quote ? `~${(quote.shares || 0).toFixed(4)}` : 'N/A'}
                        </span>
                      </div>
                      {quote && quote.current_prices && (
                        <>
                          <div className="pt-2 border-t border-primary/10">
                            <p className="text-xs text-secondary mb-2">Price Impact:</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-secondary">Current:</span>
                              <span className="mono text-primary">
                                {formatPrice(quote.current_prices.find((p: any) => p.outcome_id === selectedOutcome)?.price || 0)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-secondary">After Trade:</span>
                              <span className="mono text-secondary">
                                {formatPrice(quote.new_prices.find((p: any) => p.outcome_id === selectedOutcome)?.price || 0)}%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Place Bet Button */}
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


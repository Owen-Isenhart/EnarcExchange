/**
 * Admin Dashboard Page
 * Allows admins to manage markets, outcomes, and view platform statistics
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMarkets, useMarketOutcomes, useResolveMarket, useUpdateMarket } from '@/hooks/useMarkets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/utils/formatting';
import { AlertCircle, CheckCircle2, BarChart3, Zap, X } from 'lucide-react';
import Link from 'next/link';

interface ResolutionModalState {
  isOpen: boolean;
  marketId: number | null;
  selectedOutcomeId: number | null;
}

interface CloseModalState {
  isOpen: boolean;
  marketId: number | null;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { markets, isLoading } = useMarkets(1, 100);
  const [resolutionModal, setResolutionModal] = useState<ResolutionModalState>({
    isOpen: false,
    marketId: null,
    selectedOutcomeId: null,
  });
  const [closeModal, setCloseModal] = useState<CloseModalState>({
    isOpen: false,
    marketId: null,
  });
  const resolveMarketMutation = useResolveMarket(resolutionModal.marketId || 0);
  const closeMarketMutation = useUpdateMarket(closeModal.marketId || 0);
  const outcomeMarketId = resolutionModal.marketId || 0;
  const { outcomes } = useMarketOutcomes(outcomeMarketId);

  // Only admins can access this page
  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-secondary">Please login to access admin dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-secondary">You don't have permission to access the admin dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats from markets
  const openMarkets = markets.filter((m: any) => m.status === 'open').length;
  const closedMarkets = markets.filter((m: any) => m.status === 'closed').length;
  const resolvedMarkets = markets.filter((m: any) => m.status === 'resolved').length;

  const handleResolveClick = (marketId: number) => {
    setResolutionModal({
      isOpen: true,
      marketId,
      selectedOutcomeId: null,
    });
  };

  const handleCloseMarketClick = (marketId: number) => {
    setCloseModal({
      isOpen: true,
      marketId,
    });
  };

  const handleConfirmClose = () => {
    if (closeModal.marketId) {
      closeMarketMutation.mutate(
        { status: 'closed' },
        {
          onSuccess: () => {
            setCloseModal({
              isOpen: false,
              marketId: null,
            });
          },
        }
      );
    }
  };

  const handleConfirmResolution = () => {
    if (resolutionModal.selectedOutcomeId && resolutionModal.marketId) {
      resolveMarketMutation.mutate(
        { winning_outcome_id: resolutionModal.selectedOutcomeId },
        {
          onSuccess: () => {
            setResolutionModal({
              isOpen: false,
              marketId: null,
              selectedOutcomeId: null,
            });
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    setResolutionModal({
      isOpen: false,
      marketId: null,
      selectedOutcomeId: null,
    });
  };

  const handleCloseCloseModal = () => {
    setCloseModal({
      isOpen: false,
      marketId: null,
    });
  };

  const selectedMarket = markets.find((m: any) => m.id === resolutionModal.marketId);
  const closeMarketSelected = markets.find((m: any) => m.id === closeModal.marketId);

  return (
    <div className="section container-max space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-secondary">Manage markets and platform operations</p>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Total Markets</span>
              </div>
              <p className="text-2xl font-bold mono">{markets.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Open Markets</span>
              </div>
              <p className="text-2xl font-bold mono text-accent-primary">{openMarkets}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Closed Markets</span>
              </div>
              <p className="text-2xl font-bold mono text-[#e87500]">{closedMarkets}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Resolved Markets</span>
              </div>
              <p className="text-2xl font-bold mono text-[#5fe0b7]">{resolvedMarkets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Markets Management</h2>
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-secondary">Loading markets...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {markets.map((market: any) => (
              <Card
                key={market.id}
                className="hover:shadow-lg hover:shadow-[#154734]/20 transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/markets/${market.id}`}>
                        <h3 className="font-semibold text-lg mb-1 truncate hover:text-[#154734] transition-colors cursor-pointer">
                          {market.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-secondary line-clamp-1">{market.description}</p>
                      <p className="text-xs text-muted mt-2">
                        Created by {market.created_by_username} • {formatDate(market.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          market.status === 'open'
                            ? 'success'
                            : market.status === 'closed'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {market.status}
                      </Badge>
                      {market.status === 'open' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCloseMarketClick(market.id)}
                          className="text-xs"
                        >
                          Close
                        </Button>
                      )}
                      {market.status === 'closed' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResolveClick(market.id)}
                          className="text-xs"
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/markets/create">
            <Card className="hover:shadow-lg hover:shadow-[#154734]/20 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Create Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary">Create a new prediction market</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg hover:shadow-[#154734]/20 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">View detailed market analytics and insights</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolution Modal */}
      {resolutionModal.isOpen && selectedMarket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Resolve Market</CardTitle>
              <button
                onClick={handleCloseModal}
                className="text-secondary hover:text-primary transition-colors"
                disabled={resolveMarketMutation.isPending}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Market Info */}
              <div className="p-3 bg-surface-secondary rounded-lg border border-surface-light">
                <p className="text-sm text-secondary">Market</p>
                <p className="font-semibold text-primary">{selectedMarket.name}</p>
              </div>

              {/* Outcomes Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary">Select Winning Outcome:</p>
                {outcomes.length === 0 ? (
                  <p className="text-sm text-secondary py-2">Loading outcomes...</p>
                ) : (
                  <div className="space-y-2">
                    {outcomes.map((outcome: any) => (
                      <button
                        key={outcome.id}
                        onClick={() =>
                          setResolutionModal({
                            ...resolutionModal,
                            selectedOutcomeId: outcome.id,
                          })
                        }
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                          resolutionModal.selectedOutcomeId === outcome.id
                            ? 'border-[#154734] bg-[#154734]/20'
                            : 'border-surface-light bg-surface-secondary hover:bg-surface-secondary'
                        }`}
                      >
                        <p className="font-medium text-primary">{outcome.description}</p>
                        <p className="text-xs text-muted mt-1">ID: {outcome.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {resolveMarketMutation.isError && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                  <p className="text-sm text-red-200">
                    {(resolveMarketMutation.error as any)?.message ||
                      'Failed to resolve market'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={resolveMarketMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmResolution}
                  disabled={
                    !resolutionModal.selectedOutcomeId || resolveMarketMutation.isPending
                  }
                  isLoading={resolveMarketMutation.isPending}
                  className="flex-1"
                >
                  Confirm Resolution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Close Market Modal */}
      {closeModal.isOpen && closeMarketSelected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Close Market</CardTitle>
              <button
                onClick={handleCloseCloseModal}
                className="text-secondary hover:text-primary transition-colors"
                disabled={closeMarketMutation.isPending}
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Market Info */}
              <div className="p-3 bg-surface-secondary rounded-lg border border-surface-light">
                <p className="text-sm text-secondary">Market</p>
                <p className="font-semibold text-primary">{closeMarketSelected.name}</p>
              </div>

              {/* Warning Message */}
              <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                <p className="text-sm text-warning font-medium">
                  Closing this market will prevent new bets from being placed. You'll then be able to resolve it with a winning outcome.
                </p>
              </div>

              {/* Error Message */}
              {closeMarketMutation.isError && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                  <p className="text-sm text-red-200">
                    {(closeMarketMutation.error as any)?.message ||
                      'Failed to close market'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCloseModal}
                  disabled={closeMarketMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmClose}
                  disabled={closeMarketMutation.isPending}
                  isLoading={closeMarketMutation.isPending}
                  className="flex-1"
                >
                  Close Market
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

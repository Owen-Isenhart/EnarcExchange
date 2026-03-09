/**
 * Markets Listing Page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMarkets } from '@/hooks/useMarkets';
import { useDebounce } from '@/hooks/useDebounce';
import { MarketGaugeCard } from '@/components/MarketGaugeCard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { TrendingUp } from 'lucide-react';

export default function MarketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { markets, meta, isLoading } = useMarkets(page);

  // Filter for only open markets and by search
  const openMarkets = markets.filter(
    (market: any) => market.status === 'open'
  );

  const filteredMarkets = openMarkets.filter(
    (market: any) =>
      market.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      market.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Count only open markets for the total count
  const openMarketCount = openMarkets.length;

  return (
    <div className="section container-max space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Prediction Markets</h1>
          <p className="text-secondary mt-2">
            {openMarketCount} open markets available
          </p>
        </div>
        <Link href="/markets/create">
          <Button>Create Market</Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search markets..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Markets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMarkets.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market: any) => (
              <Link key={market.id} href={`/markets/${market.id}`}>
                <Card className="p-4 h-full hover:shadow-lg hover:shadow-[#154734]/20 transition-all cursor-pointer">
                  <MarketGaugeCard market={market} />
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.canPaginate && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 text-secondary">
                Page {page}
              </div>
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="p-6">
            <div className="text-center space-y-4 py-12">
              <TrendingUp className="h-12 w-12 text-white/20 mx-auto" />
              <p className="text-secondary">No markets found</p>
              <p className="text-sm text-muted">Try adjusting your search or creating a new market</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

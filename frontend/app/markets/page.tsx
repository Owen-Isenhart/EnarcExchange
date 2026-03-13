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
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Fetch all markets at once with a large limit instead of pagination
  const { markets, isLoading } = useMarkets(1, 10000);

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
  // We need to fetch all markets to get an accurate count of open markets
  // For now, use the filtered count as the display count
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

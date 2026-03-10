/**
 * usePrices Hook - Handle price queries
 */

import { useQuery, useQueries } from '@tanstack/react-query';
import { pricesService } from '@/services';
import { QUERY_KEYS } from '@/config/api';
import type { Price } from '@/types';

export function useOutcomePriceHistory(outcomeId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: outcomeId ? QUERY_KEYS.PRICES.BY_OUTCOME(outcomeId) : ['prices', 'outcome', null],
    queryFn: () => (outcomeId ? pricesService.getPricesByOutcome(outcomeId) : Promise.resolve([])),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30,
    enabled: !!outcomeId && outcomeId > 0,
  });

  // Handle both paginated and direct array responses
  let historyData: any[] = [];
  if (Array.isArray(data)) {
    historyData = data;
  } else if (data && typeof data === 'object') {
    historyData = (data as any).data || (data as any).rows || [];
  }

  return {
    history: historyData as Price[],
    isLoading,
    error,
  };
}

export function useOutcomePriceHistories(outcomeIds: number[]) {
  const queries = useQueries({
    queries: outcomeIds.map((outcomeId) => ({
      queryKey: QUERY_KEYS.PRICES.BY_OUTCOME(outcomeId),
      queryFn: () => pricesService.getPricesByOutcome(outcomeId),
      staleTime: 1000 * 30, // 30 seconds
      refetchInterval: 1000 * 30,
      enabled: !!outcomeId && outcomeId > 0,
    })),
  });

  // Transform the results to match expected format
  const histories = queries.map((query) => {
    const data = query.data;
    let historyData: any[] = [];
    if (Array.isArray(data)) {
      historyData = data;
    } else if (data && typeof data === 'object') {
      historyData = (data as any).data || (data as any).rows || [];
    }
    return historyData as Price[];
  });

  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error;

  return {
    histories,    isLoading,
    error,
  };
}
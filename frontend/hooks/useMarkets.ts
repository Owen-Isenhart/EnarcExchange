/**
 * useMarkets Hook - Handle market queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketsService, outcomesService } from '@/services';
import { useUiStore } from '@/store/uiStore';
import { QUERY_KEYS, DEFAULT_PAGE_SIZE } from '@/config/api';
import type { CreateMarketRequest, UpdateMarketRequest } from '@/types';

export function useMarkets(page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MARKETS.LIST(page, limit),
    queryFn: () => marketsService.getMarkets(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    markets: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    hasMore: data?.meta?.canPaginate || false,
  };
}

export function useMarket(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MARKETS.DETAIL(id),
    queryFn: () => marketsService.getMarketById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    market: data,
    isLoading,
    error,
  };
}

export function useMarketPrices(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MARKETS.PRICES(id),
    queryFn: () => marketsService.getMarketPrices(id),
    staleTime: 1000 * 30, // 30 seconds - prices change frequently
    refetchInterval: 1000 * 30,
    enabled: !!id && !isNaN(id),
  });

  // Handle both direct array and object with outcomes property
  const pricesArray = Array.isArray(data) ? data : (data && typeof data === 'object' ? (data as any).outcomes || [] : []);

  return {
    prices: pricesArray,
    pricesData: data,
    isLoading,
    error,
  };
}

export function useMarketOutcomes(marketId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-outcomes', marketId],
    queryFn: () => outcomesService.getMarketOutcomes(marketId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!marketId && !isNaN(marketId),
  });

  // Handle both direct array and paginated { data: [...] } responses
  let outcomes: any[] = [];
  if (Array.isArray(data)) {
    outcomes = data;
  } else if (data && typeof data === 'object') {
    outcomes = (data as any).data || (data as any).rows || [];
  }

  return {
    outcomes,
    isLoading,
    error,
  };
}

export function useCreateMarket() {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: (data: CreateMarketRequest) => marketsService.createMarket(data),
    onSuccess: (market: any) => {
      // Invalidate markets list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MARKETS.ALL,
      });
      addNotification({
        type: 'success',
        message: 'Market created successfully!',
      });
      return market;
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to create market',
      });
    },
  });
}

export function useMarketQuote(
  marketId: number,
  outcomeId: number | null,
  amount: number | null
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-quote', marketId, outcomeId, amount],
    queryFn: () => {
      if (!outcomeId || !amount || amount <= 0) {
        return null;
      }
      return marketsService.getQuote(marketId, outcomeId, amount);
    },
    staleTime: 0, // Always fresh since user is typing
    enabled: !!marketId && !!outcomeId && !!amount && amount > 0,
  });

  return {
    quote: data,
    isLoading,
    error,
  };
}

export function useResolveMarket(id: number) {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: (data: { winning_outcome_id: number }) =>
      marketsService.resolveMarket(id, data),
    onSuccess: (market: any) => {
      queryClient.setQueryData(QUERY_KEYS.MARKETS.DETAIL(id), market);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MARKETS.ALL,
      });
      addNotification({
        type: 'success',
        message: 'Market resolved successfully!',
      });
      return market;
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to resolve market',
      });
    },
  });
}

export function useDeleteMarket(id: number) {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();

  return useMutation({
    mutationFn: () => marketsService.deleteMarket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MARKETS.ALL,
      });
      addNotification({
        type: 'success',
        message: 'Market deleted successfully!',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to delete market',
      });
    },
  });
}

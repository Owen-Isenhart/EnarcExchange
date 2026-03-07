/**
 * useBets Hook - Handle betting queries and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { betsService } from '@/services';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from './useAuth';
import { QUERY_KEYS, DEFAULT_PAGE_SIZE } from '@/config/api';
import type { CreateBetRequest, SellBetRequest } from '@/types';

export function useBets(page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.BETS.LIST(page, limit),
    queryFn: () => betsService.getBets(page, limit),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    bets: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
  };
}

export function useUserBets(userId?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: userId ? QUERY_KEYS.BETS.USER(userId) : ['bets', 'user'],
    queryFn: () => (userId ? betsService.getUserBets(userId) : Promise.resolve([])),
    staleTime: 1000 * 60,
    enabled: !!userId && userId > 0,
  });

  // Handle both paginated response and direct array
  let betsArray: any[] = [];
  if (Array.isArray(data)) {
    betsArray = data;
  } else if (data && typeof data === 'object') {
    betsArray = (data as any).data || (data as any).rows || [];
  }

  return {
    bets: betsArray,
    isLoading,
    error,
  };
}

export function useMarketBets(marketId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.BETS.MARKET(marketId),
    queryFn: () => betsService.getMarketBets(marketId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30,
    enabled: !!marketId && !isNaN(marketId),
  });

  return {
    bets: data || [],
    isLoading,
    error,
  };
}

export function usePlaceBet() {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreateBetRequest) => betsService.placeBet(data),
    onSuccess: (bet: any) => {
      // Invalidate all bet-related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BETS.ALL,
      });
      
      // Invalidate user data if we have user ID
      if (user?.id) {
        // Refetch user detail to update balance
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.CURRENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.DETAIL(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.STATS(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.USER_POSITIONS(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BETS.USER(user.id),
        });
        // Force refetch of market prices
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MARKETS.ALL,
        });
      }
      
      addNotification({
        type: 'success',
        message: 'Bet placed successfully!',
      });
      return bet;
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to place bet',
      });
    },
  });
}

export function useSellBet() {
  const queryClient = useQueryClient();
  const { addNotification } = useUiStore();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: SellBetRequest) => betsService.sellBet(data),
    onSuccess: (bet: any) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BETS.ALL,
      });
      
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.CURRENT,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.DETAIL(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.STATS(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.USERS.USER_POSITIONS(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BETS.USER(user.id),
        });
      }
      
      addNotification({
        type: 'success',
        message: 'Bet sold successfully!',
      });
      return bet;
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to sell bet',
      });
    },
  });
}

/**
 * useUser Hook - Handle user queries
 */

import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services';
import { QUERY_KEYS } from '@/config/api';

export function useUser(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.USERS.DETAIL(id),
    queryFn: () => usersService.getUserById(id),
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: data,
    isLoading,
    error,
  };
}

export function useUserByUsername(username: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.USERS.BY_USERNAME(username),
    queryFn: () => usersService.getUserByUsername(username),
    staleTime: 1000 * 60 * 5,
    enabled: !!username,
  });

  return {
    user: data,
    isLoading,
    error,
  };
}

export function useUserPositions(userId?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: userId 
      ? QUERY_KEYS.USERS.USER_POSITIONS(userId)
      : QUERY_KEYS.USERS.POSITIONS,
    queryFn: () =>
      userId ? usersService.getUserPositions(userId) : usersService.getMyPositions(),
    staleTime: 1000 * 60,
    enabled: userId !== undefined ? userId > 0 : true,
  });

  return {
    positions: data || [],
    isLoading,
    error,
  };
}

export function useUserStats(userId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.USERS.STATS(userId),
    queryFn: () => usersService.getUserStats(userId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    stats: data,
    isLoading,
    error,
  };
}

/**
 * useAuth Hook - Handle authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/store';
import { useUiStore } from '@/store/uiStore';
import { QUERY_KEYS } from '@/config/api';
import type { LoginRequest, SignupRequest } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, token, setUser, setToken, logout, isAuthenticated } =
    useAuthStore();
  const { addNotification } = useUiStore();

  // Get current user
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: QUERY_KEYS.USERS.CURRENT,
    queryFn: () => authService.getCurrentUser(),
    enabled: !!token, // Always fetch if we have a token
    staleTime: 1000 * 60, // 1 minute - shorter to catch balance updates
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response: any) => {
      setToken(response.token);
      setUser(response.user);
      queryClient.setQueryData(QUERY_KEYS.USERS.CURRENT, response.user);
      addNotification({
        type: 'success',
        message: 'Logged in successfully!',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Login failed',
      });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (response: any) => {
      setToken(response.token);
      setUser(response.user);
      queryClient.setQueryData(QUERY_KEYS.USERS.CURRENT, response.user);
      addNotification({
        type: 'success',
        message: 'Account created successfully!',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.message || 'Signup failed',
      });
    },
  });

  // Logout
  const handleLogout = () => {
    logout();
    queryClient.clear();
    addNotification({
      type: 'success',
      message: 'Logged out successfully',
    });
  };

  return {
    user: user || currentUser,
    token,
    isAuthenticated: isAuthenticated(),
    isLoading: isLoadingUser || loginMutation.isPending || signupMutation.isPending,
    error: userError || loginMutation.error || signupMutation.error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    logout: handleLogout,
    refetchUser: refetchCurrentUser,
  };
}

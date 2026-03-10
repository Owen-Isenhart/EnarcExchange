/**
 * Auth Store - Zustand store for authentication state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { User } from '@/types/models';
import { STORAGE_KEYS } from '@/config/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hydrate: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set: any, get: any) => {
    const state: AuthState = {
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user: any) => set({ user }),

      setToken: (token: any) => {
        set({ token });
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          } else {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          }
        }
      },

      setIsLoading: (isLoading: any) => set({ isLoading }),

      setError: (error: any) => set({ error }),

      logout: () => {
        set({ user: null, token: null, error: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      },

      hydrate: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

          if (token) {
            set({ token });
          }

          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ user });
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      },

      isAuthenticated: () => {
        const { token } = get();
        return !!token;
      },
    };
    return state;
  })
);

// Listen to user changes and persist to localStorage
useAuthStore.subscribe(
  (state: any) => state.user,
  (user: any) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }
  }
);

// Listen to logout events
if (typeof window !== 'undefined') {
  window.addEventListener('logout', () => {
    useAuthStore.getState().logout();
  });
}

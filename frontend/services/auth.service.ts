/**
 * Auth Service - Handle authentication
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  CurrentUserResponse,
} from '@/types/api';

export const authService = {
  /**
   * Sign up new user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data);
  },

  /**
   * Log in user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
};

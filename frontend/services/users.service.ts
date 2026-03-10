/**
 * Users Service - Handle user operations
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  User,
  Position,
  UserStats,
  UserListResponse,
} from '@/types';

export const usersService = {
  /**
   * Get all users with pagination
   */
  getUsers: async (
    page: number = 1,
    limit: number = 20
  ): Promise<UserListResponse> => {
    return apiClient.get(API_ENDPOINTS.USERS.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<User> => {
    return apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
  },

  /**
   * Get user by username
   */
  getUserByUsername: async (username: string): Promise<User> => {
    return apiClient.get(API_ENDPOINTS.USERS.BY_USERNAME(username));
  },

  /**
   * Get current user's positions
   */
  getMyPositions: async (): Promise<Position[]> => {
    return apiClient.get(API_ENDPOINTS.USERS.POSITIONS);
  },

  /**
   * Get user's positions by ID
   */
  getUserPositions: async (userId: number): Promise<Position[]> => {
    return apiClient.get(API_ENDPOINTS.USERS.USER_POSITIONS(userId));
  },

  /**
   * Get user statistics
   */
  getUserStats: async (userId: number): Promise<UserStats> => {
    return apiClient.get(API_ENDPOINTS.USERS.STATS(userId));
  },
};

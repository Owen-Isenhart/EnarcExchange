/**
 * Bets Service - Handle betting operations
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Bet,
  BetListResponse,
  CreateBetRequest,
  SellBetRequest,
} from '@/types';
import { generateId } from '@/utils/helpers';

export const betsService = {
  /**
   * Get all bets with pagination
   */
  getBets: async (page: number = 1, limit: number = 20): Promise<BetListResponse> => {
    return apiClient.get(API_ENDPOINTS.BETS.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get bet by ID
   */
  getBetById: async (id: number): Promise<Bet> => {
    return apiClient.get(API_ENDPOINTS.BETS.DETAIL(id));
  },

  /**
   * Get bets for a specific user
   */
  getUserBets: async (userId: number): Promise<Bet[]> => {
    return apiClient.get(API_ENDPOINTS.BETS.USER_BETS(userId));
  },

  /**
   * Get bets on a specific market
   */
  getMarketBets: async (marketId: number): Promise<Bet[]> => {
    return apiClient.get(API_ENDPOINTS.BETS.MARKET_BETS(marketId));
  },

  /**
   * Place a new bet with idempotency
   */
  placeBet: async (data: CreateBetRequest): Promise<Bet> => {
    const idempotencyKey = generateId();
    return apiClient.post(API_ENDPOINTS.BETS.CREATE, data, {
      headers: {
        'x-idempotency-key': idempotencyKey,
      },
    });
  },

  /**
   * Sell/close a bet position
   */
  sellBet: async (data: SellBetRequest): Promise<Bet> => {
    const idempotencyKey = generateId();
    return apiClient.post(API_ENDPOINTS.BETS.SELL, data, {
      headers: {
        'x-idempotency-key': idempotencyKey,
      },
    });
  },
};

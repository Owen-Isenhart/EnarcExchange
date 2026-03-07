/**
 * Markets Service - Handle market operations
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Market,
  MarketOutcome,
  Price,
  MarketListResponse,
  CreateMarketRequest,
  UpdateMarketRequest,
  ResolveMarketRequest,
  SeedMarketRequest,
  QuoteResponse,
} from '@/types';

export const marketsService = {
  /**
   * Get all markets with pagination
   */
  getMarkets: async (
    page: number = 1,
    limit: number = 20
  ): Promise<MarketListResponse> => {
    return apiClient.get(API_ENDPOINTS.MARKETS.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get market by ID
   */
  getMarketById: async (id: number): Promise<Market> => {
    return apiClient.get(API_ENDPOINTS.MARKETS.DETAIL(id));
  },

  /**
   * Create new market (admin only)
   */
  createMarket: async (data: CreateMarketRequest): Promise<Market> => {
    return apiClient.post(API_ENDPOINTS.MARKETS.CREATE, data);
  },

  /**
   * Update market (admin only)
   */
  updateMarket: async (
    id: number,
    data: UpdateMarketRequest
  ): Promise<Market> => {
    return apiClient.put(API_ENDPOINTS.MARKETS.UPDATE(id), data);
  },

  /**
   * Delete market (admin only)
   */
  deleteMarket: async (id: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.MARKETS.DELETE(id));
  },

  /**
   * Get market prices
   */
  getMarketPrices: async (id: number): Promise<Price[]> => {
    return apiClient.get(API_ENDPOINTS.MARKETS.PRICES(id));
  },

  /**
   * Get price quote for betting
   */
  getQuote: async (
    marketId: number,
    outcomeId: number,
    amount: number
  ): Promise<QuoteResponse> => {
    return apiClient.get(API_ENDPOINTS.MARKETS.QUOTE(marketId), {
      params: { outcome_id: outcomeId, amount },
    });
  },

  /**
   * Resolve market (admin only)
   */
  resolveMarket: async (
    id: number,
    data: ResolveMarketRequest
  ): Promise<Market> => {
    return apiClient.post(API_ENDPOINTS.MARKETS.RESOLVE(id), data);
  },

  /**
   * Seed market with initial liquidity (admin only)
   */
  seedMarket: async (
    id: number,
    data: SeedMarketRequest
  ): Promise<Market> => {
    return apiClient.post(API_ENDPOINTS.MARKETS.SEED(id), data);
  },
};

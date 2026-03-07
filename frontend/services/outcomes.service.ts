/**
 * Outcomes Service - Handle market outcomes
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  MarketOutcome,
  OutcomeListResponse,
  CreateOutcomeRequest,
  UpdateOutcomeRequest,
} from '@/types';

export const outcomesService = {
  /**
   * Get all outcomes with pagination
   */
  getOutcomes: async (
    page: number = 1,
    limit: number = 20
  ): Promise<OutcomeListResponse> => {
    return apiClient.get(API_ENDPOINTS.OUTCOMES.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get outcomes for a specific market
   */
  getMarketOutcomes: async (marketId: number): Promise<MarketOutcome[]> => {
    return apiClient.get(API_ENDPOINTS.OUTCOMES.MARKET_OUTCOMES(marketId));
  },

  /**
   * Get outcome by ID
   */
  getOutcomeById: async (id: number): Promise<MarketOutcome> => {
    return apiClient.get(API_ENDPOINTS.OUTCOMES.DETAIL(id));
  },

  /**
   * Create outcome (admin only)
   */
  createOutcome: async (data: CreateOutcomeRequest): Promise<MarketOutcome> => {
    return apiClient.post(API_ENDPOINTS.OUTCOMES.CREATE, data);
  },

  /**
   * Update outcome (admin only)
   */
  updateOutcome: async (
    id: number,
    data: UpdateOutcomeRequest
  ): Promise<MarketOutcome> => {
    return apiClient.put(API_ENDPOINTS.OUTCOMES.UPDATE(id), data);
  },

  /**
   * Delete outcome (admin only)
   */
  deleteOutcome: async (id: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.OUTCOMES.DELETE(id));
  },
};

/**
 * Prices Service - Handle price data
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Price,
  PriceListResponse,
  CreatePriceRequest,
  UpdatePriceRequest,
} from '@/types';

export const pricesService = {
  /**
   * Get all prices with pagination
   */
  getPrices: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PriceListResponse> => {
    return apiClient.get(API_ENDPOINTS.PRICES.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get latest prices
   */
  getLatestPrices: async (): Promise<Price[]> => {
    return apiClient.get(API_ENDPOINTS.PRICES.LATEST);
  },

  /**
   * Get price history for an outcome
   */
  getPricesByOutcome: async (outcomeId: number): Promise<Price[]> => {
    return apiClient.get(API_ENDPOINTS.PRICES.BY_OUTCOME(outcomeId));
  },

  /**
   * Get price by ID
   */
  getPriceById: async (id: number): Promise<Price> => {
    return apiClient.get(API_ENDPOINTS.PRICES.DETAIL(id));
  },

  /**
   * Create price (admin only)
   */
  createPrice: async (data: CreatePriceRequest): Promise<Price> => {
    return apiClient.post(API_ENDPOINTS.PRICES.CREATE, data);
  },

  /**
   * Update price (admin only)
   */
  updatePrice: async (
    id: number,
    data: UpdatePriceRequest
  ): Promise<Price> => {
    return apiClient.put(API_ENDPOINTS.PRICES.UPDATE(id), data);
  },

  /**
   * Delete price (admin only)
   */
  deletePrice: async (id: number): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PRICES.DELETE(id));
  },
};

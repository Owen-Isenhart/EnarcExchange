/**
 * Transactions Service - Handle financial transactions
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Transaction,
  TransactionListResponse,
  CreateTransactionRequest,
} from '@/types';

export const transactionsService = {
  /**
   * Get all transactions with pagination
   */
  getTransactions: async (
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionListResponse> => {
    return apiClient.get(API_ENDPOINTS.TRANSACTIONS.LIST, {
      params: { page, limit },
    });
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: number): Promise<Transaction> => {
    return apiClient.get(API_ENDPOINTS.TRANSACTIONS.DETAIL(id));
  },

  /**
   * Get transactions for a specific user
   */
  getUserTransactions: async (
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionListResponse> => {
    return apiClient.get(API_ENDPOINTS.TRANSACTIONS.USER_TRANSACTIONS(userId), {
      params: { page, limit },
    });
  },

  /**
   * Create transaction (e.g., deposit, withdrawal)
   */
  createTransaction: async (
    data: CreateTransactionRequest
  ): Promise<Transaction> => {
    return apiClient.post(API_ENDPOINTS.TRANSACTIONS.CREATE, data);
  },
};

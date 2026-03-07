/**
 * API Request/Response types
 * Types for all HTTP client interactions
 */

import type {
  User,
  Market,
  MarketOutcome,
  Price,
  Bet,
  Transaction,
  Position,
  UserStats,
  QuoteResponse,
} from './models';

// ============= Pagination =============
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  canPaginate: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============= Auth =============
export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  email: string;
  token_balance: number;
  is_admin: boolean;
  created_at: string;
}

// ============= Markets =============
export interface CreateMarketRequest {
  name: string;
  description: string;
  start_time?: string;
  end_time?: string;
  liquidity_parameter?: number;
}

export interface UpdateMarketRequest {
  name?: string;
  description?: string;
  status?: 'open' | 'closed' | 'resolved';
}

export interface ResolveMarketRequest {
  winning_outcome_id: number;
}

export interface SeedMarketRequest {
  outcome_id: number;
  amount: number;
}

// ============= Outcomes =============
export interface CreateOutcomeRequest {
  market_id: number;
  description: string;
}

export interface UpdateOutcomeRequest {
  description?: string;
}

// ============= Prices =============
export interface CreatePriceRequest {
  outcome_id: number;
  price: number;
}

export interface UpdatePriceRequest {
  price: number;
}

// ============= Bets =============
export interface CreateBetRequest {
  outcome_id: number;
  amount: number;
}

export interface SellBetRequest {
  outcome_id: number;
  shares: number;
}

// ============= Transactions =============
export interface CreateTransactionRequest {
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'transfer';
  amount: number;
  description?: string;
}

// ============= AI =============
export interface GenerateMarketsRequest {
  topic?: string;
  count?: number;
}

export interface GenerateMarketsResponse {
  markets: CreateMarketRequest[];
}

export interface EnrichDescriptionRequest {
  description: string;
}

export interface EnrichDescriptionResponse {
  enriched_description: string;
}

// ============= API Responses =============
export type UserListResponse = PaginatedResponse<User>;
export type MarketListResponse = PaginatedResponse<Market>;
export type BetListResponse = PaginatedResponse<Bet>;
export type TransactionListResponse = PaginatedResponse<Transaction>;
export type OutcomeListResponse = PaginatedResponse<MarketOutcome>;
export type PriceListResponse = PaginatedResponse<Price>;

// ============= Composite Responses =============
export interface MarketDetailResponse extends Market {
  outcomes: MarketOutcome[];
  prices: Record<number, Price>;
}

export interface UserProfileResponse extends User {
  stats?: UserStats;
}

/**
 * Zod validation schemas for runtime type-checking
 * Validate all API responses and form inputs
 */

import { z } from 'zod';

// ============= Core Schemas =============
export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  token_balance: z.number(),
  is_admin: z.boolean(),
  created_at: z.string(),
});

export const MarketSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['open', 'closed', 'resolved']),
  created_by: z.number(),
  created_by_username: z.string(),
  liquidity_parameter: z.number(),
  winning_outcome_id: z.number().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  created_at: z.string(),
});

export const MarketOutcomeSchema = z.object({
  id: z.number(),
  market_id: z.number(),
  description: z.string(),
  created_at: z.string(),
});

export const PriceSchema = z.object({
  id: z.number(),
  outcome_id: z.number(),
  price: z.number().min(0).max(1),
  created_at: z.string(),
});

export const BetSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  outcome_id: z.number(),
  amount: z.number(),
  status: z.enum(['open', 'won', 'lost', 'cancelled']),
  shares: z.number().optional(),
  created_at: z.string(),
  username: z.string().optional(),
  outcome_description: z.string().optional(),
});

export const TransactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: z.enum(['deposit', 'withdrawal', 'bet', 'win', 'transfer']),
  amount: z.number(),
  description: z.string().optional(),
  created_at: z.string(),
});

export const PositionSchema = z.object({
  outcome_id: z.number(),
  outcome_description: z.string(),
  market_id: z.number(),
  market_name: z.string(),
  shares: z.number(),
  current_price: z.number(),
  value: z.number(),
  payout_if_win: z.number(),
});

export const UserStatsSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  total_bets: z.number(),
  wins: z.number(),
  losses: z.number(),
  open_bets: z.number(),
  total_wagered: z.number(),
  total_won: z.number(),
  roi: z.number(),
  created_at: z.string(),
});

// ============= Request Validation =============
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(32),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateBetSchema = z.object({
  outcome_id: z.number().int().positive(),
  amount: z.number().positive('Bet amount must be positive'),
});

export const SellBetSchema = z.object({
  outcome_id: z.number().int().positive(),
  shares: z.number().positive('Shares must be positive'),
});

export const CreateMarketSchema = z.object({
  name: z.string().min(5, 'Market name must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  liquidity_parameter: z.number().positive().optional(),
});

export const CreateOutcomeSchema = z.object({
  market_id: z.number().int().positive(),
  description: z.string().min(3, 'Description must be at least 3 characters').max(200),
});

export const ResolveMarketSchema = z.object({
  winning_outcome_id: z.number().int().positive(),
});

// ============= Response Pagination =============
export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  canPaginate: z.boolean(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    data: z.array(schema),
    meta: PaginationMetaSchema,
  });

// ============= Infer Types =============
export type SignupForm = z.infer<typeof SignupSchema>;
export type LoginForm = z.infer<typeof LoginSchema>;
export type CreateBetForm = z.infer<typeof CreateBetSchema>;
export type SellBetForm = z.infer<typeof SellBetSchema>;
export type CreateMarketForm = z.infer<typeof CreateMarketSchema>;
export type CreateOutcomeForm = z.infer<typeof CreateOutcomeSchema>;

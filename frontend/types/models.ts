/**
 * Core domain models for EnarcExchange
 * All TypeScript interfaces representing business entities
 */

export interface User {
  id: number;
  username: string;
  email: string;
  token_balance: number;
  is_admin: boolean;
  created_at: string;
}

export interface Market {
  id: number;
  name: string;
  description: string;
  status: 'open' | 'closed' | 'resolved';
  created_by: number;
  created_by_username: string;
  liquidity_parameter: number;
  winning_outcome_id: number | null;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface MarketOutcome {
  id: number;
  market_id: number;
  description: string;
  created_at: string;
}

export interface Price {
  id: number;
  outcome_id: number;
  price: number;
  created_at: string;
}

export interface Bet {
  id: number;
  user_id: number;
  outcome_id: number;
  amount: number;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  shares?: number;
  created_at: string;
  username?: string;
  outcome_description?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'transfer';
  amount: number;
  description?: string;
  created_at: string;
}

export interface Position {
  outcome_id: number;
  outcome_description: string;
  market_id: number;
  market_name: string;
  shares: number;
  current_price: number;
  value: number;
  payout_if_win: number;
}

export interface UserStats {
  user_id: number;
  username: string;
  total_bets: number;
  wins: number;
  losses: number;
  open_bets: number;
  total_wagered: number;
  total_won: number;
  roi: number;
  created_at: string;
}

export interface QuoteResponse {
  outcome_id: number;
  shares: number;
  cost_amount: number;
  current_prices: Array<{ outcome_id: number; price: number }>;
  new_prices: Array<{ outcome_id: number; price: number }>;
}

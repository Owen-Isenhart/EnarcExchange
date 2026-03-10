/**
 * API Configuration and Constants
 */

// API BASE URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    ME: '/api/auth/me',
  },

  // Markets
  MARKETS: {
    LIST: '/api/markets',
    DETAIL: (id: number) => `/api/markets/${id}`,
    CREATE: '/api/markets',
    UPDATE: (id: number) => `/api/markets/${id}`,
    DELETE: (id: number) => `/api/markets/${id}`,
    PRICES: (id: number) => `/api/markets/${id}/prices`,
    QUOTE: (id: number) => `/api/markets/${id}/quote`,
    RESOLVE: (id: number) => `/api/markets/${id}/resolve`,
    SEED: (id: number) => `/api/markets/${id}/seed`,
  },

  // Outcomes
  OUTCOMES: {
    LIST: '/api/outcomes',
    MARKET_OUTCOMES: (marketId: number) =>
      `/api/outcomes/market/${marketId}`,
    DETAIL: (id: number) => `/api/outcomes/${id}`,
    CREATE: '/api/outcomes',
    UPDATE: (id: number) => `/api/outcomes/${id}`,
    DELETE: (id: number) => `/api/outcomes/${id}`,
  },

  // Prices
  PRICES: {
    LIST: '/api/prices',
    LATEST: '/api/prices/latest',
    BY_OUTCOME: (outcomeId: number) => `/api/prices/outcome/${outcomeId}`,
    DETAIL: (id: number) => `/api/prices/${id}`,
    CREATE: '/api/prices',
    UPDATE: (id: number) => `/api/prices/${id}`,
    DELETE: (id: number) => `/api/prices/${id}`,
  },

  // Bets
  BETS: {
    LIST: '/api/bets',
    DETAIL: (id: number) => `/api/bets/${id}`,
    CREATE: '/api/bets',
    SELL: '/api/bets/sell',
    USER_BETS: (userId: number) => `/api/bets/user/${userId}`,
    MARKET_BETS: (marketId: number) => `/api/bets/market/${marketId}`,
  },

  // Users
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: number) => `/api/users/${id}`,
    BY_USERNAME: (username: string) => `/api/users/username/${username}`,
    POSITIONS: '/api/users/me/positions',
    USER_POSITIONS: (userId: number) => `/api/users/${userId}/positions`,
    STATS: (userId: number) => `/api/users/${userId}/stats`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAIL: (id: number) => `/api/transactions/${id}`,
    CREATE: '/api/transactions',
    USER_TRANSACTIONS: (userId: number) =>
      `/api/transactions/user/${userId}`,
  },

  // AI
  AI: {
    GENERATE_MARKETS: '/api/ai/markets/generate',
    SUGGEST_MARKETS: '/api/ai/markets/suggest',
    ENRICH: '/api/ai/markets/enrich',
  },
};

// Query Keys for React Query (for caching and invalidation)
export const QUERY_KEYS = {
  MARKETS: {
    ALL: ['markets'] as const,
    LIST: (page: number, limit: number) =>
      ['markets', 'list', page, limit] as const,
    DETAIL: (id: number) => ['markets', id] as const,
    PRICES: (id: number) => ['markets', id, 'prices'] as const,
    QUOTE: (id: number) => ['markets', id, 'quote'] as const,
  },
  OUTCOMES: {
    ALL: ['outcomes'] as const,
    LIST: (marketId: number) => ['outcomes', 'market', marketId] as const,
    DETAIL: (id: number) => ['outcomes', id] as const,
  },
  PRICES: {
    ALL: ['prices'] as const,
    LATEST: ['prices', 'latest'] as const,
    BY_OUTCOME: (outcomeId: number) =>
      ['prices', 'outcome', outcomeId] as const,
  },
  BETS: {
    ALL: ['bets'] as const,
    LIST: (page: number, limit: number) => ['bets', 'list', page, limit] as const,
    DETAIL: (id: number) => ['bets', id] as const,
    USER: (userId: number) => ['bets', 'user', userId] as const,
    MARKET: (marketId: number) => ['bets', 'market', marketId] as const,
  },
  USERS: {
    ALL: ['users'] as const,
    DETAIL: (id: number) => ['users', id] as const,
    BY_USERNAME: (username: string) => ['users', 'username', username] as const,
    CURRENT: ['users', 'me'] as const,
    POSITIONS: ['users', 'me', 'positions'] as const,
    USER_POSITIONS: (userId: number) =>
      ['users', userId, 'positions'] as const,
    STATS: (userId: number) => ['users', userId, 'stats'] as const,
  },
  TRANSACTIONS: {
    ALL: ['transactions'] as const,
    LIST: (page: number, limit: number) =>
      ['transactions', 'list', page, limit] as const,
    DETAIL: (id: number) => ['transactions', id] as const,
    USER: (userId: number) => ['transactions', 'user', userId] as const,
  },
};

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'enarcexchange_token',
  CURRENT_USER: 'enarcexchange_user',
  THEME: 'enarcexchange_theme',
};

// Request timeouts
export const REQUEST_TIMEOUT = 30000; // 30 seconds

export { API_BASE_URL };

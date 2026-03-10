/**
 * useMarketSocket Hook - Real-time market data via Socket.io
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/api';
import type { Price } from '@/types';

// Lazy load socket.io-client to avoid SSR issues
let io: any = null;

// Dynamic import for client-side only
if (typeof window !== 'undefined') {
  const loadSocket = async () => {
    try {
      const { io: socketIO } = await import('socket.io-client');
      io = socketIO;
    } catch (err) {
      console.warn('socket.io-client not available, real-time features disabled');
    }
  };
  loadSocket();
}

interface MarketPriceUpdate {
  market_id: number;
  prices: Record<number, number>;
}

export function useMarketSocket(marketId: number | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<any>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !marketId) {
      return;
    }

    // Wait for io to be available
    const initializeSocket = async () => {
      try {
        // Dynamically import socket.io-client
        const { io: socketIO } = await import('socket.io-client');
        
        // Connect to WebSocket if not already connected
        if (!socketRef.current) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          socketRef.current = socketIO(apiUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
          });

          // Connection event
          socketRef.current.on('connect', () => {
            console.log('[Socket.io] Connected to server');
            connectedRef.current = true;
            // Subscribe to market on connect
            if (marketId) {
              socketRef.current.emit('market:subscribe', marketId);
              console.log(`[Socket.io] Subscribed to market ${marketId}`);
            }
          });

          // Disconnection event
          socketRef.current.on('disconnect', () => {
            console.log('[Socket.io] Disconnected from server');
            connectedRef.current = false;
          });

          // Market prices update event
          socketRef.current.on('market:prices', (data: MarketPriceUpdate) => {
            console.log('[Socket.io] Received market prices update:', data);
            
            // Update React Query cache with new prices
            queryClient.setQueryData(
              QUERY_KEYS.MARKETS.PRICES(data.market_id),
              (oldData: any) => {
                if (!oldData) return oldData;

                // Update outcomes with new prices
                const outcomes = Array.isArray(oldData) ? oldData : oldData.outcomes || [];
                return {
                  ...oldData,
                  outcomes: outcomes.map((outcome: any) => ({
                    ...outcome,
                    price: data.prices[outcome.outcome_id] ?? outcome.price,
                  })),
                };
              }
            );

            // Invalidate price history queries for all outcomes
            const updatedOutcomeIds = Object.keys(data.prices).map(Number);
            updatedOutcomeIds.forEach((outcomeId) => {
              queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.PRICES.BY_OUTCOME(outcomeId),
              });
            });
          });

          // Error event
          socketRef.current.on('error', (error: any) => {
            console.error('[Socket.io] Connection error:', error);
          });
        }
      } catch (err) {
        console.warn('[Socket.io] Failed to initialize:', err);
        // Graceful degradation - app still works with polling
      }
    };

    initializeSocket();

    // Cleanup subscription on unmount
    return () => {
      if (socketRef.current && marketId) {
        socketRef.current.emit('market:unsubscribe', marketId);
        console.log(`[Socket.io] Unsubscribed from market ${marketId}`);
      }
    };
  }, [marketId, queryClient]);

  // Cleanup socket on final unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on component unmount - keep connection alive for other components
      // Only close on app shutdown
      if (typeof window === 'undefined' && socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected: connectedRef.current,
  };
}

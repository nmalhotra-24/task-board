/**
 * Custom WebSocket Hook
 * Manages WebSocket connection with automatic reconnection
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export const useWebSocket = ({ onMessage, enabled = true }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      // Generate unique client ID
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Connecting to WebSocket...');
      ws.current = new WebSocket(`${WS_URL}/ws/${clientId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setReconnectAttempt(0);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        setConnected(false);

        // Attempt to reconnect with exponential backoff
        if (enabled) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [enabled, onMessage, reconnectAttempt]);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { connected };
};

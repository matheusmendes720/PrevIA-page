'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { apiClient } from '../lib/api';

interface BackendStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      setIsChecking(true);
      try {
        // Try to fetch health endpoint directly
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        // Consider online if status is ok, healthy, or degraded (degraded means partially working)
        setIsOnline(response.ok && (data.status === 'ok' || data.status === 'healthy' || data.status === 'degraded'));
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
        if (onStatusChange) {
          onStatusChange(isOnline ?? false);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    // Check immediately
    checkBackend();

    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onStatusChange]);

  if (isChecking || isOnline === null) {
    return null; // Don't show anything while checking
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-slide-in-right">
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-300">Usando dados de exemplo</span>
            <button
              onClick={() => {
                window.open('http://localhost:5000/docs', '_blank');
              }}
              className="text-xs text-red-400 hover:text-red-300 underline ml-2"
              title="Backend offline - usando dados de exemplo. Clique para ver a documentação da API."
            >
              (Backend offline)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Don't show anything when online
};

export default BackendStatus;


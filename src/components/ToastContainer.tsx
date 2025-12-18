
'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import { ToastMessage } from '../types';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    setMounted(true);

    // This is a workaround to get toasts from the context provider without nesting
    // the container inside the provider, which would be ideal but harder with the current setup.
    const contextHolder = document.getElementById('toast-portal-context-holder');
    if (!contextHolder) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-toasts') {
          const newToasts = JSON.parse((mutation.target as HTMLElement).getAttribute('data-toasts') || '[]');
          setToasts(newToasts);
        }
      });
    });

    observer.observe(contextHolder, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleDismiss = (id: string) => {
    // Dismissal is handled by timeout in the context, this is for manual close
    // For this example, we'll just filter it visually. The context will remove it later.
    setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
  };
  
  // Don't render on server side
  if (!mounted || typeof window === 'undefined') return null;

  const portalElement = document.body;
  if (!portalElement) return null;

  return ReactDOM.createPortal(
    <div className="fixed bottom-5 right-5 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>,
    portalElement
  );
};

export default ToastContainer;

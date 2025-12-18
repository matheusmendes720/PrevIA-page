
import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, XCircleIcon, InfoIcon, ExclamationTriangleIcon } from './icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
    barClass: 'bg-green-400',
  },
  error: {
    icon: <XCircleIcon className="w-6 h-6 text-red-400" />,
    barClass: 'bg-red-400',
  },
  info: {
    icon: <InfoIcon className="w-6 h-6 text-blue-400" />,
    barClass: 'bg-blue-400',
  },
  warning: {
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />,
    barClass: 'bg-yellow-400',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const config = toastConfig[toast.type as keyof typeof toastConfig] || toastConfig.info;

  return (
    <div className="glass-card rounded-lg overflow-hidden w-full max-w-sm animate-fade-in-up animate-subtle-glow">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.barClass}`}></div>
      <div className="flex items-center p-4 pl-5">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-brand-lightest-slate">{toast.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button onClick={() => onDismiss(toast.id)} className="inline-flex text-brand-slate hover:text-brand-lightest-slate transition-colors text-2xl leading-none">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
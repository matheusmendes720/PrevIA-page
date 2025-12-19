'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  title: string;
  description?: string;
  keyPoints?: string[];
  status?: 'success' | 'warning' | 'critical' | 'info';
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  title, 
  description, 
  keyPoints = [], 
  status = 'info',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, [isVisible]);

  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-900/95 border-green-500/50';
      case 'warning':
        return 'bg-yellow-900/95 border-yellow-500/50';
      case 'critical':
        return 'bg-red-900/95 border-red-500/50';
      case 'info':
      default:
        return 'bg-brand-navy/95 border-brand-cyan/50';
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl max-w-sm ${getStatusStyles()}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <h4 className="text-sm font-bold text-brand-lightest-slate mb-2">{title}</h4>
          {description && (
            <p className="text-xs text-brand-light-slate mb-2">{description}</p>
          )}
          {keyPoints.length > 0 && (
            <ul className="list-disc list-inside text-xs text-brand-slate space-y-1">
              {keyPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Tooltip);



















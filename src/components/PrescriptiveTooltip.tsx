import React, { useState, useRef, useEffect } from 'react';
import type { PrescriptiveTooltipData } from '../types/prescriptive';
import { InfoIcon } from './icons';

interface PrescriptiveTooltipProps {
  data: PrescriptiveTooltipData;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnHover?: boolean;
  showOnClick?: boolean;
}

const PrescriptiveTooltip: React.FC<PrescriptiveTooltipProps> = ({
  data,
  children,
  position = 'top',
  showOnHover = true,
  showOnClick = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (showOnHover) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover && !isExpanded) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (showOnClick) {
      setIsVisible(!isVisible);
      setIsExpanded(!isExpanded);
    } else if (isVisible) {
      setIsExpanded(!isExpanded);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
        if (e.key === 'Escape') {
          setIsVisible(false);
          setIsExpanded(false);
        }
      }}
      aria-label="Mostrar informações prescritivas"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]} ${isExpanded ? 'w-96' : 'w-80'} bg-brand-navy border border-brand-cyan/40 rounded-lg shadow-xl p-4 animate-fade-in`}
          role="tooltip"
        >
          {!isExpanded ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold text-brand-cyan">O que significa?</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="text-brand-cyan hover:text-brand-light-cyan text-xs"
                  aria-label="Expandir tooltip"
                >
                  Ver mais
                </button>
              </div>
              <p className="text-xs text-brand-slate">{data.whatItMeans}</p>
              <div className="pt-2 border-t border-brand-cyan/20">
                <p className="text-xs font-semibold text-brand-lightest-slate">Ação recomendada:</p>
                <p className="text-xs text-brand-slate mt-1">{data.whatToDoNow}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold text-brand-cyan">Análise Prescritiva</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-brand-slate hover:text-brand-lightest-slate text-xs"
                  aria-label="Recolher tooltip"
                >
                  ✕
                </button>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">O que significa?</h5>
                <p className="text-xs text-brand-slate">{data.whatItMeans}</p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">Por que importa?</h5>
                <p className="text-xs text-brand-slate">{data.whyItMatters}</p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">O que fazer agora?</h5>
                <p className="text-xs text-brand-slate">{data.whatToDoNow}</p>
              </div>

              {data.rootCauses && data.rootCauses.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">Causas raiz:</h5>
                  <ul className="text-xs text-brand-slate list-disc list-inside space-y-1">
                    {data.rootCauses.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.recommendedActions && data.recommendedActions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">Ações recomendadas:</h5>
                  <div className="space-y-2">
                    {data.recommendedActions.map((action, idx) => (
                      <div key={idx} className="bg-brand-light-navy/50 p-2 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-brand-cyan">{action.action}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            action.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                            action.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-brand-slate">Prazo: {action.timeline}</p>
                        <p className="text-brand-slate">Benefício: {action.benefit}</p>
                        {action.roiMonths && (
                          <p className="text-brand-slate">ROI: {action.roiMonths} meses</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.dataSources && data.dataSources.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">Fontes de dados:</h5>
                  <div className="space-y-1">
                    {data.dataSources.map((source, idx) => (
                      <div key={idx} className="text-xs text-brand-slate">
                        <span className="font-semibold">{source.name}</span>
                        <span className="text-brand-cyan ml-1">({source.confidence}% confiança)</span>
                        <p className="text-xs opacity-75">{source.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.externalFactors && data.externalFactors.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-brand-lightest-slate mb-1">Fatores externos:</h5>
                  <div className="space-y-1">
                    {data.externalFactors.map((factor, idx) => (
                      <div key={idx} className="text-xs text-brand-slate">
                        <span className="font-semibold">{factor.factor}:</span> {factor.value}
                        <span className="ml-1 text-brand-cyan">{factor.change}</span>
                        <p className="opacity-75">Impacto: {factor.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptiveTooltip;


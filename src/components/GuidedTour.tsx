import React, { useState, useEffect } from 'react';
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from './icons';
import Card from './Card';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'kpi-cards',
    title: 'KPI Cards com Inteligência Prescritiva',
    content: 'Os KPIs agora incluem scores de risco, badges de ação e tooltips prescritivos. Passe o mouse sobre o ícone de informação para ver insights acionáveis.',
    target: '.kpi-card-container',
    position: 'bottom',
  },
  {
    id: 'forecast-chart',
    title: 'Gráfico de Previsão com Cenários',
    content: 'Use o seletor de cenários para comparar estratégias (Conservador, Linha Base, Agressivo). As faixas de confiança mostram a incerteza do modelo.',
    target: '.forecast-chart-container',
    position: 'top',
  },
  {
    id: 'risk-matrix',
    title: 'Matriz de Risco',
    content: 'Visualize todas as famílias de produtos por nível de risco. Clique em uma família para ver detalhes, causas raiz e ações recomendadas.',
    target: '.risk-matrix-container',
    position: 'left',
  },
  {
    id: 'action-board',
    title: 'Quadro de Ações Prescritivas',
    content: 'Acompanhe todas as ações recomendadas em um formato Kanban. Arraste cards entre colunas para atualizar o status.',
    target: '.action-board-container',
    position: 'right',
  },
];

interface GuidedTourProps {
  onComplete?: () => void;
}

/**
 * Guided tour system for introducing prescriptive features
 */
const GuidedTour: React.FC<GuidedTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed tour before
    const completed = localStorage.getItem('prescriptive-tour-completed');
    if (!completed) {
      setIsVisible(true);
    } else {
      setHasCompletedTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('prescriptive-tour-completed', 'true');
    setHasCompletedTour(true);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || hasCompletedTour) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const targetElement = document.querySelector(step.target);

  if (!targetElement) {
    return null;
  }

  const rect = targetElement.getBoundingClientRect();
  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: `${window.innerHeight - rect.top + 10}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    },
    left: {
      right: `${window.innerWidth - rect.left + 10}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: 'translateY(-50%)',
    },
    right: {
      left: `${rect.right + 10}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: 'translateY(-50%)',
    },
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleSkip} />
      
      {/* Highlight target element */}
      <div
        className="fixed z-50 border-2 border-brand-cyan rounded-lg pointer-events-none"
        style={{
          top: `${rect.top - 4}px`,
          left: `${rect.left - 4}px`,
          width: `${rect.width + 8}px`,
          height: `${rect.height + 8}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Tour Card */}
      <Card
        className="fixed z-50 w-80 p-4 shadow-2xl"
        style={positionStyles[step.position]}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-brand-lightest-slate">{step.title}</h3>
            <p className="text-xs text-brand-slate mt-1">
              Passo {currentStep + 1} de {TOUR_STEPS.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-brand-slate hover:text-brand-cyan transition-colors"
            aria-label="Fechar tour"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-brand-slate mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1 text-sm text-brand-slate hover:text-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Anterior
          </button>
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-brand-cyan' : 'bg-brand-slate/50'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-brand-cyan text-brand-navy rounded hover:bg-opacity-80 transition-colors font-semibold"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Concluir' : 'Próximo'}
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </>
  );
};

export default GuidedTour;


import React, { useEffect } from 'react';

/**
 * Accessibility enhancements for prescriptive components
 * Adds ARIA labels, keyboard navigation, and screen reader support
 */
const AccessibilityEnhancer: React.FC = () => {
  useEffect(() => {
    // Add ARIA labels to interactive elements
    const enhanceElements = () => {
      // KPI Cards
      document.querySelectorAll('.kpi-card').forEach((card, index) => {
        if (!card.getAttribute('aria-label')) {
          const title = card.querySelector('h3')?.textContent || 'KPI Card';
          card.setAttribute('aria-label', `${title} - Passe o mouse para ver insights prescritivos`);
          card.setAttribute('role', 'button');
          card.setAttribute('tabIndex', '0');
        }
      });

      // Risk Cards
      document.querySelectorAll('.risk-card').forEach((card) => {
        if (!card.getAttribute('aria-label')) {
          const title = card.querySelector('h4')?.textContent || 'Risk Card';
          card.setAttribute('aria-label', `${title} - Clique para ver detalhes do risco`);
          card.setAttribute('role', 'button');
        }
      });

      // Action Cards
      document.querySelectorAll('.action-card').forEach((card) => {
        if (!card.getAttribute('aria-label')) {
          const title = card.querySelector('h4')?.textContent || 'Action Card';
          card.setAttribute('aria-label', `${title} - Ação prescritiva recomendada`);
          card.setAttribute('role', 'article');
        }
      });

      // Tooltips
      document.querySelectorAll('[data-tooltip]').forEach((element) => {
        const tooltipText = element.getAttribute('data-tooltip');
        if (tooltipText && !element.getAttribute('aria-describedby')) {
          const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
          element.setAttribute('aria-describedby', id);
          element.setAttribute('aria-label', tooltipText);
        }
      });

      // Charts
      document.querySelectorAll('.recharts-wrapper').forEach((chart) => {
        if (!chart.getAttribute('role')) {
          chart.setAttribute('role', 'img');
          chart.setAttribute('aria-label', 'Gráfico com dados prescritivos e insights');
        }
      });
    };

    // Run on mount and after DOM updates
    enhanceElements();
    const observer = new MutationObserver(enhanceElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Keyboard navigation for modals
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        const lastModal = modals[modals.length - 1] as HTMLElement;
        if (lastModal && lastModal.style.display !== 'none') {
          const closeButton = lastModal.querySelector('[aria-label*="Fechar"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AccessibilityEnhancer;


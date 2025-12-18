/**
 * Formula Display Component
 * Renders mathematical formulas with LaTeX-style notation
 */

'use client';

import React from 'react';

interface FormulaDisplayProps {
  formula: string;
  description?: string;
  inline?: boolean;
}

export function FormulaDisplay({ formula, description, inline = false }: FormulaDisplayProps) {
  // Simple formula rendering without external libraries
  // For production, consider using KaTeX or MathJax
  
  const formatFormula = (f: string) => {
    return f
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/sqrt/g, '√')
      .replace(/sigma/g, 'σ')
      .replace(/mu/g, 'μ')
      .replace(/alpha/g, 'α')
      .replace(/beta/g, 'β')
      .replace(/gamma/g, 'γ')
      .replace(/delta/g, 'Δ')
      .replace(/rho/g, 'ρ')
      .replace(/pi/g, 'π');
  };
  
  if (inline) {
    return (
      <code className="formula-inline">
        {formatFormula(formula)}
        <style jsx>{`
          .formula-inline {
            font-family: 'Monaco', 'Menlo', monospace;
            background: rgba(32, 160, 132, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            color: var(--color-primary);
            font-size: 14px;
          }
        `}</style>
      </code>
    );
  }
  
  return (
    <div className="formula-block">
      <div className="formula-content">
        {formatFormula(formula)}
      </div>
      {description && (
        <div className="formula-description">{description}</div>
      )}
      
      <style jsx>{`
        .formula-block {
          background: var(--color-surface);
          border: 1px solid var(--color-primary);
          border-left: 4px solid var(--color-primary);
          border-radius: var(--radius-base);
          padding: 16px;
          margin: 12px 0;
        }
        
        .formula-content {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 16px;
          color: var(--color-primary);
          text-align: center;
          padding: 8px;
          background: rgba(32, 160, 132, 0.05);
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        
        .formula-description {
          margin-top: 8px;
          font-size: 13px;
          color: var(--color-text-secondary);
          text-align: center;
        }
      `}</style>
    </div>
  );
}


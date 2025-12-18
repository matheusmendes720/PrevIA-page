'use client';

import React, { Component, ReactNode } from 'react';
import Card from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-400">Algo deu errado</h2>
                <p className="text-sm text-brand-slate">Ocorreu um erro ao carregar esta página</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Detalhes do erro:</h3>
                <p className="text-xs text-red-300 font-mono mb-2">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <details className="text-xs text-brand-slate">
                    <summary className="cursor-pointer text-brand-slate hover:text-brand-lightest-slate mb-2">
                      Stack trace
                    </summary>
                    <pre className="overflow-auto p-2 bg-brand-light-navy/50 rounded text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-brand-cyan text-brand-darkest-navy rounded-lg font-medium hover:bg-brand-cyan/80 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;










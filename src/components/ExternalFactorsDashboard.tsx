import React, { useState, useEffect } from 'react';
import Card from './Card';
import ExternalFactorsBar, { ExternalFactor } from './ExternalFactorsBar';
import { externalDataService } from '../services/externalDataService';
import type { EconomicIndicator, InfrastructureData, WeatherData } from '../services/externalDataService';

const ExternalFactorsDashboard: React.FC = () => {
  const [factors, setFactors] = useState<ExternalFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await externalDataService.loadExternalData();
        
        // Combine all factors
        const allFactors: ExternalFactor[] = [
          ...data.economic.map(e => ({
            name: e.name,
            value: e.value,
            change: e.change,
            changeType: e.changeType,
            impact: e.impact,
            source: e.source,
          })),
          ...data.infrastructure.map(i => ({
            name: i.name,
            value: i.value,
            change: i.change,
            changeType: i.changeType,
            impact: i.impact,
            source: i.source,
          })),
          ...data.weather.map(w => ({
            name: w.name,
            value: w.value,
            change: w.change,
            changeType: w.changeType,
            impact: w.impact,
            source: w.source,
          })),
        ];

        setFactors(allFactors);
      } catch (error) {
        console.error('Error loading external factors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Fatores Externos</h3>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-brand-slate">Carregando fatores externos...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-2">Fatores Externos</h3>
        <p className="text-sm text-brand-slate">
          Indicadores econômicos, infraestrutura e clima que impactam a operação
        </p>
      </div>
      <ExternalFactorsBar factors={factors} />
    </Card>
  );
};

export default ExternalFactorsDashboard;


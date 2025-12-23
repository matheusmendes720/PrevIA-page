
import React, { memo, useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart } from 'recharts';
import Card from './Card';
import { ForecastDataPoint } from '../types';
import ScenarioToggle, { ScenarioType } from './ScenarioToggle';
import ExternalFactorsBar, { ExternalFactor } from './ExternalFactorsBar';
import { prescriptiveDataService } from '../services/prescriptiveDataService';
import type { ComprehensivePrescriptive } from '../types/prescriptive';

interface DemandForecastChartProps {
  data: ForecastDataPoint[];
}

interface EnhancedDataPoint extends ForecastDataPoint {
  confidence68Upper?: number;
  confidence68Lower?: number;
  confidence95Upper?: number;
  confidence95Lower?: number;
  safetyStockLevel?: number;
  reorderPoint?: number;
  riskZone?: 'HIGH' | 'MEDIUM' | 'LOW';
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = memo(({ data }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('baseline');
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensivePrescriptive | null>(null);
  const [externalFactors, setExternalFactors] = useState<ExternalFactor[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const comprehensive = await prescriptiveDataService.loadComprehensivePrescriptive();
        setComprehensiveData(comprehensive);

        // Mock external factors - in production, these would come from APIs
        setExternalFactors([
          {
            name: 'USD/BRL',
            value: '5.12',
            change: '+2.3%',
            changeType: 'increase',
            impact: '+3.8% custo de importação',
            source: 'BACEN',
          },
          {
            name: 'IPCA',
            value: '4.42%',
            change: '-0.1%',
            changeType: 'decrease',
            impact: 'Pressão de margem neutra',
            source: 'BACEN',
          },
          {
            name: 'Torres 5G Ativadas',
            value: '342',
            change: '+12%',
            changeType: 'increase',
            impact: '+8% demanda de componentes',
            source: 'ANATEL',
          },
          {
            name: 'Risco Climático',
            value: 'BAIXO',
            change: '→',
            changeType: 'neutral',
            impact: 'Padrões normais de manutenção',
            source: 'INMET',
          },
        ]);
      } catch (error) {
        console.error('Error loading prescriptive data:', error);
      }
    };

    loadData();
  }, []);

  const enhancedData: EnhancedDataPoint[] = useMemo(() => {
    if (!comprehensiveData) return data.map(d => ({ ...d }));

    return data.map((point, index) => {
      const predicted = point['Demanda Prevista'];
      const volatility = comprehensiveData.predictions.frequency?.demand_volatility || 0.1;
      const riskScore = comprehensiveData.predictions.frequency?.risk_score || 0.02;

      // Calculate confidence bands (simplified - in production, use actual model uncertainty)
      const stdDev = predicted * volatility;
      const confidence68Upper = predicted + stdDev;
      const confidence68Lower = predicted - stdDev;
      const confidence95Upper = predicted + 2 * stdDev;
      const confidence95Lower = predicted - 2 * stdDev;

      // Apply scenario multipliers
      const scenarioMultiplier = 
        selectedScenario === 'conservative' ? 0.8 :
        selectedScenario === 'aggressive' ? 1.2 : 1.0;

      const adjustedPredicted = predicted * scenarioMultiplier;
      const adjusted68Upper = confidence68Upper * scenarioMultiplier;
      const adjusted68Lower = confidence68Lower * scenarioMultiplier;
      const adjusted95Upper = confidence95Upper * scenarioMultiplier;
      const adjusted95Lower = confidence95Lower * scenarioMultiplier;

      // Determine risk zone
      let riskZone: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (riskScore > 0.65) riskZone = 'HIGH';
      else if (riskScore > 0.30) riskZone = 'MEDIUM';

      // Safety stock and reorder point (from prescriptive data)
      const safetyStock = comprehensiveData.recommendations.frequency?.safety_stock || 0;
      const reorderPoint = comprehensiveData.recommendations.frequency?.reorder_point || 0;

      return {
        ...point,
        'Demanda Prevista': adjustedPredicted,
        confidence68Upper: adjusted68Upper,
        confidence68Lower: adjusted68Lower,
        confidence95Upper: adjusted95Upper,
        confidence95Lower: adjusted95Lower,
        safetyStockLevel: safetyStock,
        reorderPoint: reorderPoint,
        riskZone,
      };
    });
  }, [data, comprehensiveData, selectedScenario]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as EnhancedDataPoint;
      return (
        <div className="bg-brand-navy border border-brand-cyan/40 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-brand-lightest-slate mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="mb-1">
              <span className="text-xs" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toFixed(1)}
              </span>
            </div>
          ))}
          {dataPoint.confidence68Upper && dataPoint.confidence68Lower && (
            <div className="mt-2 pt-2 border-t border-brand-cyan/20">
              <p className="text-xs text-brand-slate">Intervalo 68%: {dataPoint.confidence68Lower.toFixed(1)} - {dataPoint.confidence68Upper.toFixed(1)}</p>
              <p className="text-xs text-brand-slate">Intervalo 95%: {dataPoint.confidence95Lower?.toFixed(1)} - {dataPoint.confidence95Upper?.toFixed(1)}</p>
            </div>
          )}
          {dataPoint.riskZone && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                dataPoint.riskZone === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                dataPoint.riskZone === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                Risco: {dataPoint.riskZone}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Previsão de Demanda (Últimos 30 Dias)</h3>
        <ScenarioToggle selectedScenario={selectedScenario} onScenarioChange={setSelectedScenario} />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enhancedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64ffda" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#64ffda" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrevista" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="confidence95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="confidence68" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64ffda" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#64ffda" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
            <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#a8b2d1' }} />
            
            {/* Confidence bands shown in tooltip - reference lines for key thresholds */}
            {enhancedData.length > 0 && enhancedData[0].confidence95Upper && (
              <ReferenceLine
                y={enhancedData[Math.floor(enhancedData.length / 2)].confidence95Upper}
                stroke="#8884d8"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{ value: '95% Upper', position: 'right', fill: '#8884d8', fontSize: 10 }}
              />
            )}
            {enhancedData.length > 0 && enhancedData[0].confidence95Lower && (
              <ReferenceLine
                y={enhancedData[Math.floor(enhancedData.length / 2)].confidence95Lower}
                stroke="#8884d8"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{ value: '95% Lower', position: 'right', fill: '#8884d8', fontSize: 10 }}
              />
            )}

            {/* Safety Stock Reference Line */}
            {enhancedData[0]?.safetyStockLevel && enhancedData[0].safetyStockLevel > 0 && (
              <ReferenceLine
                y={enhancedData[0].safetyStockLevel}
                stroke="#fbbf24"
                strokeDasharray="5 5"
                label={{ value: 'Estoque de Segurança', position: 'right', fill: '#fbbf24' }}
              />
            )}

            {/* Reorder Point Reference Line */}
            {enhancedData[0]?.reorderPoint && enhancedData[0].reorderPoint > 0 && (
              <ReferenceLine
                y={enhancedData[0].reorderPoint}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Ponto de Recompra', position: 'right', fill: '#ef4444' }}
              />
            )}

            {/* Actual Demand */}
            <Area
              type="monotone"
              dataKey="Demanda Real"
              stroke="#64ffda"
              fillOpacity={1}
              fill="url(#colorReal)"
            />
            
            {/* Predicted Demand */}
            <Area
              type="monotone"
              dataKey="Demanda Prevista"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorPrevista)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {externalFactors.length > 0 && <ExternalFactorsBar factors={externalFactors} />}
    </Card>
  );
});

DemandForecastChart.displayName = 'DemandForecastChart';

export default DemandForecastChart;

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ScatterChart, Scatter, Line as RechartsLine } from 'recharts';
import { apiClient } from '../lib/api';

const ModelPerformanceDashboard: React.FC = () => {
  const [lossData, setLossData] = useState<Array<{epoch: number; train: number; validation: number}>>([]);
  const [residuals, setResiduals] = useState<Array<{actual: number; predicted: number}>>([]);
  const [featureImportance, setFeatureImportance] = useState<Array<{feature: string; importance: number}>>([]);
  const [modelComparison, setModelComparison] = useState<Array<{metric: string; ARIMA: number; Prophet: number; LSTM: number; Ensemble: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelPerformance = async () => {
      try {
        const response = await apiClient.getModelPerformance();
        setLossData(response.loss_curves || []);
        setResiduals(response.residuals || []);
        setFeatureImportance(response.feature_importance || []);
        setModelComparison(response.model_comparison || []);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching model performance:', err);
        const errorMessage = err.message || 'Erro ao carregar métricas de modelos';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchModelPerformance();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-brand-lightest-slate text-lg">Carregando métricas de modelos...</div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-red-400 mb-2">Erro ao carregar métricas de modelos</p>
          <p className="text-xs text-brand-slate/70">{error}</p>
        </div>
      </Card>
    );
  }

  // Check for empty data
  const hasData = lossData.length > 0 || residuals.length > 0 || 
                  featureImportance.length > 0 || modelComparison.length > 0;

  if (!hasData && !loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-brand-slate mb-2">Nenhum dado de desempenho de modelos disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se os modelos foram treinados e há dados disponíveis</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Comparison */}
      <Card>
        <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Comparação de Desempenho dos Modelos</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="metric" tick={{ fill: '#8892b0' }} stroke="#334155" />
              <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 47, 0.8)',
                  borderColor: '#64ffda',
                  color: '#ccd6f6',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#ccd6f6' }}
              />
              <Legend wrapperStyle={{ color: '#a8b2d1' }} />
              <Bar dataKey="ARIMA" fill="#8884d8" />
              <Bar dataKey="Prophet" fill="#82ca9d" />
              <Bar dataKey="LSTM" fill="#ffc658" />
              <Bar dataKey="Ensemble" fill="#64ffda" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Loss Curves */}
        <Card>
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Curvas de Perda no Treinamento (LSTM)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="epoch" tick={{ fill: '#8892b0' }} stroke="#334155" />
                <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 25, 47, 0.8)',
                    borderColor: '#64ffda',
                    color: '#ccd6f6',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: '#ccd6f6' }}
                />
                <Legend wrapperStyle={{ color: '#a8b2d1' }} />
                <Line type="monotone" dataKey="train" stroke="#64ffda" strokeWidth={2} name="Training Loss" />
                <Line type="monotone" dataKey="validation" stroke="#8884d8" strokeWidth={2} name="Validation Loss" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Feature Importance */}
        <Card>
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Importância das Features (Top 10)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={featureImportance} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis type="number" tick={{ fill: '#8892b0' }} stroke="#334155" />
                <YAxis dataKey="feature" type="category" tick={{ fill: '#8892b0' }} stroke="#334155" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 25, 47, 0.8)',
                    borderColor: '#64ffda',
                    color: '#ccd6f6',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: '#ccd6f6' }}
                />
                <Bar dataKey="importance" fill="#64ffda" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Residual Plot */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Análise de Resíduos (Real vs. Previsto)</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="actual" 
                  name="Valor Real" 
                  tick={{ fill: '#8892b0' }} 
                  stroke="#334155"
                />
                <YAxis 
                  type="number" 
                  dataKey="predicted" 
                  name="Valor Previsto" 
                  tick={{ fill: '#8892b0' }} 
                  stroke="#334155"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(10, 25, 47, 0.8)',
                    borderColor: '#64ffda',
                    color: '#ccd6f6',
                    borderRadius: '0.5rem'
                  }}
                />
                <Scatter name="Previsões" data={residuals} fill="#64ffda" />
                <RechartsLine 
                  type="linear" 
                  dataKey="actual" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Mathematical Formulas Section */}
      <Card>
        <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Key Formulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-light-navy/30 p-4 rounded-lg">
            <h4 className="text-brand-cyan font-semibold mb-2">Reorder Point (PP)</h4>
            <p className="text-brand-slate mb-2">PP = (D × LT) + SS</p>
            <p className="text-sm text-brand-light-slate">
              Where D = Daily Demand, LT = Lead Time (days), SS = Safety Stock
            </p>
          </div>
          
          <div className="bg-brand-light-navy/30 p-4 rounded-lg">
            <h4 className="text-brand-cyan font-semibold mb-2">Safety Stock</h4>
            <p className="text-brand-slate mb-2">SS = Z × σ × √LT</p>
            <p className="text-sm text-brand-light-slate">
              Where Z = Service level factor, σ = Demand std dev, LT = Lead Time
            </p>
          </div>
          
          <div className="bg-brand-light-navy/30 p-4 rounded-lg">
            <h4 className="text-brand-cyan font-semibold mb-2">MAPE</h4>
            <p className="text-brand-slate mb-2">MAPE = (1/n) Σ|Actual - Forecast|/Actual × 100%</p>
            <p className="text-sm text-brand-light-slate">
              Mean Absolute Percentage Error for forecast accuracy
            </p>
          </div>
          
          <div className="bg-brand-light-navy/30 p-4 rounded-lg">
            <h4 className="text-brand-cyan font-semibold mb-2">RMSE</h4>
            <p className="text-brand-slate mb-2">RMSE = √[(1/n) Σ(Actual - Forecast)²]</p>
            <p className="text-sm text-brand-light-slate">
              Root Mean Squared Error for model evaluation
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModelPerformanceDashboard;


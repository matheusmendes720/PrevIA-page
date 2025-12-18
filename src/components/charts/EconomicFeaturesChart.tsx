import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { EconomicFeatures, BACENIndicators } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface EconomicFeaturesChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const EconomicFeaturesChart: React.FC<EconomicFeaturesChartProps> = ({ materialId, startDate, endDate }) => {
  const [economicData, setEconomicData] = useState<EconomicFeatures[]>([]);
  const [bacenData, setBacenData] = useState<BACENIndicators[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'indicators' | 'trends' | 'impacts'>('indicators');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [economicResponse, bacenResponse] = await Promise.all([
          apiClient.getEconomicFeatures(materialId, startDate, endDate),
          apiClient.getBACENIndicators(startDate, endDate),
        ]);

        if (economicResponse.status === 'success') {
          setEconomicData(economicResponse.data);
        }
        if (Array.isArray(bacenResponse) && bacenResponse.length > 0) {
          setBacenData(bacenResponse);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados econômicos';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados econômicos', 'error');
        }
        console.error('Error fetching economic features:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materialId, startDate, endDate, addToast]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dados econômicos...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Indicadores BACEN</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Tendências</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Impactos</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar dados econômicos</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const dataToUse = bacenData.length > 0 ? bacenData : economicData;

  // Check for empty data - moved before tab rendering
  if (dataToUse.length === 0 && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button
              onClick={() => setActiveTab('indicators')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'indicators'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Indicadores BACEN
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'trends'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Tendências
            </button>
            <button
              onClick={() => setActiveTab('impacts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'impacts'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Impactos
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-brand-slate mb-2">Nenhum dado econômico disponível</p>
            <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderIndicatorsChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de indicadores disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      ipca: item.ipca || item.inflacao || 0,
      cambio: item.cambio_usd_brl || item.exchange_rate || 0,
      selic: item.selic_percent || item.selic || 0,
      pib: item.pib_variacao || item.gdp_growth || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ipca"
            stroke="#64ffda"
            strokeWidth={2}
            name="IPCA (%)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cambio"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Câmbio (R$/USD)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="selic"
            stroke="#f87171"
            strokeWidth={2}
            name="SELIC (%)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="pib"
            stroke="#a78bfa"
            fill="#a78bfa"
            fillOpacity={0.3}
            name="PIB Variação (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendsChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de tendências disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      ipca_ma3: item.ipca_ma3 || 0,
      cambio_ma7: item.cambio_ma7 || 0,
      selic_trend: item.selic_trend || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Line type="monotone" dataKey="ipca_ma3" stroke="#64ffda" strokeWidth={2} name="IPCA MA3" />
          <Line type="monotone" dataKey="cambio_ma7" stroke="#60a5fa" strokeWidth={2} name="Câmbio MA7" />
          <Line type="monotone" dataKey="selic_trend" stroke="#f87171" strokeWidth={2} name="SELIC Trend" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderImpactsChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de impactos disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      demanda_impacto: item.demanda_impacto || 0,
      custo_impacto: item.custo_impacto || 0,
      risco_economico: item.risco_economico || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Area type="monotone" dataKey="demanda_impacto" stroke="#64ffda" fill="#64ffda" fillOpacity={0.3} name="Impacto Demanda" />
          <Area type="monotone" dataKey="custo_impacto" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} name="Impacto Custo" />
          <Area type="monotone" dataKey="risco_economico" stroke="#f87171" fill="#f87171" fillOpacity={0.3} name="Risco Econômico" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
          <button
            onClick={() => setActiveTab('indicators')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'indicators'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Indicadores BACEN
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Tendências
          </button>
          <button
            onClick={() => setActiveTab('impacts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'impacts'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Impactos
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'indicators' && renderIndicatorsChart()}
          {activeTab === 'trends' && renderTrendsChart()}
          {activeTab === 'impacts' && renderImpactsChart()}
        </div>

      </div>
    </Card>
  );
};

export default EconomicFeaturesChart;


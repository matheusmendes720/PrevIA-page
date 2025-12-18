import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ComposedChart } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { FiveGFeatures, FiveGExpansion } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface FiveGExpansionChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const FiveGExpansionChart: React.FC<FiveGExpansionChartProps> = ({ materialId, startDate, endDate }) => {
  const [fiveGData, setFiveGData] = useState<FiveGFeatures[]>([]);
  const [expansionData, setExpansionData] = useState<FiveGExpansion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'coverage' | 'milestones' | 'demand'>('coverage');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fiveGResponse, expansionResponse] = await Promise.all([
          apiClient.get5GFeatures(materialId, startDate, endDate),
          apiClient.get5GExpansion(startDate, endDate),
        ]);

        if (fiveGResponse.status === 'success') {
          setFiveGData(fiveGResponse.data);
        }
        if (Array.isArray(expansionResponse) && expansionResponse.length > 0) {
          setExpansionData(expansionResponse);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de 5G';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de 5G', 'error');
        }
        console.error('Error fetching 5G features:', error);
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
          <p className="text-brand-slate">Carregando dados de 5G...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Cobertura</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Marcos</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Impacto Demanda</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar dados de 5G</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  const dataToUse = expansionData.length > 0 ? expansionData : fiveGData;

  // Check for empty data
  if (dataToUse.length === 0 && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button
              onClick={() => setActiveTab('coverage')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'coverage'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Cobertura
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'milestones'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Marcos
            </button>
            <button
              onClick={() => setActiveTab('demand')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'demand'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Impacto Demanda
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-brand-slate mb-2">Nenhum dado de 5G disponível</p>
            <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderCoverageChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de cobertura disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      municipios_cobertos: item.municipios_cobertos_5g || item.municipios_5g || 0,
      populacao_coberta: item.populacao_coberta_5g || item.populacao_5g || 0,
      investimento_total: item.investimento_5g_brl || item.investimento_total || 0,
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
            formatter={(value: number) => {
              if (value > 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
              return value.toLocaleString('pt-BR');
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="municipios_cobertos"
            stroke="#64ffda"
            fill="#64ffda"
            fillOpacity={0.3}
            name="Municípios Cobertos"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="populacao_coberta"
            stroke="#60a5fa"
            strokeWidth={2}
            name="População Coberta (milhões)"
          />
          <Bar
            yAxisId="right"
            dataKey="investimento_total"
            fill="#a78bfa"
            opacity={0.6}
            name="Investimento Total (R$)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderMilestonesChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de marcos disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      novas_torres: item.novas_torres_5g || 0,
      upgrades: item.upgrades_5g || 0,
      migracoes: item.migracoes_5g || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
          <Bar dataKey="novas_torres" fill="#64ffda" name="Novas Torres" />
          <Bar dataKey="upgrades" fill="#60a5fa" name="Upgrades" />
          <Bar dataKey="migracoes" fill="#a78bfa" name="Migrações" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDemandImpactChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de impacto de demanda disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      demanda_impacto_5g: item.demanda_impacto_5g || 0,
      demanda_projetada: item.demanda_projetada || 0,
      crescimento_previsto: item.crescimento_previsto || 0,
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
          <Area type="monotone" dataKey="demanda_impacto_5g" stroke="#64ffda" fill="#64ffda" fillOpacity={0.3} name="Impacto Demanda 5G" />
          <Area type="monotone" dataKey="demanda_projetada" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} name="Demanda Projetada" />
          <Area type="monotone" dataKey="crescimento_previsto" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} name="Crescimento Previsto (%)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
          <button
            onClick={() => setActiveTab('coverage')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'coverage'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Cobertura
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'milestones'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Marcos
          </button>
          <button
            onClick={() => setActiveTab('demand')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'demand'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Impacto Demanda
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'coverage' && renderCoverageChart()}
          {activeTab === 'milestones' && renderMilestonesChart()}
          {activeTab === 'demand' && renderDemandImpactChart()}
        </div>

      </div>
    </Card>
  );
};

export default FiveGExpansionChart;


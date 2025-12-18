import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { SLAFeatures, SLAPenalty, SLAViolation } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface SLAMetricsChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const SLAMetricsChart: React.FC<SLAMetricsChartProps> = ({ materialId, startDate, endDate }) => {
  const [slaData, setSlaData] = useState<SLAFeatures[]>([]);
  const [penaltiesData, setPenaltiesData] = useState<SLAPenalty[]>([]);
  const [violationsData, setViolationsData] = useState<SLAViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'penalties' | 'violations'>('metrics');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [slaResponse, penaltiesResponse, violationsResponse] = await Promise.all([
          apiClient.getSLAFeatures(materialId, undefined, 100, 0),
          apiClient.getSLAPenalties(),
          apiClient.getSLAViolations(undefined),
        ]);

        if (slaResponse.status === 'success') {
          setSlaData(slaResponse.data);
        }
        if (penaltiesResponse.status === 'success') {
          setPenaltiesData(penaltiesResponse.data);
        }
        if (violationsResponse.status === 'success') {
          setViolationsData(violationsResponse.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de SLA';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de SLA', 'error');
        }
        console.error('Error fetching SLA features:', error);
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
          <p className="text-brand-slate">Carregando dados de SLA...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Métricas</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Penalidades</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Violações</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar dados de SLA</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Check for empty data per tab
  const hasData = (activeTab === 'metrics' && slaData.length > 0) ||
                  (activeTab === 'penalties' && penaltiesData.length > 0) ||
                  (activeTab === 'violations' && violationsData.length > 0);

  if (!hasData && !loading) {
    const tabMessages = {
      metrics: 'dados de métricas',
      penalties: 'dados de penalidades',
      violations: 'dados de violações'
    };

    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'metrics'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Métricas
            </button>
            <button
              onClick={() => setActiveTab('penalties')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'penalties'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Penalidades
            </button>
            <button
              onClick={() => setActiveTab('violations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'violations'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Violações
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-brand-slate mb-2">Nenhum {tabMessages[activeTab]} disponível</p>
            <p className="text-xs text-brand-slate/70">Tente selecionar outra aba ou verificar os dados</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderMetricsChart = () => {
    if (slaData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de métricas disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (slaData || []).filter(item => item && (item.material_id || item.material_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de SLA encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      material_name: item.material_name || `Material ${item.material_id}`,
      tier: item.tier_nivel,
      availability: item.availability_actual || item.availability_target || 0,
      target: item.availability_target || 0,
      downtime: item.downtime_hours_monthly || 0,
      penalty: item.sla_penalty_brl || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData.slice(0, 15)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="material_name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'penalty') return `R$ ${value.toLocaleString('pt-BR')}`;
              if (name === 'availability' || name === 'target') return `${value.toFixed(2)}%`;
              return value;
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="left" dataKey="availability" fill="#64ffda" name="Disponibilidade Atual (%)" />
          <Line yAxisId="left" type="monotone" dataKey="target" stroke="#60a5fa" strokeWidth={2} name="Meta (%)" />
          <Area yAxisId="right" type="monotone" dataKey="penalty" stroke="#f87171" fill="#f87171" fillOpacity={0.3} name="Penalidade (R$)" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderPenaltiesChart = () => {
    if (penaltiesData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de penalidades disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (penaltiesData || []).filter(item => item && (item.material_id || item.material_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de penalidade encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      material_name: item.material_name || `Material ${item.material_id}`,
      tier: item.tier_nivel,
      penalty: item.sla_penalty_brl || 0,
      risk: item.penalty_risk || 0,
      availability: item.current_availability || 0,
      target: item.availability_target || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData.slice(0, 15)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="material_name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'penalty') return `R$ ${value.toLocaleString('pt-BR')}`;
              if (name === 'availability' || name === 'target') return `${value.toFixed(2)}%`;
              return `${(value * 100).toFixed(1)}%`;
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="right" dataKey="penalty" fill="#f87171" name="Penalidade (R$)" />
          <Line yAxisId="left" type="monotone" dataKey="risk" stroke="#a78bfa" strokeWidth={2} name="Risco de Penalidade" />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="availability"
            stroke="#64ffda"
            fill="#64ffda"
            fillOpacity={0.3}
            name="Disponibilidade (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderViolationsChart = () => {
    if (violationsData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de violações disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (violationsData || []).filter(item => item && (item.material_id || item.material_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de violação encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      material_name: item.material_name || `Material ${item.material_id}`,
      tier: item.tier_nivel,
      risk: item.sla_violation_risk || 0,
      estimated_penalty: item.estimated_penalty_brl || 0,
      violation_level: item.violation_level,
    }));

    const violationColors: Record<string, string> = {
      LOW: '#64ffda',
      MEDIUM: '#a78bfa',
      HIGH: '#f87171',
    };

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData.slice(0, 15)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="material_name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'estimated_penalty') return `R$ ${value.toLocaleString('pt-BR')}`;
              return `${(value * 100).toFixed(1)}%`;
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar
            yAxisId="right"
            dataKey="estimated_penalty"
            fill="#64ffda"
            name="Penalidade Estimada (R$)"
          />
          <Line yAxisId="left" type="monotone" dataKey="risk" stroke="#60a5fa" strokeWidth={2} name="Risco de Violação" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('penalties')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'penalties'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Penalidades
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'violations'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Violações
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'metrics' && renderMetricsChart()}
          {activeTab === 'penalties' && renderPenaltiesChart()}
          {activeTab === 'violations' && renderViolationsChart()}
        </div>

      </div>
    </Card>
  );
};

export default SLAMetricsChart;


import React, { useState, useEffect, useMemo, memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { Top5Family, TierAnalytics } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface BusinessMetricsChartProps {
  materialId?: number;
}

const COLORS = ['#64ffda', '#60a5fa', '#a78bfa', '#f87171', '#34d399'];

const BusinessMetricsChart: React.FC<BusinessMetricsChartProps> = memo(({ materialId }) => {
  const [top5Families, setTop5Families] = useState<Top5Family[]>([]);
  const [tierAnalytics, setTierAnalytics] = useState<TierAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'top5' | 'tiers' | 'overview'>('overview');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [top5Response, tiersResponse] = await Promise.all([
          apiClient.getTop5Families(),
          apiClient.getTierAnalytics(),
        ]);

        if (top5Response.status === 'success') {
          setTop5Families(top5Response.data);
        }
        if (tiersResponse.status === 'success') {
          setTierAnalytics(tiersResponse.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de negócio';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de negócio', 'error');
        }
        console.error('Error fetching business features:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materialId, addToast]);

  // Memoize chart data to avoid recalculation on every render
  // MUST be before any early returns to comply with React Hooks rules
  const top5ChartData = useMemo(() => {
    const validData = (top5Families || []).filter(item => item && (item.family_id || item.family_name));
    return validData.map((item) => ({
      name: item.family_name || `Família ${item.family_id}`,
      movements: item.total_movements || 0,
      percentage: item.percentage || 0,
      materials: item.unique_materials || 0,
      sites: item.unique_sites || 0,
    }));
  }, [top5Families]);

  // Memoize tier chart data
  const tierChartData = useMemo(() => {
    const validData = (tierAnalytics || []).filter(item => item && item.tier_nivel);
    return validData.map((item) => ({
      tier: item.tier_nivel,
      materials: item.material_count || 0,
      penalty: item.total_sla_penalty_brl || 0,
      availability: item.avg_availability_target || 0,
      downtime: item.avg_downtime_hours || 0,
      risk: item.high_risk_count || 0,
    }));
  }, [tierAnalytics]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dados de negócio...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Visão Geral</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Top 5 Famílias</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Análise de Tiers</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar dados de negócio</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Check for empty data per tab
  const hasData = (activeTab === 'overview' && (top5Families.length > 0 || tierAnalytics.length > 0)) ||
                  (activeTab === 'top5' && top5Families.length > 0) ||
                  (activeTab === 'tiers' && tierAnalytics.length > 0);

  if (!hasData && !loading) {
    const tabMessages = {
      overview: 'dados de negócio',
      top5: 'dados das top 5 famílias',
      tiers: 'dados de tiers'
    };

    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('top5')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'top5'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Top 5 Famílias
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'tiers'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Análise de Tiers
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

  const renderTop5Chart = () => {
    if (top5Families.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado das top 5 famílias disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    if (top5ChartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de família encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = top5ChartData;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Top 5 Famílias - Movimentações</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
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
              <Bar dataKey="movements" fill="#64ffda" name="Movimentações" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Distribuição por Família</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 25, 47, 0.8)',
                  borderColor: '#64ffda',
                  color: '#ccd6f6',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTiersChart = () => {
    if (tierAnalytics.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de tiers disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    if (tierChartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de tier encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = tierChartData;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="tier" tick={{ fill: '#8892b0' }} stroke="#334155" />
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
              if (name === 'availability') return `${value.toFixed(2)}%`;
              return value;
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="left" dataKey="materials" fill="#64ffda" name="Qtd. Materiais" />
          <Bar yAxisId="right" dataKey="penalty" fill="#f87171" name="Penalidades (R$)" />
          <Line yAxisId="left" type="monotone" dataKey="availability" stroke="#60a5fa" strokeWidth={2} name="Disponibilidade (%)" />
          <Line yAxisId="left" type="monotone" dataKey="downtime" stroke="#a78bfa" strokeWidth={2} name="Downtime (h)" />
          <Line yAxisId="left" type="monotone" dataKey="risk" stroke="#34d399" strokeWidth={2} name="Alto Risco" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderOverviewChart = () => {
    if (top5Families.length === 0 && tierAnalytics.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de visão geral disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="p-4">
            <h4 className="text-sm text-brand-slate mb-1">Total de Famílias</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">{top5Families.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h4 className="text-sm text-brand-slate mb-1">Total de Materiais</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              {top5Families.reduce((sum, item) => sum + (item.unique_materials || 0), 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h4 className="text-sm text-brand-slate mb-1">Total de Tiers</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">{tierAnalytics.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h4 className="text-sm text-brand-slate mb-1">Penalidades Totais</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              R$ {tierAnalytics.reduce((sum, item) => sum + (item.total_sla_penalty_brl || 0), 0).toLocaleString('pt-BR')}
            </p>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('top5')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'top5'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Top 5 Famílias
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tiers'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Análise de Tiers
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'overview' && (
            <>
              {renderOverviewChart()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Top 5 Famílias</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={top5Families.map((item) => ({
                      name: item.family_name || `Família ${item.family_id}`,
                      movements: item.total_movements || 0,
                    }))} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
                      <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 25, 47, 0.8)',
                          borderColor: '#64ffda',
                          color: '#ccd6f6',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar dataKey="movements" fill="#64ffda" name="Movimentações" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Análise de Tiers</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tierAnalytics.map((item) => ({
                      tier: item.tier_nivel,
                      materials: item.material_count || 0,
                    }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="tier" tick={{ fill: '#8892b0' }} stroke="#334155" />
                      <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 25, 47, 0.8)',
                          borderColor: '#64ffda',
                          color: '#ccd6f6',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar dataKey="materials" fill="#60a5fa" name="Materiais" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
          {activeTab === 'top5' && renderTop5Chart()}
          {activeTab === 'tiers' && renderTiersChart()}
        </div>

      </div>
    </Card>
  );
});

BusinessMetricsChart.displayName = 'BusinessMetricsChart';

export default BusinessMetricsChart;


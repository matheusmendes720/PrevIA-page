import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { LeadTimeFeatures, SupplierLeadTime } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface LeadTimeAnalyticsChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const COLORS = ['#64ffda', '#60a5fa', '#a78bfa', '#f87171', '#34d399'];

const LeadTimeAnalyticsChart: React.FC<LeadTimeAnalyticsChartProps> = ({ materialId, startDate, endDate }) => {
  const [leadTimeData, setLeadTimeData] = useState<LeadTimeFeatures[]>([]);
  const [supplierData, setSupplierData] = useState<SupplierLeadTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'risks'>('overview');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadTimeResponse, supplierResponse] = await Promise.all([
          apiClient.getLeadTimeFeatures(materialId, startDate, endDate),
          apiClient.getSupplierLeadTimes(),
        ]);

        if (leadTimeResponse.status === 'success') {
          setLeadTimeData(leadTimeResponse.data);
        }
        if (supplierResponse.status === 'success') {
          setSupplierData(supplierResponse.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de lead time';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de lead time', 'error');
        }
        console.error('Error fetching lead time features:', error);
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
          <p className="text-brand-slate">Carregando dados de lead time...</p>
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
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Fornecedores</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Riscos</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar dados de lead time</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Check for empty data per tab
  const hasData = (activeTab === 'overview' && leadTimeData.length > 0) ||
                  (activeTab === 'suppliers' && supplierData.length > 0) ||
                  (activeTab === 'risks' && leadTimeData.length > 0);

  if (!hasData && !loading) {
    const tabMessages = {
      overview: 'dados de lead time',
      suppliers: 'dados de fornecedores',
      risks: 'dados de riscos'
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
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Fornecedores
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'risks'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Riscos
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

  const renderOverviewChart = () => {
    if (leadTimeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de visão geral disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (leadTimeData || []).filter(item => item && item.material_id);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de lead time encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const categories = validData.reduce((acc, item) => {
      const cat = item.lead_time_category || 'NORMAL';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));

    const avgData = validData.map((item) => ({
      material_id: item.material_id,
      lead_time: item.lead_time_days || 0,
      base_lead_time: item.base_lead_time_days || 0,
      total_lead_time: item.total_lead_time_days || 0,
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Distribuição por Categoria</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
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
        <div>
          <h4 className="text-sm font-semibold text-brand-lightest-slate mb-2">Lead Times por Material</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={avgData.slice(0, 10)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="material_id" tick={{ fill: '#8892b0' }} stroke="#334155" />
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
              <Bar dataKey="lead_time" fill="#64ffda" name="Lead Time" />
              <Line type="monotone" dataKey="base_lead_time" stroke="#60a5fa" strokeWidth={2} name="Base Lead Time" />
              <Line type="monotone" dataKey="total_lead_time" stroke="#f87171" strokeWidth={2} name="Total Lead Time" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSuppliersChart = () => {
    if (supplierData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de fornecedores disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (supplierData || []).filter(item => item && (item.supplier_id || item.supplier_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de fornecedor encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const supplierChartData = validData.map((item) => ({
      name: item.supplier_name || `Fornecedor ${item.supplier_id}`,
      avg_lead_time: item.avg_lead_time_days || 0,
      reliability: item.reliability || 0,
      material_count: item.material_count || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={supplierChartData.slice(0, 10)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
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
          <Bar yAxisId="left" dataKey="avg_lead_time" fill="#64ffda" name="Lead Time Médio (dias)" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="reliability"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Confiabilidade (%)"
          />
          <Bar yAxisId="left" dataKey="material_count" fill="#a78bfa" opacity={0.6} name="Qtd. Materiais" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderRisksChart = () => {
    if (leadTimeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de riscos disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (leadTimeData || []).filter(item => item && item.material_id);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de lead time encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const riskData = validData.map((item) => ({
      material_id: item.material_id,
      strike_risk: item.strike_risk || 0,
      customs_delay: item.customs_delay_days || 0,
      is_critical: item.is_critical_lead_time ? 1 : 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={riskData.slice(0, 20)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="material_id" tick={{ fill: '#8892b0' }} stroke="#334155" />
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
          <Area type="monotone" dataKey="strike_risk" stroke="#f87171" fill="#f87171" fillOpacity={0.3} name="Risco Greve" />
          <Area type="monotone" dataKey="customs_delay" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} name="Atraso Alfândega (dias)" />
          <Area type="monotone" dataKey="is_critical" stroke="#64ffda" fill="#64ffda" fillOpacity={0.3} name="Lead Time Crítico" />
        </AreaChart>
      </ResponsiveContainer>
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
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Fornecedores
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'risks'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Riscos
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'overview' && renderOverviewChart()}
          {activeTab === 'suppliers' && renderSuppliersChart()}
          {activeTab === 'risks' && renderRisksChart()}
        </div>

      </div>
    </Card>
  );
};

export default LeadTimeAnalyticsChart;


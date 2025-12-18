import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { SiteAggregation } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface SiteAggregationChartProps {
  siteId?: string;
  onSiteClick?: (siteId: string) => void;
}

const SiteAggregationChart: React.FC<SiteAggregationChartProps> = ({ siteId, onSiteClick }) => {
  const [siteData, setSiteData] = useState<SiteAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getSiteAggregations(siteId);
        if (response.status === 'success' || Array.isArray(response)) {
          setSiteData(Array.isArray(response) ? response : response.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de site';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de site', 'error');
        }
        console.error('Error fetching site aggregations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, addToast]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dados de sites/torres...</p>
        </div>
      </Card>
    );
  }

  if (siteData.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de site disponível</p>
          <p className="text-xs text-brand-slate/70">18,000+ torres cadastradas</p>
        </div>
      </Card>
    );
  }

  const chartData = siteData.slice(0, 20).map((item: any) => ({
    site_id: item.site_id || `Site ${item.site_id}`,
    movements: item.total_movimentacoes || item.total_demand || 0,
    avg_7d: item.demanda_media_7d || item.avg_demand_7d || 0,
    avg_30d: item.demanda_media_30d || item.avg_demand_30d || 0,
    frequency: item.frequency || item.site_frequency || 0,
    materials: item.total_materiais || item.material_count || 0,
  }));

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">📍 Agregações por Site/Torre</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="site_id" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
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
            <Bar yAxisId="left" dataKey="movements" fill="#64ffda" name="Movimentações" />
            <Bar yAxisId="left" dataKey="materials" fill="#60a5fa" opacity={0.6} name="Qtd. Materiais" />
            <Line yAxisId="right" type="monotone" dataKey="avg_7d" stroke="#a78bfa" strokeWidth={2} name="Média 7 dias" />
            <Line yAxisId="right" type="monotone" dataKey="avg_30d" stroke="#34d399" strokeWidth={2} name="Média 30 dias" />
            <Area yAxisId="right" type="monotone" dataKey="frequency" stroke="#f87171" fill="#f87171" fillOpacity={0.3} name="Frequência" />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Total de Sites</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">{siteData.length}</p>
          </div>
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Total de Movimentações</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              {siteData.reduce((sum, item: any) => sum + (item.total_movimentacoes || item.total_demand || 0), 0)}
            </p>
          </div>
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Total de Materiais</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              {siteData.reduce((sum, item: any) => sum + (item.total_materiais || item.material_count || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SiteAggregationChart;


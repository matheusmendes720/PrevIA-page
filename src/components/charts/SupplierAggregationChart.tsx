import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { SupplierAggregation } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface SupplierAggregationChartProps {
  supplierId?: number;
  onSupplierClick?: (supplierId: number) => void;
}

const SupplierAggregationChart: React.FC<SupplierAggregationChartProps> = ({ supplierId, onSupplierClick }) => {
  const [supplierData, setSupplierData] = useState<SupplierAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getSupplierAggregations(supplierId);
        if (response.status === 'success') {
          setSupplierData(response.data);
        } else if (Array.isArray(response)) {
          setSupplierData(response);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de fornecedor';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de fornecedor', 'error');
        }
        console.error('Error fetching supplier aggregations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supplierId, addToast]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dados de fornecedores...</p>
        </div>
      </Card>
    );
  }

  if (supplierData.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de fornecedor disponível</p>
          <p className="text-xs text-brand-slate/70">Análise de fornecedores e confiabilidade</p>
        </div>
      </Card>
    );
  }

  const chartData = supplierData.slice(0, 20).map((item: any) => ({
    supplier_name: item.supplier_name || item.fornecedor_nome || `Fornecedor ${item.supplier_id || item.fornecedor_id}`,
    frequency: item.supplier_frequency || item.reliability || 0,
    lead_time_mean: item.supplier_lead_time_mean || item.avg_lead_time || 0,
    lead_time_std: item.supplier_lead_time_std || item.std_lead_time || 0,
    reliability: item.reliability || 0,
    materials: item.material_count || 0,
  }));

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">🏭 Agregações por Fornecedor</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="supplier_name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
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
            <Bar yAxisId="left" dataKey="frequency" fill="#64ffda" name="Frequência" />
            <Bar yAxisId="left" dataKey="materials" fill="#60a5fa" opacity={0.6} name="Qtd. Materiais" />
            <Line yAxisId="right" type="monotone" dataKey="lead_time_mean" stroke="#a78bfa" strokeWidth={2} name="Lead Time Médio (dias)" />
            <Line yAxisId="right" type="monotone" dataKey="lead_time_std" stroke="#f87171" strokeWidth={2} name="Lead Time Std Dev" />
            <Area yAxisId="right" type="monotone" dataKey="reliability" stroke="#34d399" fill="#34d399" fillOpacity={0.3} name="Confiabilidade (%)" />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Total de Fornecedores</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">{supplierData.length}</p>
          </div>
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Lead Time Médio</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              {supplierData.length > 0
                ? Math.round(
                    supplierData.reduce(
                      (sum, item: any) => sum + (item.supplier_lead_time_mean || item.avg_lead_time || 0),
                      0
                    ) / supplierData.length
                  )
                : 0}
              {' '}dias
            </p>
          </div>
          <div className="p-3 bg-brand-light-navy/50 rounded-lg">
            <h4 className="text-sm font-semibold text-brand-lightest-slate mb-1">Confiabilidade Média</h4>
            <p className="text-2xl font-bold text-brand-lightest-slate">
              {supplierData.length > 0
                ? Math.round(
                    (supplierData.reduce((sum, item: any) => sum + (item.reliability || 0), 0) / supplierData.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SupplierAggregationChart;










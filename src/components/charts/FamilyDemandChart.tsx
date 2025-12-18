import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { FamilyAggregation } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface FamilyDemandChartProps {
  familyId?: number;
  onFamilyClick?: (familyId: number) => void;
}

const FamilyDemandChart: React.FC<FamilyDemandChartProps> = ({ familyId, onFamilyClick }) => {
  const [familyData, setFamilyData] = useState<FamilyAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getFamilyAggregations(familyId);
        if (response.status === 'success' || Array.isArray(response)) {
          setFamilyData(Array.isArray(response) ? response : response.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados de família';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados de família', 'error');
        }
        console.error('Error fetching family aggregations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyId, addToast]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando dados de família...</p>
        </div>
      </Card>
    );
  }

  if (familyData.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Não há dados disponíveis para esta família.</p>
        </div>
      </Card>
    );
  }

  const chartData = familyData.map(item => ({
    name: item.family_name || `Família ${item.family_id}`,
    family_id: item.family_id,
    total_demand: item.total_demand || 0,
    avg_demand_7d: item.avg_demand_7d || 0,
    avg_demand_30d: item.avg_demand_30d || 0,
    std_demand_7d: item.std_demand_7d || 0,
    std_demand_30d: item.std_demand_30d || 0,
    material_count: item.material_count || 0,
  }));

  const handleBarClick = (data: any) => {
    if (onFamilyClick && data.family_id) {
      onFamilyClick(data.family_id);
    }
  };

  return (
    <Card className="h-full">
      <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">
        Demanda por Família {familyId ? `- Família ${familyId}` : '(Todas as Famílias)'}
      </h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" tick={{ fill: '#8892b0' }} stroke="#334155" angle={-45} textAnchor="end" height={80} />
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
            <Bar
              yAxisId="left"
              dataKey="total_demand"
              fill="#64ffda"
              opacity={0.8}
              name="Demanda Total"
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="avg_demand_30d"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              name="Média 30 Dias"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="material_count"
              stroke="#fbbf24"
              strokeWidth={2}
              name="Número de Materiais"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-brand-slate">
        <p>💡 Clique em uma barra para ver detalhes da família</p>
      </div>
    </Card>
  );
};

export default FamilyDemandChart;


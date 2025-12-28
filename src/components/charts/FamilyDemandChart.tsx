import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, ReferenceLine, Cell } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { FamilyAggregation } from '../../types/features';
import { useToast } from '../../hooks/useToast';
import { usePrescriptiveChart } from '../../hooks/usePrescriptiveChart';
import PrescriptiveTooltip from '../PrescriptiveTooltip';
import { prescriptiveDataService } from '../../services/prescriptiveDataService';

interface FamilyDemandChartProps {
  familyId?: number;
  onFamilyClick?: (familyId: number) => void;
}

const FamilyDemandChart: React.FC<FamilyDemandChartProps> = ({ familyId, onFamilyClick }) => {
  const [familyData, setFamilyData] = useState<FamilyAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const [familyName, setFamilyName] = useState<string | undefined>();
  const { chartData: prescriptiveData } = usePrescriptiveChart(familyName);

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

  const chartData = familyData.map(item => {
    const name = item.family_name || `Família ${item.family_id}`;
    if (!familyName && name) {
      setFamilyName(name);
    }
    return {
      name,
      family_id: item.family_id,
      total_demand: item.total_demand || 0,
      avg_demand_7d: item.avg_demand_7d || 0,
      avg_demand_30d: item.avg_demand_30d || 0,
      std_demand_7d: item.std_demand_7d || 0,
      std_demand_30d: item.std_demand_30d || 0,
      material_count: item.material_count || 0,
      riskLevel: prescriptiveData?.riskOverlay?.riskLevel,
      riskScore: prescriptiveData?.riskOverlay?.riskScore,
    };
  });

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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-brand-navy border border-brand-cyan/40 rounded-lg p-3 shadow-xl">
                      <p className="text-sm font-semibold text-brand-lightest-slate mb-2">{data.name}</p>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="mb-1">
                          <span className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toFixed(1)}
                          </span>
                        </div>
                      ))}
                      {data.riskLevel && (
                        <div className="mt-2 pt-2 border-t border-brand-cyan/20">
                          <span className={`text-xs px-2 py-1 rounded ${
                            data.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                            data.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            Risco: {data.riskLevel}
                          </span>
                          {data.riskScore && (
                            <p className="text-xs text-brand-slate mt-1">
                              Score: {(data.riskScore * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ color: '#a8b2d1' }} />
            {/* Risk overlay reference lines */}
            {prescriptiveData?.actionThreshold && (
              <ReferenceLine
                yAxisId="left"
                y={prescriptiveData.actionThreshold}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{ value: 'Ponto de Ação', position: 'right', fill: '#f59e0b', fontSize: 10 }}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey="total_demand"
              fill="#64ffda"
              opacity={0.8}
              name="Demanda Total"
              onClick={handleBarClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.riskLevel === 'HIGH' ? '#ef4444' :
                    entry.riskLevel === 'MEDIUM' ? '#f59e0b' :
                    '#64ffda'
                  }
                />
              ))}
            </Bar>
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


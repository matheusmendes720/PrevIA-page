import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { ClimateFeatures, SalvadorClimate } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface ClimateTimeSeriesChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const ClimateTimeSeriesChart: React.FC<ClimateTimeSeriesChartProps> = ({ materialId, startDate, endDate }) => {
  const [climateData, setClimateData] = useState<ClimateFeatures[]>([]);
  const [salvadorData, setSalvadorData] = useState<SalvadorClimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temperature' | 'precipitation' | 'risks'>('temperature');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [climateResponse, salvadorResponse] = await Promise.all([
          apiClient.getClimateFeatures(materialId, startDate, endDate),
          apiClient.getSalvadorClimate(startDate, endDate),
        ]);

        if (climateResponse.status === 'success') {
          setClimateData(climateResponse.data);
        }
        if (Array.isArray(salvadorResponse) && salvadorResponse.length > 0) {
          setSalvadorData(salvadorResponse);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados climáticos';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados climáticos', 'error');
        }
        console.error('Error fetching climate features:', error);
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
          <p className="text-brand-slate">Carregando dados climáticos...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-2">Features Climáticas - Salvador/BA</h3>
          <div className="flex gap-2 border-b border-brand-light-navy/50">
            <button className="py-2 px-4 border-b-2 border-transparent text-brand-slate">Temperatura</button>
            <button className="py-2 px-4 border-b-2 border-transparent text-brand-slate">Precipitação</button>
            <button className="py-2 px-4 border-b-2 border-transparent text-brand-slate">Riscos</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-red-400 mb-2">Erro ao carregar dados climáticos</p>
          <p className="text-xs text-brand-slate/70">{error}</p>
        </div>
      </Card>
    );
  }

  const dataToUse = salvadorData.length > 0 ? salvadorData : climateData;

  // Check for empty data
  if (dataToUse.length === 0 && !loading) {
    return (
      <Card className="h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-2">Features Climáticas - Salvador/BA</h3>
          <div className="flex gap-2 border-b border-brand-light-navy/50">
            <button
              onClick={() => setActiveTab('temperature')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'temperature'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Temperatura
            </button>
            <button
              onClick={() => setActiveTab('precipitation')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'precipitation'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Precipitação
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'risks'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Riscos
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado climático disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      </Card>
    );
  }

  const renderTemperatureChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de temperatura disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      temperatura: item.temperatura_avg_c || item.temperatura_media || 0,
      umidade: item.humidity_percent || item.umidade_percentual || 0,
      extreme_heat: item.is_extreme_heat ? 1 : 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
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
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temperatura"
            stroke="#64ffda"
            fill="#64ffda"
            fillOpacity={0.3}
            name="Temperatura (°C)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="umidade"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Umidade (%)"
          />
          <Bar yAxisId="left" dataKey="extreme_heat" fill="#f87171" opacity={0.6} name="Calor Extremo" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderPrecipitationChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de precipitação disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      precipitacao: item.precipitation_mm || item.precipitacao_mm || 0,
      heavy_rain: item.is_heavy_rain || item.is_intense_rain ? 1 : 0,
      no_rain: item.no_rain ? 1 : 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="precipitacao"
            stroke="#60a5fa"
            fill="#60a5fa"
            fillOpacity={0.3}
            name="Precipitação (mm)"
          />
          <Bar yAxisId="left" dataKey="heavy_rain" fill="#f87171" opacity={0.6} name="Chuva Intensa" />
          <Bar yAxisId="left" dataKey="no_rain" fill="#fbbf24" opacity={0.6} name="Sem Chuva" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderRisksChart = () => {
    const validData = (dataToUse || []).filter((item: any) => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de riscos disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map((item: any) => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      corrosion_risk: (item.corrosion_risk || 0) * 100,
      field_work_disruption: (item.field_work_disruption || 0) * 100,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCorrosion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDisruption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="corrosion_risk"
            stroke="#f87171"
            fillOpacity={1}
            fill="url(#colorCorrosion)"
            name="Risco de Corrosão (%)"
          />
          <Area
            type="monotone"
            dataKey="field_work_disruption"
            stroke="#fbbf24"
            fillOpacity={1}
            fill="url(#colorDisruption)"
            name="Interrupção de Trabalho de Campo (%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-brand-lightest-slate mb-2">Features Climáticas - Salvador/BA</h3>
        <div className="flex gap-2 border-b border-brand-light-navy/50">
          <button
            onClick={() => setActiveTab('temperature')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'temperature'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Temperatura
          </button>
          <button
            onClick={() => setActiveTab('precipitation')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'precipitation'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Precipitação
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'risks'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Riscos
          </button>
        </div>
      </div>
      <div className="h-96">
        {activeTab === 'temperature' && renderTemperatureChart()}
        {activeTab === 'precipitation' && renderPrecipitationChart()}
        {activeTab === 'risks' && renderRisksChart()}
      </div>
    </Card>
  );
};

export default ClimateTimeSeriesChart;


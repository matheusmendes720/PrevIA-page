import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { TemporalFeatures, CalendarFeatures } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface TemporalFeaturesChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const TemporalFeaturesChart: React.FC<TemporalFeaturesChartProps> = ({ materialId, startDate, endDate }) => {
  const [temporalData, setTemporalData] = useState<TemporalFeatures[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temporal' | 'calendar' | 'cyclical'>('temporal');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [temporalResponse, calendarResponse] = await Promise.all([
          apiClient.getTemporalFeatures(materialId, startDate, endDate),
          apiClient.getBrazilianCalendar(startDate, endDate),
        ]);

        if (temporalResponse.status === 'success') {
          setTemporalData(temporalResponse.data);
        }
        if (Array.isArray(calendarResponse) && calendarResponse.length > 0) {
          setCalendarData(calendarResponse);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar dados temporais';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar dados temporais', 'error');
        }
        console.error('Error fetching temporal features:', error);
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
          <p className="text-brand-slate">Carregando dados temporais...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-red-400 mb-2">Erro ao carregar dados temporais</p>
          <p className="text-xs text-brand-slate/70">{error}</p>
        </div>
      </Card>
    );
  }

  // Check for empty data
  const hasData = (activeTab === 'temporal' && temporalData.length > 0) ||
                  (activeTab === 'calendar' && calendarData.length > 0) ||
                  (activeTab === 'cyclical' && temporalData.length > 0);

  if (!hasData && !loading) {
    return (
      <Card className="h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-brand-lightest-slate mb-2">Features Temporais</h3>
          <div className="flex gap-2 border-b border-brand-light-navy/50">
            <button
              onClick={() => setActiveTab('temporal')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'temporal'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Temporal
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Calendário Brasileiro
            </button>
            <button
              onClick={() => setActiveTab('cyclical')}
              className={`py-2 px-4 border-b-2 transition-colors ${
                activeTab === 'cyclical'
                  ? 'border-brand-cyan text-brand-cyan'
                  : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
              }`}
            >
              Codificação Cíclica
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado temporal disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      </Card>
    );
  }

  const renderTemporalChart = () => {
    const validData = (temporalData || []).filter(item => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado temporal disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map(item => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      month: item.month || 0,
      weekday: item.weekday || 0,
      is_weekend: item.is_weekend ? 1 : 0,
      is_holiday: item.is_holiday ? 1 : 0,
      is_carnival: item.is_carnival ? 1 : 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
          <Bar dataKey="month" fill="#64ffda" opacity={0.6} name="Mês" />
          <Line type="monotone" dataKey="weekday" stroke="#8884d8" strokeWidth={2} name="Dia da Semana" />
          <Area type="monotone" dataKey="is_holiday" fill="#f87171" opacity={0.3} name="Feriado" />
          <Area type="monotone" dataKey="is_carnival" fill="#fbbf24" opacity={0.3} name="Carnaval" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderCalendarChart = () => {
    const validData = (calendarData || []).filter(item => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado de calendário disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map(item => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      is_feriado: item.is_feriado ? 1 : 0,
      is_carnaval: item.is_carnaval ? 1 : 0,
      is_natal: item.is_natal ? 1 : 0,
      is_verao: item.is_verao ? 1 : 0,
      impact_demanda: item.impact_demanda || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64ffda" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#64ffda" stopOpacity={0}/>
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
          <Area type="monotone" dataKey="impact_demanda" stroke="#64ffda" fillOpacity={1} fill="url(#colorImpact)" name="Impacto na Demanda" />
          <Bar dataKey="is_feriado" fill="#f87171" opacity={0.6} name="Feriado" />
          <Bar dataKey="is_carnaval" fill="#fbbf24" opacity={0.6} name="Carnaval" />
          <Bar dataKey="is_verao" fill="#60a5fa" opacity={0.6} name="Verão" />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderCyclicalChart = () => {
    const validData = (temporalData || []).filter(item => item && item.data_referencia);
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado cíclico disponível</p>
          <p className="text-xs text-brand-slate/70">Tente ajustar os filtros ou selecionar outro período</p>
        </div>
      );
    }

    const chartData = validData.map(item => ({
      date: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : 'N/A',
      month_sin: item.month_sin || 0,
      month_cos: item.month_cos || 0,
      day_of_year_sin: item.day_of_year_sin || 0,
      day_of_year_cos: item.day_of_year_cos || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
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
          <Line type="monotone" dataKey="month_sin" stroke="#64ffda" strokeWidth={2} name="Mês (Sin)" />
          <Line type="monotone" dataKey="month_cos" stroke="#8884d8" strokeWidth={2} name="Mês (Cos)" />
          <Line type="monotone" dataKey="day_of_year_sin" stroke="#f87171" strokeWidth={2} name="Dia do Ano (Sin)" />
          <Line type="monotone" dataKey="day_of_year_cos" stroke="#fbbf24" strokeWidth={2} name="Dia do Ano (Cos)" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-brand-lightest-slate mb-2">Features Temporais</h3>
        <div className="flex gap-2 border-b border-brand-light-navy/50">
          <button
            onClick={() => setActiveTab('temporal')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'temporal'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Temporal
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'calendar'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Calendário Brasileiro
          </button>
          <button
            onClick={() => setActiveTab('cyclical')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'cyclical'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-brand-slate hover:text-brand-lightest-slate'
            }`}
          >
            Codificação Cíclica
          </button>
        </div>
      </div>
      <div className="h-96">
        {activeTab === 'temporal' && renderTemporalChart()}
        {activeTab === 'calendar' && renderCalendarChart()}
        {activeTab === 'cyclical' && renderCyclicalChart()}
      </div>
    </Card>
  );
};

export default TemporalFeaturesChart;


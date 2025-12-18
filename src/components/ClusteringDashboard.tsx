import React, { useState, useEffect } from 'react';
import Card from './Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '../lib/api';

const COLORS = ['#64ffda', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const ClusteringDashboard: React.FC = () => {
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [towerData, setTowerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'equipment' | 'towers'>('equipment');

  useEffect(() => {
    const fetchClusteringData = async () => {
      try {
        setLoading(true);
        
        const [equipmentRes, towerRes] = await Promise.all([
          apiClient.getEquipmentFailureClustering(),
          apiClient.getTowerPerformanceClustering()
        ]);
        
        setEquipmentData(equipmentRes);
        setTowerData(towerRes);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching clustering data:', err);
        const errorMessage = err.message || 'Erro ao carregar dados de clustering';
        setError(errorMessage);
        setEquipmentData(null);
        setTowerData(null);
        setLoading(false);
      }
    };

    fetchClusteringData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-brand-lightest-slate text-lg">Carregando análises de clustering...</div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveView('equipment')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeView === 'equipment'
                ? 'bg-brand-cyan text-brand-navy'
                : 'bg-brand-light-navy text-brand-lightest-slate hover:bg-brand-light-navy/70'
            }`}
          >
            Falhas de Equipamentos
          </button>
          <button
            onClick={() => setActiveView('towers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeView === 'towers'
                ? 'bg-brand-cyan text-brand-navy'
                : 'bg-brand-light-navy text-brand-lightest-slate hover:bg-brand-light-navy/70'
            }`}
          >
            Performance de Torres
          </button>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <p className="text-red-400 mb-2">Erro ao carregar dados de clustering</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveView('equipment')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'equipment'
              ? 'bg-brand-cyan text-brand-navy'
              : 'bg-brand-light-navy text-brand-lightest-slate hover:bg-brand-light-navy/70'
          }`}
        >
          Falhas de Equipamentos
        </button>
        <button
          onClick={() => setActiveView('towers')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeView === 'towers'
              ? 'bg-brand-cyan text-brand-navy'
              : 'bg-brand-light-navy text-brand-lightest-slate hover:bg-brand-light-navy/70'
          }`}
        >
          Performance de Torres
        </button>
      </div>

      {activeView === 'equipment' ? (
        equipmentData && equipmentData.cluster_stats && equipmentData.cluster_stats.length > 0 ? (
          <>
            {/* Cluster Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {equipmentData.cluster_stats.map((stat: any) => (
              <Card key={stat.cluster}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-brand-lightest-slate">Cluster {stat.cluster}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stat.risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                    stat.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {stat.risk_level === 'High' ? 'Alto Risco' : stat.risk_level === 'Medium' ? 'Médio Risco' : 'Baixo Risco'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Registros:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Taxa de Falha:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.failure_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Temp. Média:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.avg_temperature} K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Velocidade:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.avg_speed} rpm</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Failure Rate Comparison */}
          <Card>
            <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Taxa de Falha por Cluster</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipmentData.cluster_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="cluster" tick={{ fill: '#8892b0' }} stroke="#334155" label={{ value: 'Cluster', position: 'insideBottom', offset: -5, fill: '#8892b0' }} />
                  <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" label={{ value: 'Taxa de Falha (%)', angle: -90, position: 'insideLeft', fill: '#8892b0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 25, 47, 0.8)',
                      borderColor: '#64ffda',
                      color: '#ccd6f6',
                      borderRadius: '0.5rem'
                    }}
                    itemStyle={{ color: '#ccd6f6' }}
                  />
                  <Bar dataKey="failure_rate" fill="#64ffda" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-brand-slate mb-2">Nenhum dado de falhas de equipamentos disponível</p>
              <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
            </div>
          </Card>
        )
      ) : null}

      {activeView === 'towers' ? (
        towerData && towerData.cluster_stats && towerData.cluster_stats.length > 0 ? (
          <>
            {/* Cluster Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {towerData.cluster_stats.map((stat: any) => (
              <Card key={stat.cluster}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-brand-lightest-slate">Cluster {stat.cluster}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stat.performance === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                    stat.performance === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                    stat.performance === 'Fair' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {stat.performance}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Registros:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Usuários Média:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.avg_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Download:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.avg_download.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-slate">Latência:</span>
                    <span className="text-brand-lightest-slate font-semibold">{stat.avg_latency}ms</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Performance Distribution */}
          <Card>
            <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Distribuição de Performance das Torres</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={towerData.cluster_stats}
                    dataKey="count"
                    nameKey="performance"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {towerData.cluster_stats.map((entry: any, index: number) => (
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
          </Card>

          {/* Latency Comparison */}
          <Card>
            <h3 className="text-xl font-bold text-brand-lightest-slate mb-4">Comparação de Latência por Cluster</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={towerData.cluster_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="cluster" tick={{ fill: '#8892b0' }} stroke="#334155" label={{ value: 'Cluster', position: 'insideBottom', offset: -5, fill: '#8892b0' }} />
                  <YAxis tick={{ fill: '#8892b0' }} stroke="#334155" label={{ value: 'Latência (ms)', angle: -90, position: 'insideLeft', fill: '#8892b0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 25, 47, 0.8)',
                      borderColor: '#64ffda',
                      color: '#ccd6f6',
                      borderRadius: '0.5rem'
                    }}
                    itemStyle={{ color: '#ccd6f6' }}
                  />
                  <Bar dataKey="avg_latency" fill="#8884d8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-brand-slate mb-2">Nenhum dado de performance de torres disponível</p>
              <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
            </div>
          </Card>
        )
      ) : null}
    </div>
  );
};

export default ClusteringDashboard;


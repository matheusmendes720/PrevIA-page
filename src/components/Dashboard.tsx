

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ForecastDataPoint, Alert, AlertLevel, KpiData } from '../types';
import Card from './Card';
import DemandForecastChart from './DemandForecastChart';
import AlertsTable from './AlertsTable';
import KpiCard from './KpiCard';
import { TrendingUpIcon, TargetIcon, ChartBarIcon, ServerIcon, RefreshIcon, DownloadIcon, ClockIcon, BellIcon } from './icons';
import OperationalStatus from './OperationalStatus';
import InsightModal from './InsightModal';
import PrescriptiveRecommendationsEnhanced from './PrescriptiveRecommendationsEnhanced';
import { useToast } from '../hooks/useToast';

const kpiMetrics: KpiData[] = [
    {
      title: 'Acurácia da Previsão',
      value: '92.7%',
      change: '2.5%',
      changeType: 'increase',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Nível de Serviço',
      value: '98.2%',
      change: '0.8%',
      changeType: 'increase',
      icon: <TargetIcon />,
    },
    {
      title: 'Giro de Estoque',
      value: '6.4',
      change: '0.5',
      changeType: 'decrease',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Custo de Estoque',
      value: 'R$ 1.2M',
      change: '5%',
      changeType: 'decrease',
      icon: <ServerIcon className="w-8 h-8 text-brand-cyan" />,
    },
];

const generateMockForecastData = (): ForecastDataPoint[] => {
  const data: ForecastDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const baseDemand = 80 + Math.sin(i / 5) * 20 + Math.random() * 10;
    const forecastDemand = baseDemand - 5 + Math.random() * 10;
    data.push({
      date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      'Demanda Real': parseFloat(baseDemand.toFixed(0)),
      'Demanda Prevista': parseFloat(forecastDemand.toFixed(0)),
    });
  }
  return data;
};

const mockAlertsData: Alert[] = [
    { item: "Transceptor 5G", itemCode: "MAT_TRNS_5G", currentStock: 22, reorderPoint: 50, daysUntilStockout: 2.5, level: AlertLevel.CRITICAL, recommendation: "Compra emergencial", stateId: 'RJ' },
    { item: "Conector Óptico SC/APC", itemCode: "MAT_CONN_001", currentStock: 65, reorderPoint: 132, daysUntilStockout: 8.1, level: AlertLevel.WARNING, recommendation: "Comprar 250 unidades", stateId: 'SP' },
    { item: "Bateria de Lítio 48V", itemCode: "MAT_BATT_003", currentStock: 30, reorderPoint: 45, daysUntilStockout: 9.0, level: AlertLevel.WARNING, recommendation: "Comprar 50 unidades", stateId: 'MG' },
    { item: "Cabo Óptico 1Km", itemCode: "MAT_CABO_001", currentStock: 120, reorderPoint: 110, daysUntilStockout: 15.2, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'SP' },
    { item: "Antena 3.5GHz", itemCode: "MAT_ANTN_007", currentStock: 78, reorderPoint: 75, daysUntilStockout: 22.4, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'AM' },
    { item: "Parafuso M16 Aço Inox", itemCode: "MAT_ESTRUT_001", currentStock: 1500, reorderPoint: 1200, daysUntilStockout: 25.0, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'BA' },
    { item: "Fonte de Alimentação AC/DC", itemCode: "MAT_POWR_002", currentStock: 40, reorderPoint: 35, daysUntilStockout: 31.0, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'RJ' },
    { item: "Placa de Circuito TX/RX", itemCode: "MAT_ELET_015", currentStock: 15, reorderPoint: 40, daysUntilStockout: 5.3, level: AlertLevel.CRITICAL, recommendation: "Compra emergencial", stateId: 'SP' },
    { item: "Switch Gerenciável L2", itemCode: "MAT_NETW_004", currentStock: 8, reorderPoint: 20, daysUntilStockout: 6.1, level: AlertLevel.CRITICAL, recommendation: "Compra emergencial", stateId: 'RS' },
    { item: "Caixa de Emenda Óptica", itemCode: "MAT_CEOP_009", currentStock: 110, reorderPoint: 90, daysUntilStockout: 18.0, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'PR' },
    { item: "Módulo SFP+ 10G", itemCode: "MAT_SFP_10G", currentStock: 55, reorderPoint: 70, daysUntilStockout: 11.5, level: AlertLevel.WARNING, recommendation: "Comprar 50 unidades", stateId: 'SP' },
    { item: "Gabinete Outdoor 42U", itemCode: "MAT_GAB_001", currentStock: 12, reorderPoint: 10, daysUntilStockout: 45.0, level: AlertLevel.NORMAL, recommendation: "Monitorar estoque", stateId: 'SC' }
];

interface DashboardProps {
    searchTerm: string;
    onSelectAlert: (stateId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ searchTerm, onSelectAlert }) => {
    const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
    const [statusFilter, setStatusFilter] = useState<AlertLevel | null>(null);
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [insightModalAlert, setInsightModalAlert] = useState<Alert | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setForecastData(generateMockForecastData());
    }, []);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            setForecastData(generateMockForecastData());
            setLastRefresh(new Date());
            addToast('Dados atualizados com sucesso', 'success');
        } catch (error) {
            addToast('Erro ao atualizar dados', 'error');
        } finally {
            setIsRefreshing(false);
        }
    }, [addToast]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshData]);

    const handleStatusSelect = (level: AlertLevel) => {
        setStatusFilter(prev => prev === level ? null : level);
    }

    const handleOpenInsightModal = (alert: Alert) => {
        setInsightModalAlert(alert);
        setIsInsightModalOpen(true);
    };

    const formatLastRefresh = () => {
        const diff = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
        if (diff < 60) return `há ${diff}s`;
        const minutes = Math.floor(diff / 60);
        return `há ${minutes}min`;
    };

    const filteredAlerts = useMemo(() => {
        return mockAlertsData.filter(alert => {
            const matchesSearch = !searchTerm || 
                alert.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = !statusFilter || alert.level === statusFilter;

            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, statusFilter]);

    const operationalStatusData = useMemo(() => {
        const counts = mockAlertsData.reduce((acc, alert) => {
            acc[alert.level] = (acc[alert.level] || 0) + 1;
            return acc;
        }, {} as Record<AlertLevel, number>);
        
        return [
            { name: 'Crítico', value: counts.CRITICAL || 0, level: AlertLevel.CRITICAL },
            { name: 'Atenção', value: counts.WARNING || 0, level: AlertLevel.WARNING },
            { name: 'Normal', value: counts.NORMAL || 0, level: AlertLevel.NORMAL },
        ];
    }, []);

    return (
        <div className="w-full space-y-6">
            {/* Dashboard Header with Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
                <div>
                    <h2 className="text-xl font-bold text-brand-lightest-slate mb-1">Visão Geral</h2>
                    <p className="text-sm text-brand-slate">Monitoramento em tempo real da operação</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-brand-slate">
                        <ClockIcon className="w-4 h-4" />
                        <span>Atualizado {formatLastRefresh()}</span>
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-brand-light-navy text-brand-cyan hover:bg-brand-navy rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>
                    <button className="px-4 py-2 bg-brand-cyan text-brand-navy hover:bg-opacity-80 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm">
                        <DownloadIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards with Enhanced Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiMetrics.map((kpi, index) => (
                     <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <KpiCard data={kpi} />
                     </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <DemandForecastChart data={forecastData} />
                </div>
                <div className="lg:col-span-1 animate-fade-in-up flex flex-col min-h-0" style={{ animationDelay: '500ms' }}>
                    <OperationalStatus data={operationalStatusData} onSliceClick={handleStatusSelect} activeFilter={statusFilter}/>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <div className="lg:col-span-2">
                    <AlertsTable 
                        alerts={filteredAlerts} 
                        onSelectAlert={onSelectAlert}
                        onShowInsight={handleOpenInsightModal}
                    />
                </div>
                <div className="lg:col-span-1">
                    <PrescriptiveRecommendationsEnhanced />
                </div>
            </div>
            {isInsightModalOpen && insightModalAlert && (
                <InsightModal 
                    alert={insightModalAlert}
                    onClose={() => setIsInsightModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
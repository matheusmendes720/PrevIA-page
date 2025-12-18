

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Alert, AlertLevel } from '../types';
import Pagination from './Pagination';
import { BellIcon, SparklesIcon } from './icons';

const AlertBadge: React.FC<{ level: AlertLevel }> = ({ level }) => {
  const levelStyles = {
    [AlertLevel.CRITICAL]: 'bg-red-500/20 text-red-400 animate-pulse-glow',
    [AlertLevel.WARNING]: 'bg-yellow-500/20 text-yellow-400',
    [AlertLevel.NORMAL]: 'bg-green-500/20 text-green-400',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelStyles[level]}`}>
      {level}
    </span>
  );
};

interface AlertsTableProps {
  alerts: Alert[];
  onSelectAlert: (stateId: string) => void;
  onShowInsight: (alert: Alert) => void;
}

const ITEMS_PER_PAGE = 6;

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts, onSelectAlert, onShowInsight }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [alerts]);

  const totalPages = Math.ceil(alerts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAlerts = alerts.slice(startIndex, endIndex);

  // Map high-level recommendations to specific alerts to mimic screenshot
  const recommendationTitles: { [key: string]: string } = {
      "MAT_TRNS_5G": "Otimização de Rota de Estoque",
      "MAT_CONN_001": "Manutenção Preditiva",
      "MAT_BATT_003": "Renegociação com Fornecedor",
  };

  return (
    <Card className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-brand-lightest-slate">Alertas Críticos de Estoque</h3>
            <BellIcon className="w-5 h-5 text-red-400" />
        </div>
      <div className="overflow-y-auto flex-grow -mx-6 px-6">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-brand-navy/70 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-sm font-semibold text-brand-slate w-32">Status</th>
              <th className="p-3 text-sm font-semibold text-brand-slate">Ação</th>
              <th className="p-3 text-sm font-semibold text-brand-slate w-20 text-center">Insight</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.map((alert, index) => (
              <tr 
                key={index} 
                className="border-b border-brand-light-navy/50 last:border-b-0 hover:bg-brand-light-navy/30 transition-colors"
              >
                <td className="p-3 align-top">
                  <AlertBadge level={alert.level} />
                </td>
                <td className="p-3 cursor-pointer" onClick={() => onSelectAlert(alert.stateId)}>
                    <p className="font-semibold text-brand-lightest-slate">{recommendationTitles[alert.itemCode] || alert.item}</p>
                    <p className="text-xs text-brand-slate mt-1">{`Estoque: ${alert.currentStock} / PP: ${alert.reorderPoint} | Alerta no estado: ${alert.stateId}`}</p>
                    <p className="text-sm text-brand-light-slate mt-2 font-medium">{alert.recommendation}</p>
                </td>
                <td className="p-3 align-middle text-center">
                    { (alert.level === AlertLevel.CRITICAL || alert.level === AlertLevel.WARNING) &&
                        <button 
                            onClick={() => onShowInsight(alert)}
                            className="p-2 text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full transition-colors"
                            title="Obter Insight Rápido com IA"
                        >
                            <SparklesIcon />
                        </button>
                    }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default AlertsTable;

import React from 'react';
import { Report } from '../types';
import Card from './Card';
import { DownloadIcon } from './icons';
import InventoryPieChart from './InventoryPieChart';

interface ReportPreviewModalProps {
  report: Report;
  onClose: () => void;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ report, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-brand-cyan/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-brand-lightest-slate">{report.name}</h2>
              <p className="text-sm text-brand-slate">Gerado em: {report.date}</p>
            </div>
            <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
          </div>

          <div className="bg-brand-light-navy/30 p-4 rounded-lg">
            {report.summary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="md:border-r border-brand-light-navy pr-6">
                    <h4 className="font-semibold text-brand-light-slate mb-2">{report.summary.metric}</h4>
                    <p className="text-4xl font-bold text-brand-cyan mb-4">{report.summary.value}</p>
                    <p className="text-xs text-brand-slate">
                        Este é um resumo dos dados consolidados para o período do relatório. Para detalhes completos, faça o download do arquivo.
                    </p>
                </div>
                <div>
                    {report.summary.chartData && (
                        <InventoryPieChart title={report.summary.chartTitle} data={report.summary.chartData} />
                    )}
                </div>
              </div>
            ) : (
              <p className="text-brand-slate text-center py-16">Nenhum resumo disponível para este relatório.</p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 flex items-center space-x-2">
              <DownloadIcon />
              <span>Download Completo</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
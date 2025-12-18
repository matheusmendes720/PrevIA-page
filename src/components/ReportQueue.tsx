
import React from 'react';
import Card from './Card';
import { Report, ReportStatus } from '../types';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from './icons';

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-brand-light-navy/50 rounded-full h-1.5 mt-1">
    <div className="bg-brand-cyan h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
  </div>
);

const QueueStatusIcon: React.FC<{ status: ReportStatus }> = ({ status }) => {
    const iconMap = {
        [ReportStatus.PROCESSING]: <ClockIcon className="w-5 h-5 text-brand-cyan animate-spin" />,
        [ReportStatus.PENDING]: <ClockIcon className="w-5 h-5 text-yellow-400" />,
        [ReportStatus.FAILED]: <XCircleIcon className="w-5 h-5 text-red-400" />,
        [ReportStatus.COMPLETED]: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    };
    return iconMap[status] || null;
}

const ReportQueue: React.FC<{ reports: Report[] }> = ({ reports }) => {
  return (
    <Card className="h-full">
      <h3 className="text-lg font-bold text-brand-lightest-slate mb-4">Fila de Geração</h3>
      <div className="space-y-4">
        {reports.length > 0 ? reports.map(report => (
          <div key={report.id} className="flex items-start space-x-3">
            <div className="pt-0.5"><QueueStatusIcon status={report.status} /></div>
            <div>
              <p className="text-sm font-semibold text-brand-light-slate leading-tight">{report.name}</p>
              <p className="text-xs text-brand-slate">
                {report.status === ReportStatus.PROCESSING ? `Processando... ${report.progress}%` : 
                 report.status === ReportStatus.PENDING ? 'Na fila' : 
                 'Falhou'}
              </p>
              {report.status === ReportStatus.PROCESSING && report.progress !== undefined && <ProgressBar progress={report.progress} />}
            </div>
          </div>
        )) : (
            <p className="text-sm text-brand-slate text-center py-8">Nenhum relatório na fila.</p>
        )}
      </div>
    </Card>
  );
};

export default ReportQueue;
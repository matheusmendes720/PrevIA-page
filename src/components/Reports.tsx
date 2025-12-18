

import React, { useMemo, useState } from 'react';
import Card from './Card';
import { Report, ReportStatus } from '../types';
import { DownloadIcon, EyeIcon, CalendarIcon, StarIcon, TrashIcon, RefreshIcon } from './icons';
import ReportPreviewModal from './ReportPreviewModal';
import FavoriteReports from './FavoriteReports';
import ReportQueue from './ReportQueue';
import GenerateReportModal from './GenerateReportModal';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../hooks/useToast';

const initialReportsData: Report[] = [
  { 
    id: 'REP001', name: 'Relatório Mensal de Inventário', date: '01/07/2024', type: 'Inventário', status: ReportStatus.COMPLETED, isFavorite: true,
    summary: {
      metric: 'Valor Total do Estoque',
      value: 'R$ 4.8M',
      chartTitle: 'Distribuição por Categoria',
      chartData: [
        { name: 'Cabos', value: 1200000 },
        { name: 'Equipamentos Ativos', value: 2500000 },
        { name: 'Hardware', value: 800000 },
        { name: 'Outros', value: 300000 },
      ]
    }
  },
  { 
    id: 'REP002', name: 'Análise de Acurácia da Previsão - Q2', date: '30/06/2024', type: 'Previsão', status: ReportStatus.COMPLETED, isFavorite: true,
    summary: {
      metric: 'Acurácia Média',
      value: '92.7%',
      chartTitle: 'Desvio Médio por Região (%)',
      chartData: [
        { name: 'Sudeste', value: 6.5 },
        { name: 'Nordeste', value: 8.2 },
        { name: 'Norte', value: 10.1 },
        { name: 'Sul', value: 7.3 },
        { name: 'Centro-Oeste', value: 9.5 },
      ]
    }
  },
  { 
    id: 'REP003', name: 'Relatório de Nível de Serviço', date: '28/06/2024', type: 'Performance', status: ReportStatus.COMPLETED, isFavorite: false,
    summary: {
      metric: 'Nível de Serviço (SLA)',
      value: '98.2%',
      chartTitle: 'Atendimento de SLA por Categoria (%)',
      chartData: [
        { name: 'Instalação', value: 99.1 },
        { name: 'Manutenção Preventiva', value: 99.8 },
        { name: 'Manutenção Corretiva', value: 96.5 },
        { name: 'Suporte Técnico', value: 97.9 },
      ]
    }
  },
  { id: 'REP004', name: 'Relatório Semanal de Alertas', date: '05/07/2024', type: 'Alertas', status: ReportStatus.PROCESSING, progress: 75 },
  { id: 'REP005', name: 'Análise de Custo de Estoque', date: '25/06/2024', type: 'Financeiro', status: ReportStatus.FAILED },
  { 
    id: 'REP006', name: 'Relatório de Performance de Fornecedores', date: '20/06/2024', type: 'Fornecedores', status: ReportStatus.COMPLETED, isFavorite: true,
    summary: {
      metric: 'Lead Time Médio',
      value: '18.2 dias',
      chartTitle: 'Confiabilidade de Entrega (%)',
      chartData: [
        { name: 'Fornecedor A', value: 98.5 },
        { name: 'Fornecedor B', value: 92.3 },
        { name: 'Fornecedor C', value: 95.0 },
        { name: 'Fornecedor D', value: 89.1 },
        { name: 'Fornecedor E', value: 99.1 },
      ]
    }
  },
  { id: 'REP007', name: 'Relatório de Manutenções Preventivas', date: '06/07/2024', type: 'Manutenção', status: ReportStatus.PROCESSING, progress: 40 },
  { id: 'REP008', name: 'Auditoria de Segurança Trimestral', date: '07/07/2024', type: 'Segurança', status: ReportStatus.PENDING },
];

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-brand-light-navy/50 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-brand-cyan h-2.5 rounded-full transition-all duration-500" 
          style={{ 
            width: `${progress}%`,
            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`,
            backgroundSize: `40px 40px`,
          }}
        ></div>
    </div>
);

const StatusDisplay: React.FC<{ report: Report }> = ({ report }) => {
  const statusStyles: Record<ReportStatus, string> = {
    [ReportStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
    [ReportStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
    [ReportStatus.PROCESSING]: 'text-brand-cyan',
    [ReportStatus.FAILED]: 'bg-red-500/20 text-red-400',
  };
  const statusText: Record<ReportStatus, string> = {
    [ReportStatus.COMPLETED]: 'Concluído',
    [ReportStatus.PENDING]: 'Na Fila',
    [ReportStatus.PROCESSING]: 'Processando',
    [ReportStatus.FAILED]: 'Falhou',
  }

  if (report.status === ReportStatus.PROCESSING && report.progress !== undefined) {
      return (
          <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-brand-cyan whitespace-nowrap">{report.progress}%</span>
              <ProgressBar progress={report.progress} />
          </div>
      )
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[report.status]}`}>
      {statusText[report.status]}
    </span>
  );
};

interface ReportsProps {
    searchTerm: string;
}

const Reports: React.FC<ReportsProps> = ({ searchTerm }) => {
  const { addToast } = useToast();
  const [reportsData, setReportsData] = useState<Report[]>(initialReportsData);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState<Report | null>(null);
  const [reportType, setReportType] = useState('Todos');

  const filteredReports = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    return reportsData.filter(report => {
        const matchesSearch = !searchTerm || 
            report.name.toLowerCase().includes(term) ||
            report.type.toLowerCase().includes(term) ||
            (report.summary && (
                report.summary.metric.toLowerCase().includes(term) ||
                report.summary.value.toLowerCase().includes(term) ||
                report.summary.chartTitle.toLowerCase().includes(term) ||
                (report.summary.chartData && report.summary.chartData.some(d => d.name.toLowerCase().includes(term)))
            ));

        const matchesType = reportType === 'Todos' || report.type === reportType;
        return matchesSearch && matchesType;
    });
  }, [searchTerm, reportType, reportsData]);

  const favoriteReports = useMemo(() => filteredReports.filter(r => r.isFavorite), [filteredReports]);
  const queueReports = useMemo(() => filteredReports.filter(r => r.status === ReportStatus.PROCESSING || r.status === ReportStatus.PENDING || r.status === ReportStatus.FAILED).sort((a,b) => (a.progress || 0) - (b.progress || 0)), [filteredReports]);

  const reportTypes = ['Todos', ...Array.from(new Set(initialReportsData.map(r => r.type)))];

  const handleToggleFavorite = (reportId: string) => {
    setReportsData(prevReports => 
        prevReports.map(report => 
            report.id === reportId ? { ...report, isFavorite: !report.isFavorite } : report
        )
    );
  };

  const handleGenerateReport = (newReport: Omit<Report, 'id' | 'status' | 'date'>) => {
    const report: Report = {
        ...newReport,
        id: `REP${Date.now()}`,
        status: ReportStatus.PENDING,
        date: new Date().toLocaleDateString('pt-BR'),
    }
    setReportsData(prev => [report, ...prev]);
    addToast('Relatório adicionado à fila de geração!', 'success');
    setIsGenerateModalOpen(false);
  };

  const handleOpenDeleteModal = (report: Report) => {
    setDeletingReport(report);
    setIsDeleteModalOpen(true);
  }

  const handleDeleteReport = () => {
    if(deletingReport) {
        setReportsData(prev => prev.filter(r => r.id !== deletingReport.id));
        addToast(`Relatório "${deletingReport.name}" excluído.`, 'error');
        setIsDeleteModalOpen(false);
        setDeletingReport(null);
    }
  }

  const handleRegenerateReport = (report: Report) => {
    setReportsData(prev => prev.map(r => r.id === report.id ? {...r, status: ReportStatus.PENDING, progress: 0} : r));
    addToast(`Relatório "${report.name}" enviado para a fila novamente.`, 'info');
  }

  return (
    <div className="space-y-6">
      <FavoriteReports reports={favoriteReports} onViewReport={setSelectedReport} />
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input type="date" className="bg-brand-light-navy/50 border border-white/10 rounded-lg py-2 px-4 pl-10 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan" />
                    <CalendarIcon className="w-5 h-5 text-brand-slate absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                 <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-brand-light-navy/50 border border-white/10 rounded-lg py-2.5 px-4 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan">
                    {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
             <button onClick={() => setIsGenerateModalOpen(true)} className="bg-brand-cyan text-brand-navy font-bold py-2.5 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 flex items-center space-x-2">
                <span>Gerar Novo Relatório</span>
            </button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <h3 className="text-lg font-bold text-brand-lightest-slate mb-4 px-4 pt-2">Todos os Relatórios</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-brand-navy/70">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-brand-slate w-8"></th>
                        <th className="p-4 text-sm font-semibold text-brand-slate">Nome do Relatório</th>
                        <th className="p-4 text-sm font-semibold text-brand-slate">Data</th>
                        <th className="p-4 text-sm font-semibold text-brand-slate">Tipo</th>
                        <th className="p-4 text-sm font-semibold text-brand-slate text-center">Status</th>
                        <th className="p-4 text-sm font-semibold text-brand-slate text-center">Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredReports.map((report) => (
                        <tr key={report.id} className="border-b border-brand-light-navy/50 last:border-b-0 hover:bg-brand-light-navy/30">
                        <td className="p-4">
                            <button onClick={() => handleToggleFavorite(report.id)} className={`transition-colors ${report.isFavorite ? "text-yellow-400" : "text-brand-slate hover:text-yellow-400"}`}>
                                <StarIcon filled={report.isFavorite} />
                            </button>
                        </td>
                        <td className="p-4 font-medium text-brand-lightest-slate">{report.name}</td>
                        <td className="p-4 text-brand-slate">{report.date}</td>
                        <td className="p-4 text-brand-slate">{report.type}</td>
                        <td className="p-4 text-center min-w-[140px]"><StatusDisplay report={report} /></td>
                        <td className="p-4">
                            <div className="flex items-center justify-center space-x-1">
                                <button onClick={() => setSelectedReport(report)} className="p-2 text-brand-slate hover:text-brand-cyan transition-colors" title="Visualizar"><EyeIcon /></button>
                                <button className="p-2 text-brand-slate hover:text-brand-cyan transition-colors" title="Download"><DownloadIcon /></button>
                                {report.status === ReportStatus.FAILED && (
                                     <button onClick={() => handleRegenerateReport(report)} className="p-2 text-brand-slate hover:text-yellow-400 transition-colors" title="Gerar Novamente"><RefreshIcon /></button>
                                )}
                                <button onClick={() => handleOpenDeleteModal(report)} className="p-2 text-brand-slate hover:text-red-400 transition-colors" title="Excluir"><TrashIcon /></button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
        <div>
            <ReportQueue reports={queueReports} />
        </div>
      </div>

      {selectedReport && <ReportPreviewModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      {isGenerateModalOpen && <GenerateReportModal reportTypes={reportTypes.filter(t => t !== 'Todos')} onClose={() => setIsGenerateModalOpen(false)} onGenerate={handleGenerateReport} />}
      {isDeleteModalOpen && deletingReport && (
         <ConfirmationModal 
            title="Excluir Relatório"
            message={`Tem certeza que deseja excluir o relatório "${deletingReport.name}"? Esta ação não pode ser desfeita.`}
            onCancel={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteReport}
         />
      )}
    </div>
  );
};

export default Reports;
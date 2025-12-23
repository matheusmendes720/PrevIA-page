import React, { useState } from 'react';
import { FileIcon, PresentationIcon } from './icons';
import { useToast } from '../hooks/useToast';
import { prescriptiveDataService } from '../services/prescriptiveDataService';

interface ExportPrescriptiveReportProps {
  className?: string;
}

/**
 * Export prescriptive insights to PDF or PowerPoint
 */
const ExportPrescriptiveReport: React.FC<ExportPrescriptiveReportProps> = ({ className }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would call a backend service
      // For now, we'll create a downloadable JSON/HTML report
      const insights = await prescriptiveDataService.loadPrescriptiveInsights();
      const comprehensive = await prescriptiveDataService.loadComprehensivePrescriptive();
      
      const reportData = {
        timestamp: new Date().toISOString(),
        insights,
        comprehensive,
        summary: {
          total_families: Object.keys(insights.risk_assessments).length,
          high_risk_count: Object.values(insights.risk_assessments).filter(
            r => r.stockout_risk === 'HIGH' || r.stockout_risk === 'CRITICAL'
          ).length,
          urgent_actions: insights.recommendations.filter(r => r.includes('URGENT')).length,
          roi_estimate: insights.business_impact.roi_estimate,
        },
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescriptive-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast('Relatório exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      addToast('Erro ao exportar relatório', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPowerPoint = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would generate a PowerPoint file
      // For now, we'll show a message
      addToast('Exportação para PowerPoint em desenvolvimento', 'info');
    } catch (error) {
      console.error('Error exporting to PowerPoint:', error);
      addToast('Erro ao exportar para PowerPoint', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-brand-navy rounded-lg font-semibold hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Exportar relatório prescritivo para PDF"
      >
        <FileIcon className="w-4 h-4" />
        {isExporting ? 'Exportando...' : 'Exportar PDF'}
      </button>
      <button
        onClick={exportToPowerPoint}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-brand-light-navy text-brand-lightest-slate rounded-lg font-semibold hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-brand-cyan/40"
        aria-label="Exportar relatório prescritivo para PowerPoint"
      >
        <PresentationIcon className="w-4 h-4" />
        {isExporting ? 'Exportando...' : 'Exportar PPT'}
      </button>
    </div>
  );
};

export default ExportPrescriptiveReport;


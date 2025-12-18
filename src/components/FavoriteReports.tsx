
import React from 'react';
import { Report } from '../types';
import Card from './Card';
import { ReportIcon } from './icons';

interface FavoriteReportsProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
}

const FavoriteReports: React.FC<FavoriteReportsProps> = ({ reports, onViewReport }) => {
  if (reports.length === 0) {
    return null;
  }

  return (
    <div>
        <h2 className="text-lg font-bold text-brand-lightest-slate mb-4">Relatórios Favoritos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {reports.map(report => (
            <Card 
                key={report.id} 
                className="hover:border-brand-cyan/50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => onViewReport(report)}
            >
            <div className="flex items-start space-x-4">
                <div className="bg-brand-light-navy/50 p-2 rounded-lg border border-white/10">
                    <ReportIcon className="w-6 h-6 text-brand-cyan" />
                </div>
                <div>
                    <h3 className="font-semibold text-brand-lightest-slate leading-tight">{report.name}</h3>
                    <p className="text-sm text-brand-slate mt-1">{report.type}</p>

                </div>
            </div>
            </Card>
        ))}
        </div>
    </div>
  );
};

export default FavoriteReports;
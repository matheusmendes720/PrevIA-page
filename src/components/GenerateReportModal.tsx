
import React, { useState } from 'react';
import Card from './Card';
import { Report } from '../types';

interface GenerateReportModalProps {
  onClose: () => void;
  onGenerate: (newReport: Omit<Report, 'id' | 'status' | 'date'>) => void;
  reportTypes: string[];
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ onClose, onGenerate, reportTypes }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(reportTypes[0] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && type) {
      onGenerate({ name, type });
    }
  };
  
  const inputStyles = "w-full bg-brand-light-navy/50 border border-white/10 rounded-lg py-2 px-4 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan";

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" 
      style={{ animationDuration: '0.3s' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-brand-cyan/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-lightest-slate">Gerar Novo Relatório</h2>
            <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-slate mb-1">Nome do Relatório</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className={inputStyles}
                placeholder="Ex: Relatório de Inventário Q3"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-brand-slate mb-1">Tipo de Relatório</label>
              <select 
                id="type" 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                required 
                className={inputStyles}
              >
                {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
             <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="bg-brand-light-navy/50 text-brand-lightest-slate font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-opacity">
                Cancelar
              </button>
              <button type="submit" className="bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40">
                Gerar
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default GenerateReportModal;

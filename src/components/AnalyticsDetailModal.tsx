
import React from 'react';
import Card from './Card';
import { InventoryItem, Supplier } from '../types';

interface AnalyticsDetailModalProps {
  title: string;
  data: any[];
  type: 'inventory' | 'supplier';
  onClose: () => void;
}

const InventoryTable: React.FC<{ items: InventoryItem[] }> = ({ items }) => (
    <table className="w-full text-left">
        <thead className="border-b border-white/10">
            <tr>
                <th className="p-2 text-xs font-semibold text-brand-slate">Item</th>
                <th className="p-2 text-xs font-semibold text-brand-slate text-right">Quantidade</th>
                <th className="p-2 text-xs font-semibold text-brand-slate text-right">Valor</th>
            </tr>
        </thead>
        <tbody>
            {items.map(item => (
                <tr key={item.id} className="border-b border-white/5 last:border-b-0">
                    <td className="p-2 text-sm text-brand-lightest-slate">{item.name}</td>
                    <td className="p-2 text-sm text-brand-light-slate text-right">{item.quantity.toLocaleString('pt-BR')}</td>
                    <td className="p-2 text-sm text-brand-light-slate text-right">{item.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const SupplierDetails: React.FC<{ suppliers: Supplier[] }> = ({ suppliers }) => (
    <div className="space-y-4">
        {suppliers.map(supplier => (
            <div key={supplier.id} className="p-3 bg-brand-light-navy/30 rounded-lg">
                <p className="font-bold text-brand-lightest-slate">{supplier.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-brand-slate">Lead Time Médio</p>
                        <p className="font-semibold text-brand-light-slate">{supplier.avgLeadTime} dias</p>
                    </div>
                     <div>
                        <p className="text-brand-slate">Confiabilidade</p>
                        <p className="font-semibold text-brand-light-slate">{supplier.reliability}%</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const AnalyticsDetailModal: React.FC<AnalyticsDetailModalProps> = ({ title, data, type, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" 
        style={{ animationDuration: '0.3s' }}
        onClick={onClose}
    >
      <div 
        className="w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-brand-cyan/50 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-brand-lightest-slate">{title}</h2>
            <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
          </div>
          <div className="overflow-y-auto pr-2 -mr-2">
            {type === 'inventory' && <InventoryTable items={data as InventoryItem[]} />}
            {type === 'supplier' && <SupplierDetails suppliers={data as Supplier[]} />}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDetailModal;

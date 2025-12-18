

import React from 'react';
import Card from './Card';
import { PrescriptiveRecommendation } from '../types';
import { LightBulbIcon, ShieldCheckIcon, CurrencyDollarIcon } from './icons';

const mockRecommendations: PrescriptiveRecommendation[] = [
    {
        id: 'rec01',
        title: 'Antecipar Pedido 5G',
        priority: 'Medium',
        description: 'Aumentar estoque de Transceptores 5G em 30%: Previsão de expansão nacional 5G-SA para Q1 2025.',
        impact: 'Garantir disponibilidade',
        estimatedSavings: 'R$ 250.000'
    },
    {
        id: 'rec02',
        title: 'Monitorar Corrosão',
        priority: 'Low',
        description: 'Inspecionar torres costeiras no Nordeste: Alto índice de corrosão registrado em períodos de alta umidade.',
        impact: 'Prevenir falhas estruturais',
        estimatedSavings: 'R$ 85.000'
    },
    {
        id: 'rec03',
        title: 'Otimização de Rota de Estoque',
        priority: 'High',
        description: 'Transferir 50 unidades de Conector Óptico de SP para RJ para balancear estoque e evitar ruptura.',
        impact: 'Reduzir custos de frete',
        estimatedSavings: 'R$ 35.000'
    }
];

const PriorityBadge: React.FC<{ priority: PrescriptiveRecommendation['priority'] }> = ({ priority }) => {
    const styles = {
        'High': 'bg-red-500/20 text-red-400',
        'Medium': 'bg-yellow-500/20 text-yellow-400',
        'Low': 'bg-blue-500/20 text-blue-400',
    };
     const text = {
        'High': 'Alta',
        'Medium': 'Média',
        'Low': 'Baixa',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${styles[priority]}`}>{text[priority]}</span>
}


const PrescriptiveRecommendations: React.FC = () => {
    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-brand-lightest-slate">Dicas Preditivas</h3>
                <LightBulbIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow -mr-2">
                {mockRecommendations.map(rec => (
                    <div key={rec.id} className="p-4 bg-brand-light-navy/40 rounded-lg transition-all hover:bg-brand-light-navy/60">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-brand-light-slate leading-tight">{rec.title}</h4>
                            <PriorityBadge priority={rec.priority} />
                        </div>
                        <p className="text-sm text-brand-slate mb-3">{rec.description}</p>
                        <div className="text-xs text-brand-slate space-y-2 border-t border-white/10 pt-3">
                            <div className="flex items-center space-x-2">
                                <ShieldCheckIcon className="w-4 h-4 text-brand-cyan" />
                                <span><strong>Impacto:</strong> {rec.impact}</span>
                            </div>
                             <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                                <span><strong>Economia Est.:</strong> {rec.estimatedSavings}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default PrescriptiveRecommendations;
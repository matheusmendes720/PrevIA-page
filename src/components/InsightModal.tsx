
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Alert } from '../types';
import Card from './Card';
import { SparklesIcon } from './icons';

interface InsightModalProps {
    alert: Alert;
    onClose: () => void;
}

const parseMarkdown = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
};

const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-3 bg-brand-light-navy rounded w-full"></div>
        <div className="h-3 bg-brand-light-navy rounded w-5/6"></div>
        <div className="h-3 bg-brand-light-navy rounded w-full"></div>
        <div className="h-3 bg-brand-light-navy rounded w-4/6"></div>
    </div>
);

const InsightModal: React.FC<InsightModalProps> = ({ alert, onClose }) => {
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const generateInsight = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
                    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable not set");
                }
                
                const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const prompt = `
                    Analise o seguinte alerta de inventário e forneça um insight rápido e acionável em um parágrafo conciso (2-3 sentenças).
                    Explique a urgência com base nos dados e sugira a ação imediata mais apropriada.
                    
                    Formato da Resposta: Texto simples, sem markdown.

                    Dados do Alerta:
                    - Item: ${alert.item} (${alert.itemCode})
                    - Nível do Alerta: ${alert.level}
                    - Estoque Atual: ${alert.currentStock}
                    - Ponto de Pedido: ${alert.reorderPoint}
                    - Dias até a Ruptura: ${alert.daysUntilStockout}
                    - Recomendação do Sistema: ${alert.recommendation}
                    - Estado: ${alert.stateId}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                setInsight(text || '');

            } catch (err: any) {
                console.error("Error generating AI insight:", err);
                const errorMessage = err?.message || 'Erro desconhecido';
                setError(`Falha ao gerar o insight: ${errorMessage}. Verifique o console para mais detalhes.`);
            } finally {
                setLoading(false);
            }
        };

        generateInsight();
    }, [alert]);

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
                <Card className="border-brand-cyan/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                             <SparklesIcon className="w-6 h-6 text-yellow-400" />
                             <div>
                                <h2 className="text-xl font-bold text-brand-lightest-slate">Insight Rápido de IA</h2>
                                <p className="text-sm text-brand-slate">{alert.item} - {alert.itemCode}</p>
                             </div>
                        </div>
                        <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
                    </div>

                    <div className="bg-brand-light-navy/30 p-4 rounded-lg min-h-[100px] text-sm text-brand-light-slate">
                        <p className="font-semibold text-brand-lightest-slate mb-3 pb-3 border-b border-white/10">
                            {`Alerta de ${alert.level === 'CRITICAL' ? 'estoque crítico' : 'estoque baixo'} para ${alert.item} no estado de ${alert.stateId}.`}
                        </p>
                        {loading && <SkeletonLoader />}
                        {error && <p className="text-red-400">{error}</p>}
                        {!loading && !error && insight}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InsightModal;

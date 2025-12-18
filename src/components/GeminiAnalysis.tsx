

import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StateData } from '../types';
import Card from './Card';
import { LightBulbIcon } from './icons';

interface GeminiAnalysisProps {
    stateData: StateData;
    onClose: () => void;
}

// Simple Markdown to HTML parser
const parseMarkdown = (text: string) => {
    let html = text;
    // Headers (e.g., ### Title)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-brand-lightest-slate mt-4 mb-2">$1</h3>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Unordered lists
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/<\/li>\n<li/gim, '</li><li'); // Fix spacing between li elements
    html = `<ul>${html}</ul>`.replace(/<ul>\s*<li/g, '<ul><li').replace(/<\/li>\s*<\/ul>/g, '</li></ul>');
    // Clean up empty ul tags that might result from the replacements
    html = html.replace(/<ul><\/ul>/g, '');
    // Newlines
    html = html.replace(/\n/g, '<br />').replace(/<\/li><br \/>/g, '</li>');
    html = html.replace(/<\/h3><br \/>/g, '</h3>');
    
    return html;
};

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-brand-light-navy rounded w-3/4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-brand-light-navy rounded"></div>
            <div className="h-3 bg-brand-light-navy rounded w-5/6"></div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-brand-light-navy rounded"></div>
            <div className="h-3 bg-brand-light-navy rounded w-4/6"></div>
        </div>
    </div>
);


const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ stateData, onClose }) => {
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateAnalysis = async () => {
            setLoading(true);
            setError(null);
            setAnalysis('');

            try {
                if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
                  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY environment variable not set");
                }
                
                const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const prompt = `
                    Como um analista de operações de telecomunicações sênior, forneça um resumo executivo conciso para o estado de ${stateData.name}.
                    Com base nos seguintes dados JSON, analise a saúde operacional e forneça um resumo cobrindo:
                    1.  **Status Geral:** Uma visão geral da situação atual.
                    2.  **Principais Riscos:** Identifique os 2-3 principais riscos críticos (ex: falta de estoque, atrasos em projetos, baixo desempenho de fornecedores).
                    3.  **Oportunidades:** Destaque quaisquer áreas potenciais para melhoria ou otimização.
                    4.  **Recomendações:** Sugira 1-2 ações claras e práticas.

                    Use títulos com ### para cada seção (ex: ### Status Geral).
                    Use **texto em negrito** para ênfase.
                    Use listas com hífens (-) para os itens dentro de cada seção.
                    Formate a resposta inteiramente em Markdown, sem usar blocos de código.

                    Dados JSON:
                    ${JSON.stringify(stateData, null, 2)}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                setAnalysis(text || '');

            } catch (err: any) {
                console.error("Error generating AI analysis:", err);
                const errorMessage = err?.message || 'Erro desconhecido';
                setError(`Falha ao gerar a análise: ${errorMessage}. Verifique o console para mais detalhes.`);
            } finally {
                setLoading(false);
            }
        };

        generateAnalysis();
    }, [stateData]);

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold text-brand-lightest-slate">Análise de IA para {stateData.name}</h3>
                </div>
                <button onClick={onClose} className="text-2xl text-brand-slate hover:text-white transition-colors">&times;</button>
            </div>
            <div className="p-4 bg-brand-light-navy/30 rounded-lg min-h-[200px] prose prose-sm max-w-none">
                {loading && <SkeletonLoader />}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && !error && analysis && (
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }} />
                )}
            </div>
        </Card>
    );
};

export default GeminiAnalysis;
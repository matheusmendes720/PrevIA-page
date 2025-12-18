
import React, { useState, useRef } from 'react';
import Card from './Card';
import BrazilMap from './BrazilMap';
import { StateData } from '../types';
import StateDetailsPanel from './StateDetailsPanel';
import { XCircleIcon } from './icons';

const Tooltip: React.FC<{ data: StateData | null; style: React.CSSProperties, visible: boolean }> = ({ data, style, visible }) => {
    if (!data || !visible) return null;

    const categoryText = {
        consolidated: 'Área Consolidada',
        expansion: 'Área de Expansão',
    };
    
    const categoryClass = {
        consolidated: 'text-brand-cyan',
        expansion: 'text-yellow-400',
    }

    return (
        <div
            className="absolute z-10 p-4 transition-opacity duration-200 pointer-events-none glass-card rounded-lg shadow-2xl text-sm w-max"
            style={style}
        >
            <h4 className="font-bold text-base text-brand-lightest-slate">{data.name}</h4>
            <p className={`font-semibold ${categoryClass[data.category]}`}>{categoryText[data.category]}</p>
            <div className="mt-2 space-y-1 text-brand-light-slate">
                <p><strong>Torres Ativas:</strong> {data.towers.toLocaleString('pt-BR')}</p>
                <p><strong>Manutenções:</strong> {data.maintenance.toLocaleString('pt-BR')}</p>
                <p><strong>Projetos:</strong> {data.projects.toLocaleString('pt-BR')}</p>
            </div>
        </div>
    );
};

interface InteractiveMapProps {
    stateData: Record<string, StateData>;
    selectedState: string | null;
    onStateClick: (stateId: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ stateData, selectedState, onStateClick }) => {
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapContainerRef.current) return;

        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const style: React.CSSProperties = { transform: 'translate(15px, 15px)'}; // Default offset
        
        const tooltipWidth = 220;
        
        if (x > rect.width / 2) {
             style.transform = `translate(-${tooltipWidth + 15}px, 15px)`;
        }
        if (y > rect.height / 2) {
            style.transform = (style.transform || '').replace('15px', '-110%');
        }

        style.left = x;
        style.top = y;

        setTooltipStyle(style);
    };

    const hasSelection = selectedState !== null;

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-brand-lightest-slate">Mapa de Cobertura e Operações</h3>
                    {selectedState && (
                        <button
                          onClick={() => onStateClick(selectedState)}
                          className="flex items-center gap-1.5 text-sm text-brand-slate hover:text-brand-lightest-slate transition-colors bg-brand-light-navy/50 hover:bg-brand-light-navy px-3 py-1 rounded-full"
                          title="Limpar seleção"
                        >
                          <XCircleIcon className="w-5 h-5" />
                          <span>Limpar Seleção</span>
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-md bg-[#0d4b55]/80 border border-brand-cyan"></div>
                        <span className="text-brand-slate">Área Consolidada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-md bg-[#149193]/80 border border-brand-cyan"></div>
                        <span className="text-brand-slate">Área de Expansão</span>
                    </div>
                </div>
            </div>
            <div className={`grid grid-cols-1 ${hasSelection ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6`}>
                <div 
                    ref={mapContainerRef}
                    className={`${hasSelection ? 'lg:col-span-1' : 'lg:col-span-3'} relative min-h-[400px] lg:min-h-[550px] transition-all duration-300 ease-in-out cursor-pointer`}
                    onMouseMove={handleMouseMove} 
                    onMouseLeave={() => setHoveredState(null)}
                >
                    <div className="absolute inset-0 p-4">
                        <BrazilMap
                            hoveredState={hoveredState}
                            onStateHover={setHoveredState}
                            stateData={stateData}
                            selectedState={selectedState}
                            onStateClick={onStateClick}
                        />
                    </div>
                    <Tooltip data={hoveredState ? stateData[hoveredState] : null} style={tooltipStyle} visible={!selectedState} />
                </div>
                <div className={`${hasSelection ? 'lg:col-span-1' : 'lg:col-span-1'} transition-all duration-300 ease-in-out`}>
                    <StateDetailsPanel stateData={selectedState ? stateData[selectedState] : null} />
                </div>
            </div>
        </Card>
    );
};

export default InteractiveMap;
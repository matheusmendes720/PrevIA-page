import React from 'react';
import { StateData } from '../types';

interface BrazilMapProps {
    hoveredState: string | null;
    onStateHover: (stateId: string | null) => void;
    stateData: Record<string, StateData>;
    selectedState: string | null;
    onStateClick: (stateId: string) => void;
}

const stylizedStatesPaths: Record<string, string> = {
    'RR': "M242,53 L230,77 L202,79 L194,59 L214,48 Z",
    'AP': "M319,62 L297,84 L265,71 L274,43 L303,44 Z",
    'AM': "M203,85 L135,108 L111,158 L142,183 L203,166 L226,122 Z",
    'AC': "M103,172 L82,190 L102,217 L128,200 Z",
    'RO': "M135,188 L109,222 L145,246 L171,211 Z",
    'PA': "M291,91 L234,124 L213,178 L235,199 L283,191 L324,141 Z",
    'MT': "M209,181 L150,252 L206,289 L265,243 Z",
    'TO': "M318,206 L273,250 L287,299 L332,279 Z",
    'MA': "M381,148 L330,147 L329,203 L349,235 L391,223 L406,180 Z",
    'PI': "M422,192 L396,229 L402,267 L441,257 L450,214 Z",
    'CE': "M484,188 L455,214 L461,241 L494,230 Z",
    'RN': "M524,200 L499,232 L512,246 L536,228 Z",
    'PB': "M532,233 L515,250 L527,268 L547,256 Z",
    'PE': "M520,255 L467,247 L461,281 L504,291 L520,274 Z",
    'AL': "M510,296 L493,313 L505,329 L522,317 Z",
    'SE': "M486,316 L468,330 L480,347 L498,334 Z",
    'BA': "M462,286 L395,274 L378,311 L411,358 L465,327 Z",
    'GO': "M281,305 L220,295 L222,354 L278,367 Z",
    'DF': "M289,332 L278,341 L287,352 L298,343 Z",
    'MS': "M214,360 L166,311 L145,348 L160,396 L212,398 Z",
    'MG': "M371,316 L284,373 L302,423 L355,414 L387,366 Z",
    'ES': "M394,374 L360,418 L378,438 L406,416 Z",
    'SP': "M295,428 L221,406 L216,458 L284,478 Z",
    'RJ': "M350,420 L310,428 L320,458 L357,449 Z",
    'PR': "M278,484 L210,464 L221,511 L272,521 Z",
    'SC': "M278,526 L228,516 L237,549 L281,552 Z",
    'RS': "M275,557 L230,555 L204,505 L179,534 L217,585 L272,586 Z",
};

const stylizedStateLabels: Record<string, { x: number, y: number }> = {
    AC: { x: 105, y: 195 }, AM: { x: 170, y: 135 }, RR: { x: 218, y: 65 }, AP: { x: 290, y: 60 }, PA: { x: 270, y: 150 },
    RO: { x: 140, y: 220 }, MT: { x: 205, y: 240 }, TO: { x: 300, y: 250 }, MA: { x: 370, y: 190 }, PI: { x: 425, y: 230 },
    CE: { x: 475, y: 215 }, RN: { x: 520, y: 220 }, PB: { x: 535, y: 250 }, PE: { x: 495, y: 270 }, AL: { x: 510, y: 310 },
    SE: { x: 485, y: 330 }, BA: { x: 420, y: 315 }, GO: { x: 250, y: 335 }, DF: { x: 290, y: 340 }, MS: { x: 180, y: 360 },
    MG: { x: 340, y: 375 }, ES: { x: 385, y: 405 }, SP: { x: 260, y: 445 }, RJ: { x: 335, y: 440 }, PR: { x: 250, y: 500 },
    SC: { x: 255, y: 535 }, RS: { x: 240, y: 570 }
};

const connectorLines: string[] = [
    "M325,244 L378,311",
    "M250,315 L281,305",
    "M406,180 L450,214 L484,188",
];

const BrazilMap: React.FC<BrazilMapProps> = ({ hoveredState, onStateHover, stateData, selectedState, onStateClick }) => {
    return (
        <svg viewBox="70 0 550 600" className="w-full h-full">
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#64ffda" floodOpacity="0.8" />
                </filter>

                <linearGradient id="grad-consolidated" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d4b55" />
                    <stop offset="100%" stopColor="#052c33" />
                </linearGradient>

                <linearGradient id="grad-expansion" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64ffda" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#149193" />
                </linearGradient>

                <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#233554" />
                    <stop offset="100%" stopColor="#112240" />
                </linearGradient>

                <filter id="inner-glow">
                    <feGaussianBlur stdDeviation="2" in="SourceAlpha" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="out" result="inner-glow" />
                </filter>
            </defs>
            <g>
                <g className="opacity-70">
                    {connectorLines.map((d, i) => (
                        <path key={`connector-${i}`} d={d} className="stroke-cyan-500/80 stroke-2 fill-none" />
                    ))}
                </g>
                {Object.entries(stylizedStatesPaths).map(([id, d]) => {
                    const data = stateData[id];
                    const category = data?.category || 'default';

                    const categoryStyles = {
                        consolidated: { fill: "url(#grad-consolidated)", stroke: "#64ffda", class: "opacity-90" },
                        expansion: { fill: "url(#grad-expansion)", stroke: "#64ffda", class: "opacity-95" },
                        default: { fill: "url(#grad-default)", stroke: "#8892b0", class: "opacity-70" }
                    };

                    const s = categoryStyles[category] || categoryStyles.default;
                    const isSelected = selectedState === id;
                    const isHovered = hoveredState === id;

                    return (
                        <path
                            key={id}
                            id={id}
                            d={d}
                            fill={s.fill}
                            stroke={isSelected || isHovered ? "#64ffda" : s.stroke}
                            strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 1}
                            className={`transition-all duration-300 cursor-pointer ${s.class} ${isHovered ? 'opacity-100' : ''} ${isSelected ? 'opacity-100' : ''}`}
                            filter={isSelected ? "url(#glow)" : isHovered ? "url(#inner-glow)" : "none"}
                            onMouseEnter={() => onStateHover(id)}
                            onMouseLeave={() => onStateHover(null)}
                            onClick={() => onStateClick(id)}
                        />
                    );
                })}
                {Object.entries(stylizedStateLabels).map(([id, { x, y }]) => (
                    <text
                        key={`${id}-label`}
                        x={x}
                        y={y}
                        className="text-[11px] font-bold fill-brand-lightest-slate/80 pointer-events-none"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {id}
                    </text>
                ))}
            </g>
        </svg>
    );
};

export default React.memo(BrazilMap);
/**
 * Simple Mock Data for Temporal Page
 * Matches HTML baseline structure
 */

import type { TemporalFeaturePayload } from '../types/temporal.types';

const seasonalityMatrix: number[][] = [
  [0.86, 0.83, 0.63, 0.76, 0.69, 0.52, 0.52], // Jan
  [0.70, 0.55, 0.87, 0.63, 0.77, 0.59, 0.59], // Fev
  [0.61, 0.52, 0.74, 0.69, 0.74, 0.57, 0.58], // Mar
  [0.70, 0.85, 0.55, 0.69, 0.69, 0.71, 0.57], // Abr
  [0.88, 0.51, 0.86, 0.88, 0.69, 0.70, 0.71], // Mai
  [0.87, 0.60, 0.88, 0.69, 0.53, 0.71, 0.64], // Jun
  [0.77, 0.68, 0.64, 0.76, 0.71, 0.68, 0.64], // Jul
  [0.56, 0.84, 0.74, 0.50, 0.65, 0.70, 0.81], // Ago
  [0.75, 0.77, 0.77, 0.80, 0.70, 0.80, 0.89], // Set
  [0.55, 0.82, 0.83, 0.61, 0.56, 0.70, 0.70], // Out
  [0.72, 0.82, 0.83, 0.58, 0.66, 0.63, 0.78], // Nov
  [0.55, 0.81, 0.59, 0.77, 0.78, 0.70, 0.87]  // Dez
];

const cyclicalSamples = Array(24).fill(0).map((_, i) => ({
  label: `${i}h`,
  value: i,
  sin: Math.sin((i / 24) * 2 * Math.PI),
  cos: Math.cos((i / 24) * 2 * Math.PI)
}));

const forecastSlices = Array(60).fill(0).map((_, i) => {
  const base = 500 + Math.sin((i / 60) * Math.PI) * 200;
  const noise = Math.sin(i * 0.7) * 20;
  return {
    date: new Date(2025, 9, 19 + i).toISOString().split('T')[0],
    actual: Math.round(base + noise),
    predicted: Math.round(base + Math.sin(i * 0.5) * 15)
  };
});

export const mockPayload: TemporalFeaturePayload = {
  events: [
    {
      id: 'carnival',
      date: '2025-02-15',
      label: 'Carnaval',
      impactScore: -0.5,
      demandDelta: -30,
      narrative: 'Períodos festivos reduzem atividades operacionais, seguidos de recuperação forte',
      recommendedActions: ['Aumentar estoque preventivo 30%', 'Reduzir expedições', 'Preparar para pico pós-feriado']
    },
    {
      id: 'easter',
      date: '2025-04-20',
      label: 'Páscoa',
      impactScore: -0.4,
      demandDelta: -22,
      narrative: 'Feriado prolongado reduz operações; oportunidade para manutenção preventiva.',
      recommendedActions: ['Planejar paradas', 'Revisar pipeline pós-feriado', 'Escalonar equipes de plantão']
    },
    {
      id: 'summer-peak',
      date: '2025-01-25',
      label: 'Pico de Verão',
      impactScore: 0.5,
      demandDelta: 60,
      narrative: 'Alta de consumo de dados e calor afetando equipamentos.',
      recommendedActions: ['Reforçar refrigeração', 'Aumentar estoque de ventilação/UPS', 'Monitorar SLAs em capitais']
    },
    {
      id: 'rainy-season',
      date: '2025-11-01',
      label: 'Estação Chuvosa',
      impactScore: 0.4,
      demandDelta: 40,
      narrative: 'Chuvas aumentam corrosão, multiplicando demanda por manutenção preventiva',
      recommendedActions: ['Aumentar itens de corrosão 40%', 'Reforçar equipes de campo', 'SLA crítico'],
      duration: {
        start: '2025-10-15',
        end: '2025-12-15',
        durationDays: 62
      }
    },
    {
      id: 'black-friday',
      date: '2025-11-29',
      label: 'Black Friday',
      impactScore: 0.74,
      demandDelta: 105,
      narrative: 'Recorde tráfego mobile: demanda 5G em pico.',
      recommendedActions: ['Pre-order MATERIAL_ELETRICO até 01/11', 'Reservar capacidade fornecedores', 'Reforçar estoque crítico']
    },
    {
      id: 'maintenance-cycle',
      date: '2025-03-10',
      label: 'Janela de Manutenção',
      impactScore: -0.2,
      demandDelta: -12,
      narrative: 'Janela programada para atualizações de rede e inspeções.',
      recommendedActions: ['Concentrar manutenção preventiva', 'Avisar equipes de campo', 'Sincronizar logística de peças'],
      duration: {
        start: '2025-03-05',
        end: '2025-03-12',
        durationDays: 8
      }
    },
    {
      id: 'year-end',
      date: '2025-12-20',
      label: 'Natal + Ano Novo',
      impactScore: 0.6,
      demandDelta: 80,
      narrative: 'Festividades com pico de tráfego e logística limitada.',
      recommendedActions: ['Fechar POs antecipados', 'Escalar suporte 24/7', 'Buffers regionais para sites críticos']
    },
    {
      id: 'currency-shock',
      date: '2025-05-18',
      label: 'Choque Cambial',
      impactScore: -0.3,
      demandDelta: -18,
      narrative: 'Alta do dólar pressiona custos importados e reduz demanda.',
      recommendedActions: ['Priorizar fornecedores nacionais', 'Hedge cambial de curto prazo', 'Rever preços e contratos']
    },
    {
      id: '5g-auction',
      date: '2025-06-15',
      label: 'Leilão 5G',
      impactScore: 0.6,
      demandDelta: 90,
      narrative: 'Leilão 5G acelera demanda por equipamentos e materiais.',
      recommendedActions: ['Reservar capacidade com top fornecedores', 'Aumentar estoque de MATERIAL_ELETRICO', 'Negociar frete expresso']
    },
    {
      id: 'logistics-strike',
      date: '2025-09-05',
      label: 'Greve Logística',
      impactScore: -0.45,
      demandDelta: -28,
      narrative: 'Paralisação logística afeta entregas e reposições.',
      recommendedActions: ['Ativar rotas alternativas', 'Priorizar itens críticos regionais', 'Negociar janelas de contingência']
    },
    {
      id: 'cold-wave',
      date: '2025-07-10',
      label: 'Frente Fria',
      impactScore: 0.25,
      demandDelta: 18,
      narrative: 'Frio eleva consumo energético e risco em sites sensíveis.',
      recommendedActions: ['Checar aquecimento/isolamento em sites', 'Aumentar estoque de baterias/UPS', 'Monitorar SLAs em regiões frias']
    }
  ],
  seasonalityMatrix,
  cyclicalSamples,
  forecastSlices,
  summary: {
    nextEvent: {
      id: 'carnival',
      label: 'Carnaval',
      date: '2025-02-15',
      impactScore: -0.5,
      demandDelta: -30,
      narrative: 'Períodos festivos reduzem atividades operacionais, seguidos de recuperação forte',
      recommendedActions: ['Aumentar estoque preventivo 30%', 'Reduzir expedições', 'Preparar para pico pós-feriado']
    },
    confidence: 0.94,
    riskLevel: 'medium'
  }
};


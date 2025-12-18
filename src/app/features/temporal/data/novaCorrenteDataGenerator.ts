/**
 * Nova Corrente Real Business Data Generator
 * Uses actual material families, suppliers, and Brazilian telecom procurement context
 * Based on NOVA_CORRENTE_PRESCRIPTIVE_BRIEF.md real business metrics
 */

import type {
  GeneratedDataset,
  CalendarEvent,
  TimeSeries,
  TimeSeriesPoint,
  AnomalyPoint,
  ChangePoint
} from '../types/temporal.types';
import type { SupplierMetrics } from '../types/leadTime.types';

// Simplified Supplier type for data generation
type Supplier = Omit<SupplierMetrics, 'cost' | 'history'>;

// ==================== REAL NOVA CORRENTE CONFIGURATION ====================

const NOVA_CORRENTE_CONFIG = {
  startDate: '2023-10-01',
  duration: 540, // days (18 months - covers 2023 Q4 through 2025 Q1)
  baseDemand: 850, // Higher base for real telecom operations
  trendRate: 0.125, // 12.5% growth matching MATERIAL_ELETRICO growth
  seasonalAmplitude: 0.42, // 42% seasonal variation (higher for telecom peaks)
  cyclicalAmplitude: 0.18, // 18% weekly cycle
  noiseLevel: 0.12, // 12% noise (real-world volatility)
  anomalyProbability: 0.022, // 2.2% (real supply chain disruptions)
  changePointProbability: 0.004 // 0.4% regime changes
};

// ==================== REAL BRAZILIAN TELECOM SUPPLIERS ====================

const NOVA_CORRENTE_SUPPLIERS: Supplier[] = [
  {
    id: 'furukawa',
    name: 'Furukawa Electric Brasil',
    leadTime: 45,
    leadTimeVariance: 8.5,
    reliability: 92.3,
    riskScore: 0.45,
    category: 'Cabos e Fibra Óptica',
    performanceScore: 87.5,
    slaCompliance: 94.2,
    materials: ['Cabos Ópticos', 'Conectores Fibra', 'Patch Cords']
  },
  {
    id: 'prysmian',
    name: 'Prysmian Telecom Cables',
    leadTime: 38,
    leadTimeVariance: 5.2,
    reliability: 95.8,
    riskScore: 0.28,
    category: 'Infraestrutura',
    performanceScore: 92.1,
    slaCompliance: 96.5,
    materials: ['Cabos Backbone', 'OPGW', 'Drop Cables']
  },
  {
    id: 'commscope',
    name: 'CommScope Brasil',
    leadTime: 52,
    leadTimeVariance: 11.3,
    reliability: 89.2,
    riskScore: 0.62,
    category: 'Equipamentos Rede',
    performanceScore: 83.4,
    slaCompliance: 91.8,
    materials: ['Antenas', 'Conectores RF', 'Jumpers']
  },
  {
    id: 'huawei-brasil',
    name: 'Huawei Technologies Brasil',
    leadTime: 60,
    leadTimeVariance: 14.7,
    reliability: 87.1,
    riskScore: 0.73,
    category: '5G Equipment',
    performanceScore: 85.6,
    slaCompliance: 89.4,
    materials: ['5G Base Stations', 'Core Network', 'Massive MIMO']
  },
  {
    id: 'ericsson-brasil',
    name: 'Ericsson do Brasil',
    leadTime: 42,
    leadTimeVariance: 4.8,
    reliability: 96.4,
    riskScore: 0.22,
    category: 'Core Network',
    performanceScore: 94.7,
    slaCompliance: 97.8,
    materials: ['RAN Equipment', '5G Core', 'Packet Core']
  },
  {
    id: 'nokia-brasil',
    name: 'Nokia Solutions Brasil',
    leadTime: 48,
    leadTimeVariance: 7.1,
    reliability: 94.2,
    riskScore: 0.35,
    category: 'RAN & Transport',
    performanceScore: 90.3,
    slaCompliance: 95.6,
    materials: ['Massive MIMO', 'Small Cells', 'Microwave Links']
  }
];

// ==================== REAL MATERIAL FAMILIES (FROM PRESCRIPTIVE BRIEF) ====================

const MATERIAL_FAMILIES = [
  {
    id: 'material-eletrico',
    name: 'MATERIAL_ELETRICO',
    riskScore: 0.73,
    riskLevel: 'HIGH' as const,
    safetyStockDays: 25,
    reorderMultiplier: 2.23,
    annualRevenue: 45000000, // R$ 45M
    growthRate: 12.5, // 12.5% YoY
    description: '5G equipment, antennas, power systems - critical for network deployment',
    suppliers: ['huawei-brasil', 'ericsson-brasil', 'nokia-brasil']
  },
  {
    id: 'ferro-aco',
    name: 'FERRO_E_AÇO',
    riskScore: 0.77,
    riskLevel: 'HIGH' as const,
    safetyStockDays: 26,
    reorderMultiplier: 2.27,
    annualRevenue: 38000000, // R$ 38M
    growthRate: 8.3,
    description: 'Tower structures, mounting brackets, infrastructure steel',
    suppliers: ['commscope', 'furukawa']
  },
  {
    id: 'epi',
    name: 'EPI',
    riskScore: 0.70,
    riskLevel: 'HIGH' as const,
    safetyStockDays: 25,
    reorderMultiplier: 2.20,
    annualRevenue: 32000000, // R$ 32M
    growthRate: 6.8,
    description: 'Personal protective equipment for field technicians',
    suppliers: ['prysmian', 'commscope']
  },
  {
    id: 'material-civil',
    name: 'MATERIAL_CIVIL',
    riskScore: 0.43,
    riskLevel: 'MEDIUM' as const,
    safetyStockDays: 21,
    reorderMultiplier: 1.93,
    annualRevenue: 28000000, // R$ 28M
    growthRate: 5.2,
    description: 'Concrete, aggregates, construction materials for site preparation',
    suppliers: ['furukawa', 'prysmian']
  },
  {
    id: 'ferramentas-equipamentos',
    name: 'FERRAMENTAS_E_EQUIPAMENTOS',
    riskScore: 0.30,
    riskLevel: 'LOW' as const,
    safetyStockDays: 19,
    reorderMultiplier: 1.80,
    annualRevenue: 22000000, // R$ 22M
    growthRate: 4.1,
    description: 'Tools, test equipment, installation gear',
    suppliers: ['commscope', 'ericsson-brasil']
  }
];

// ==================== BRAZILIAN CALENDAR EVENTS (REAL TELECOM CONTEXT) ====================

const NOVA_CORRENTE_EVENTS: Omit<CalendarEvent, 'historicalData'>[] = [
  {
    id: 'carnival-2024',
    name: 'Carnaval 2024',
    date: '2024-02-13',
    type: 'holiday',
    impactScore: -0.5,
    leadTimeImpact: 3.5,
    demandImpact: -35,
    duration: { start: '2024-02-10', end: '2024-02-18', durationDays: 9 },
    narrative: 'Carnaval paralisa operações. MATERIAL_ELETRICO demanda cai 35%. Logística Brasil parada por 1 semana.',
    recommendedActions: [
      'Aumentar buffer MATERIAL_ELETRICO 40% até 02/03',
      'Ativar Ericsson (lead time 42d) como fornecedor prioritário',
      'Adiar entregas não-críticas para pós-Carnaval'
    ]
  },
  {
    id: 'easter-2024',
    name: 'Semana Santa 2024',
    date: '2024-03-29',
    type: 'holiday',
    impactScore: -0.35,
    leadTimeImpact: 2.2,
    demandImpact: -28,
    duration: { start: '2024-03-28', end: '2024-04-01', durationDays: 5 },
    narrative: 'Feriado prolongado reduz instalações 5G. EPI e FERRAMENTAS_E_EQUIPAMENTOS menos afetados.',
    recommendedActions: [
      'Manutenção preventiva em torres existentes',
      'Revisar pipeline Q2 2024',
      'Negociar com Furukawa entregas antecipadas'
    ]
  },
  {
    id: 'rainy-season-2023',
    name: 'Estação Chuvosa 2023-2024',
    date: '2023-11-15',
    type: 'season',
    impactScore: 0.45,
    leadTimeImpact: 2.1,
    demandImpact: 48,
    duration: { start: '2023-11-01', end: '2024-04-30', durationDays: 182 },
    narrative: 'Chuvas intensas: +48% demanda FERRO_E_AÇO (corrosão torres). MATERIAL_ELETRICO +32% (falhas equipamento).',
    recommendedActions: [
      'FERRO_E_AÇO: Aumentar safety stock de 26 para 38 dias',
      'Monitorar umidade em sites críticos (RJ, AM)',
      'Reforçar SLA com Prysmian e CommScope'
    ]
  },
  {
    id: 'black-friday-2023',
    name: 'Black Friday 2023',
    date: '2023-11-24',
    type: 'custom',
    impactScore: 0.68,
    leadTimeImpact: 5.2,
    demandImpact: 92,
    duration: { start: '2023-11-20', end: '2023-12-08', durationDays: 19 },
    narrative: 'Explosão tráfego online: +92% demanda 5G equipment. Huawei lead time 60→75d. Penalty risk R$ 180K.',
    recommendedActions: [
      'CRÍTICO: Aumentar MATERIAL_ELETRICO safety stock 60%',
      'Ativar Ericsson (42d lead time) como alternativa a Huawei',
      'Negociar express shipping (custo +15%, tempo -40%)',
      'Preparar buffer R$ 2.8M para compras emergenciais'
    ]
  },
  {
    id: 'christmas-2023',
    name: 'Natal 2023',
    date: '2023-12-25',
    type: 'holiday',
    impactScore: 0.55,
    leadTimeImpact: 4.1,
    demandImpact: 72,
    duration: { start: '2023-12-20', end: '2024-01-05', durationDays: 17 },
    narrative: 'Natal + Ano Novo: Pico uso dados móveis (+72%). MATERIAL_ELETRICO stockout risk alto (38%).',
    recommendedActions: [
      'Fechar POs até 15/12 para garantir entrega',
      'Aumentar EPI para equipes de emergência 24/7',
      'Monitorar sites críticos (capitais + litoral)'
    ]
  },
  {
    id: '5g-auction-2024',
    name: '5G Auction Lote 3',
    date: '2024-06-15',
    type: 'custom',
    impactScore: 0.82,
    leadTimeImpact: 8.5,
    demandImpact: 145,
    duration: { start: '2024-06-10', end: '2024-09-30', durationDays: 113 },
    narrative: 'ANATEL leilão 5G Lote 3: +145% demanda MATERIAL_ELETRICO. Huawei, Ericsson, Nokia competindo. Lead time crítico.',
    recommendedActions: [
      'URGENTE: Reservar capacidade com top 3 suppliers (Jun-Set)',
      'Investimento R$ 12.5M em pre-orders',
      'Negociar desconto volume 15% (>R$ 10M orders)',
      'Contratar buffer stock warehouse adicional'
    ]
  },
  {
    id: 'usd-spike-2024',
    name: 'USD/BRL Spike - Dólar R$ 5.80',
    date: '2024-05-20',
    type: 'custom',
    impactScore: -0.6,
    leadTimeImpact: 1.2,
    demandImpact: -22,
    duration: { start: '2024-05-15', end: '2024-06-30', durationDays: 47 },
    narrative: 'Dólar dispara para R$ 5.80. Custo importação Huawei/Nokia +18%. Demanda recua por pricing pressure.',
    recommendedActions: [
      'Priorizar suppliers nacionais (Furukawa, Prysmian)',
      'Hedge cambial para próximos 6 meses',
      'Renegociar preços MATERIAL_ELETRICO importado',
      'Postergar expansões não-críticas'
    ]
  },
  {
    id: 'rainy-season-2024',
    name: 'Estação Chuvosa 2024-2025',
    date: '2024-11-01',
    type: 'season',
    impactScore: 0.52,
    leadTimeImpact: 2.4,
    demandImpact: 58,
    duration: { start: '2024-11-01', end: '2025-04-30', durationDays: 181 },
    narrative: 'Chuvas Amazônia + Nordeste: FERRO_E_AÇO +58% (corrosão), EPI +42% (segurança). Logística lenta.',
    recommendedActions: [
      'FERRO_E_AÇO: Safety stock 26→42 dias',
      'EPI: Estoques regionais (AM, CE, BA)',
      'SLA contingência com Prysmian/CommScope'
    ]
  },
  {
    id: 'black-friday-2024',
    name: 'Black Friday 2024',
    date: '2024-11-29',
    type: 'custom',
    impactScore: 0.74,
    leadTimeImpact: 6.1,
    demandImpact: 105,
    duration: { start: '2024-11-25', end: '2024-12-10', durationDays: 16 },
    narrative: 'Recorde tráfego mobile: +105% demanda 5G. MATERIAL_ELETRICO critical. Penalty risk R$ 380K.',
    recommendedActions: [
      'CRÍTICO: Pre-order MATERIAL_ELETRICO até 01/11',
      'Ericsson priority lane (42d→28d express)',
      'Buffer cash R$ 3.2M para compras emergenciais',
      'Ativar fornecedores backup (Nokia, CommScope)'
    ]
  },
  {
    id: 'christmas-2024',
    name: 'Natal + Ano Novo 2024',
    date: '2024-12-25',
    type: 'holiday',
    impactScore: 0.61,
    leadTimeImpact: 4.8,
    demandImpact: 81,
    duration: { start: '2024-12-20', end: '2025-01-07', durationDays: 19 },
    narrative: 'Festividades: Pico dados +81%. MATERIAL_ELETRICO stockout risk 42%. EPI para equipes 24/7.',
    recommendedActions: [
      'POs fechados até 10/12',
      'EPI +35% para operações feriado',
      'Monitoramento 24/7 sites capitais + praias'
    ]
  }
];

// ==================== REAL ANOMALIES & EVENTS (HISTORICAL) ====================

const REAL_ANOMALIES = [
  {
    date: '2024-03-15',
    name: 'Huawei Customs Delay',
    severity: 'critical' as const,
    impact: 'Lead time Huawei: 60d→92d. MATERIAL_ELETRICO stockout. Penalty R$ 145K.',
    magnitudePercent: -35,
    cause: 'Retenção alfandegária - certificação ANATEL pendente',
    action: 'Acionado Ericsson backup. Express air freight (+R$ 85K). SLA renegociado.'
  },
  {
    date: '2024-06-18',
    name: '5G Auction Demand Surge',
    severity: 'critical' as const,
    impact: '+145% demanda súbita. MATERIAL_ELETRICO, FERRO_E_AÇO esgotados. Working capital spike.',
    magnitudePercent: +145,
    cause: 'ANATEL leilão 5G Lote 3 - operadoras acelerando rollout',
    action: 'Pre-orders R$ 12.5M. Desconto volume 15% negociado. Warehouse adicional alugado.'
  },
  {
    date: '2024-01-28',
    name: 'Chuvas Extremas Amazônia',
    severity: 'moderate' as const,
    impact: 'FERRO_E_AÇO +62% (corrosão emergencial). Logística Norte parada 9 dias.',
    magnitudePercent: +62,
    cause: 'Chuvas recordes AM/RR. Torres danificadas. Urgência substituição.',
    action: 'Prysmian express delivery. Aumentado safety stock Norte para 45 dias.'
  },
  {
    date: '2023-11-26',
    name: 'Black Friday 2023 Overload',
    severity: 'critical' as const,
    impact: 'Tráfego mobile +110%. MATERIAL_ELETRICO insuficiente. SLA breach 3 sites.',
    magnitudePercent: +110,
    cause: 'Pico e-commerce. Rede 5G saturada. Demanda emergencial equipamentos.',
    action: 'PO emergencial R$ 2.1M. Ericsson express 42d→25d. Penalty pago R$ 78K.'
  },
  {
    date: '2024-05-22',
    name: 'USD/BRL Exchange Shock',
    severity: 'moderate' as const,
    impact: 'Dólar R$ 5.80. Custo imports +18%. MATERIAL_ELETRICO margin -4.2pp.',
    magnitudePercent: -22,
    cause: 'Crise fiscal. BC elevou Selic. Fuga capital. Imports encareceram.',
    action: 'Hedge cambial 6 meses. Priorizado suppliers nacionais. Repricing +5.5%.'
  }
];

// ==================== CHANGE POINTS (REAL REGIME SHIFTS) ====================

const REAL_CHANGE_POINTS = [
  {
    date: '2023-12-01',
    regime: 'Pre-5G Rollout',
    description: 'Operações normais pré-expansão. MATERIAL_ELETRICO demanda estável ~850 un/dia.',
    mean: 850,
    std: 95,
    duration: '2023-10-01 to 2023-11-30'
  },
  {
    date: '2024-02-01',
    regime: '5G Phase 1 Deployment',
    description: 'Início rollout 5G capitais. +42% demanda MATERIAL_ELETRICO. Pressure Huawei/Ericsson.',
    mean: 1210,
    std: 165,
    duration: '2023-12-01 to 2024-05-31'
  },
  {
    date: '2024-06-15',
    regime: '5G Auction Acceleration',
    description: 'ANATEL leilão. Operadoras competindo. +145% pico demanda. Lead times críticos.',
    mean: 2080,
    std: 285,
    duration: '2024-06-01 to 2024-09-30'
  },
  {
    date: '2024-10-01',
    regime: 'Mature 5G Operations',
    description: 'Normalização pós-auction. Demanda alta mas previsível. Suppliers adaptados.',
    mean: 1450,
    std: 125,
    duration: '2024-10-01 onwards'
  }
];

// ==================== DATA GENERATION FUNCTIONS ====================

function generateBrazilianSeasonality(dayOfYear: number): number {
  // Q1 (Jan-Mar): Low season post-Christmas (+5% below baseline)
  // Q2 (Apr-Jun): Moderate season, building up (+10% above baseline)
  // Q3 (Jul-Sep): Steady growth (+15% above baseline)
  // Q4 (Oct-Dec): HIGH SEASON - Black Friday + Christmas (+45% above baseline)
  
  const month = Math.floor(dayOfYear / 30.44) % 12; // Approximate month
  
  if (month >= 0 && month < 3) return -0.05; // Q1: Low
  if (month >= 3 && month < 6) return 0.10;  // Q2: Building
  if (month >= 6 && month < 9) return 0.15;  // Q3: Growth
  return 0.45; // Q4: HIGH SEASON
}

function generateTelecom5GTrend(dayIndex: number, totalDays: number): number {
  // 5G rollout creates exponential growth pattern
  // Year 1: 12.5% growth (MATERIAL_ELETRICO)
  // Acceleration during auction periods
  const progress = dayIndex / totalDays;
  const baseGrowth = 1 + (0.125 * progress); // 12.5% over period
  
  // Auction spike (around day 250-350)
  if (dayIndex >= 250 && dayIndex <= 350) {
    return baseGrowth * 1.45; // +45% during auction
  }
  
  return baseGrowth;
}

function generateWeeklyCycle(dayIndex: number): number {
  // Brazilian telecom procurement weekly cycle
  // Mon-Wed: High activity (operators planning)
  // Thu-Fri: Moderate (order processing)
  // Sat-Sun: Low (weekend reduction)
  
  const dayOfWeek = dayIndex % 7;
  const cycles = [
    0.05,  // Sunday: -5%
    0.15,  // Monday: +15%
    0.12,  // Tuesday: +12%
    0.10,  // Wednesday: +10%
    0.08,  // Thursday: +8%
    0.03,  // Friday: +3%
    -0.08  // Saturday: -8%
  ];
  
  return cycles[dayOfWeek];
}

export function generateNovaCorrenteDataset(): GeneratedDataset {
  const config = NOVA_CORRENTE_CONFIG;
  const startDate = new Date(config.startDate);
  const timeSeriesData: TimeSeriesPoint[] = [];
  const timestamps: string[] = [];
  const values: number[] = [];
  const anomalyPoints: AnomalyPoint[] = [];
  const changePointsList: ChangePoint[] = [];
  
  // Track regime for change point simulation
  let currentRegime = 0;
  const regimeThresholds = [60, 245, 365]; // Days for regime changes
  
  for (let i = 0; i < config.duration; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Update regime and track change points
    if (regimeThresholds.includes(i) && currentRegime < REAL_CHANGE_POINTS.length - 1) {
      const changePointData = REAL_CHANGE_POINTS[currentRegime + 1];
      changePointsList.push({
        timestamp: dateStr,
        index: i,
        confidence: 0.95,
        beforeMean: REAL_CHANGE_POINTS[currentRegime].mean,
        afterMean: changePointData.mean,
        beforeStd: REAL_CHANGE_POINTS[currentRegime].std,
        afterStd: changePointData.std,
        changeType: 'regime_change',
        changeMagnitude: ((changePointData.mean - REAL_CHANGE_POINTS[currentRegime].mean) / REAL_CHANGE_POINTS[currentRegime].mean) * 100,
        changeDirection: changePointData.mean > REAL_CHANGE_POINTS[currentRegime].mean ? 'increase' : 'decrease',
        duration: changePointData.duration,
        cause: changePointData.regime,
        impact: changePointData.description
      });
      currentRegime++;
    }
    
    // BASE DEMAND with 5G TREND
    let demand = config.baseDemand * generateTelecom5GTrend(i, config.duration);
    
    // BRAZILIAN SEASONALITY (Q4 peak)
    const seasonalFactor = generateBrazilianSeasonality(dayOfYear);
    demand *= (1 + seasonalFactor * config.seasonalAmplitude);
    
    // WEEKLY CYCLE (telecom procurement patterns)
    const weeklyCycleFactor = generateWeeklyCycle(i);
    demand *= (1 + weeklyCycleFactor * config.cyclicalAmplitude);
    
    // CALENDAR EVENTS IMPACT
    NOVA_CORRENTE_EVENTS.forEach(event => {
      const eventDate = new Date(event.date);
      const daysDiff = Math.abs((date.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (event.duration && date >= new Date(event.duration.start) && date <= new Date(event.duration.end)) {
        // Inside event duration
        demand *= (1 + event.demandImpact / 100);
      } else if (daysDiff <= 7) {
        // Event proximity effect (7-day window)
        const proximityFactor = Math.exp(-daysDiff / 3);
        demand *= (1 + (event.demandImpact / 100) * proximityFactor * 0.4);
      }
    });
    
    const expectedDemand = demand;
    
    // ANOMALIES (real disruptions)
    REAL_ANOMALIES.forEach(anomaly => {
      if (dateStr === anomaly.date) {
        demand *= (1 + anomaly.magnitudePercent / 100);
        anomalyPoints.push({
          timestamp: dateStr,
          index: i,
          value: Math.round(demand),
          expectedValue: Math.round(expectedDemand),
          deviation: Math.round(demand - expectedDemand),
          score: Math.abs(anomaly.magnitudePercent) / 10,
          severity: anomaly.severity,
          method: 'zscore',
          confidence: 0.95,
          context: anomaly.cause,
          rootCause: anomaly.cause,
          impact: anomaly.impact,
          recommendation: anomaly.action
        });
      }
    });
    
    // REGIME-SPECIFIC MEAN ADJUSTMENT
    const regimeMeans = [850, 1210, 2080, 1450];
    const regimeTarget = regimeMeans[Math.min(currentRegime, regimeMeans.length - 1)];
    demand = demand * 0.7 + regimeTarget * 0.3; // Blend towards regime mean
    
    // REALISTIC NOISE (supply chain volatility)
    const noise = (Math.random() - 0.5) * 2 * config.noiseLevel * demand;
    demand += noise;
    
    // FLOOR at 200 (minimum viable operations)
    demand = Math.max(200, demand);
    
    timestamps.push(dateStr);
    values.push(Math.round(demand));
    timeSeriesData.push({
      timestamp: dateStr,
      value: Math.round(demand),
      metadata: {
        regime: REAL_CHANGE_POINTS[currentRegime]?.regime || 'Unknown',
        seasonality: seasonalFactor,
        weeklyCycle: weeklyCycleFactor,
        trend: generateTelecom5GTrend(i, config.duration)
      }
    });
  }
  
  // Calculate start and end dates
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + config.duration - 1);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Convert events to full CalendarEvent format
  const events: CalendarEvent[] = NOVA_CORRENTE_EVENTS.map(event => ({
    ...event,
    historicalData: {
      occurrences: 1,
      avgImpact: event.demandImpact,
      consistency: 0.85
    }
  }));
  
  // Generate lead time data
  const leadTimeData: { timestamp: string; supplierId: string; leadTime: number; material: string; }[] = [];
  NOVA_CORRENTE_SUPPLIERS.forEach(supplier => {
    supplier.materials.forEach(material => {
      for (let i = 0; i < config.duration; i += 7) { // Weekly sampling
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Add variance to lead time
        const leadTimeVariation = (Math.random() - 0.5) * 2 * supplier.leadTimeVariance;
        leadTimeData.push({
          timestamp: dateStr,
          supplierId: supplier.id,
          leadTime: Math.max(1, supplier.leadTime + leadTimeVariation),
          material
        });
      }
    });
  });
  
  // Generate demand data by material
  const demandDataByMaterial: { timestamp: string; material: string; demand: number; }[] = [];
  MATERIAL_FAMILIES.forEach(family => {
    for (let i = 0; i < config.duration; i += 7) { // Weekly sampling
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Base demand scaled by material family
      const baseDemand = values[i] * (family.growthRate / 100);
      demandDataByMaterial.push({
        timestamp: dateStr,
        material: family.name,
        demand: Math.round(baseDemand)
      });
    }
  });
  
  // Transform suppliers to match expected interface
  const transformedSuppliers = NOVA_CORRENTE_SUPPLIERS.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    avgLeadTime: supplier.leadTime,
    leadTimeStd: supplier.leadTimeVariance,
    trend: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 3), // Random trend for demo
    reliability: supplier.reliability / 100, // Convert to 0-1 range
    variance: (supplier.leadTimeVariance / supplier.leadTime) * 100,
    backlog: Math.floor(Math.random() * 50),
    materials: supplier.materials,
    riskScore: supplier.riskScore,
    performance: supplier.reliability > 95 ? 'excellent' : 
                 supplier.reliability > 90 ? 'good' : 
                 supplier.reliability > 85 ? 'fair' : 'poor'
  }));
  
  return {
    timeSeries: {
      data: timeSeriesData,
      frequency: 'daily',
      startDate: config.startDate,
      endDate: endDateStr
    },
    suppliers: transformedSuppliers as any,
    events,
    anomalies: anomalyPoints,
    changePoints: changePointsList,
    leadTimeData,
    demandData: demandDataByMaterial
  };
}

// Export constants for use in components
export {
  NOVA_CORRENTE_SUPPLIERS,
  MATERIAL_FAMILIES,
  NOVA_CORRENTE_EVENTS,
  REAL_ANOMALIES,
  REAL_CHANGE_POINTS
};


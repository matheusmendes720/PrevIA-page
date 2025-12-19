/**
 * Integrated Data Generator
 * Creates realistic temporal and lead time data with Brazilian telecom context
 * Combines: trends, seasonality, cyclical patterns, events, anomalies, and change points
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

// Simplified Supplier type for data generation (without cost and history)
type Supplier = Omit<SupplierMetrics, 'cost' | 'history'>;

// ==================== Configuration ====================

const DEFAULT_CONFIG = {
  startDate: '2023-10-01',
  duration: 540, // days (18 months)
  baseDemand: 500,
  trendRate: 0.05, // 5% growth per month
  seasonalAmplitude: 0.35, // 35% seasonal variation
  cyclicalAmplitude: 0.15, // 15% weekly cycle
  noiseLevel: 0.08, // 8% random noise
  anomalyProbability: 0.015, // 1.5% chance per day
  changePointProbability: 0.003 // 0.3% chance per day
};

// ==================== Brazilian Calendar Events ====================

const BRAZILIAN_EVENTS: Omit<CalendarEvent, 'historicalData'>[] = [
  {
    id: 'carnival-2024',
    name: 'Carnaval 2024',
    date: '2024-02-13',
    type: 'holiday',
    impactScore: -0.5,
    leadTimeImpact: 3.2,
    demandImpact: -30,
    duration: { start: '2024-02-10', end: '2024-02-18', durationDays: 9 },
    narrative: 'Períodos festivos reduzem atividades operacionais. Logística impactada por 1 semana antes/depois.',
    recommendedActions: [
      'Aumentar buffer stock 30% até 02/03',
      'Ativar fornecedores backup',
      'Preparar equipe para recuperação pós-feriado'
    ]
  },
  {
    id: 'easter-2024',
    name: 'Páscoa 2024',
    date: '2024-03-31',
    type: 'holiday',
    impactScore: -0.4,
    leadTimeImpact: 2.1,
    demandImpact: -25,
    duration: { start: '2024-03-29', end: '2024-04-01', durationDays: 4 },
    narrative: 'Feriado prolongado com redução moderada de operações',
    recommendedActions: [
      'Planejar paradas para manutenção preventiva',
      'Revisar pipeline de projetos 5G',
      'Ajustar previsões para abril'
    ]
  },
  {
    id: 'rainy-season-2023',
    name: 'Estação Chuvosa 2023-2024',
    date: '2023-11-01',
    type: 'season',
    impactScore: 0.4,
    leadTimeImpact: 1.8,
    demandImpact: 40,
    duration: { start: '2023-11-01', end: '2024-04-30', durationDays: 182 },
    narrative: 'Chuvas intensificam corrosão em torres, multiplicando demanda por manutenção e substituições',
    recommendedActions: [
      'Aumentar estoque de componentes de corrosão 45%',
      'Reforçar equipes de campo em 25%',
      'Negociar SLA flexível com clientes',
      'Monitorar fornecedores de logística'
    ]
  },
  {
    id: 'black-friday-2023',
    name: 'Black Friday 2023',
    date: '2023-11-24',
    type: 'custom',
    impactScore: 0.6,
    leadTimeImpact: 4.5,
    demandImpact: 85,
    duration: { start: '2023-11-20', end: '2023-12-05', durationDays: 16 },
    narrative: 'Pico de compras online sobrecarrega rede telecom. Urgência de expansão 5G.',
    recommendedActions: [
      'Priorizar entregas críticas',
      'Aumentar safety stock 50%',
      'Negociar express logistics',
      'Ativar plano de contingência'
    ]
  },
  {
    id: 'christmas-2023',
    name: 'Natal 2023',
    date: '2023-12-25',
    type: 'holiday',
    impactScore: -0.3,
    leadTimeImpact: 2.5,
    demandImpact: -20,
    duration: { start: '2023-12-22', end: '2024-01-05', durationDays: 15 },
    narrative: 'Fechamento de fim de ano. Fornecedores operam com capacidade reduzida.',
    recommendedActions: [
      'Antecipar pedidos críticos para dezembro',
      'Manter equipe mínima de plantão',
      'Revisar contratos para 2024'
    ]
  },
  {
    id: 'carnival-2025',
    name: 'Carnaval 2025',
    date: '2025-03-04',
    type: 'holiday',
    impactScore: -0.5,
    leadTimeImpact: 3.2,
    demandImpact: -30,
    duration: { start: '2025-02-28', end: '2025-03-09', durationDays: 10 },
    narrative: 'Períodos festivos reduzem atividades operacionais',
    recommendedActions: ['Aumentar buffer stock 30%', 'Preparar para pico pós-feriado']
  },
  {
    id: '5g-launch-sp',
    name: 'Lançamento 5G São Paulo',
    date: '2024-07-15',
    type: 'custom',
    impactScore: 0.8,
    leadTimeImpact: -1.2,
    demandImpact: 120,
    duration: { start: '2024-06-01', end: '2024-09-30', durationDays: 122 },
    narrative: 'Expansão massiva de infraestrutura 5G. Demanda excepcional por conectores, cabos, e refrigeração.',
    recommendedActions: [
      'Consolidar fornecedores principais',
      'Garantir capacidade de produção',
      'Contratos de volume com desconto 8-12%',
      'Monitoramento diário de estoque'
    ]
  },
  {
    id: 'truck-strike-2024',
    name: 'Greve de Caminhoneiros 2024',
    date: '2024-07-18',
    type: 'custom',
    impactScore: -0.9,
    leadTimeImpact: 8.5,
    demandImpact: 0,
    duration: { start: '2024-07-15', end: '2024-07-30', durationDays: 16 },
    narrative: 'Greve nacional paralisa logística. Lead times explodem, risco crítico de stockout.',
    recommendedActions: [
      'URGENTE: Ativar fornecedores alternativos',
      'Transporte aéreo para itens críticos',
      'Comunicação proativa com clientes',
      'Acionar apólice de seguro de interrupção'
    ]
  }
];

// ==================== Supplier Definitions ====================

const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-a',
    name: 'Supplier A',
    avgLeadTime: 17,
    leadTimeStd: 4.8,
    trend: 3,
    reliability: 0.78,
    variance: 28,
    backlog: 8,
    materials: ['Conectores'],
    riskScore: 8.2,
    performance: 'poor'
  },
  {
    id: 'sup-b',
    name: 'Supplier B',
    avgLeadTime: 11,
    leadTimeStd: 2.1,
    trend: -1,
    reliability: 0.85,
    variance: 18,
    backlog: 3,
    materials: ['Cabos'],
    riskScore: 4.1,
    performance: 'good'
  },
  {
    id: 'sup-c',
    name: 'Supplier C',
    avgLeadTime: 13,
    leadTimeStd: 3.2,
    trend: 1,
    reliability: 0.82,
    variance: 22,
    backlog: 5,
    materials: ['Conectores', 'Cabos'],
    riskScore: 5.3,
    performance: 'fair'
  },
  {
    id: 'sup-d',
    name: 'Supplier D',
    avgLeadTime: 16,
    leadTimeStd: 5.8,
    trend: 2,
    reliability: 0.76,
    variance: 35,
    backlog: 12,
    materials: ['Refrigeração'],
    riskScore: 8.9,
    performance: 'poor'
  },
  {
    id: 'sup-e',
    name: 'Supplier E',
    avgLeadTime: 14,
    leadTimeStd: 2.8,
    trend: 0,
    reliability: 0.81,
    variance: 20,
    backlog: 4,
    materials: ['Cabos'],
    riskScore: 5.0,
    performance: 'fair'
  },
  {
    id: 'sup-f',
    name: 'Supplier F',
    avgLeadTime: 9,
    leadTimeStd: 1.2,
    trend: -2,
    reliability: 0.92,
    variance: 15,
    backlog: 1,
    materials: ['Conectores'],
    riskScore: 2.1,
    performance: 'excellent'
  }
];

// ==================== Main Generator Function ====================

export function generateIntegratedDataset(): GeneratedDataset {
  const config = DEFAULT_CONFIG;
  const startDate = new Date(config.startDate);
  const numDays = config.duration;
  
  // Generate timestamps
  const timestamps: string[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    timestamps.push(date.toISOString().split('T')[0]);
  }
  
  // Generate base components
  const trend = generateTrend(numDays, config.trendRate);
  const seasonal = generateSeasonality(numDays, timestamps);
  const weekly = generateWeeklyCycle(numDays);
  const noise = generateNoise(numDays, config.noiseLevel);
  
  // Apply calendar events
  const eventImpacts = applyCalendarEvents(numDays, timestamps, BRAZILIAN_EVENTS);
  
  // Inject anomalies
  const anomalies = injectAnomalies(numDays, timestamps, config.anomalyProbability);
  
  // Inject change points
  const changePoints = injectChangePoints(numDays, timestamps, config.changePointProbability);
  
  // Combine all components for demand
  const demand: number[] = [];
  for (let i = 0; i < numDays; i++) {
    let value = config.baseDemand;
    value += trend[i];
    value *= (1 + seasonal[i]);
    value *= (1 + weekly[i]);
    value *= (1 + eventImpacts[i]);
    value += noise[i];
    
    // Apply anomalies
    const anomaly = anomalies.find(a => a.index === i);
    if (anomaly) {
      value *= (1 + (anomaly.score > 0 ? 0.5 : -0.3));
    }
    
    // Apply change points
    const changePoint = changePoints.find(cp => cp.index === i);
    if (changePoint) {
      // Shift baseline
      const shift = changePoint.changeDirection === 'increase' ? 1.2 : 0.85;
      value *= shift;
    }
    
    demand.push(Math.max(0, value));
  }
  
  // Generate lead time data for each supplier
  const leadTimeData: GeneratedDataset['leadTimeData'] = [];
  const materials = ['Conectores', 'Cabos', 'Refrigeração'];
  
  for (let i = 0; i < numDays; i += 3) { // Sample every 3 days
    for (const supplier of SUPPLIERS) {
      for (const material of supplier.materials) {
        const baseLeadTime = supplier.avgLeadTime;
        const supplierNoise = (Math.random() - 0.5) * supplier.leadTimeStd;
        const seasonalEffect = seasonal[i] * 2; // Lead time affected by season
        const eventEffect = eventImpacts[i] * 10; // Events heavily affect lead time
        
        // Supplier-specific seasonality (some suppliers worse in rainy season)
        let supplierSeasonalModifier = 1;
        if (supplier.id === 'sup-a' || supplier.id === 'sup-d') {
          supplierSeasonalModifier = timestamps[i] >= '2023-11-01' && timestamps[i] <= '2024-04-30' ? 1.25 : 1;
        }
        
        const leadTime = Math.max(
          5,
          baseLeadTime + supplierNoise + seasonalEffect + eventEffect
        ) * supplierSeasonalModifier;
        
        leadTimeData.push({
          timestamp: timestamps[i],
          supplierId: supplier.id,
          leadTime,
          material
        });
      }
    }
  }
  
  // Generate demand data per material
  const demandData: GeneratedDataset['demandData'] = [];
  const materialDistribution = {
    'Conectores': 0.4,
    'Cabos': 0.35,
    'Refrigeração': 0.25
  };
  
  for (let i = 0; i < numDays; i++) {
    for (const [material, fraction] of Object.entries(materialDistribution)) {
      demandData.push({
        timestamp: timestamps[i],
        material,
        demand: Math.round(demand[i] * fraction)
      });
    }
  }
  
  // Create time series
  const timeSeriesData: TimeSeriesPoint[] = timestamps.map((ts, i) => ({
    timestamp: ts,
    value: demand[i],
    metadata: {
      trend: trend[i],
      seasonal: seasonal[i],
      weekly: weekly[i],
      event: eventImpacts[i]
    }
  }));
  
  const timeSeries: TimeSeries = {
    data: timeSeriesData,
    frequency: 'daily',
    startDate: timestamps[0],
    endDate: timestamps[timestamps.length - 1]
  };
  
  // Add historical data to events
  const events = BRAZILIAN_EVENTS.map(event => ({
    ...event,
    historicalData: {
      occurrences: event.type === 'holiday' ? 2 : 1,
      avgImpact: Math.abs(event.demandImpact),
      consistency: 0.85
    }
  }));
  
  return {
    timeSeries,
    suppliers: SUPPLIERS,
    events,
    anomalies,
    changePoints,
    leadTimeData,
    demandData
  };
}

// ==================== Component Generators ====================

function generateTrend(numDays: number, trendRate: number): number[] {
  const trend: number[] = [];
  const monthlyRate = trendRate;
  const dailyRate = monthlyRate / 30;
  
  for (let i = 0; i < numDays; i++) {
    trend.push(i * dailyRate * 100); // Convert to units
  }
  
  return trend;
}

function generateSeasonality(numDays: number, timestamps: string[]): number[] {
  const seasonal: number[] = [];
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(timestamps[i]);
    const dayOfYear = getDayOfYear(date);
    
    // Annual cycle (peaks in rainy season Nov-Apr)
    const annualComponent = 0.35 * Math.sin(2 * Math.PI * (dayOfYear - 305) / 365);
    
    // Semi-annual cycle
    const semiAnnualComponent = 0.15 * Math.sin(4 * Math.PI * dayOfYear / 365);
    
    seasonal.push(annualComponent + semiAnnualComponent);
  }
  
  return seasonal;
}

function generateWeeklyCycle(numDays: number): number[] {
  const weekly: number[] = [];
  
  for (let i = 0; i < numDays; i++) {
    const dayOfWeek = i % 7;
    
    // Weekdays higher than weekends
    let cyclicValue = 0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      cyclicValue = -0.15; // Weekend reduction
    } else if (dayOfWeek === 4) {
      cyclicValue = 0.10; // Friday peak
    } else {
      cyclicValue = 0.05; // Normal weekday
    }
    
    weekly.push(cyclicValue);
  }
  
  return weekly;
}

function generateNoise(numDays: number, noiseLevel: number): number[] {
  const noise: number[] = [];
  
  for (let i = 0; i < numDays; i++) {
    // Normal distribution approximation
    const u1 = Math.random();
    const u2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    noise.push(normal * noiseLevel * 50); // Scale to meaningful units
  }
  
  return noise;
}

function applyCalendarEvents(
  numDays: number,
  timestamps: string[],
  events: Omit<CalendarEvent, 'historicalData'>[]
): number[] {
  const impacts: number[] = new Array(numDays).fill(0);
  
  for (const event of events) {
    const startIdx = timestamps.indexOf(event.duration.start);
    const endIdx = timestamps.indexOf(event.duration.end);
    
    if (startIdx !== -1 && endIdx !== -1) {
      const eventDuration = endIdx - startIdx + 1;
      const impactMagnitude = event.demandImpact / 100;
      
      for (let i = startIdx; i <= endIdx; i++) {
        if (i < numDays) {
          // Gradual ramp up and down
          const progress = (i - startIdx) / eventDuration;
          const rampFactor = Math.sin(progress * Math.PI); // Bell curve
          impacts[i] += impactMagnitude * rampFactor;
        }
      }
    }
  }
  
  return impacts;
}

function injectAnomalies(
  numDays: number,
  timestamps: string[],
  probability: number
): AnomalyPoint[] {
  const anomalies: AnomalyPoint[] = [];
  
  for (let i = 30; i < numDays - 30; i++) { // Avoid edges
    if (Math.random() < probability) {
      const severity: 'critical' | 'moderate' | 'mild' = 
        Math.random() < 0.2 ? 'critical' : Math.random() < 0.5 ? 'moderate' : 'mild';
      
      const score = severity === 'critical' ? 4.5 : severity === 'moderate' ? 3.5 : 3;
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      anomalies.push({
        timestamp: timestamps[i],
        index: i,
        value: 0, // Will be filled by actual data
        expectedValue: 0,
        deviation: 0,
        score: score * direction,
        severity,
        method: 'zscore',
        confidence: 0.9,
        context: 'Injected anomaly for demonstration',
        rootCause: severity === 'critical' ? 'Supply disruption' : 'Demand spike',
        impact: severity === 'critical' ? 'High risk of stockout' : 'Monitor situation'
      });
    }
  }
  
  return anomalies;
}

function injectChangePoints(
  numDays: number,
  timestamps: string[],
  probability: number
): ChangePoint[] {
  const changePoints: ChangePoint[] = [];
  
  // Deterministic change points at key moments
  const keyChangePoints = [
    {
      timestamp: '2024-03-15',
      cause: 'Supplier A contract renegotiation - performance degradation',
      direction: 'increase' as const,
      magnitude: 28
    },
    {
      timestamp: '2024-08-01',
      cause: 'Volume discount activation - cost reduction',
      direction: 'decrease' as const,
      magnitude: 7.8
    },
    {
      timestamp: '2024-01-10',
      cause: 'Supplier F promoted to primary - reliability improvement',
      direction: 'increase' as const,
      magnitude: 8
    }
  ];
  
  for (const kcp of keyChangePoints) {
    const index = timestamps.indexOf(kcp.timestamp);
    if (index !== -1) {
      changePoints.push({
        timestamp: kcp.timestamp,
        index,
        confidence: 0.95,
        beforeMean: 0, // Will be filled by actual analysis
        afterMean: 0,
        beforeStd: 0,
        afterStd: 0,
        changeType: 'mean_shift',
        changeMagnitude: kcp.magnitude,
        changeDirection: kcp.direction,
        duration: 'Ongoing',
        cause: kcp.cause,
        impact: `${kcp.magnitude.toFixed(1)}% ${kcp.direction} in baseline`
      });
    }
  }
  
  return changePoints;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// ==================== Export Utilities ====================

export function getSupplierById(id: string): Supplier | undefined {
  return SUPPLIERS.find(s => s.id === id);
}

export function getEventById(id: string): CalendarEvent | undefined {
  const event = BRAZILIAN_EVENTS.find(e => e.id === id);
  return event ? {
    ...event,
    historicalData: {
      occurrences: event.type === 'holiday' ? 2 : 1,
      avgImpact: Math.abs(event.demandImpact),
      consistency: 0.85
    }
  } : undefined;
}

export function getEventsInRange(startDate: string, endDate: string): CalendarEvent[] {
  return BRAZILIAN_EVENTS
    .filter(e => e.date >= startDate && e.date <= endDate)
    .map(event => ({
      ...event,
      historicalData: {
        occurrences: event.type === 'holiday' ? 2 : 1,
        avgImpact: Math.abs(event.demandImpact),
        consistency: 0.85
      }
    }));
}

// Singleton instance
let cachedDataset: GeneratedDataset | null = null;

export function getCachedDataset(): GeneratedDataset {
  if (!cachedDataset) {
    cachedDataset = generateIntegratedDataset();
  }
  return cachedDataset;
}

export function regenerateDataset(): GeneratedDataset {
  cachedDataset = generateIntegratedDataset();
  return cachedDataset;
}


